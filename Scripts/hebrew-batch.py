#!/usr/bin/env python3
"""Validate/apply directly authored Hebrew; credit review only on explicit review.

The view command supplies the complete bilingual batch for editorial reading.
This script never creates translated wording or infers editorial approval.
"""
import argparse
import hashlib
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOC = ROOT / 'Documentation/hebrew'
SOURCE = Path('/Users/antonkrutov/Developer/data/stardew-english-unpacked')
PATCHES = ROOT / 'Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/hebrew'


def read(path):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            assert key not in result, (path, 'duplicate JSON key', key)
            result[key] = value
        return result
    return json.loads(path.read_text(), object_pairs_hook=unique)


def write(path, value):
    value = json.dumps(value, ensure_ascii=False, indent=2) + '\n'
    if not path.exists() or path.read_text() != value:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(value)


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


TOKENS = re.compile(r'\{\{[^{}]+\}\}|\{[^{}]+\}|\$[A-Za-z0-9]+|%[a-z][A-Za-z0-9_]*|\[(?:#|image|link|textcolor|letterbg|LocalizedText|FarmerStat|HOURS|MINUTES|DAY_OF|\d)[^\]]*\]|https?://[^\s)]+')


def signature(text):
    return (Counter(TOKENS.findall(text)), Counter(c for c in text if c in '@#^|/\\\n%<$_[]`*'))


def checked_variants(record, original):
    text = record['translation']
    adaptation = record.get('genderAdaptation')
    if not adaptation:
        return [(original, text)]
    assert adaptation['subject'] == 'current-player'
    assert adaptation['evidence'].strip()
    # Established native syntax, explicitly required by the translation guide.
    # Inspect both actual runtime branches, not merely the raw wrapper count.
    blocks = re.compile(r'\$\{([^{}^]*)\^([^{}^]*)\}\$')
    assert blocks.search(text), 'Gender adaptation without a native block'
    translated = [blocks.sub(lambda m: m.group(gender), text) for gender in (1, 2)]
    source = [blocks.sub(lambda m: m.group(gender), original) for gender in (1, 2)] if blocks.search(original) else [original, original]
    assert all('${' not in value and '}$' not in value for value in translated + source)
    return list(zip(source, translated))


parser = argparse.ArgumentParser()
parser.add_argument('batch', type=Path)
parser.add_argument('action', choices=['check', 'view', 'apply', 'review'])
args = parser.parse_args()
batch = read(args.batch)
state = read(DOC / 'checkpoint.json')
glossary_sha = sha(ROOT / 'Documentation/glossary/glossary.he.json')
assert state['glossaryFrozen'] and state['glossaryConsecutiveCleanFullAudits'] >= 2
assert batch['glossarySHA256'] == glossary_sha
assert re.fullmatch(r'[a-z0-9-]+', batch['id'])
assert batch['records'] and len(batch['records']) <= 80
sources = {}
entries = {}
typed_fields = {}
additional_path = DOC / 'additional-source-fields.json'
additional = read(additional_path)['records'] if additional_path.exists() else []
additional_by_identity = {
    (record['target'], record['entry'], record['field']): record
    for record in additional
}
batch_identities = set()
for record in batch['records']:
    target = record['target']
    assert target in batch['sourceHashes']
    field = record.get('field')
    if field is not None:
        entry = record['entry']
        native = additional_by_identity[(target, entry, field)]
        assert sha(Path(native['sourceXNB'])) == batch['sourceHashes'][target], (target, 'source changed')
        original = native['english']
        key = entry + '/' + field
    else:
        if target not in sources:
            source_file = SOURCE / (target + '.json')
            assert sha(source_file) == batch['sourceHashes'][target], (target, 'source changed')
            sources[target] = read(source_file)['content']
        content = sources[target]
        key = record['key']
        original = content[int(key)] if isinstance(content, list) else content[key]
    identity = (target, key)
    assert identity not in batch_identities, (target, key, 'duplicate in batch')
    batch_identities.add(identity)
    translated = record['translation']
    assert record['english'] == original, (target, key, 'English changed')
    assert isinstance(translated, str) and (translated.strip() or original == ''), key
    for source_variant, translated_variant in checked_variants(record, original):
        assert signature(source_variant) == signature(translated_variant), (target, key, 'control-token mismatch', signature(source_variant), signature(translated_variant))
    assert not re.search('[\u202a-\u202e\u2066-\u2069]', translated), (target, key, 'embedded bidi formatting')
    if translated == original:
        assert record.get('preservationReason', '').strip(), (target, key, 'unexplained preservation')
    else:
        assert re.search('[\u0590-\u05ff]', translated), (target, key, 'missing Hebrew')
    latin = re.findall(r'[A-Za-z][A-Za-z0-9-]*', TOKENS.sub('', translated))
    exception = record.get('latinException', {})
    assert latin == exception.get('tokens', []), (target, key, 'unreviewed Latin', latin)
    if exception:
        assert exception.get('reason', '').strip(), (target, key)
    if translated != original:
        if field is not None:
            typed_fields.setdefault(target, {}).setdefault(entry, {})[field] = translated
        else:
            entries.setdefault(target, {})[key] = translated

patch_path = PATCHES / (batch['id'] + '.json')
patch = {'Changes': [{'Action': 'EditData', 'Target': target,
                      'When': {'Language': 'he-vnrevival'}, 'Entries': values}
                     for target, values in entries.items() if values] +
                    [{'Action': 'EditData', 'Target': target,
                      'When': {'Language': 'he-vnrevival'}, 'Fields': values}
                     for target, values in typed_fields.items() if values]}
for other in PATCHES.glob('*.json'):
    if other == patch_path:
        continue
    for change in read(other)['Changes']:
        overlap = entries.get(change['Target'], {}).keys() & change.get('Entries', {}).keys()
        assert not overlap, (other, 'duplicate entries across batches', overlap)
        for entry, fields in change.get('Fields', {}).items():
            field_overlap = typed_fields.get(change['Target'], {}).get(entry, {}).keys() & fields.keys()
            assert not field_overlap, (other, 'duplicate fields across batches', entry, field_overlap)

if args.action == 'view':
    print('Batch SHA256:', sha(args.batch))
    for index, record in enumerate(batch['records'], 1):
        record_key = record.get('key', record.get('entry', '') + '/' + record.get('field', ''))
        print(f"{index}. {record['target']} :: {record_key}")
        print('EN:', record['english'])
        print('HE:', record['translation'])
elif args.action == 'apply':
    if patch['Changes']:
        write(patch_path, patch)
    else:
        assert not patch_path.exists(), 'A preservation-only batch must not create a no-op Content Patcher file'
elif args.action == 'review':
    if patch['Changes']:
        assert read(patch_path) == patch, 'Apply exact current batch before marking its human/model editorial read'
    else:
        assert not patch_path.exists(), 'A preservation-only batch must not create a no-op Content Patcher file'
    reviews_path = DOC / 'reviewed-records.json'
    reviews = read(reviews_path) if reviews_path.exists() else {}
    for record in batch['records']:
        record_key = record.get('key', record.get('entry', '') + '/' + record.get('field', ''))
        identity = record['target'] + '\0' + record_key
        reviews[identity] = {**record, 'glossarySHA256': glossary_sha,
                             'batch': batch['id'], 'batchSHA256': sha(args.batch),
                             'reviewedSourceContextLanguageTokens': True}
    write(reviews_path, reviews)
print(json.dumps({'batch': batch['id'], 'records': len(batch['records']), 'action': args.action,
                  'errors': 0, 'warnings': 0, 'editorialApprovalInferred': False}))

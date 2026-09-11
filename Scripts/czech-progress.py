#!/usr/bin/env python3
"""Hash-bound Czech coverage. Only explicitly reviewed, unchanged rows count.

A source-equal string needs a per-row preservation reason. A changed string
never implies editorial approval. This tool cannot certify translation quality.
"""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOC = ROOT / 'Documentation/czech'
PAYLOAD = ROOT / 'Sources/StardewTranslationInstaller/Resources/ModPayload'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source', type=Path, default=Path.home() / 'Developer/data/stardew-english-unpacked')
parser.add_argument('--typed-source', type=Path, default=Path('/private/tmp/stardew-cs-inspector/english'))
parser.add_argument('--initialize', action='store_true')
parser.add_argument('--write-report', action='store_true')
args = parser.parse_args()

def digest(text):
    return hashlib.sha256(text.encode()).hexdigest()

def read(path):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f'Duplicate JSON key in {path}: {key}')
            result[key] = value
        return result
    return json.loads(path.read_text(), object_pairs_hook=unique)

def identity(target, key, field=None):
    return json.dumps([target, str(key), field], ensure_ascii=False, separators=(',', ':'))

def source_rows():
    for file in sorted(args.source.rglob('*.json')):
        content = read(file)['content']
        target = str(file.relative_to(args.source).with_suffix(''))
        entries = enumerate(content) if isinstance(content, list) else content.items()
        for key, value in entries:
            if not isinstance(value, str):
                raise ValueError(f'Unclassified English source value: {target}: {key}')
            yield target, str(key), None, value
    # Player-facing literals in typed 1.6 assets, beyond the historical 187 assets.
    for target, key, field in [
        ('Data/Buildings', 'Farmhouse', 'Name'),
        ('Data/Buildings', 'Farmhouse', 'Description'),
        ('Data/Pets', 'Turtle', 'DisplayName'),
        ('Data/Characters', '???', 'DisplayName'),
    ]:
        yield target, key, field, read(args.typed_source / (target + '.json'))[key][field]

source = {identity(t, k, f): {'target': t, 'key': k, 'field': f, 'sourceSHA256': digest(v)} for t, k, f, v in source_rows()}
manifest_path = DOC / 'source-manifest.json'
if args.initialize:
    manifest = {'schema': 1, 'locale': 'cs', 'count': len(source), 'rows': list(source.values())}
    serialized = json.dumps(manifest, ensure_ascii=False, indent=2) + '\n'
    if manifest_path.exists() and manifest_path.read_text() != serialized:
        raise SystemExit('Existing source manifest differs; inspect source changes before replacing it.')
    manifest_path.write_text(serialized)
manifest = read(manifest_path)
expected = {identity(r['target'], r['key'], r['field']): r for r in manifest['rows']}
errors = []
if expected != source or manifest['count'] != len(source):
    errors.append('English source coverage or hashes differ from the pinned manifest.')
english = read(ROOT / 'Documentation/glossary/glossary.en.json')
glossary_path = ROOT / 'Documentation/glossary/glossary.cs.json'
glossary = read(glossary_path)['cs']
if list(glossary) != [entry['id'] for entry in english]:
    errors.append('Czech glossary IDs or order differ from English.')
for key, entry in glossary.items():
    if set(entry) != {'term', 'meaning'} or any(not isinstance(v, str) or not v.strip() or '\ufffd' in v for v in entry.values()):
        errors.append('Malformed Czech glossary entry: ' + key)
glossary_hash = hashlib.sha256(glossary_path.read_bytes()).hexdigest()
actual = {}
for file in sorted((PAYLOAD / 'assets/translations/czech').rglob('*.json')):
    document = read(file)
    if 'Format' in document or not document.get('Changes'):
        errors.append('Invalid secondary patch: ' + str(file.relative_to(ROOT)))
    for change in document.get('Changes', []):
        if change.get('Action') != 'EditData' or change.get('When') != {'Language': 'cs-vnrevival'}:
            errors.append('Invalid Czech language gate: ' + str(file.relative_to(ROOT)))
        entries = [(str(k), None, v) for k, v in change.get('Entries', {}).items()]
        entries += [(str(k), field, v) for k, fields in change.get('Fields', {}).items() for field, v in fields.items()]
        for key, field, value in entries:
            rid = identity(change['Target'], key, field)
            if rid in actual or rid not in expected or not isinstance(value, str):
                errors.append('Duplicate, unknown, or non-string patch row: ' + rid)
            actual[rid] = value
reviewed = {}
checks = {'sourceMeaning', 'detailsAndTone', 'glossary', 'czechGrammar', 'englishResidue', 'characterVoice', 'context', 'tokensAndStructure'}
for file in sorted((DOC / 'batches').glob('*.json')):
    batch = read(file)
    if batch.get('locale') != 'cs' or batch.get('glossarySHA256') != glossary_hash:
        errors.append('Batch has wrong locale or stale glossary: ' + file.name)
        continue
    for row in batch.get('rows', []):
        rid = identity(row['target'], row['key'], row.get('field'))
        if rid in reviewed:
            errors.append('Duplicate editorial approval: ' + rid)
            continue
        if rid not in expected or rid not in actual:
            errors.append('Reviewed row absent from source or patches: ' + rid)
            continue
        if row.get('sourceSHA256') != expected[rid]['sourceSHA256'] or row.get('translationSHA256') != digest(actual[rid]):
            errors.append('Stale source or translation approval: ' + rid)
            continue
        if set(row.get('reviewChecks', [])) != checks:
            errors.append('Incomplete editorial approval: ' + rid)
            continue
        if digest(actual[rid]) == expected[rid]['sourceSHA256'] and not row.get('preservationReason', '').strip():
            errors.append('Source-equal row lacks an explicit reason: ' + rid)
            continue
        reviewed[rid] = row
remaining = len(expected) - len(reviewed)
checkpoint = read(DOC / 'checkpoint.json')
editorial = {'available': False}
if not remaining and not errors:
    from czech_audit import Audit
    try:
        editorial = dict(Audit(ROOT).status(), available=True)
    except (ValueError, KeyError, OSError) as error:
        errors.append('Editorial ledger cannot be verified: ' + str(error))
release_passed = bool(checkpoint.get('releaseGatesPassed') and editorial.get('cleanFullAudits') == 2 and not errors)
report = {
    'locale': 'cs', 'sourceRecords': len(expected), 'patchedRecords': len(actual),
    'reviewedRecords': len(reviewed), 'remainingRecords': remaining,
    'coveragePercent': round(100 * len(reviewed) / len(expected), 3),
    'projectPercent': None,  # No invented combined translation/release percentage.
    'editorial': editorial, 'releaseGatesPassed': release_passed,
    'glossarySHA256': glossary_hash, 'errors': errors,
    'warnings': ([f'{remaining} records still require translation or justified preservation and editorial review.'] if remaining else [])
}
if not remaining and not release_passed:
    report['warnings'].append('Full text coverage reached; editorial and release gates are reported separately.')
if args.write_report:
    (DOC / 'coverage-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(report, ensure_ascii=False, indent=2))
raise SystemExit(1 if errors else 0)

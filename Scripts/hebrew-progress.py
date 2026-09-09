#!/usr/bin/env python3
"""Hebrew-only source inventory/checkpoint; never generates translated wording.

Review records are keyed by Target + NUL + key and must bind exact English and
Hebrew values. Merely creating a patch never earns reviewed coverage.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOC = ROOT / 'Documentation/hebrew'
PATCHES = ROOT / 'Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/hebrew'


def read(path):
    def pairs(items):
        result = {}
        for key, value in items:
            if key in result:
                raise ValueError(f'Duplicate key in {path}: {key}')
            result[key] = value
        return result
    return json.loads(path.read_text(), object_pairs_hook=pairs)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write(path, value):
    text = json.dumps(value, ensure_ascii=False, indent=2) + '\n'
    if not path.exists() or path.read_text() != text:
        path.write_text(text)


parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, default=Path('/Users/antonkrutov/Developer/data/stardew-english-unpacked'))
parser.add_argument('--apply-glossary', action='store_true')
parser.add_argument('--glossary-page', type=int, nargs=2, metavar=('FIRST', 'LAST'))
parser.add_argument('--target-only', action='store_true')
args = parser.parse_args()
english = read(ROOT / 'Documentation/glossary/glossary.en.json')
baseline = read(DOC / 'glossary-public-baseline.json')
corrections = read(DOC / 'glossary-corrections.json')
glossary_path = ROOT / 'Documentation/glossary/glossary.he.json'
expected = {e['id']: dict(e['translation']) for e in baseline['entries']}
assert list(expected) == [e['id'] for e in english]
assert baseline['total'] == len(english) == len(expected)
assert [{k: v for k, v in e.items() if k != 'translation'} for e in baseline['entries']] == english
for key, fields in corrections.items():
    assert key in expected and fields and set(fields) <= {'term', 'meaning'}
    expected[key].update(fields)
if args.apply_glossary:
    write(glossary_path, {'he': expected})
assert read(glossary_path) == {'he': expected}
latin_exceptions = read(DOC / 'glossary-latin-exceptions.json')
pending_glossary_script = []
for key, entry in expected.items():
    assert set(entry) == {'term', 'meaning'}
    for field, text in entry.items():
        assert isinstance(text, str) and text.strip(), key
        exception = latin_exceptions.get(key, {}).get(field)
        latin = re.findall(r'[A-Za-z][A-Za-z0-9-]*', text)
        assert latin == (exception['tokens'] if exception else []), (key, field, latin)
        if exception:
            assert exception['reason'].strip(), key
        if not any('\u0590' <= c <= '\u05ff' for c in text) and not exception:
            pending_glossary_script.append(key)
        assert not any(c in text for c in '\u202a\u202b\u202c\u202d\u202e\u2066\u2067\u2068\u2069'), key

if args.glossary_page:
    first, last = args.glossary_page
    assert 1 <= first <= last <= len(english)
    print(f'Hebrew glossary {first}-{last}; SHA256={digest(glossary_path)}')
    for index in range(first - 1, last):
        source = english[index]
        translated = expected[source['id']]
        print(f"{index + 1} {source['id']} | {source['term']} | {translated['term']}")
        if not args.target_only:
            print(source['meaning'])
        print(translated['meaning'])
    raise SystemExit(0)

sources, hashes = {}, {}
for file in sorted(args.source.rglob('*.json')):
    target = file.relative_to(args.source).with_suffix('').as_posix()
    content = read(file)['content']
    hashes[target] = digest(file)
    items = content.items() if isinstance(content, dict) else enumerate(content)
    for key, value in items:
        assert isinstance(value, str), (target, key)
        sources[target + '\0' + str(key)] = value
assert sources, 'English extraction is empty'
additional_path = DOC / 'additional-source-fields.json'
additional = read(additional_path)['records'] if additional_path.exists() else []
for record in additional:
    assert digest(Path(record['sourceXNB'])) == record['sourceSHA256'], record['target']
    identity = record['target'] + '\0' + record['entry'] + '/' + record['field']
    assert identity not in sources
    sources[identity] = record['english']
inventory = {'sourceRoot': str(args.source), 'assetHashes': hashes,
             'targets': len(hashes), 'records': len(sources),
             'additionalNativeFields': len(additional),
             'additionalNativeFieldsSHA256': digest(additional_path) if additional else None,
             'unit': 'unique English (Target,key); list entries use zero-based index',
             'scopeVerifiedAgainstInstalledBaseAssets': False}
write(DOC / 'source-inventory.json', inventory)

patch_values = {}
for file in sorted(PATCHES.rglob('*.json')):
    patch = read(file)
    assert 'Format' not in patch and patch.get('Changes'), file
    for change in patch['Changes']:
        assert change['Action'] == 'EditData', file
        assert change['When'] == {'Language': 'he-vnrevival'}, file
        assert change.get('Entries') or change.get('Fields'), file
        for key, value in change.get('Entries', {}).items():
            identity = change['Target'] + '\0' + key
            assert identity in sources and identity not in patch_values, identity
            patch_values[identity] = value
        for entry, fields in change.get('Fields', {}).items():
            for field, value in fields.items():
                identity = change['Target'] + '\0' + entry + '/' + field
                assert identity in sources and identity not in patch_values, identity
                patch_values[identity] = value
review_path = DOC / 'reviewed-records.json'
reviews = read(review_path) if review_path.exists() else {}
for identity, record in reviews.items():
    assert record['english'] == sources[identity], identity
    if record['translation'] == record['english']:
        assert record.get('preservationReason', '').strip(), identity
        assert identity not in patch_values or patch_values[identity] == record['english'], identity
    else:
        assert record['translation'] == patch_values[identity], identity
    assert record['glossarySHA256'] == digest(glossary_path), identity
    assert record['batchSHA256'] == digest(DOC / 'batches' / (record['batch'] + '.json')), identity
    assert record['reviewedSourceContextLanguageTokens'] is True, identity
    if record['translation'] != record['english']:
        assert any('\u0590' <= c <= '\u05ff' for c in record['translation']), identity
state = read(DOC / 'checkpoint.json')
coverage_complete = len(reviews) == len(sources)
project_percent = (100.0 if coverage_complete and state.get('phase') == 'complete'
                   else min(99.999, round(100 * len(reviews) / len(sources), 3)))
state.update({'sourceInventorySHA256': digest(DOC / 'source-inventory.json'),
              'glossarySHA256': digest(glossary_path), 'sourceRecords': len(sources),
              'reviewedRecords': len(reviews), 'patchRecords': len(patch_values),
              'projectPercent': project_percent,
              'coverageDenominatorProvisional': not inventory['scopeVerifiedAgainstInstalledBaseAssets']})
write(DOC / 'checkpoint.json', state)
print(json.dumps({'glossaryEntries': len(expected), 'correctionEntries': len(corrections),
                  'sourceTargets': len(hashes), 'sourceRecords': len(sources),
                  'reviewedRecords': len(reviews), 'projectPercent': state['projectPercent'],
                  'pendingGlossaryScriptReview': pending_glossary_script,
                  'editorialStatus': ('complete; see checkpoint' if state.get('phase') == 'complete'
                                      else 'partial; see checkpoint; structural validation is not editorial approval')},
                 ensure_ascii=False))

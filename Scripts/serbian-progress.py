#!/usr/bin/env python3
"""Count only explicitly reviewed sr records whose source and output hashes match."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATE = ROOT / 'Documentation/serbian'
PATCHES = ROOT / 'Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/serbian'


def read(file):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f'Duplicate JSON key {key} in {file}')
            result[key] = value
        return result
    return json.loads(file.read_text(), object_pairs_hook=unique)


def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()


manifest = read(STATE / 'source-manifest.json')
source_root = Path(manifest['sourceRoot'])
for asset in manifest['assets']:
    file = source_root / asset['path']
    if hashlib.sha256(file.read_bytes()).hexdigest() != asset['sha256']:
        raise ValueError(f'English source changed: {file}')
expected = {(r['target'], r['key']): r for r in manifest['records']}
assert len(expected) == manifest['totalRecords']
actual = {}
for file in sorted(PATCHES.rglob('*.json')):
    patch = read(file)
    assert 'Format' not in patch and patch.get('Changes'), file
    for change in patch['Changes']:
        assert change['Action'] == 'EditData', file
        assert change['When'] == {'Language': 'sr-vnrevival'}, file
        for key, value in change['Entries'].items():
            record = (change['Target'], str(key))
            assert record in expected and record not in actual, record
            assert isinstance(value, str), record
            actual[record] = value
ledger_file = STATE / 'reviewed-records.json'
ledger = read(ledger_file) if ledger_file.exists() else []
reviewed = set()
for entry in ledger:
    record = (entry['target'], entry['key'])
    assert record not in reviewed and record in actual, record
    assert entry['sourceSha256'] == expected[record]['sourceSha256'], record
    assert entry['translationSha256'] == digest(actual[record]), record
    assert entry['reviewedAgainstEnglish'] is True, record
    assert entry['terminologyChecked'] is True, record
    assert entry['serbianEditorialChecked'] is True, record
    assert entry['tokensAndContextChecked'] is True, record
    assert entry['status'] in ('translated-reviewed', 'preserved-reviewed'), record
    if entry['status'] == 'preserved-reviewed':
        assert entry.get('reason', '').strip(), record
        assert digest(actual[record]) == expected[record]['sourceSha256'], record
    reviewed.add(record)
coverage = len(reviewed) / len(expected) * 100
checkpoint = read(STATE / 'checkpoint.json')
gates = checkpoint.get('finalGates', {})
complete = (len(reviewed) == len(expected) and bool(gates)
            and all(v is True for v in gates.values())
            and checkpoint['deliverySynchronized'] is True)
print(json.dumps({
    'locale': 'sr', 'totalRecords': len(expected), 'materializedRecords': len(actual),
    'reviewedRecords': len(reviewed), 'remainingRecords': len(expected) - len(reviewed),
    'reviewedCoveragePercent': round(coverage, 6), 'projectComplete': complete,
    'glossaryCleanFullAudits': checkpoint['glossaryCleanFullAudits'],
}, ensure_ascii=False, indent=2))

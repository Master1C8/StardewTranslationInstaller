#!/usr/bin/env python3
"""Source-derived bg coverage. This tool never generates translated wording.

inventory pins source hashes; status counts only hash-matched editorial records.
The inventory includes the reviewed typed-GameData supplement.
"""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATE = ROOT / 'Documentation/bulgarian'
SOURCE = Path('/Users/antonkrutov/Developer/data/stardew-english-unpacked')
PAYLOAD = ROOT / 'Sources/StardewTranslationInstaller/Resources/ModPayload'


def digest(value):
    return hashlib.sha256(value.encode('utf-8')).hexdigest()


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f'Duplicate JSON key: {key}')
        result[key] = value
    return result


def read(file):
    return json.loads(file.read_text(), object_pairs_hook=unique_object)


def write(file, data):
    text = json.dumps(data, ensure_ascii=False, indent=2) + '\n'
    if file.exists() and file.read_text() == text:
        return
    temporary = file.with_suffix(file.suffix + '.tmp')
    temporary.write_text(text)
    temporary.replace(file)


def source_inventory():
    files, records = [], []
    for file in sorted(SOURCE.rglob('*.json')):
        relative = file.relative_to(SOURCE)
        target = relative.with_suffix('').as_posix()
        content = read(file)['content']
        files.append({'path': relative.as_posix(), 'sha256': digest(file.read_text())})
        if isinstance(content, dict):
            values = content.items()
        elif isinstance(content, list):
            values = ((str(i), value) for i, value in enumerate(content))
        else:
            raise ValueError(f'Unsupported source structure: {target}')
        for key, value in values:
            if not isinstance(value, str):
                raise ValueError(f'Unclassified structured source: {target}/{key}')
            records.append({'target': target, 'key': key, 'sourceSha256': digest(value)})
    supplement = read(STATE / 'supplement-review.json')
    for asset in supplement['assets']:
        files.append({'path': asset['target'] + '.json', 'sha256': asset['sha256'],
                      'sourceKind': 'typed-GameData-supplement'})
    for candidate in supplement['literalDisplayCandidates']:
        if candidate['sourceSha256'] != digest(candidate['source']):
            raise ValueError(f"Stale supplemental source hash: {candidate['target']}/{candidate['key']}.{candidate['field']}")
        records.append({'target': candidate['target'],
                        'key': candidate['key'] + '.' + candidate['field'],
                        'sourceSha256': candidate['sourceSha256']})
    if not files:
        raise ValueError('English sources unavailable')
    return {'schemaVersion': 1, 'locale': 'bg', 'sourceRoot': str(SOURCE),
            'files': files, 'records': records}


def status():
    errors = []
    manifest = read(STATE / 'source-inventory.json')
    current = source_inventory()
    if current != manifest:
        errors.append('English source inventory changed; reconcile it before counting progress')
    source_records = {(r['target'], r['key']): r for r in current['records']}
    translations = {}
    for file in sorted((PAYLOAD / 'assets/translations/bulgarian').rglob('*.json')):
        document = read(file)
        if 'Format' in document or not document.get('Changes'):
            errors.append(f'Invalid secondary patch: {file.relative_to(ROOT)}')
        for patch in document.get('Changes', []):
            if patch.get('Action') != 'EditData' or patch.get('When') != {'Language': 'bg-vnrevival'}:
                errors.append(f'Invalid Bulgarian gate or action: {file.relative_to(ROOT)}')
            for key, value in patch.get('Entries', {}).items():
                identity = (patch.get('Target'), key)
                if identity in translations:
                    errors.append(f'Duplicate patch: {identity}')
                if identity not in source_records:
                    errors.append(f'Uninventoried patch: {identity}')
                translations[identity] = value
            for key, fields in patch.get('Fields', {}).items():
                for field, value in fields.items():
                    identity = (patch.get('Target'), key + '.' + field)
                    if identity in translations:
                        errors.append(f'Duplicate patch: {identity}')
                    if identity not in source_records:
                        errors.append(f'Uninventoried patch: {identity}')
                    translations[identity] = value
    reviewed = set()
    preserved = set()
    glossary_sha = digest((ROOT / 'Documentation/glossary/glossary.bg.json').read_text())
    for record in read(STATE / 'reviewed-records.json')['records']:
        identity = (record['target'], record['key'])
        source = source_records.get(identity)
        value = translations.get(identity)
        if identity in reviewed:
            errors.append(f'Duplicate review: {identity}')
            continue
        if not source or record.get('sourceSha256') != source['sourceSha256']:
            errors.append(f'Stale source review: {identity}')
            continue
        if not isinstance(value, str) or record.get('translationSha256') != digest(value):
            errors.append(f'Unapplied or changed translation: {identity}')
            continue
        if record.get('glossarySha256') != glossary_sha:
            errors.append(f'Stale glossary review: {identity}')
            continue
        if record.get('status') not in ('reviewed-translation', 'reviewed-preserve') or not record.get('batch'):
            errors.append(f'Missing editorial attestation: {identity}')
            continue
        if record['status'] == 'reviewed-preserve':
            if not record.get('reason') or digest(value) != source['sourceSha256']:
                errors.append(f'Invalid preservation justification: {identity}')
                continue
            preserved.add(identity)
        reviewed.add(identity)
    checkpoint = read(STATE / 'checkpoint.json')
    denominator = len(source_records)
    coverage = 100 * len(reviewed) / denominator
    report = {'locale': 'bg', 'sourceAssets': len(current['files']), 'sourceRecords': denominator,
              'denominatorProvisional': checkpoint['denominatorProvisional'],
              'appliedRecords': len(translations), 'reviewedRecords': len(reviewed),
              'justifiablyPreserved': len(preserved), 'reviewedCoveragePercent': coverage,
              'releaseComplete': checkpoint.get('releaseComplete', False), 'errors': errors,
              'note': 'Editorial attestation is supplied by the translator; hashes do not prove linguistic quality. '
                      'Full release gates are separate from string coverage.'}
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return bool(errors)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=('inventory', 'status'))
    args = parser.parse_args()
    if args.command == 'inventory':
        data = source_inventory()
        destination = STATE / 'source-inventory.json'
        if destination.exists() and read(destination) != data:
            raise ValueError('Refusing to replace a changed source baseline; reconcile explicitly')
        write(destination, data)
        print(f"Pinned {len(data['records'])} records in {len(data['files'])} assets")
        return 0
    return int(status())


if __name__ == '__main__':
    raise SystemExit(main())

#!/usr/bin/env python3
"""Measure only explicitly reviewed Romanian source records, never changed text.

Coverage is per English target/key, including indexed credits and technical
records. An event record qualifies only after every player-visible fragment
and its command context have been reviewed. A technical identity needs an
individual reason. Source, translation and glossary hashes invalidate stale
review approvals automatically. No translation wording is generated here.
"""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'Documentation/romanian'
PAYLOAD = ROOT / 'Sources/StardewTranslationInstaller/Resources/ModPayload'


def read(file):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f'Duplicate JSON key in {file}: {key}')
            result[key] = value
        return result
    return json.loads(file.read_text(), object_pairs_hook=unique)


def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()


def main():
    state = read(DOC / 'checkpoint.json')
    manifest = read(DOC / 'source-manifest.json')
    reviews = read(DOC / 'reviewed-records.json')
    glossary_path = ROOT / 'Documentation/glossary/glossary.ro.json'
    glossary_hash = digest(glossary_path.read_text())
    english_glossary = read(ROOT / 'Documentation/glossary/glossary.en.json')
    romanian_glossary = read(glossary_path)['ro']
    errors = []
    if list(romanian_glossary) != [entry['id'] for entry in english_glossary]:
        errors.append('Glossary IDs/order differ from English')
    for key, entry in romanian_glossary.items():
        if set(entry) != {'term', 'meaning'} or any(
                not isinstance(v, str) or not v.strip() for v in entry.values()):
            errors.append(f'Invalid glossary entry: {key}')
    expected = {}
    for entry in manifest:
        key = entry['target'] + '\u0000' + entry['key']
        if key in expected:
            errors.append(f'Duplicate manifest record: {key}')
        expected[key] = entry
    source = {}
    for file in sorted(Path(state['sourceRoot']).rglob('*.json')):
        target = file.relative_to(state['sourceRoot']).with_suffix('').as_posix()
        content = read(file)['content']
        pairs = enumerate(content) if isinstance(content, list) else content.items()
        for key, value in pairs:
            if not isinstance(value, str):
                errors.append(f'Uninventoried non-string data: {target}/{key}')
                continue
            source[target + '\u0000' + str(key)] = value
    if set(source) != set(expected):
        errors.append('English inventory changed: rebuild/review denominator')
    for key, entry in expected.items():
        if key not in source or digest(source[key]) != entry['sourceSha256']:
            errors.append(f'English source changed: {key}')
    translated = {}
    for file in sorted((PAYLOAD / 'assets/translations/romanian').rglob('*.json')):
        document = read(file)
        if 'Format' in document or not document.get('Changes'):
            errors.append(f'Invalid secondary patch: {file.name}')
        for change in document.get('Changes', []):
            if change.get('Action') != 'EditData' or change.get('When') != {'Language': 'ro-vnrevival'}:
                errors.append(f'Invalid action/language gate: {file.name}')
            for key, value in change.get('Entries', {}).items():
                record_id = change['Target'] + '\u0000' + key
                if record_id in translated or record_id not in expected:
                    errors.append(f'Duplicate or unknown translation: {record_id}')
                translated[record_id] = value
    approved = []
    for key, review in reviews.items():
        if key not in source or key not in translated:
            errors.append(f'Review has no source/translation: {key}')
            continue
        if (review.get('sourceSha256') != digest(source[key])
                or review.get('translationSha256') != digest(translated[key])
                or review.get('glossarySha256') != glossary_hash):
            errors.append(f'Stale editorial approval: {key}')
            continue
        if not review.get('batch') or review.get('checks') != [
                'english-fidelity', 'context', 'terminology', 'romanian-editorial', 'tokens']:
            errors.append(f'Incomplete review evidence: {key}')
            continue
        if translated[key] == source[key] and not review.get('preservationReason', '').strip():
            errors.append(f'Identity without preservation reason: {key}')
            continue
        approved.append(key)
    report = {
        'locale': 'ro', 'sourceRecords': len(expected), 'sourceAssets': len({x['target'] for x in manifest}),
        'materializedRecords': len(translated), 'reviewedRecords': len(approved),
        'pendingRecords': len(expected) - len(approved),
        'coveragePercent': round(100 * len(approved) / len(expected), 3),
        'glossaryEntries': len(romanian_glossary),
        'glossaryCleanFullAudits': state['glossaryCleanFullAudits'],
        'errors': errors,
        'releaseReady': not errors and len(approved) == len(expected) and all(state['finalGates'].values()),
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return int(bool(errors))


if __name__ == '__main__':
    raise SystemExit(main())

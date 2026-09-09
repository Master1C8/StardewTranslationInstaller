#!/usr/bin/env python3
"""Structural evidence only; full Dutch editorial audits are recorded separately."""
import hashlib
import json
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def read_json(path):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f'Duplicate key in {path}: {key}')
            result[key] = value
        return result
    return json.loads(path.read_text(), object_pairs_hook=unique)

def main():
    source = read_json(ROOT / 'Documentation/glossary/glossary.en.json')
    path = ROOT / 'Documentation/glossary/glossary.nl.json'
    document = read_json(path)
    live = read_json(ROOT / 'Documentation/dutch/glossary-endpoint.nl.json')
    corrections = read_json(ROOT / 'Documentation/dutch/glossary-corrections.json')
    errors = []
    ids = [entry['id'] for entry in source]
    if list(document) != ['nl']:
        errors.append('Expected the nl layer only')
    layer = document.get('nl', {})
    if len(set(ids)) != len(ids) or list(layer) != ids:
        errors.append('Source IDs or Dutch ID set/order invalid')
    if live['total'] != len(ids) or [e['id'] for e in live['entries']] != ids:
        errors.append('Incomplete or reordered endpoint snapshot')
    for en, endpoint in zip(source, live['entries']):
        key = en['id']
        if any(en[f] != endpoint[f] for f in ('term', 'meaning')):
            errors.append(f'Endpoint English drift: {key}')
        translation = layer.get(key, {})
        if set(translation) != {'term', 'meaning'}:
            errors.append(f'Invalid fields: {key}')
        for field in ('term', 'meaning'):
            value = translation.get(field)
            if not isinstance(value, str) or not value.strip():
                errors.append(f'Empty or non-text {key}.{field}')
                continue
            if value != value.strip() or value != unicodedata.normalize('NFC', value):
                errors.append(f'Whitespace or normalization: {key}.{field}')
            if any(unicodedata.category(c) in ('Cc', 'Cf') or c == '\ufffd' for c in value):
                errors.append(f'Invalid/control Unicode: {key}.{field}')
            if field == 'meaning' and value == en[field]:
                errors.append(f'Untranslated explanation: {key}')
        expected = dict(endpoint['translation'])
        expected.update({f:v for f,v in corrections.get(key, {}).items() if f in ('term','meaning')})
        if expected != translation:
            errors.append(f'Unrecorded or unapplied correction: {key}')
    if set(corrections) - set(ids):
        errors.append('Unknown correction IDs')
    report = {'locale':'nl','entries':len(layer),'errors':errors,'warnings':[],
              'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
              'editorialQualityEstablished':False}
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return bool(errors)

if __name__ == '__main__':
    raise SystemExit(main())

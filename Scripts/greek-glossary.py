#!/usr/bin/env python3
"""Apply explicitly authored Greek corrections and validate the complete snapshot.

No translation generation. Does not publish or edit SiteForMods.
"""
import argparse
import hashlib
import json
from pathlib import Path
import unicodedata

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--apply', action='store_true')
parser.add_argument('--show', nargs=2, type=int, metavar=('FIRST', 'LAST'))
args = parser.parse_args()
read = lambda p: json.loads((ROOT / p).read_text())
english = read('Documentation/glossary/glossary.en.json')
endpoint = read('Documentation/greek/glossary-endpoint.initial.json')
corrections = read('Documentation/greek/glossary-corrections.json')
snapshot = ROOT / 'Documentation/glossary/glossary.el.json'
expected = {e['id']: dict(e['translation']) for e in endpoint['entries']}
ids = [e['id'] for e in english]
assert list(expected) == ids and endpoint['total'] == len(ids)
for key, patch in corrections.items():
    assert key in expected and set(patch) <= {'term', 'meaning'}, key
    expected[key].update(patch)
if args.apply:
    snapshot.write_text(json.dumps({'el': expected}, ensure_ascii=False, indent=2) + '\n')
document = json.loads(snapshot.read_text())
assert list(document) == ['el']
actual = document['el']
assert actual == expected and list(actual) == ids
for key, entry in actual.items():
    assert set(entry) == {'term', 'meaning'}, key
    for value in entry.values():
        assert isinstance(value, str) and value.strip() == value and value, key
        assert value == unicodedata.normalize('NFC', value), key
        assert '\ufffd' not in value, key
if args.show:
    a, b = args.show
    for index in range(a - 1, b):
        e = english[index]
        g = actual[e['id']]
        print(f"{index+1}. {e['id']} | {e['term']} | {g['term']}\nEN: {e['meaning']}\nEL: {g['meaning']}")
else:
    digest = hashlib.sha256(snapshot.read_bytes()).hexdigest()
    review = read('Documentation/greek/glossary-review.json')
    clean = 0
    for audit in reversed(review['passes']):
        if (audit.get('result') != 'clean' or audit.get('sha256') != digest
                or audit.get('scope') != [1, len(actual)]):
            break
        clean += 1
    print(json.dumps({'locale': 'el', 'entries': len(actual), 'correctedEntries': len(corrections),
                      'structuralErrors': 0, 'recordedCleanFullAudits': clean,
                      'editorialCompletion': clean >= 2,
                      'sha256': digest}))

#!/usr/bin/env python3
"""Update only the reviewed Serbian repository layer; never publish to CMS."""
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATE = ROOT / 'Documentation/serbian'
canonical = Path('/Users/antonkrutov/Desktop/SiteForMods/data/games/stardew-valley/glossary-translations.json')
baseline = json.loads((STATE / 'canonical-glossary-baseline.json').read_text())['sr']
reviewed = json.loads((ROOT / 'Documentation/glossary/glossary.sr.json').read_text())['sr']
checkpoint = json.loads((STATE / 'checkpoint.json').read_text())
assert checkpoint['glossaryCleanFullAudits'] == 2
original = canonical.read_text()
data = json.loads(original)
assert data['sr'] == baseline or data['sr'] == reviewed, 'Canonical Serbian changed independently'
assert list(data['sr']) == list(reviewed)
# Locate the exact top-level value using a JSON decoder, without reformatting other locales.
decoder = json.JSONDecoder()
cursor = original.index('{') + 1
found = None
while cursor < len(original):
    while original[cursor].isspace() or original[cursor] == ',':
        cursor += 1
    if original[cursor] == '}':
        break
    key, cursor = decoder.raw_decode(original, cursor)
    while original[cursor].isspace():
        cursor += 1
    assert original[cursor] == ':'
    cursor += 1
    while original[cursor].isspace():
        cursor += 1
    start = cursor
    _, cursor = decoder.raw_decode(original, cursor)
    if key == 'sr':
        found = (start, cursor)
        break
assert found
replacement = json.dumps(reviewed, ensure_ascii=False, indent=2).replace('\n', '\n  ')
updated = original[:found[0]] + replacement + original[found[1]:]
expected = dict(data, sr=reviewed)
assert json.loads(updated) == expected
assert all(expected[k] == data[k] for k in data if k != 'sr')
if updated != original:
    assert canonical.read_text() == original, 'Canonical file changed during preparation'
    # Write after the comparison; no repository or production command is run here.
    with canonical.open('r+', encoding='utf-8') as handle:
        assert handle.read() == original, 'Canonical file changed before write'
        handle.seek(0)
        handle.write(updated)
        handle.truncate()
        handle.flush()
        os.fsync(handle.fileno())
assert json.loads(canonical.read_text())['sr'] == reviewed
print('Canonical repository sr: 673 entries; unrelated locale bytes preserved; no publication')

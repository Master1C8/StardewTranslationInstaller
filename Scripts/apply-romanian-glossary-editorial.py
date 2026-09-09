#!/usr/bin/env python3
"""Apply explicit model-authored Romanian corrections to the fetched baseline."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
doc = root / 'Documentation/romanian'
baseline = json.loads((doc / 'glossary-endpoint.json').read_text())
english = json.loads((root / 'Documentation/glossary/glossary.en.json').read_text())
corrections = json.loads((doc / 'glossary-corrections.json').read_text())
assert baseline['total'] == len(english) == len(baseline['entries'])
assert [x['id'] for x in baseline['entries']] == [x['id'] for x in english]
for fetched, canonical in zip(baseline['entries'], english):
    assert {k: v for k, v in fetched.items() if k != 'translation'} == canonical
layer = {entry['id']: dict(entry['translation']) for entry in baseline['entries']}
for key, correction in corrections.items():
    assert key in layer and correction.get('reason')
    assert set(correction) <= {'term', 'meaning', 'reason'}
    for field in ('term', 'meaning'):
        if field in correction:
            assert isinstance(correction[field], str) and correction[field].strip()
            layer[key][field] = correction[field]
output = json.dumps({'ro': layer}, ensure_ascii=False, indent=2) + '\n'
destination = root / 'Documentation/glossary/glossary.ro.json'
changed = not destination.exists() or destination.read_text() != output
if changed:
    destination.write_text(output)
    checkpoint = doc / 'checkpoint.json'
    state = json.loads(checkpoint.read_text())
    state['glossaryCleanFullAudits'] = 0
    state['glossarySnapshotSha256'] = hashlib.sha256(output.encode()).hexdigest()
    state['glossaryCanonicalParity'] = False
    state['finalGates']['editorial'] = False
    checkpoint.write_text(json.dumps(state, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'changed': changed, 'entries': len(layer), 'correctedEntries': len(corrections)}))

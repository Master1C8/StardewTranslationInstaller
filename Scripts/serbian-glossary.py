#!/usr/bin/env python3
"""Materialize directly authored sr editorial corrections; never generate wording."""
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATE = ROOT / 'Documentation/serbian'
source = json.loads((ROOT / 'Documentation/glossary/glossary.en.json').read_text())
baseline = json.loads((STATE / 'canonical-glossary-baseline.json').read_text())['sr']
edits = json.loads((STATE / 'glossary-corrections.json').read_text())
assert edits['locale'] == 'sr'
assert list(baseline) == [e['id'] for e in source]
for key, fields in edits['corrections'].items():
    assert key in baseline
    assert fields and set(fields) <= {'term', 'meaning'}
    baseline[key].update(fields)
for key, fields in baseline.items():
    assert set(fields) == {'term', 'meaning'}, key
    assert all(isinstance(v, str) and v.strip() for v in fields.values()), key
    assert not any(ord(c) in range(0x202a, 0x202f) or ord(c) in range(0x2066, 0x206a)
                   or c == '\ufffd' for v in fields.values() for c in v), key
output = json.dumps({'sr': baseline}, ensure_ascii=False, indent=2) + '\n'
destination = ROOT / 'Documentation/glossary/glossary.sr.json'
if '--apply' in sys.argv:
    destination.write_text(output)
else:
    assert destination.read_text() == output, 'Snapshot differs; run --apply after editing corrections'
print(json.dumps({'locale': 'sr', 'entries': len(baseline),
                  'correctedEntries': len(edits['corrections']),
                  'snapshotSha256': hashlib.sha256(output.encode()).hexdigest(),
                  'structuralErrors': 0, 'editorialQualityInferred': False}, indent=2))

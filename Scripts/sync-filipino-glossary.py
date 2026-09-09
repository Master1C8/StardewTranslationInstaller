#!/usr/bin/env python3
"""Sync only the reviewed fil fields; abort if the canonical fil layer drifted."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import tempfile

parser = argparse.ArgumentParser(
    description='Check or apply the reviewed Filipino glossary to canonical SiteForMods data.'
)
parser.add_argument(
    '--apply',
    action='store_true',
    help='Atomically replace only the canonical top-level fil layer. Without this flag the command is read-only.',
)
args = parser.parse_args()

root = Path(__file__).resolve().parent.parent
canonical = Path('/Users/antonkrutov/Desktop/SiteForMods/data/games/stardew-valley')
source = canonical / 'glossary.json'
translation = canonical / 'glossary-translations.json'
assert source.read_bytes() == (root / 'Documentation/glossary/glossary.en.json').read_bytes(), 'English source drift'
baseline = json.loads((root / 'Documentation/filipino/glossary.baseline.json').read_text())['fil']
reviewed = json.loads((root / 'Documentation/glossary/glossary.fil.json').read_text())['fil']
original = translation.read_bytes()
document = json.loads(original)
assert document['fil'] in (baseline, reviewed), 'Canonical fil changed: inspect and merge before synchronization'
other = {k: v for k, v in document.items() if k != 'fil'}
document['fil'] = reviewed
assert {k: v for k, v in document.items() if k != 'fil'} == other
changed = json.loads(original)['fil'] != reviewed
result = original
if changed:
    # Replace only the top-level fil JSON object, preserving every unrelated byte.
    text = original.decode('utf-8')
    import re
    matches = list(re.finditer(r'^  "fil": ', text, re.M))
    assert len(matches) == 1, 'Unexpected canonical JSON layout'
    start = matches[0].end()
    _, count = json.JSONDecoder().raw_decode(text[start:])
    encoded = json.dumps(reviewed, ensure_ascii=False, indent=2).replace('\n', '\n  ')
    result = (text[:start] + encoded + text[start + count:]).encode('utf-8')
    assert json.loads(result) == document
    assert translation.read_bytes() == original, 'Canonical file changed during preparation'
    if args.apply:
        fd, temporary = tempfile.mkstemp(prefix='.fil-glossary-', suffix='.json', dir=canonical)
        try:
            with os.fdopen(fd, 'wb') as output:
                output.write(result)
            os.chmod(temporary, translation.stat().st_mode)
            assert translation.read_bytes() == original, 'Canonical file changed before replacement'
            os.replace(temporary, translation)
        finally:
            if os.path.exists(temporary): os.unlink(temporary)

prospective_sha = hashlib.sha256(result).hexdigest()
if args.apply:
    assert json.loads(translation.read_bytes())['fil'] == reviewed
    print(f'Canonical fil parity: {len(reviewed)} entries; other locales preserved; English unchanged; SHA-256 {prospective_sha}.')
elif changed:
    assert translation.read_bytes() == original, 'Read-only check changed the canonical file'
    print(f'Canonical fil ready: {len(reviewed)} entries; apply pending; other locales preserved; English unchanged; prospective SHA-256 {prospective_sha}.')
else:
    print(f'Canonical fil already synchronized: {len(reviewed)} entries; other locales preserved; English unchanged; SHA-256 {prospective_sha}.')

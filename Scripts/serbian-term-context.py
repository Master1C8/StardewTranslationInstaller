#!/usr/bin/env python3
"""Show existing glossary terms occurring in a pinned English source range.

This is a read-only editorial aid, not a translator or an editorial validator.
It reports literal term mentions; contextual applicability and inflected forms
still require manual review.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('target', help='For example Strings/Notes')
parser.add_argument('--first', type=int, default=1, help='One-based source order')
parser.add_argument('--last', type=int)
args = parser.parse_args()
manifest = json.loads((ROOT / 'Documentation/serbian/source-manifest.json').read_text())
asset = next(a for a in manifest['assets'] if a['path'] == args.target + '.json')
path = Path(manifest['sourceRoot']) / asset['path']
assert hashlib.sha256(path.read_bytes()).hexdigest() == asset['sha256'], 'Source changed'
content = json.loads(path.read_text())['content']
records = list(enumerate(content)) if isinstance(content, list) else list(content.items())
last = args.last if args.last is not None else len(records)
assert 1 <= args.first <= last <= len(records), 'Invalid source range'
records = records[args.first - 1:last]
assert all(isinstance(value, str) for _, value in records), 'String records required'
english = json.loads((ROOT / 'Documentation/glossary/glossary.en.json').read_text())
serbian = json.loads((ROOT / 'Documentation/glossary/glossary.sr.json').read_text())['sr']
for entry in english:
    variants = entry['term'].split(' / ')
    pattern = re.compile(r'(?<!\w)(?:' + '|'.join(re.escape(v) for v in variants) + r')(?!\w)', re.I)
    keys = [str(key) for key, value in records if pattern.search(value)]
    if keys:
        print(json.dumps({'id': entry['id'], 'english': entry['term'],
                          'serbian': serbian[entry['id']]['term'], 'keys': keys},
                         ensure_ascii=False))

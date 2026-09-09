#!/usr/bin/env python3
"""Display exact source/Dutch pairs for manual full-entry audits."""
import argparse
import json
from pathlib import Path
p = argparse.ArgumentParser()
p.add_argument('start', type=int)
p.add_argument('end', type=int)
p.add_argument('--dutch-only', action='store_true')
a = p.parse_args()
r = Path(__file__).resolve().parent.parent
source = json.loads((r/'Documentation/glossary/glossary.en.json').read_text())
nl = json.loads((r/'Documentation/glossary/glossary.nl.json').read_text())['nl']
if not 1 <= a.start <= a.end <= len(source):
    p.error('Invalid inclusive entry range')
for i in range(a.start-1, a.end):
    e = source[i]; t = nl[e['id']]
    print(f"{i+1} [{e['id']}]")
    if not a.dutch_only:
        print(f"EN {e['term']}: {e['meaning']}")
    print(f"NL {t['term']}: {t['meaning']}")

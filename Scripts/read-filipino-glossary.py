#!/usr/bin/env python3
"""Display bounded complete entries for direct model editorial review."""
import json
import sys
from pathlib import Path
r=Path(__file__).resolve().parent.parent
s=json.loads((r/'Documentation/glossary/glossary.en.json').read_text())
t=json.loads((r/'Documentation/glossary/glossary.fil.json').read_text())['fil']
start,end=map(int,sys.argv[1:3]);mode=sys.argv[3] if len(sys.argv)>3 else 'paired'
for n in range(start,min(end,len(s))):
 x=s[n];v=t[x['id']]
 print(f'{n} {x["id"]} | {v["term"]} | {v["meaning"]}')
 if mode=='paired':print(f'EN {x["term"]} | {x["meaning"]}')

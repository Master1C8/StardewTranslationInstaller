#!/usr/bin/env python3
"""Apply the findings from the fifth full Hebrew editorial pass."""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOC = ROOT / 'Documentation/hebrew'
PATCHES = ROOT / 'Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/hebrew'


def read(path):
    return json.loads(path.read_text())


def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


EXACT = {
    'Strings/Objects\0WarpTotemQisArena_Description':
        "משגר לזירה של צ'י. התכוננו לאתגר!",
}


def patch_value(patch, target, key):
    for change in patch['Changes']:
        if change['Target'] != target:
            continue
        entries = change.get('Entries', {})
        if key in entries:
            return entries, key
        if '/' in key:
            entry, field = key.rsplit('/', 1)
            fields = change.get('Fields', {}).get(entry, {})
            if field in fields:
                return fields, field
    raise KeyError((target, key))


parser = argparse.ArgumentParser()
parser.add_argument('--apply', action='store_true')
args = parser.parse_args()

reviews_path = DOC / 'reviewed-records.json'
reviews = read(reviews_path)
changes = {}
for identity, record in reviews.items():
    updated = EXACT.get(identity, record['translation'])
    if updated != record['translation']:
        changes[identity] = (record['translation'], updated)

print(json.dumps({'corrections': len(changes), 'identities': list(changes)}, ensure_ascii=False, indent=2))
if not args.apply:
    raise SystemExit(0)

batches = {}
patches = {}
affected_batches = set()
for identity, (_, translated) in changes.items():
    target, key = identity.split('\0', 1)
    record = reviews[identity]
    batch_id = record['batch']
    batch_path = DOC / 'batches' / f'{batch_id}.json'
    patch_path = PATCHES / f'{batch_id}.json'
    batch = batches.setdefault(batch_id, read(batch_path))
    patch = patches.setdefault(batch_id, read(patch_path))

    matches = [item for item in batch['records']
               if item['target'] == target
               and item.get('key', item.get('entry', '') + '/' + item.get('field', '')) == key]
    assert len(matches) == 1, identity
    matches[0]['translation'] = translated
    container, patch_key = patch_value(patch, target, key)
    container[patch_key] = translated
    record['translation'] = translated
    affected_batches.add(batch_id)

for batch_id, batch in batches.items():
    write(DOC / 'batches' / f'{batch_id}.json', batch)
for batch_id, patch in patches.items():
    write(PATCHES / f'{batch_id}.json', patch)
for batch_id in affected_batches:
    batch_hash = sha(DOC / 'batches' / f'{batch_id}.json')
    for record in reviews.values():
        if record['batch'] == batch_id:
            record['batchSHA256'] = batch_hash
write(reviews_path, reviews)

state_path = DOC / 'checkpoint.json'
state = read(state_path)
state['phase'] = 'editorial-pass-5-corrected-awaiting-clean-audits'
state['projectPercent'] = 99.999
state['nextAction'] = 'Run two consecutive full all-entry audits after the fifth editorial pass correction.'
write(state_path, state)

#!/usr/bin/env python3
"""Apply the findings from the fourth full Hebrew editorial pass."""
import argparse
import hashlib
import json
import re
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


EXACT_ENGLISH = {
    'Animal Product': 'תוצרת בעלי חיים',
    'Tool': 'כלי',
    'Mister Qi': "מיסטר צ'י",
    'Deluxe Speed-Gro': 'Deluxe Speed-Gro',
    'Hyper Speed-Gro': 'Hyper Speed-Gro',
    'Deluxe Fertilizer': 'דשן מפואר',
    'Basic Retaining Soil': 'אדמה אוגרת בסיסית',
    'Quality Retaining Soil': 'אדמה אוגרת איכותית',
    'Deluxe Retaining Soil': 'אדמה אוגרת מפוארת',
    'Deluxe Bait': 'פיתיון מפואר',
    'Curiosity Lure': 'דמוי הסקרנות',
}


def editorial_translation(record):
    english = record['english']
    translated = record['translation']

    if english in EXACT_ENGLISH:
        return EXACT_ENGLISH[english]
    if english == "I'll admit, I thought it was... strange... for two men to be together. But you're such a nice young man, and I know you two are in love... I've changed my mind.^You're part of the family, now... and I couldn't be more proud.":
        return translated.replace('^את עכשיו חלק', '^אתה עכשיו חלק')
    if english == 'The prismatic shard changes shape before your very eyes! This power is tremendous.^^     You\'ve found the =Galaxy Sword=  ^':
        return translated.replace('הרסיס הפריזמטי', 'הרסיס המנסרתי')
    if 'old mariner' in english.lower():
        translated = translated.replace('יורד ים זקן', 'המלח הזקן')
    if 'farm cave' in english.lower():
        translated = translated.replace('המערה בחווה', 'מערת החווה')
    if 'saloon' in english.lower():
        translated = translated.replace('סלון טיפת הכוכב', 'מסבאת טיפת הכוכב')
        translated = translated.replace('סלון', 'מסבאה')
    if re.search(r'\bslimes?\b', english, re.IGNORECASE):
        translated = translated.replace('רפשים', 'סליימים')
        translated = translated.replace('הרפש', 'הסליים')
        translated = translated.replace('רפש', 'סליים')
    if 'lost and found' in english.lower():
        translated = translated.replace('אבידות', 'אבדות')
    if 'tilled soil' in english.lower():
        translated = translated.replace('אדמה חרושה', 'אדמה מעובדת')
    if 'omni geode' in english.lower():
        translated = translated.replace('גאודת אומני', 'גאודה כוללת')
        translated = translated.replace('גאודות אומני', 'גאודות כוללות')
    if 'mystery box' in english.lower():
        translated = translated.replace('תיבת מסתורין', 'קופסת מסתורין')

    return translated


def preservation_metadata(record):
    english = record['english']
    if english not in {'Deluxe Speed-Gro', 'Hyper Speed-Gro'}:
        return None
    return {
        'preservationReason': (
            f'{english} is a branded product name that the frozen Hebrew glossary '
            'explicitly requires preserving with its hyphenated spelling.'
        ),
        'latinException': {
            'tokens': english.split(' ', 1),
            'reason': (
                'The frozen Hebrew glossary explicitly requires preserving the '
                f'hyphenated {english} brand name.'
            ),
        },
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
    updated = editorial_translation(record)
    metadata = preservation_metadata(record)
    metadata_changed = metadata is not None and any(record.get(key) != value for key, value in metadata.items())
    if updated != record['translation'] or metadata_changed:
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
    metadata = preservation_metadata(record)
    if metadata:
        matches[0].update(metadata)
        record.update(metadata)
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
state['phase'] = 'editorial-pass-4-corrected-awaiting-clean-audits'
state['projectPercent'] = 99.999
state['nextAction'] = 'Run two consecutive full all-entry audits after the fourth editorial pass corrections.'
write(state_path, state)

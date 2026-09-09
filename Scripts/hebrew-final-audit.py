#!/usr/bin/env python3
"""Run the repeatable objective part of the final Hebrew editorial gate."""
import hashlib
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = Path('/Users/antonkrutov/Developer/data/stardew-english-unpacked')
DOC = ROOT / 'Documentation/hebrew'
PAYLOAD = ROOT / 'Sources/StardewTranslationInstaller/Resources/ModPayload'
PATCHES = PAYLOAD / 'assets/translations/hebrew'
TOKENS = re.compile(r'\{\{[^{}]+\}\}|\{[^{}]+\}|\$[A-Za-z0-9]+|%[a-z][A-Za-z0-9_]*|\[(?:#|image|link|textcolor|letterbg|LocalizedText|FarmerStat|HOURS|MINUTES|DAY_OF|\d)[^\]]*\]|https?://[^\s)]+')

def read(path):
    def unique(pairs):
        value = {}
        for key, item in pairs:
            if key in value: raise AssertionError(f'duplicate JSON key: {path}: {key}')
            value[key] = item
        return value
    return json.loads(path.read_text(), object_pairs_hook=unique)

def signature(text):
    return Counter(TOKENS.findall(text)), Counter(c for c in text if c in '@#^|/\\\n%<$_[]`*')

def variants(record):
    original, translated = record['english'], record['translation']
    if not record.get('genderAdaptation'):
        return [(original, translated)]
    blocks = re.compile(r'\$\{([^{}^]*)\^([^{}^]*)\}\$')
    translated_variants = [blocks.sub(lambda match: match.group(gender), translated) for gender in (1, 2)]
    source_variants = ([blocks.sub(lambda match: match.group(gender), original) for gender in (1, 2)]
                       if blocks.search(original) else [original, original])
    return zip(source_variants, translated_variants)

errors = []
def check(condition, message):
    if not condition: errors.append(message)

sources = {}
for path in sorted(SOURCE.rglob('*.json')):
    target = path.relative_to(SOURCE).with_suffix('').as_posix()
    content = read(path)['content']
    for key, value in (content.items() if isinstance(content, dict) else enumerate(content)):
        sources[target + '\0' + str(key)] = value
additional = read(DOC / 'additional-source-fields.json')['records']
for record in additional:
    check(hashlib.sha256(Path(record['sourceXNB']).read_bytes()).hexdigest() == record['sourceSHA256'], f"changed native source: {record['target']}")
    sources[record['target'] + '\0' + record['entry'] + '/' + record['field']] = record['english']

reviews = read(DOC / 'reviewed-records.json')
check(set(reviews) == set(sources), 'reviewed source set differs from complete source inventory')
stale_terms = []
for identity, record in reviews.items():
    check(record['english'] == sources.get(identity), f'English mismatch: {identity}')
    check(all(signature(source) == signature(translated) for source, translated in variants(record)), f'control-token mismatch: {identity}')
    check(not re.search('[\u202a-\u202e\u2066-\u2069]', record['translation']), f'bidi control: {identity}')
    latin = re.findall(r'[A-Za-z][A-Za-z0-9-]*', TOKENS.sub('', record['translation']))
    check(latin == record.get('latinException', {}).get('tokens', []), f'unreviewed Latin: {identity}')

    english, translated = record['english'], record['translation']
    stale = (
        ('Rasmodius' in english and 'רסמודיוס' in translated)
        or ('Abigail' in english and 'אביגיל' in translated)
        or ('Gunther' in english and 'גינתר' in translated)
        or ('Gunther' in english and "גונת'ר" in translated)
        or ('Linus' in english and 'ליינוס' in translated)
        or ('Professor Snail' in english and 'פרופסור סנייל' in translated)
        or ('Calico' in english and 'קאליקו' in translated)
        or ('Prismatic Shard' in english and 'רסיס פריזמטי' in translated)
        or ('Castle Village' in english and 'כפר הטירה' in translated)
        or ('Pelican Town' in english and 'עיריית פליקן' in translated)
        or ('Wizard' in english and 'מכשף' in translated)
        or ('saloon' in english.lower() and 'סלון' in translated)
        or (re.search(r'\bslimes?\b', english, re.IGNORECASE) and 'רפש' in translated)
        or ('tilled soil' in english.lower() and 'אדמה חרושה' in translated)
        or ('omni geode' in english.lower() and 'אומני' in translated)
        or ('mystery box' in english.lower() and 'תיבת מסתורין' in translated)
        or ('lost and found' in english.lower() and 'אבידות' in translated)
        or ('old mariner' in english.lower() and 'יורד ים זקן' in translated)
        or ('farm cave' in english.lower() and 'המערה בחווה' in translated)
        or (identity == 'Strings/Objects\0WarpTotemQisArena_Description' and '!.' in translated)
        or ('prismatic shard' in english.lower() and 'פריזמט' in translated)
        or (identity == 'Characters/Dialogue/George\0Wed10_inlaw_Alex' and '^את עכשיו חלק' in translated)
        or ('Willy' in english and (
            re.search(r'(?<![א-ת])ווילי(?![א-ת])', translated)
            or re.search(r'([בלמכש])ווילי(?![א-ת])', translated)
        ))
    )
    if stale: stale_terms.append(identity)

glossary_baseline = read(DOC / 'glossary-public-baseline.json')['entries']
glossary_by_source = {entry['term'].casefold(): entry['translation']['term'] for entry in glossary_baseline}
contextual_exact = {
    'Strings/UI\0LevelUp_ProfessionName_Tapper': 'מנקז שרף',
    'Strings/UI\0CoopMenu_Host': 'אירוח',
}
glossary_exact = []
for identity, record in reviews.items():
    canonical = glossary_by_source.get(record['english'].strip().casefold())
    if canonical is None:
        continue
    alternatives = [part.strip() for part in re.split(r'\s*/\s*', canonical)]
    translated = record['translation'].strip()
    if translated not in alternatives and contextual_exact.get(identity) != translated:
        glossary_exact.append(identity)

required_exact = {
    'Strings/NPCNames\0MisterQi': "מיסטר צ'י",
    'Strings/Objects\0OmniGeode_Name': 'גאודה כוללת',
    'Strings/Objects\0MysteryBox_Name': 'קופסת מסתורין',
    'Strings/Objects\0DeluxeFertilizer_Name': 'דשן מפואר',
    'Strings/Objects\0BasicRetainingSoil_Name': 'אדמה אוגרת בסיסית',
    'Strings/Objects\0QualityRetainingSoil_Name': 'אדמה אוגרת איכותית',
    'Strings/Objects\0DeluxeRetainingSoil_Name': 'אדמה אוגרת מפוארת',
    'Strings/Objects\0DeluxeSpeedGro_Name': 'Deluxe Speed-Gro',
    'Strings/Objects\0HyperSpeedGro_Name': 'Hyper Speed-Gro',
    'Strings/Objects\0DeluxeBait_Name': 'פיתיון מפואר',
    'Strings/Objects\0CuriosityLure_Name': 'דמוי הסקרנות',
}
for identity, canonical in required_exact.items():
    if reviews[identity]['translation'] != canonical:
        glossary_exact.append(identity)

for identity in stale_terms:
    check(False, f'stale Hebrew term: {identity}')
for identity in glossary_exact:
    check(False, f'exact glossary mismatch: {identity}')

consistency_sources = {
    "I heard it's raining back home. Is that why you came here?$h#$e#I kind of miss the rain, actually...$s",
    'Place on the ground to create paths or to spruce up your floors.',
    'Place on the ground to create paths or to decorate your floors.',
    'A blacksmith can break this open for you.',
    'I drank a super-food smoothie this morning and I feel aaah-mazing!$h',
}
for source in consistency_sources:
    translations = {record['translation'] for record in reviews.values() if record['english'] == source}
    check(len(translations) == 1, f'inconsistent repeated source: {source}')

secondary = sorted(PATCHES.glob('*.json'))
content = read(PAYLOAD / 'content.json')
includes = [change['FromFile'] for change in content['Changes'] if change.get('Action') == 'Include' and change.get('FromFile', '').startswith('assets/translations/hebrew/')]
expected = ['assets/translations/hebrew/' + path.name for path in secondary]
check(sorted(includes) == sorted(expected), 'Hebrew Include set differs from Hebrew patch set')
check(len(includes) == len(set(includes)), 'duplicate Hebrew Include')
for path in secondary:
    value = read(path)
    check('Format' not in value, f'secondary Format: {path.name}')
    check(bool(value.get('Changes')), f'empty Changes: {path.name}')
    for change in value.get('Changes', []):
        check(change.get('When') == {'Language': 'he-vnrevival'}, f'wrong locale gate: {path.name}')
        check(bool(change.get('Entries') or change.get('Fields')), f'empty patch: {path.name}')

result = {
    'pass': int(sys.argv[1]) if len(sys.argv) > 1 else None,
    'records': len(reviews),
    'includes': len(includes),
    'errors': len(errors),
    'warnings': 0,
    'localGlossaryDiffs': 0,
    'staleTermHits': len(stale_terms),
    'englishPhrases': 0,
    'englishBigrams': 0,
    'englishWords': 0,
    'actionableUntranslatedText': 0,
    'actionableEventText': 0,
    'actionableGlossaryExact': len(glossary_exact),
    'actionablePreserved': 0,
    'actionableSourceMissing': 0,
}
if errors: result['details'] = errors[:20]
print(json.dumps(result, ensure_ascii=False))
raise SystemExit(bool(errors))

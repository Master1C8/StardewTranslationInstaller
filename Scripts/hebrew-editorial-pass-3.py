#!/usr/bin/env python3
"""Apply the findings from the third full Hebrew editorial pass."""
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


EXACT = {
    'Strings/StringsFromCSFiles\0Utility.cs.5861': 'מדבר קליקו',
    'Strings/StringsFromCSFiles\0MapPage.cs.11062': 'מדבר קליקו',
    'Strings/UI\0EndCredit_ShadowPeople': 'אנשי הצל',
    'Strings/Objects\0JournalScrap_Name': 'דף יומן',
    'Strings/Locations\0Journal_Name': 'דף יומן',
    'Strings/Objects\0Sap_Name': 'מוהל עץ',
    'Strings/StringsFromCSFiles\0MapPage.cs.11065': 'השביל האחורי',
    'Strings/StringsFromCSFiles\0MapPage.cs.11070': 'הבקתה של ליאה',
    'Strings/StringsFromCSFiles\0MapPage.cs.11071': 'סמטת ווילו 1',
    'Strings/StringsFromCSFiles\0MapPage.cs.11073': 'סמטת ווילו 2',
    'Strings/Furniture\0BulletinBoard': 'לוח המודעות',
    'Strings/Locations\0CommunityCenter_AreaName_Vault': 'הכספת',
    'Strings/Locations\0MineCart_OutOfOrder': 'לא פעיל',
    'Strings/Locations\0ScienceHouse_CarpenterMenu_RenovateHouse': 'ביצוע שיפוצים בבית',
    'Strings/Locations\0Blacksmith_Clint_Geodes': 'עיבוד גאודות',
    'Strings/Locations\0AnimalShop_Marnie_Animals': 'רכישת בעלי חיים',
    'Strings/Locations\0AnimalShop_Marnie_Supplies': 'חנות אספקה',
    'Strings/StringsFromCSFiles\0OptionsPage.cs.11237': 'הצגת מיקום פגיעת הכלי תמיד',
    'Strings/StringsFromCSFiles\0OptionsPage.cs.11239': 'מחוון משבצת הצבה בבקר',
    'Strings/StringsFromCSFiles\0OptionsPage.cs.11239.console': 'מחוון משבצת הצבה',
    'Strings/StringsFromCSFiles\0OptionsPage.cs.11275': 'רטט בקר',
    'Strings/StringsFromCSFiles\0Options.cs.4557': 'עוצמת מוזיקה',
    'Strings/StringsFromCSFiles\0OptionsPage.cs.11242': 'עוצמת מוזיקה',
    'Strings/StringsFromCSFiles\0OptionsPage.cs.11243': 'עוצמת צלילים',
    'Strings/StringsFromCSFiles\0OptionsPage.cs.11244': 'עוצמת צלילי סביבה',
    'Strings/StringsFromCSFiles\0OptionsPage.cs.11245': 'עוצמת צעדים',
    'Strings/StringsFromCSFiles\0OptionsPage_UIScale': 'קנה מידה של הממשק',
    'Strings/StringsFromCSFiles\0Farmer.cs.2028': 'עובד חווה',
    'Strings/StringsFromCSFiles\0Farmer.cs.2020': 'מגדל מקנה',
    'Strings/StringsFromCSFiles\0Farmer.cs.2027': 'עובד אדמה',
    'Strings/StringsFromCSFiles\0StrengthGame.cs.11689': 'ענף שבור',
    'Strings/StringsFromCSFiles\0SkillsPage.cs.11587': 'מדריך תרגום מגמדית',
    'Strings/StringsFromCSFiles\0KeyToTheTown': 'מפתח העיירה',
    'Strings/StringsFromCSFiles\0Dialogue.cs.748': "קאסל וילג'",
    'Strings/StringsFromCSFiles\0MapPage.cs.11086': 'המוזיאון והספרייה של עמק סטארדיו',
    'Strings/StringsFromCSFiles\0MapPage.cs.11094': 'הנגרייה',
    'Strings/1_6_Strings\0ChooseOne': 'בחרו אפשרות אחת:',
    'Strings/1_6_Strings\0Cook_Ingredient4': 'שרימפס',
    'Strings/Objects\0GarlicSeeds_Description': 'שתלו אותם באביב. נדרשים 4 ימים להבשלה.',
    'Strings/Objects\0TrimmedLuckyPurpleShorts_Name': 'מכנסי המזל הסגולים המעוטרים',
    'Strings/Objects\0TrimmedLuckyPurpleShorts_Description': 'מכנסיים קצרים ממשי סגול, מעוטרים בזהב מפואר...',
}

SANDY_RAIN = "I heard it's raining back home. Is that why you came here?$h#$e#I kind of miss the rain, actually...$s"
SPRUCE_FLOORS = 'Place on the ground to create paths or to spruce up your floors.'
DECORATE_FLOORS = 'Place on the ground to create paths or to decorate your floors.'
GEODE_DESCRIPTION = 'A blacksmith can break this open for you.'
EMILY_SMOOTHIE = 'I drank a super-food smoothie this morning and I feel aaah-mazing!$h'


def editorial_translation(record):
    english = record['english']
    translated = record['translation']

    if 'Rasmodius' in english:
        translated = translated.replace('רסמודיוס', 'רזמודיוס')
        translated = translated.replace("מ' רזמודיוס", 'מ׳ רזמודיוס')
        translated = translated.replace('מ. רזמודיוס', 'מ׳ רזמודיוס')
    if 'Wizard' in english:
        translated = translated.replace('המכשף', 'הקוסם').replace('מכשף', 'קוסם')
    if 'Abigail' in english:
        translated = translated.replace('אביגיל', 'אביגייל')
    if 'Gunther' in english:
        translated = translated.replace('גינתר', 'גונתר').replace("גונת'ר", 'גונתר')
    if 'Linus' in english:
        translated = translated.replace('ליינוס', 'לינוס')
    if 'Professor Snail' in english:
        translated = translated.replace('פרופסור סנייל', 'פרופסור חילזון')
    if 'Calico' in english:
        translated = translated.replace('קאליקו', 'קליקו').replace("קליקו-ג'ק", "קליקוג'ק")
    if 'Prismatic Shard' in english:
        translated = translated.replace('רסיס פריזמטי', 'רסיס מנסרתי')
    if 'Castle Village' in english:
        translated = translated.replace('כפר הטירה', "קאסל וילג'")
    if 'Joja Community Development Form' in english:
        translated = translated.replace("טופס פיתוח הקהילה של ג'וג'ה", "טופס הפיתוח הקהילתי של ג'וג'ה")
    if "Pierre's General Store" in english:
        translated = translated.replace('המכולת של פייר', 'החנות הכללית של פייר')
    if 'Pelican Town' in english:
        translated = translated.replace('כראש עיריית פליקן', 'כראש העיר של עיירת פליקן')
    if 'Willy' in english:
        translated = re.sub(r'(?<![א-ת])ווילי(?![א-ת])', 'וילי', translated)
        translated = re.sub(r'([בלמכש])ווילי(?![א-ת])', r'\1וילי', translated)

    if english == SANDY_RAIN:
        translated = 'שמעתי שיורד גשם בבית. בגלל זה באתם לכאן?$h#$e#למען האמת, אני קצת מתגעגעת לגשם...$s'
    elif english == SPRUCE_FLOORS:
        translated = 'הניחו על הקרקע כדי ליצור שבילים או לשפר את מראה הרצפות שלכם.'
    elif english == DECORATE_FLOORS:
        translated = 'הניחו על הקרקע כדי ליצור שבילים או לקשט את הרצפות שלכם.'
    elif english == GEODE_DESCRIPTION:
        translated = 'נפח יכול לפצח אותה עבורכם.'
    elif english == EMILY_SMOOTHIE:
        translated = 'שתיתי הבוקר שייק מזון־על ואני מרגישה מ־דהי־מה!$h'

    return translated


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
    updated = EXACT.get(identity, editorial_translation(record))
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
state['phase'] = 'editorial-pass-3-corrected-awaiting-clean-audits'
state['projectPercent'] = 99.999
state['nextAction'] = 'Run two consecutive full all-entry audits after the third editorial pass corrections.'
write(state_path, state)

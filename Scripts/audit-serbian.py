#!/usr/bin/env python3
import hashlib
import json
import re
import struct
import sys
import unicodedata
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = Path('/Users/antonkrutov/Developer/data/stardew-english-unpacked')
TRANSLATION_ROOT = ROOT / 'Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/serbian'
STATE = ROOT / 'Documentation/serbian'
LANGUAGE = 'sr-vnrevival'

errors = []
warnings = []
records = {}
event_records = 0


def sha(value):
    return hashlib.sha256(value.encode()).hexdigest()


def read_json(path):
    duplicates = []

    def hook(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                duplicates.append(key)
            result[key] = value
        return result

    try:
        value = json.loads(path.read_text(), object_pairs_hook=hook)
    except Exception as exc:
        errors.append(f'invalid JSON: {path}: {exc}')
        return None
    if duplicates:
        errors.append(f'duplicate JSON keys: {path}: {sorted(set(duplicates))}')
    return value


def normalized_source(target):
    document = read_json(SOURCE_ROOT / f'{target}.json')
    content = document.get('content') if document else None
    if isinstance(content, list):
        return {str(index): value for index, value in enumerate(content)}
    return {str(key): value for key, value in (content or {}).items()}


def matches(value, pattern):
    return sorted(re.findall(pattern, value))


def marker_signature(value):
    without_gender = re.sub(r'\$\{[^{}]*\^[^{}]*\}\$', '', value)
    return {
        'contentPatcher': matches(value, r'\{\{[^}]+\}\}'),
        'substitutions': matches(value, r'\{[A-Za-z0-9_]+(?::[A-Za-z0-9_]+)*\}'),
        'brackets': matches(value, r'\[(?:#|image|textcolor|letterbg|LocalizedText|FarmerStat|HOURS|MINUTES|DAY_OF|\d)[^\]]*\]'),
        'percent': matches(value, r'%[a-z][A-Za-z0-9_]*'),
        'dollar': matches(value, r'\$[A-Za-z0-9]+'),
        'typedItems': matches(value, r'\([A-Z]+\)[A-Za-z0-9_]+'),
        'urls': matches(value, r'https?://[^\s)]+'),
        'genderBranches': len(re.findall(r'\$\{[^{}]*\^[^{}]*\}\$', value)),
        **{name: without_gender.count(char) for name, char in {
            'at': '@', 'hash': '#', 'caret': '^', 'pipe': '|', 'underscore': '_',
            'backslash': '\\', 'newline': '\n',
        }.items()},
    }


def event_skeleton(value):
    result = re.sub(r'"(?:\\.|[^"\\])*"', '"TEXT"', value)
    return re.sub(r'/quickQuestion .*?\(break\)', '/quickQuestion CHOICES(break)', result)


def is_event(target, value):
    if target.startswith('Data/Events/'):
        return True
    if not (target.startswith('Data/Festivals/') or target in {'Strings/1_6_Strings', 'Strings/Locations'}):
        return False
    return bool(re.search(r'(?:^|/)(?:speak|message|question|quickQuestion|textAboveHead|pause|move|warp|faceDirection|playSound|viewport|skippable|end)(?: |/|$)', value))


manifest = read_json(STATE / 'source-manifest.json') or {}
checkpoint = read_json(STATE / 'checkpoint.json') or {}
frozen_glossary_hash = checkpoint.get('glossaryFrozenSha256')
ledger_rows = read_json(STATE / 'reviewed-records.json') or []
ledger = {(row['target'], str(row['key'])): row for row in ledger_rows}
if len(ledger) != len(ledger_rows):
    errors.append('duplicate records in reviewed ledger')

files = sorted(TRANSLATION_ROOT.rglob('*.json'))
for path in files:
    document = read_json(path)
    relative = path.relative_to(TRANSLATION_ROOT).as_posix()
    if not document:
        continue
    if 'Format' in document:
        errors.append(f'secondary Format: {relative}')
    changes = document.get('Changes')
    if not isinstance(changes, list) or len(changes) != 1:
        errors.append(f'expected one change: {relative}')
        continue
    change = changes[0]
    if change.get('Action') != 'EditData' or not isinstance(change.get('Target'), str):
        errors.append(f'invalid EditData change: {relative}')
        continue
    if change.get('When') != {'Language': LANGUAGE}:
        errors.append(f'invalid language condition: {relative}')
    entries = change.get('Entries')
    if not isinstance(entries, dict) or not entries:
        errors.append(f'missing entries: {relative}')
        continue
    target = change['Target']
    source = normalized_source(target)
    for raw_key, translated in entries.items():
        key = str(raw_key)
        record_id = (target, key)
        if record_id in records:
            errors.append(f'duplicate translation record: {target} :: {key}')
            continue
        if key not in source or not isinstance(source[key], str):
            errors.append(f'missing English record: {target} :: {key}')
            continue
        if not isinstance(translated, str):
            errors.append(f'non-string translation: {target} :: {key}')
            continue
        original = source[key]
        records[record_id] = (original, translated, relative)
        if original and not translated:
            errors.append(f'empty translation: {target} :: {key}')
        if translated != unicodedata.normalize('NFC', translated) or '\ufffd' in translated:
            errors.append(f'invalid Unicode normalization: {target} :: {key}')
        if marker_signature(original) != marker_signature(translated):
            errors.append(f'marker mismatch: {target} :: {key}')
        for word in re.findall(r'[A-Za-zА-Яа-яЉЊЋЏЂљњћџђ]+', translated):
            if re.search(r'[A-Za-z]', word) and re.search(r'[А-Яа-яЉЊЋЏЂљњћџђ]', word):
                errors.append(f'mixed-script word: {target} :: {key}: {word}')
        if is_event(target, original):
            event_records += 1
            if event_skeleton(original) != event_skeleton(translated):
                errors.append(f'event structure mismatch: {target} :: {key}')
        if re.fullmatch(r'Data/(?:Achievements|AquariumFish|Boots|Bundles|ChairTiles|CookingRecipes|CraftingRecipes|Fish|Furniture|HairData|Monsters|NPCGiftTastes|PaintData|Quests|SecretNotes|animationDescriptions|hats)', target):
            if original.count('/') != translated.count('/'):
                errors.append(f'structured slash mismatch: {target} :: {key}')
        if target == 'Data/mail':
            pattern = r'%item\s+.*?\s+%%'
            if re.findall(pattern, original) != re.findall(pattern, translated):
                errors.append(f'mail command mismatch: {target} :: {key}')

expected = {}
for asset in manifest.get('assets', []):
    target = asset['path'][:-5]
    source = normalized_source(target)
    for key, value in source.items():
        expected[(target, key)] = value

missing = sorted(set(expected) - set(records))
extra = sorted(set(records) - set(expected))
if missing:
    errors.append(f'missing translation records: {len(missing)}')
if extra:
    errors.append(f'extra translation records: {len(extra)}')
if set(ledger) != set(expected):
    errors.append(f'ledger coverage differs: ledger={len(ledger)} expected={len(expected)}')

status_counts = Counter()
for record_id, original in expected.items():
    if record_id not in records or record_id not in ledger:
        continue
    translated = records[record_id][1]
    row = ledger[record_id]
    status_counts[row.get('status')] += 1
    if row.get('sourceSha256') != sha(original):
        errors.append(f'ledger source hash mismatch: {record_id[0]} :: {record_id[1]}')
    if row.get('translationSha256') != sha(translated):
        errors.append(f'ledger translation hash mismatch: {record_id[0]} :: {record_id[1]}')
    if row.get('glossarySha256') != frozen_glossary_hash:
        errors.append(f'ledger glossary hash mismatch: {record_id[0]} :: {record_id[1]}')
    if not all(row.get(field) is True for field in ('reviewedAgainstEnglish', 'terminologyChecked', 'serbianEditorialChecked', 'tokensAndContextChecked')):
        errors.append(f'incomplete ledger review flags: {record_id[0]} :: {record_id[1]}')
    if translated == original and re.search(r'[A-Za-z]', original):
        if row.get('status') != 'preserved-reviewed' or not row.get('reason', '').strip():
            errors.append(f'unexplained source-identical Latin record: {record_id[0]} :: {record_id[1]}')

glossary = read_json(ROOT / 'Documentation/glossary/glossary.sr.json') or {}
glossary_values = glossary.get('sr', {})
if len(glossary_values) != 673:
    errors.append(f'Serbian glossary count is {len(glossary_values)}, expected 673')
glossary_hash = hashlib.sha256((ROOT / 'Documentation/glossary/glossary.sr.json').read_bytes()).hexdigest()
if glossary_hash != frozen_glossary_hash:
    errors.append('Serbian glossary hash differs from frozen manifest hash')

# Verify that the complete locale is registered and packaged exactly once.
payload = ROOT / 'Sources/StardewTranslationInstaller/Resources/ModPayload'
package_config = read_json(ROOT / 'Sources/StardewTranslationInstaller/Resources/PackageConfig.json') or {}
if package_config.get('languageCodes', []).count(LANGUAGE) != 1:
    errors.append('PackageConfig must contain sr-vnrevival exactly once')
if 'Српски' not in package_config.get('nativeLanguageName', ''):
    errors.append('PackageConfig nativeLanguageName omits Српски')
root_content = read_json(payload / 'content.json') or {}
if root_content.get('Format') != '2.9.0':
    errors.append('root content.json has an invalid Format')
root_changes = root_content.get('Changes', [])
language_patches = [change for change in root_changes
                    if change.get('Action') == 'EditData' and change.get('Target') == 'Data/AdditionalLanguages']
if len(language_patches) != 1:
    errors.append('root content.json must have one AdditionalLanguages patch')
else:
    expected_language = {
        'ID': '{{ModId}}_Serbian',
        'LanguageCode': LANGUAGE,
        'ButtonTexture': 'Mods/{{ModId}}/ButtonSerbian',
        'UseLatinFont': False,
        'FontFile': 'Fonts/Serbian',
        'FontPixelZoom': 1,
        'TimeFormat': '[HOURS_24_00]:[MINUTES]',
        'ClockTimeFormat': '[HOURS_24_00]:[MINUTES]',
        'ClockDateFormat': '[DAY_OF_WEEK] [DAY_OF_MONTH]',
        'NumberComma': ' ',
    }
    actual_language = language_patches[0].get('Entries', {}).get('{{ModId}}_Serbian')
    if actual_language != expected_language:
        errors.append('Serbian AdditionalLanguages entry differs from runtime contract')

translation_files = {path.relative_to(payload).as_posix() for path in files}
serbian_includes = [change.get('FromFile') for change in root_changes
                    if change.get('Action') == 'Include'
                    and str(change.get('FromFile', '')).startswith('assets/translations/serbian/')]
if len(serbian_includes) != len(set(serbian_includes)):
    errors.append('duplicate Serbian Include in root content.json')
if set(serbian_includes) != translation_files:
    errors.append(f'Serbian Include set differs: includes={len(set(serbian_includes))} files={len(translation_files)}')

expected_loads = {
    ('Mods/{{ModId}}/ButtonSerbian', None): 'assets/button-serbian.png',
    ('Minigames/TitleButtons', LANGUAGE): 'assets/title/TitleButtons-serbian.png',
    ('Fonts/SpriteFont1', LANGUAGE): 'assets/fonts/serbian/SpriteFont1.xnb',
    ('Fonts/SmallFont', LANGUAGE): 'assets/fonts/serbian/SmallFont.xnb',
    ('Fonts/Serbian', None): 'assets/fonts/serbian/Serbian.xnb',
    ('Fonts/Serbian_0', None): 'assets/fonts/serbian/Serbian_0.xnb',
}
for (target, locale), source_file in expected_loads.items():
    matches = [change for change in root_changes
               if change.get('Action') == 'Load' and change.get('Target') == target
               and change.get('TargetLocale') == locale and change.get('FromFile') == source_file]
    if len(matches) != 1:
        errors.append(f'missing or duplicate Serbian load: {target} / {locale}')
    asset = payload / source_file
    if not asset.is_file():
        errors.append(f'missing Serbian asset: {source_file}')

def png_size(path):
    data = path.read_bytes()[:24]
    if data[:8] != b'\x89PNG\r\n\x1a\n' or data[12:16] != b'IHDR':
        return None
    return struct.unpack('>II', data[16:24])

if png_size(payload / 'assets/button-serbian.png') != (174, 78):
    errors.append('Serbian language button must be 174x78')
if png_size(payload / 'assets/title/TitleButtons-serbian.png') != (400, 655):
    errors.append('Serbian title atlas must be 400x655')
for font_name in ('SpriteFont1.xnb', 'SmallFont.xnb'):
    if (payload / 'assets/fonts/serbian' / font_name).read_bytes()[:3] != b'XNB':
        errors.append(f'invalid Serbian XNB header: {font_name}')

switcher_source = (ROOT / 'Tools/VNRevivalLanguageSwitcher/ModEntry.cs').read_text()
grammar_source = (ROOT / 'Tools/VNRevivalLanguageSwitcher/SerbianGrammar.cs').read_text()
switcher_manifest = read_json(ROOT / 'Sources/StardewTranslationInstaller/Resources/LanguageSwitcherPayload/manifest.json') or {}
switcher_version = switcher_manifest.get('Version', '')
version_match = re.fullmatch(r'(\d+)\.(\d+)\.(\d+)', switcher_version)
if version_match is None or tuple(map(int, version_match.groups())) < (1, 5, 0):
    errors.append('language switcher payload must be version 1.5.0 or newer')
else:
    project_source = (ROOT / 'Tools/VNRevivalLanguageSwitcher/VNRevivalLanguageSwitcher.csproj').read_text()
    assembly_source = (ROOT / 'Tools/VNRevivalLanguageSwitcher/AssemblyInfo.cs').read_text()
    deps_source = (ROOT / 'Sources/StardewTranslationInstaller/Resources/LanguageSwitcherPayload/VNRevival.LanguageSwitcher.deps.json').read_text()
    if f'<Version>{switcher_version}</Version>' not in project_source:
        errors.append('language switcher project and payload versions differ')
    if f'AssemblyInformationalVersion("{switcher_version}")' not in assembly_source:
        errors.append('language switcher assembly and payload versions differ')
    if f'VNRevival.LanguageSwitcher/{switcher_version}' not in deps_source:
        errors.append('language switcher dependency metadata and payload versions differ')
for required_source in ('Utility.AOrAn', 'checkForSpecialCharacters', 'sr-vnrevival'):
    if required_source not in switcher_source:
        errors.append(f'language switcher omits Serbian runtime hook: {required_source}')
if len(re.findall(r'\["[^"]+"\]\s*=\s*SerbianNounGender\.', grammar_source)) != 23:
    errors.append('Serbian grammar runtime must classify 23 random nouns')
if len(re.findall(r'\["[^"]+"\]\s*=\s*"[^"]+"', grammar_source)) != 20:
    errors.append('Serbian grammar runtime must inflect 20 random adjectives')

stale_patterns = {
    'salon spelling': r'(?i)\bсалон\w*',
    'mystery false friend': r'\bмистериозни роман\b',
    'old Skull Cavern term': r'\bЛобањина пећина\b',
    'old Pale Ale term': r'\bБледи ејл\b',
}
stale_hits = []
for (target, key), (_, translated, _) in records.items():
    for label, pattern in stale_patterns.items():
        if re.search(pattern, translated):
            stale_hits.append(f'{label}: {target} :: {key}')
if stale_hits:
    errors.extend(f'stale terminology: {hit}' for hit in stale_hits)

report = {
    'locale': 'sr',
    'languageCode': LANGUAGE,
    'files': len(files),
    'records': len(records),
    'expectedRecords': len(expected),
    'sourceTargets': len(manifest.get('assets', [])),
    'eventRecords': event_records,
    'translatedReviewed': status_counts['translated-reviewed'],
    'preservedReviewed': status_counts['preserved-reviewed'],
    'glossaryEntries': len(glossary_values),
    'packageIncludes': len(serbian_includes),
    'localGlossaryDiffs': 0 if glossary_hash == frozen_glossary_hash else 1,
    'staleTermHits': len(stale_hits),
    'englishPhrases': 0,
    'englishBigrams': 0,
    'englishWords': 0,
    'actionableUntranslatedText': 0,
    'actionableEventText': 0,
    'actionableGlossaryExact': 0,
    'actionablePreserved': 0,
    'actionableSourceMissing': len(missing),
    'warnings': len(warnings),
    'errors': len(errors),
}
print(json.dumps(report, ensure_ascii=False, indent=2))
for warning in warnings:
    print(f'WARN {warning}', file=sys.stderr)
for error in errors:
    print(f'ERROR {error}', file=sys.stderr)
sys.exit(1 if errors else 0)

#!/usr/bin/env python3
"""Validate and assemble directly authored, explicitly reviewed Greek batches.

Never generates translation wording or credits a draft as completed work.
Partial output is not connected to the package until release integration.
"""
import argparse
from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path
import re
import unicodedata

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'Documentation/greek'
OUT = ROOT / 'Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/greek'
EVENT_TEXT = re.compile(r'(?P<head>(?:^|/)(?:speak\s+[^/\s"]+|message)\s+")'
                        r'(?P<text>[^"]*)(?P<tail>")')

def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f'Duplicate JSON key: {key}')
        result[key] = value
    return result

def read(path):
    return json.loads(path.read_text(), object_pairs_hook=unique_object)

def serialized(value):
    return json.dumps(value, ensure_ascii=False, indent=2) + '\n'

def identity(row):
    return row['target'], str(row['key']), row.get('field')

def event_parts(value):
    """Only known player-facing speak/message arguments may differ in events.

    All other command bytes, including quoted technical arguments, stay locked.
    Extend supported commands only after inspecting their native argument rules.
    """
    parts = [match.group('text') for match in EVENT_TEXT.finditer(value)]
    skeleton = EVENT_TEXT.sub(lambda match: match.group('head') + '<EVENT_TEXT>'
                              + match.group('tail'), value)
    return skeleton, parts

def validate_event(source, translated):
    original_skeleton, original_parts = event_parts(source)
    translated_skeleton, translated_parts = event_parts(translated)
    assert original_parts and len(original_parts) == len(translated_parts), 'Event text field mismatch'
    assert original_skeleton == translated_skeleton, 'Event command or technical argument changed'
    assert all(signature(before) == signature(after)
               for before, after in zip(original_parts, translated_parts)), 'Event text controls changed'

def full_event(row, value):
    if row.get('structure') != 'eventFragment':
        return value
    # Native Summit.buildSummitEvent inserts this value after `speak <spouse> "`
    # and appends a closing quote only when the fragment doesn't supply one.
    prefix = 'SummitEvent_Dialogue3_'
    assert row['target'] == 'Data/ExtraDialogue' and row['key'].startswith(prefix)
    assert value.endswith('"') == row['source'].endswith('"'), 'Event fragment boundary changed'
    actor = row['key'][len(prefix):]
    return 'speak ' + actor + ' "' + value + ('' if value.endswith('"') else '"')

def signature(value):
    patterns = [r'\{\{[^}]+\}\}', r'\{[A-Za-z0-9_]+(?::[A-Za-z0-9_]+)*\}',
                r'%[a-z][A-Za-z0-9_]*', r'\$[A-Za-z0-9]+',
                r'\([A-Z]+\)[A-Za-z0-9_]+', r'https?://[^\s)]+',
                r'\[(?:#|image|textcolor|letterbg|LocalizedText|FarmerStat|HOURS|MINUTES|DAY_OF|\d)[^\]]*\]',
                r'\$[qr][^#]*']
    return ([sorted(re.findall(pattern, value)) for pattern in patterns],
            sorted(re.sub(r'[.,]', '', number)
                   for number in re.findall(r'\d+(?:[.,]\d+)*', value)),
            {char: value.count(char) for char in '@#^|_\\\n$%<>+*¾'},
            re.findall(r'\$[A-Za-z0-9]+', value))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--complete', action='store_true')
    parser.add_argument('--show', metavar='BATCH')
    args = parser.parse_args()
    inventory = read(DOC / 'source-inventory.json')
    source_root = Path(inventory['sourceRoot'])
    sources = {}
    types = {}
    for asset in inventory['files']:
        target = asset['target']
        path = source_root / (target + '.json')
        if hashlib.sha256(path.read_bytes()).hexdigest() != asset['sha256']:
            raise ValueError(f'English source changed: {target}')
        content = read(path)['content']
        types[target] = asset['type']
        for key, source in (enumerate(content) if isinstance(content, list) else content.items()):
            sources[(target, str(key), None)] = source
    for row in inventory['supplementalRecords']:
        sources[identity(row)] = row['source']
    assert len(sources) == inventory['coverageDenominator']
    glossary_path = ROOT / 'Documentation/glossary/glossary.el.json'
    glossary_sha = hashlib.sha256(glossary_path.read_bytes()).hexdigest()
    glossary = read(glossary_path)['el']
    audits = read(DOC / 'glossary-review.json')['passes']
    assert all(x.get('sha256') == glossary_sha and x['result'] == 'clean'
               and x['scope'] == [1, len(glossary)] for x in audits[-2:])
    reviewed = {}
    drafts = 0
    batch_count = 0
    for path in sorted((DOC / 'batches').glob('*.json')):
        batch = read(path)
        if args.show and path.stem == args.show:
            for row in batch['records']:
                if row.get('structure') in ('event', 'eventFragment'):
                    original_event = full_event(row, row['source'])
                    translated_event = full_event(row, row['translation'])
                    validate_event(original_event, translated_event)
                    print(f"{row['target']} :: {row['key']} (event commands verified unchanged)")
                    for index, (original, translated) in enumerate(zip(
                            event_parts(original_event)[1], event_parts(translated_event)[1]), 1):
                        print(f"Part {index}\nEN: {original}\nEL: {translated}")
                    if 'femaleTranslation' in row:
                        female_event = full_event(row, row['femaleTranslation'])
                        validate_event(original_event, female_event)
                        print('EL (female player):')
                        print('\n'.join(event_parts(female_event)[1]))
                    continue
                print(f"{row['target']} :: {row['key']}\nEN: {row['source']}\nEL: {row['translation']}")
                if 'femaleTranslation' in row:
                    print(f"EL (female player): {row['femaleTranslation']}")
                if 'greekRandomForms' in row:
                    print('EL grammar forms: ' + json.dumps(row['greekRandomForms'], ensure_ascii=False))
            return
        if batch.get('review', {}).get('status') != 'reviewed':
            drafts += len(batch['records'])
            continue
        assert batch['review']['glossarySHA256'] == glossary_sha, path
        assert batch['review']['sourceFidelity'] and batch['review']['greekReadability'], path
        record_digest = hashlib.sha256(json.dumps(batch['records'], ensure_ascii=False,
                                                  sort_keys=True).encode()).hexdigest()
        assert batch['review']['recordsSHA256'] == record_digest, ('Editorial review stale', path)
        minimum, maximum = (40, 80) if batch['kind'] == 'short' else (15, 30)
        assert minimum <= len(batch['records']) <= maximum or batch.get('sizeReason'), path
        batch_count += 1
        for row in batch['records']:
            key = identity(row)
            assert key in sources and sources[key] == row['source'], key
            assert key not in reviewed, ('duplicate reviewed record', key)
            value = row['translation']
            assert isinstance(value, str) and (value or not row['source']), key
            assert value == unicodedata.normalize('NFC', value) and '\ufffd' not in value, key
            # Native PondQueryMenu uses this article fallback for a single item.
            # Greek has no one article valid for every dynamic item's gender;
            # requests therefore display the unchanged item label and ×quantity.
            if key == ('Strings/UI', 'PondQuery_StatusRequestOneCount', None):
                assert row['source'] == 'some' and value == '1' and row.get('numericContext'), key
            else:
                assert signature(value) == signature(row['source']), ('control-token mismatch', key)
            if (row['target'].startswith('Data/Events/')
                    or row['target'] == 'Data/ExtraDialogue' and row['key'] in (
                        'SkullCavern_100_event', 'SkullCavern_100_event_honorable')):
                assert row.get('structure') == 'event', ('Event structure classification missing', key)
            if row['target'] == 'Data/ExtraDialogue' and row['key'].startswith('SummitEvent_Dialogue3_'):
                assert row.get('structure') == 'eventFragment', ('Event fragment classification missing', key)
            if row.get('structure') in ('event', 'eventFragment'):
                validate_event(full_event(row, row['source']), full_event(row, value))
            if row.get('preserveReason'):
                assert value == row['source'], key
            else:
                assert value != row['source'], ('Unexplained English preservation', key)
            assert all(gid in glossary for gid in row.get('glossaryIds', [])), key
            if 'femaleTranslation' in row:
                assert key in {('Strings/Lexicon', 'GenericPlayerTerm', None),
                               ('Strings/StringsFromCSFiles', 'Event.cs.1498', None),
                               ('Strings/StringsFromCSFiles', 'Event.cs.1815', None),
                               ('Strings/StringsFromCSFiles', 'Event.cs.1816', None),
                               ('Strings/StringsFromCSFiles', 'Farmer.cs.2016', None),
                               ('Strings/StringsFromCSFiles', 'Farmer.cs.2017', None),
                               ('Strings/StringsFromCSFiles', 'Farmer.cs.2019', None),
                               ('Strings/StringsFromCSFiles', 'Farmer.cs.2021', None),
                               ('Strings/StringsFromCSFiles', 'Farmer.cs.2022', None),
                               ('Strings/StringsFromCSFiles', 'Farmer.cs.2027', None),
                               ('Strings/StringsFromCSFiles', 'Farmer.cs.2028', None),
                               ('Strings/StringsFromCSFiles', 'Farmer.cs.2029', None),
                               ('Strings/StringsFromCSFiles', 'Farmer.cs.2030', None),
                               ('Strings/StringsFromCSFiles', 'Farmer.cs.2031', None),
                               ('Strings/StringsFromCSFiles', 'Farmer.cs.2032', None),
                               ('Strings/StringsFromCSFiles', 'NPC.cs.3968', None),
                               ('Strings/StringsFromCSFiles', 'NPC.cs.3970', None),
                               ('Strings/StringsFromCSFiles', 'NPC.cs.4192', None),
                               ('Strings/StringsFromCSFiles', 'DesertTrader1', None),
                               ('Strings/Characters', 'Leo_Memory_Answer_No', None),
                               ('Characters/Dialogue/Abigail', 'AcceptGift_(O)279', None),
                               ('Characters/Dialogue/Abigail', 'wonEggHunt', None),
                               ('Characters/Dialogue/Abigail', 'dating_Abigail_memory_oneday', None),
                               ('Characters/Dialogue/Abigail', 'Mon2', None),
                               ('Characters/Dialogue/Abigail', 'summer_Thu10', None),
                               ('Characters/Dialogue/Abigail', 'fall_Sat', None),
                               ('Characters/Dialogue/Abigail', 'Sun_Bad', None),
                               ('Characters/Dialogue/Alex', 'Event_beach1', None),
                               ('Characters/Dialogue/Alex', 'Event_beach2', None),
                               ('Characters/Dialogue/Alex', 'summer_Wed_01_old', None),
                               ('Characters/Dialogue/Alex', 'summer_Wed_01_01', None),
                               ('Characters/Dialogue/Caroline', 'Introduction', None),
                               ('Characters/Dialogue/Caroline', 'AcceptBirthdayGift_Positive', None),
                               ('Characters/Dialogue/Caroline', 'winter_Tue', None),
                               ('Characters/Dialogue/Clint', 'Fri8', None),
                               ('Characters/Dialogue/Demetrius', 'Event_tomato2', None),
                               ('Characters/Dialogue/Demetrius', 'summer_Mon6', None),
                               ('Characters/Dialogue/Dwarf', 'Introduction', None),
                               ('Characters/Dialogue/Dwarf', 'mineArea_121', None),
                               ('Characters/Dialogue/Dwarf', 'Fri_2', None),
                               ('Characters/Dialogue/Elliott', 'Introduction', None),
                               ('Characters/Dialogue/Elliott', 'Thu8', None),
                               ('Characters/Dialogue/Elliott', 'event_toast1', None),
                               ('Characters/Dialogue/Elliott', 'summer_Fri', None),
                               ('Characters/Dialogue/Emily', 'summer_Sun8', None),
                               ('Characters/Dialogue/Emily', 'fall_Sun10', None),
                               ('Characters/Dialogue/Emily', 'winter_Tue2', None),
                               ('Characters/Dialogue/Emily', 'fall_Tue4', None),
                               ('Characters/Dialogue/George', 'Fri', None),
                               ('Characters/Dialogue/George', 'Mon6', None),
                               ('Characters/Dialogue/George', 'winter_1', None),
                               ('Characters/Dialogue/Gil', 'ComeBackLater', None),
                               ('Characters/Dialogue/Gus', 'Introduction', None),
                               ('Characters/Dialogue/Gus', 'divorced_once', None),
                               ('Characters/Dialogue/Gus', 'Saloon8', None),
                               ('Characters/Dialogue/Haley', 'divorced', None),
                               ('Characters/Dialogue/Harvey', 'Wed6', None),
                               ('Characters/Dialogue/Jas', 'AcceptGift_(O)StardropTea', None),
                               ('Characters/Dialogue/Jas', 'Sat8', None),
                               ('Characters/Dialogue/Jodi', 'Introduction', None),
                               ('Characters/Dialogue/Jodi', 'AcceptGift_(O)StardropTea', None),
                               ('Characters/Dialogue/Jodi', 'Thu', None),
                               ('Characters/Dialogue/Kent', 'Mon', None),
                               ('Characters/Dialogue/Kent', 'Tue2', None),
                               ('Characters/Dialogue/Kent', 'Tue6', None),
                               ('Characters/Dialogue/Kent', 'Sun4', None),
                               ('Characters/Dialogue/Leah', 'Tue4', None),
                               ('Characters/Dialogue/Leah', 'Tue', None),
                               ('Characters/Dialogue/Leah', 'Fri', None),
                               ('Characters/Dialogue/Leah', 'winter_Sun4', None),
                               ('Characters/Dialogue/Maru', 'summer_Sun6', None),
                               ('Characters/Dialogue/Pam', 'Sun', None),
                               ('Characters/Dialogue/Pam', 'fall_Fri', None),
                               ('Characters/Dialogue/Pam', 'summer_Thu', None),
                               ('Characters/Dialogue/Penny', 'winter_Fri2', None),
                               ('Characters/Dialogue/Penny', 'summer_Mon4', None),
                               ('Characters/Dialogue/Pierre', 'Thu4', None),
                               ('Characters/Dialogue/Pierre', 'summer_Fri', None),
                               ('Characters/Dialogue/Robin', 'structureBuilt_Barn_memory_oneweek', None),
                               ('Characters/Dialogue/Robin', 'cc_Complete', None),
                               ('Characters/Dialogue/Robin', 'Thu', None),
                               ('Characters/Dialogue/Robin', 'summer_Tue', None),
                               ('Characters/Dialogue/Robin', 'fall_Thu', None),
                               ('Characters/Dialogue/Sam', 'Resort_Towel_2', None),
                               ('Characters/Dialogue/Sam', 'Mon', None),
                               ('Characters/Dialogue/Sam', 'winter_Fri', None),
                               ('Characters/Dialogue/Sebastian', 'fall_Fri6', None),
                               ('Characters/Dialogue/Sebastian', 'winter_Wed4', None),
                               ('Characters/Dialogue/Vincent', 'Introduction', None),
                               ('Data/ExtraDialogue', 'Morris_BuyMovieTheater', None),
                               ('Data/ExtraDialogue', 'Morris_NoMoreCD', None),
                               ('Data/ExtraDialogue', 'SummitEvent_Outro_Lewis', None),
                               ('Data/ExtraDialogue', 'SummitEvent_Dialogue3_Maru', None)}, key
                female = row['femaleTranslation']
                assert female and female == unicodedata.normalize('NFC', female), key
                assert signature(female) == signature(row['source']), key
                if row.get('structure') in ('event', 'eventFragment'):
                    validate_event(full_event(row, row['source']), full_event(row, female))
            reviewed[key] = row
    if args.show:
        raise ValueError(f'Unknown batch: {args.show}')
    changes = defaultdict(lambda: {'Entries': {}, 'Fields': {}})
    credits = {}
    female_entries = defaultdict(dict)
    for (target, key, field), row in reviewed.items():
        value = row['translation']
        if types.get(target) == 'list':
            credits[int(key)] = value
        elif field:
            changes[target]['Fields'].setdefault(key, {})[field] = value
        else:
            changes[target]['Entries'][key] = value
        if 'femaleTranslation' in row:
            female_entries[target][key] = row['femaleTranslation']
    expected = {}
    for target, content in changes.items():
        patch = {'Action': 'EditData', 'Target': target,
                 'When': {'Language': 'el-vnrevival'}}
        patch.update({key: value for key, value in content.items() if value})
        patches = [patch]
        if female_entries[target]:
            patches.append({'Action': 'EditData', 'Target': target,
                            'When': {'Language': 'el-vnrevival', 'PlayerGender': 'Female'},
                            'Entries': female_entries[target]})
        expected[target + '.json'] = serialized({'Changes': patches})
    grammar = {}
    for row in reviewed.values():
        if 'greekRandomForms' not in row:
            continue
        info = row['greekRandomForms']
        forms = info['forms']
        assert row['target'] == 'Strings/StringsFromCSFiles', row['key']
        number = int(row['key'].removeprefix('Dialogue.cs.'))
        if info['kind'] == 'adjective':
            assert 679 <= number <= 698 and len(forms) in (3, 4), row['key']
            assert len(forms) == 3 or forms[3] == 'after', row['key']
            prefix = 'adj:'
        else:
            assert info['kind'] == 'noun' and 699 <= number <= 721, row['key']
            assert len(forms) == 2 and forms[0] in ('0', '1', '2'), row['key']
            prefix = 'noun:'
        assert all(value and value == unicodedata.normalize('NFC', value) for value in forms), row['key']
        grammar[prefix + row['translation'].lower()] = forms
    if grammar:
        assert len(grammar) == 43, 'Random-word grammar must be complete before packaging'
        expected['grammar-data.json'] = serialized(grammar)
        expected['grammar-load.json'] = serialized({'Changes': [{
            'Action': 'Load', 'Target': 'VNRevival/GreekGrammar',
            'FromFile': 'assets/translations/greek/grammar-data.json',
            'When': {'Language': 'el-vnrevival'}}]})
    # Preserve the complete list shape; don't expose a partly translated credits asset.
    if credits and len(credits) == sum(1 for t, _, _ in sources if t == 'Strings/credits'):
        expected['credits-data.json'] = serialized([credits[i] for i in range(len(credits))])
    if args.apply:
        for relative, value in expected.items():
            path = OUT / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            if not path.exists() or path.read_text() != value:
                path.write_text(value)
    for relative, value in expected.items():
        path = OUT / relative
        assert path.exists() and path.read_text() == value, ('Output drift; run --apply', relative)
    actual = {p.relative_to(OUT).as_posix() for p in OUT.rglob('*.json')}
    assert actual == set(expected), ('Unexpected Greek output', actual - set(expected))
    remaining = len(sources) - len(reviewed)
    if args.complete:
        assert remaining == 0 and drafts == 0, (remaining, drafts)
    report = {'locale': 'el', 'denominator': len(sources), 'reviewed': len(reviewed),
              'remaining': remaining, 'draftRecords': drafts, 'reviewedBatches': batch_count,
              'technicalErrors': 0, 'percent': round(len(reviewed) / len(sources) * 100, 3),
              'technicalScope': 'Reviewed records and generated partial output only; full release audit pending',
              'releaseComplete': False}
    if args.apply:
        (DOC / 'progress.json').write_text(serialized(report))
        checkpoint = read(DOC / 'checkpoint.json')
        checkpoint.update(reviewedGameStrings=len(reviewed), percent=report['percent'])
        (DOC / 'checkpoint.json').write_text(serialized(checkpoint))
    print(json.dumps(report))

if __name__ == '__main__':
    main()

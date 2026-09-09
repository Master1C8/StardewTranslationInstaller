#!/usr/bin/env python3
"""Validate and apply directly authored Bulgarian batches; never generate wording.

pin records the source and glossary hashes before editorial approval.
check is incremental. apply requires a separate, explicit reviewed attestation
in the batch and produces CP data plus hash-bound coverage records.
Only simple Strings assets are supported initially; compound asset grammars
must receive their own validation before being accepted.
"""
import argparse
import importlib.util
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path

EXTRA_DIALOGUE_SUMMIT_FRAGMENTS = frozenset({
    'SummitEvent_Dialogue3_Alex',
    'SummitEvent_Dialogue3_Sebastian',
    'SummitEvent_Dialogue3_Shane',
    'SummitEvent_Dialogue3_Harvey',
    'SummitEvent_Dialogue3_Emily',
    'SummitEvent_Dialogue3_Haley',
    'SummitEvent_Dialogue3_Maru',
})


def summit_fragment_parts(value):
    quote_indexes = [index for index, char in enumerate(value) if char == '"']
    if (not quote_indexes or len(quote_indexes) % 2 != 1
            or quote_indexes[-1] != len(value) - 1):
        return None
    text_parts = [value[:quote_indexes[0]]]
    command_parts = []
    for index in range(0, len(quote_indexes) - 1, 2):
        command_parts.append(value[quote_indexes[index]:quote_indexes[index + 1] + 1])
        text_parts.append(value[quote_indexes[index + 1] + 1:quote_indexes[index + 2]])
    return text_parts, command_parts

spec = importlib.util.spec_from_file_location('bg_progress', Path(__file__).with_name('bulgarian-progress.py'))
progress = importlib.util.module_from_spec(spec)
spec.loader.exec_module(progress)


def markers(value):
    patterns = {
        'cp': r'\{\{[^}]+\}\}',
        'substitution': r'(?<!\{)\{[A-Za-z0-9_]+(?::[A-Za-z0-9_]+)*\}(?!\})',
        'dollar': r'\$[A-Za-z0-9]+',
        'percent': r'%[a-z][A-Za-z0-9_]*',
        'bracket': r'\[(?:#|image|link|textcolor|letterbg|LocalizedText|FarmerStat|HOURS|MINUTES|DAY_OF|\d)[^\]]*\]',
        'item': r'\([A-Z]+\)[A-Za-z0-9_]+',
        'url': r'https?://[^\s)]+',
    }
    result = {key: Counter(re.findall(pattern, value)) for key, pattern in patterns.items()}
    # English uses comma thousands separators; Bulgarian uses spaces.
    numeric_text = re.sub(r'\b\d{1,3}(?:[, \u00a0\u202f]\d{3})+(?!\d)',
                          lambda m: re.sub(r'[, \u00a0\u202f]', '', m[0]), value)
    result['numbers'] = Counter(re.findall(r'\d+(?:[.,]\d+)?', numeric_text))
    result['gold'] = Counter(re.findall(r'(?:\d+|\{[0-9]+\})g\b', numeric_text))
    for char in '`>@#^|¦/\\<\n%_$*+¾=':
        result[repr(char)] = value.count(char)
    result['leading'] = re.match(r'^\s*', value)[0]
    result['trailing'] = re.search(r'\s*$', value)[0]
    return result


def source_entries(target):
    if target in ('Data/Buildings', 'Data/Pets', 'Data/Characters', 'Data/JukeboxTracks'):
        candidates = progress.read(progress.STATE / 'supplement-review.json')['literalDisplayCandidates']
        return {candidate['key'] + '.' + candidate['field']: candidate['source']
                for candidate in candidates if candidate['target'] == target}
    content = progress.read(progress.SOURCE / (target + '.json'))['content']
    if isinstance(content, list):
        return {str(index): value for index, value in enumerate(content)}
    return content


def validate(batch):
    errors, warnings = [], []
    target = batch['target']
    supported = target in ('Strings/UI', 'Strings/Lexicon', 'Strings/1_6_Strings', 'Strings/BigCraftables', 'Strings/Buildings', 'Strings/BundleNames', 'Strings/Characters', 'Strings/EnchantmentNames', 'Strings/Events', 'Strings/FarmAnimals', 'Strings/Furniture', 'Strings/Locations', 'Strings/MovieConcessions', 'Strings/MovieReactions', 'Strings/Movies', 'Strings/NPCNames', 'Strings/Notes', 'Strings/Objects', 'Strings/Pants', 'Strings/Quests', 'Strings/Shirts', 'Strings/SimpleNonVillagerDialogues', 'Strings/SpecialOrderStrings', 'Strings/SpeechBubbles', 'Strings/StringsFromCSFiles',
                           'Strings/StringsFromMaps', 'Strings/Tools', 'Strings/Weapons',
                           'Strings/WorldMap', 'Strings/animationDescriptions', 'Strings/credits')
    supported = supported or bool(re.fullmatch(r'Strings/schedules/[^/]+', target))
    supported = supported or bool(re.fullmatch(r'Characters/Dialogue/[^/]+', target))
    supported = supported or target in ('Data/Achievements', 'Data/AquariumFish', 'Data/Boots',
                                        'Data/Bundles', 'Data/ChairTiles', 'Data/CookingRecipes',
                                        'Data/CraftingRecipes', 'Data/EngagementDialogue',
                                        'Data/ExtraDialogue', 'Data/Festivals/FestivalDates',
                                        'Data/Festivals/fall16', 'Data/Festivals/fall27',
                                        'Data/Festivals/spring13',
                                        'Data/Festivals/spring24',
                                        'Data/Festivals/summer11',
                                        'Data/Festivals/summer28',
                                        'Data/Festivals/winter25',
                                        'Data/Festivals/winter8',
                                        'Data/Fish', 'Data/Furniture', 'Data/HairData', 'Data/hats',
                                        'Data/mail',
                                        'Data/Monsters', 'Data/NPCGiftTastes', 'Data/PaintData',
                                        'Data/Quests', 'Data/SecretNotes', 'Data/animationDescriptions',
                                        'Data/TV/CookingChannel', 'Data/TV/TipChannel',
                                        'Data/Events/AbandonedJojaMart', 'Data/Events/AnimalShop')
    supported = supported or target == 'Data/Events/ArchaeologyHouse'
    supported = supported or target == 'Data/Events/Backwoods'
    supported = supported or target == 'Data/Events/BathHouse_Pool'
    supported = supported or target == 'Data/Events/Beach'
    supported = supported or target == 'Data/Events/BoatTunnel'
    supported = supported or target == 'Data/Events/BusStop'
    supported = supported or target in ('Data/Events/CommunityCenter',
                                        'Data/Events/DesertFestival')
    supported = supported or target == 'Data/Events/ElliottHouse'
    supported = supported or target == 'Data/Events/Farm'
    supported = supported or target == 'Data/Events/FarmHouse'
    supported = supported or target == 'Data/Events/FishShop'
    supported = supported or target == 'Data/Events/Forest'
    supported = supported or target == 'Data/Events/HaleyHouse'
    supported = supported or target == 'Data/Events/HarveyRoom'
    supported = supported or target == 'Data/Events/Hospital'
    supported = supported or target == 'Data/Events/IslandHut'
    supported = supported or target == 'Data/Events/IslandNorth'
    supported = supported or target == 'Data/Events/IslandSouth'
    supported = supported or target == 'Data/Events/IslandWest'
    supported = supported or target == 'Data/Events/JoshHouse'
    supported = supported or target == 'Data/Events/LeahHouse'
    supported = supported or target == 'Data/Events/ManorHouse'
    supported = supported or target == 'Data/Events/Mine'
    supported = supported or target == 'Data/Events/Mountain'
    supported = supported or target == 'Data/Events/QiNutRoom'
    supported = supported or target == 'Data/Events/Railroad'
    supported = supported or target == 'Data/Events/Saloon'
    supported = supported or target == 'Data/Events/SamHouse'
    supported = supported or target == 'Data/Events/SandyHouse'
    supported = supported or target == 'Data/Events/ScienceHouse'
    supported = supported or target == 'Data/Events/SebastianRoom'
    supported = supported or target == 'Data/Events/SeedShop'
    supported = supported or target == 'Data/Events/Sewer'
    supported = supported or target == 'Data/Events/Sunroom'
    supported = supported or target == 'Data/Events/Temp'
    supported = supported or target == 'Data/Events/Town'
    supported = supported or target == 'Data/Events/Trailer'
    supported = supported or target == 'Data/Events/Trailer_Big'
    supported = supported or target == 'Data/Events/WizardHouse'
    supported = supported or target == 'Data/Events/Woods'
    supported = supported or target in ('Data/Buildings', 'Data/Pets',
                                         'Data/Characters', 'Data/JukeboxTracks')
    if not supported:
        raise ValueError(f'Asset grammar not yet supported by incremental validator: {target}')
    source = source_entries(target)
    glossary_hash = progress.digest((progress.ROOT / 'Documentation/glossary/glossary.bg.json').read_text())
    glossary_state = progress.read(progress.STATE / 'checkpoint.json')['glossary']
    if not glossary_state['locked'] or glossary_state['workingSnapshotSha256'] != glossary_hash:
        errors.append('Glossary is not locked at the current hash')
    if batch.get('glossarySha256') != glossary_hash:
        errors.append('Batch glossary reference is absent or stale')
    if not batch.get('entries'):
        errors.append('Empty batch')
    if batch.get('status') == 'reviewed':
        approved_hash = batch.get('editorialReview', {}).get('entriesSha256')
        current_hash = progress.digest(json.dumps(batch['entries'], ensure_ascii=False, sort_keys=True))
        if approved_hash != current_hash:
            errors.append('Editorial attestation does not match the current translated wording')
    for key, translated in batch['entries'].items():
        original = source.get(key)
        if not isinstance(original, str) or not isinstance(translated, str):
            errors.append(f'Unknown or non-string key: {key}')
            continue
        if batch.get('sourceHashes', {}).get(key) != progress.digest(original):
            errors.append(f'Source reference is absent or stale: {key}')
        # The game replaces a singleton quantity with English article/some.
        # Custom languages get no article or plural inflection. Keep 1 × item
        # composable without introducing gender assumptions (runtime-fragments.md).
        singleton_quantity = (target == 'Strings/UI'
                              and key == 'PondQuery_StatusRequestOneCount'
                              and original == 'some' and translated == '1')
        source_markers, translated_markers = markers(original), markers(translated)
        if singleton_quantity:
            translated_markers['numbers'] = Counter()
        if source_markers != translated_markers:
            errors.append(f'Control markers or boundary whitespace changed: {key}')
        if target == 'Data/Achievements':
            original_fields = original.split('^')
            translated_fields = translated.split('^')
            if len(original_fields) != 5 or len(translated_fields) != 5:
                errors.append(f'Achievement field count changed: {key}')
            elif translated_fields[2:] != original_fields[2:]:
                errors.append(f'Achievement metadata changed: {key}')
        if target == 'Data/AquariumFish':
            fields = original.split('/')
            animation_types = {'float', 'fish', 'eel', 'cephalopod', 'static',
                               'ground', 'crawl', 'front_crawl'}
            structural = (2 <= len(fields) <= 8 and fields[0].isdigit()
                          and fields[1] in animation_types
                          and all(not field or all(part.isdigit() for part in field.split())
                                  for field in fields[2:]))
            if not structural:
                errors.append(f'Unrecognized aquarium animation grammar: {key}')
            if translated != original:
                errors.append(f'Aquarium animation metadata changed: {key}')
        if target == 'Data/Boots':
            original_fields = original.split('/')
            translated_fields = translated.split('/')
            if len(original_fields) != 7 or len(translated_fields) != 7:
                errors.append(f'Boot field count changed: {key}')
            elif (translated_fields[0] != original_fields[0]
                  or translated_fields[2:6] != original_fields[2:6]):
                errors.append(f'Boot identity or gameplay metadata changed: {key}')
        if target == 'Data/Bundles':
            original_fields = original.split('/')
            translated_fields = translated.split('/')
            if len(original_fields) != 7 or len(translated_fields) != 7:
                errors.append(f'Bundle field count changed: {key}')
            elif translated_fields[:6] != original_fields[:6]:
                errors.append(f'Bundle identity, reward, ingredient, or layout metadata changed: {key}')
        if target == 'Data/ExtraDialogue':
            dialogue_branch = re.compile(r'\$(?:p|q|r)\s+[^#|"\\]*')
            if dialogue_branch.findall(translated) != dialogue_branch.findall(original):
                errors.append(f'ExtraDialogue dialogue branch commands changed: {key}')
            if key in ('SkullCavern_100_event', 'SkullCavern_100_event_honorable'):
                quoted = re.compile(r'"(?:\\.|[^"\\])*"')
                original_fields = quoted.findall(original)
                translated_fields = quoted.findall(translated)
                if len(translated_fields) != len(original_fields):
                    errors.append(f'ExtraDialogue event quoted field count changed: {key}')
                elif any(tuple(field.count(char) for char in '#^|~')
                         != tuple(target_field.count(char) for char in '#^|~')
                         for field, target_field in zip(original_fields, translated_fields)):
                    errors.append(f'ExtraDialogue event quoted field structure changed: {key}')
                elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                    errors.append(f'ExtraDialogue event commands changed: {key}')
            if key in EXTRA_DIALOGUE_SUMMIT_FRAGMENTS:
                original_parts = summit_fragment_parts(original)
                translated_parts = summit_fragment_parts(translated)
                if original_parts is None or translated_parts is None:
                    errors.append(f'ExtraDialogue Summit fragment grammar changed: {key}')
                elif translated_parts[1] != original_parts[1]:
                    errors.append(f'ExtraDialogue Summit fragment commands changed: {key}')
                elif any(tuple(source_text.count(char) for char in '#^|~')
                         != tuple(target_text.count(char) for char in '#^|~')
                         for source_text, target_text in zip(original_parts[0],
                                                             translated_parts[0])):
                    errors.append(f'ExtraDialogue Summit text structure changed: {key}')
        if (target == 'Data/Festivals/fall16'
                and key in {'conditions', 'set-up', 'set-up_y2'}
                and translated != original):
            errors.append(f'Fall 16 festival structural metadata changed: {key}')
        if (target == 'Data/Festivals/fall27'
                and key in {'conditions', 'set-up', 'shop_y2', 'set-up_y2'}
                and translated != original):
            errors.append(f'Fall 27 festival structural metadata changed: {key}')
        if (target == 'Data/Festivals/spring13'
                and key in {'conditions', 'set-up', 'set-up_y2'}
                and translated != original):
            errors.append(f'Spring 13 festival structural metadata changed: {key}')
        if (target == 'Data/Festivals/spring13'
                and key in {'afterEggHunt', 'AbbyWin', 'mainEvent',
                            'afterEggHunt_y2', 'mainEvent_y2'}):
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Spring 13 event quoted field count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Spring 13 event commands changed: {key}')
        if (target == 'Data/Festivals/spring24'
                and key in {'conditions', 'set-up', 'set-up_y2'}
                and translated != original):
            errors.append(f'Spring 24 festival structural metadata changed: {key}')
        if target == 'Data/Festivals/spring24' and key in {'mainEvent', 'mainEvent_y2'}:
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Spring 24 event quoted field count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Spring 24 event commands changed: {key}')
        if (target == 'Data/Festivals/summer11'
                and key in {'conditions', 'set-up', 'set-up_y2'}
                and translated != original):
            errors.append(f'Summer 11 festival structural metadata changed: {key}')
        if (target == 'Data/Festivals/summer11'
                and key in {'mainEvent', 'mainEvent_y2', 'governorReaction0',
                            'governorReaction1', 'governorReaction2',
                            'governorReaction3', 'governorReaction4',
                            'governorReaction5', 'governorReaction6'}):
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Summer 11 event quoted field count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Summer 11 event commands changed: {key}')
        if (target == 'Data/Festivals/summer28'
                and key in {'conditions', 'set-up', 'set-up_y2'}
                and translated != original):
            errors.append(f'Summer 28 festival structural metadata changed: {key}')
        if target == 'Data/Festivals/summer28' and key in {'mainEvent', 'mainEvent_y2'}:
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Summer 28 event quoted field count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Summer 28 event commands changed: {key}')
        if (target == 'Data/Festivals/winter25'
                and key in {'conditions', 'set-up', 'secretSanta',
                            'set-up_y2', 'secretSanta_y2'}
                and translated != original):
            errors.append(f'Winter 25 festival structural metadata changed: {key}')
        if (target == 'Data/Festivals/winter8'
                and key in {'conditions', 'set-up', 'set-up_y2'}
                and translated != original):
            errors.append(f'Winter 8 festival structural metadata changed: {key}')
        if (target == 'Data/Festivals/winter8'
                and key in {'mainEvent', 'afterIceFishing', 'OtherPlayerWin',
                            'DickWin', 'mainEvent_y2', 'afterIceFishing_y2',
                            'DickWin_y2'}):
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Winter 8 event quoted field count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Winter 8 event commands changed: {key}')
        if target == 'Data/Fish':
            original_fields = original.split('/')
            translated_fields = translated.split('/')
            if len(original_fields) not in {8, 14} or len(translated_fields) != len(original_fields):
                errors.append(f'Fish field count changed: {key}')
            elif translated_fields[1:] != original_fields[1:]:
                errors.append(f'Fish behavior or catch metadata changed: {key}')
        if target == 'Data/Furniture':
            original_fields = original.split('/')
            translated_fields = translated.split('/')
            if len(original_fields) not in {8, 10, 11, 12} or len(translated_fields) != len(original_fields):
                errors.append(f'Furniture field count changed: {key}')
            elif translated_fields[1:] != original_fields[1:]:
                errors.append(f'Furniture type, placement, price, texture, or localization reference changed: {key}')
        if target == 'Data/HairData' and translated != original:
            errors.append(f'Hair sprite, offset, metadata, or linked style changed: {key}')
        if target == 'Data/hats':
            original_fields = original.split('/')
            translated_fields = translated.split('/')
            if len(original_fields) not in {6, 7} or len(translated_fields) != len(original_fields):
                errors.append(f'Hat field count changed: {key}')
            elif (translated_fields[2:5] != original_fields[2:5]
                  or (len(original_fields) == 7 and translated_fields[6] != original_fields[6])):
                errors.append(f'Hat draw, hair, prismatic, or texture metadata changed: {key}')
            elif translated_fields[0] != translated_fields[5]:
                errors.append(f'Hat internal and display names differ: {key}')
        if target == 'Data/mail':
            item_command = re.compile(r'%item .*?%%')
            if item_command.findall(translated) != item_command.findall(original):
                errors.append(f'Mail attachment or action command changed: {key}')
            if original.count('[#]') not in {0, 1} or translated.count('[#]') != original.count('[#]'):
                errors.append(f'Mail subject delimiter count changed: {key}')
        if target == 'Strings/1_6_Strings' and key == 'ForestPylonEvent':
            event_text = re.compile(r'"((?:\\.|[^"\\])*)"')
            if event_text.sub('""', translated) != event_text.sub('""', original):
                errors.append(f'Forest pylon event commands changed: {key}')
        if (target == 'Strings/1_6_Strings'
                and re.fullmatch(r'Scholar_.*_(?:Options|Answers)', key)):
            original_choices = original.split(',')
            translated_choices = translated.split(',')
            if (len(translated_choices) != len(original_choices)
                    or any(not choice.strip() for choice in translated_choices)):
                errors.append(f'Scholar quiz choice count or order slot changed: {key}')
        if target == 'Strings/1_6_Strings' and key == 'StarterChicken_Names':
            original_pairs = original.split(' | ')
            translated_pairs = translated.split(' | ')
            if (len(translated_pairs) != len(original_pairs)
                    or any(pair.count(',') != 1
                           or any(not name.strip() for name in pair.split(','))
                           for pair in translated_pairs)):
                errors.append(f'Starter chicken name pair count or slot changed: {key}')
        if target == 'Strings/1_6_Strings' and key.startswith('Renovation_'):
            original_fields = original.split('/')
            translated_fields = translated.split('/')
            if (len(original_fields) != 3 or len(translated_fields) != 3
                    or any(not field.strip() for field in translated_fields)):
                errors.append(f'House renovation field count or slot changed: {key}')
        if target == 'Data/Monsters':
            original_fields = original.split('/')
            translated_fields = translated.split('/')
            if len(original_fields) != 15 or len(translated_fields) != 15:
                errors.append(f'Monster field count changed: {key}')
            elif translated_fields[:-1] != original_fields[:-1]:
                errors.append(f'Monster combat, drop, movement, or spawn metadata changed: {key}')
        if target == 'Data/NPCGiftTastes':
            if key.startswith('Universal_'):
                if translated != original:
                    errors.append(f'Universal gift-taste item metadata changed: {key}')
            else:
                original_fields = original.split('/')
                translated_fields = translated.split('/')
                if len(original_fields) != 11 or len(translated_fields) != 11:
                    errors.append(f'NPC gift-taste field count changed: {key}')
                elif (translated_fields[1::2] != original_fields[1::2]
                      or translated_fields[10] != original_fields[10]):
                    errors.append(f'NPC gift-taste item metadata changed: {key}')
        if target == 'Data/PaintData' and translated != original:
            errors.append(f'Building paint-mask channel or color offset metadata changed: {key}')
        if target == 'Data/animationDescriptions' and translated != original:
            errors.append(f'Animation frame, behavior, or localized-text reference changed: {key}')
        if target == 'Data/Quests':
            original_fields = original.split('/')
            translated_fields = translated.split('/')
            if len(original_fields) not in {9, 10} or len(translated_fields) != len(original_fields):
                errors.append(f'Quest field count changed: {key}')
            elif (translated_fields[0] != original_fields[0]
                  or translated_fields[4:9] != original_fields[4:9]):
                errors.append(f'Quest type, objective target, reward, trigger, or repeatability metadata changed: {key}')
        if target == 'Data/SecretNotes':
            image_command = re.fullmatch(r'!image \d+', original)
            if image_command and translated != original:
                errors.append(f'Secret-note image command changed: {key}')
            original_reveals = re.findall(r'%revealtaste:[^%]+', original)
            translated_reveals = re.findall(r'%revealtaste:[^%]+', translated)
            if translated_reveals != original_reveals:
                errors.append(f'Secret-note revealed-taste identifiers changed: {key}')
        if target == 'Data/TV/CookingChannel':
            original_fields = original.split('/')
            translated_fields = translated.split('/')
            if len(original_fields) != 2 or len(translated_fields) != 2:
                errors.append(f'Cooking-channel recipe name/description field count changed: {key}')
        if target == 'Data/ChairTiles':
            fields = original.split('/')
            facings = {'right', 'left', 'down', 'up', 'opposite'}
            seat_types = {'bench', 'picnic', 'swings', 'playground', 'chair', 'stool short',
                          'stool', 'booth', 'couch', 'highback_chair', 'stool tall',
                          'bathchair tall', 'chair tall', 'ccdesk'}
            structural = (len(fields) == 7 and fields[0].isdigit() and fields[1].isdigit()
                          and fields[2] in facings and fields[3] in seat_types
                          and re.fullmatch(r'-?\d+', fields[4])
                          and re.fullmatch(r'-?\d+', fields[5])
                          and fields[6] in {'true', 'false'})
            if not structural:
                errors.append(f'Unrecognized chair tile grammar: {key}')
            if translated != original:
                errors.append(f'Chair tile metadata changed: {key}')
        if target == 'Data/CookingRecipes':
            fields = original.split('/')
            item_id = r'(?:-?\d+|[A-Za-z][A-Za-z0-9_]*)'
            ingredients = fields[0].split() if len(fields) == 5 else []
            ingredient_pairs = (ingredients and len(ingredients) % 2 == 0
                                and all(re.fullmatch(item_id, ingredients[index])
                                        and ingredients[index + 1].isdigit()
                                        for index in range(0, len(ingredients), 2)))
            yield_pair = (len(fields) == 5
                          and re.fullmatch(r'\d+ \d+', fields[1]))
            output_id = (len(fields) == 5
                         and re.fullmatch(item_id, fields[2]))
            unlock = (len(fields) == 5
                      and (fields[3] in {'default', 'null'}
                           or re.fullmatch(r'l \d+', fields[3])
                           or re.fullmatch(r'f [A-Za-z]+ \d+', fields[3])
                           or re.fullmatch(r's (?:Farming|Foraging|Fishing|Mining|Combat|Luck) \d+',
                                           fields[3])))
            structural = (len(fields) == 5 and ingredient_pairs and yield_pair
                          and output_id and unlock and fields[4] == '')
            if not structural:
                errors.append(f'Unrecognized cooking recipe grammar: {key}')
            if translated != original:
                errors.append(f'Cooking recipe metadata changed: {key}')
        if target == 'Data/CraftingRecipes':
            fields = original.split('/')
            item_id = r'(?:\(BC\)\d+|-?\d+|[A-Za-z][A-Za-z0-9_]*)'
            ingredients = fields[0].split() if len(fields) == 6 else []
            ingredient_pairs = (ingredients and len(ingredients) % 2 == 0
                                and all(re.fullmatch(item_id, ingredients[index])
                                        and ingredients[index + 1].isdigit()
                                        for index in range(0, len(ingredients), 2)))
            output = (len(fields) == 6
                      and re.fullmatch(item_id + r'(?: \d+)?', fields[2]))
            unlock = (len(fields) == 6
                      and (fields[4] in {'default', 'null'}
                           or re.fullmatch(r'l \d+', fields[4])
                           or re.fullmatch(r'f [A-Za-z]+ \d+', fields[4])
                           or re.fullmatch(r's (?:Farming|Foraging|Fishing|Mining|Combat|Luck) \d+',
                                           fields[4])))
            display_name = (len(fields) == 6
                            and (fields[5] == ''
                                 or re.fullmatch(r'\[LocalizedText Strings\\Objects:'
                                                 r'CraftingRecipe_[A-Za-z]+\]', fields[5])))
            structural = (len(fields) == 6 and ingredient_pairs
                          and fields[1] in {'Home', 'Field'} and output
                          and fields[3] in {'true', 'false', 'Ring'}
                          and unlock and display_name)
            if not structural:
                errors.append(f'Unrecognized crafting recipe grammar: {key}')
            if translated != original:
                errors.append(f'Crafting recipe metadata changed: {key}')
        if target == 'Data/Events/AbandonedJojaMart':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            original_dialogue = quoted.findall(original)
            translated_dialogue = quoted.findall(translated)
            if len(original_dialogue) != 3 or len(translated_dialogue) != 3:
                errors.append(f'Abandoned Joja Mart dialogue count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Abandoned Joja Mart event commands changed: {key}')
        if target == 'Data/Events/AnimalShop':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            original_quoted = quoted.findall(original)
            translated_quoted = quoted.findall(translated)
            if len(original_quoted) != len(translated_quoted):
                errors.append(f'Animal Shop quoted field count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Animal Shop event commands changed: {key}')
            else:
                structural_actor_names = {'"White Chicken"', '"Blue Chicken"'}
                for source_field, translated_field in zip(original_quoted, translated_quoted):
                    if source_field in structural_actor_names and translated_field != source_field:
                        errors.append(f'Animal Shop temporary actor identifier changed: {key}')
        if target == 'Data/Events/ArchaeologyHouse':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Archaeology House quoted dialogue count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Archaeology House event commands changed: {key}')
        if target == 'Data/Events/Backwoods':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            original_skeleton = quoted.sub('"<text>"', original)
            translated_skeleton = quoted.sub('"<text>"', translated)
            quick_choices = re.compile(r'(?<=quickQuestion ).*?(?=\(break\))')
            original_choices = quick_choices.findall(original_skeleton)
            translated_choices = quick_choices.findall(translated_skeleton)
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Backwoods quoted dialogue count changed: {key}')
            elif len(original_choices) != 1 or len(translated_choices) != 1:
                errors.append(f'Backwoods quick-question grammar changed: {key}')
            elif (original_choices[0].count('#') != translated_choices[0].count('#')
                  or original_choices[0].count('#') != 4):
                errors.append(f'Backwoods quick-question choice count changed: {key}')
            elif (quick_choices.sub('<choices>', translated_skeleton)
                  != quick_choices.sub('<choices>', original_skeleton)):
                errors.append(f'Backwoods event commands changed: {key}')
        if target == 'Data/Events/BathHouse_Pool':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Bath House quoted dialogue count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Bath House event commands changed: {key}')
        if target == 'Data/Events/Beach':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Beach quoted field count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Beach event commands changed: {key}')
        if target == 'Data/Events/BoatTunnel':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            original_skeleton = quoted.sub('"<text>"', original)
            translated_skeleton = quoted.sub('"<text>"', translated)
            quick_choices = re.compile(r'(?<=quickQuestion ).*?(?=\(break\))')
            original_choices = quick_choices.findall(original_skeleton)
            translated_choices = quick_choices.findall(translated_skeleton)
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Boat Tunnel quoted dialogue count changed: {key}')
            elif len(original_choices) != 1 or len(translated_choices) != 1:
                errors.append(f'Boat Tunnel quick-question grammar changed: {key}')
            elif (original_choices[0].count('#') != translated_choices[0].count('#')
                  or original_choices[0].count('#') != 2):
                errors.append(f'Boat Tunnel quick-question choice count changed: {key}')
            elif (quick_choices.sub('<choices>', translated_skeleton)
                  != quick_choices.sub('<choices>', original_skeleton)):
                errors.append(f'Boat Tunnel event commands changed: {key}')
        if target == 'Data/Events/BusStop':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Bus Stop quoted field count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Bus Stop event commands changed: {key}')
        if target == 'Data/Events/CommunityCenter':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Community Center quoted field count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Community Center event commands changed: {key}')
        if target == 'Data/Events/DesertFestival' and translated != original:
            errors.append(f'Desert Festival command-only event changed: {key}')
        if target == 'Data/Events/ElliottHouse':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Elliott House quoted field count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Elliott House event commands changed: {key}')
        if target == 'Data/Events/Farm':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            original_skeleton = quoted.sub('"<text>"', original)
            translated_skeleton = quoted.sub('"<text>"', translated)
            quick_choices = re.compile(r'(?<=quickQuestion ).*?(?=\(break\))')
            original_choices = quick_choices.findall(original_skeleton)
            translated_choices = quick_choices.findall(translated_skeleton)
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Farm quoted field count changed: {key}')
            elif len(original_choices) != len(translated_choices):
                errors.append(f'Farm quick-question grammar changed: {key}')
            elif (original_choices
                  and original_choices[0].count('#') != translated_choices[0].count('#')):
                errors.append(f'Farm quick-question choice count changed: {key}')
            elif (quick_choices.sub('<choices>', translated_skeleton)
                  != quick_choices.sub('<choices>', original_skeleton)):
                errors.append(f'Farm event commands changed: {key}')
        if target == 'Data/Events/FarmHouse':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            original_skeleton = quoted.sub('"<text>"', original)
            translated_skeleton = quoted.sub('"<text>"', translated)
            quick_choices = re.compile(r'(?<=quickQuestion ).*?(?=\(break\))')
            original_choices = quick_choices.findall(original_skeleton)
            translated_choices = quick_choices.findall(translated_skeleton)
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Farm House quoted field count changed: {key}')
            elif len(original_choices) != len(translated_choices):
                errors.append(f'Farm House quick-question grammar changed: {key}')
            elif any(source_choice.count('#') != target_choice.count('#')
                     for source_choice, target_choice in zip(original_choices,
                                                              translated_choices)):
                errors.append(f'Farm House quick-question choice count changed: {key}')
            elif (quick_choices.sub('<choices>', translated_skeleton)
                  != quick_choices.sub('<choices>', original_skeleton)):
                errors.append(f'Farm House event commands changed: {key}')
        if target == 'Data/Events/FishShop':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            original_skeleton = quoted.sub('"<text>"', original)
            translated_skeleton = quoted.sub('"<text>"', translated)
            quick_choices = re.compile(r'(?<=quickQuestion ).*?(?=\(break\))')
            original_choices = quick_choices.findall(original_skeleton)
            translated_choices = quick_choices.findall(translated_skeleton)
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Fish Shop quoted field count changed: {key}')
            elif len(original_choices) != len(translated_choices):
                errors.append(f'Fish Shop quick-question grammar changed: {key}')
            elif any(source_choice.count('#') != target_choice.count('#')
                     for source_choice, target_choice in zip(original_choices,
                                                              translated_choices)):
                errors.append(f'Fish Shop quick-question choice count changed: {key}')
            elif (quick_choices.sub('<choices>', translated_skeleton)
                  != quick_choices.sub('<choices>', original_skeleton)):
                errors.append(f'Fish Shop event commands changed: {key}')
        if target == 'Data/Events/Forest':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            original_skeleton = quoted.sub('"<text>"', original)
            translated_skeleton = quoted.sub('"<text>"', translated)
            quick_choices = re.compile(r'(?<=quickQuestion ).*?(?=\(break\))')
            original_choices = quick_choices.findall(original_skeleton)
            translated_choices = quick_choices.findall(translated_skeleton)
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Forest quoted field count changed: {key}')
            elif len(original_choices) != len(translated_choices):
                errors.append(f'Forest quick-question grammar changed: {key}')
            elif any(source_choice.count('#') != target_choice.count('#')
                     for source_choice, target_choice in zip(original_choices,
                                                              translated_choices)):
                errors.append(f'Forest quick-question choice count changed: {key}')
            elif (quick_choices.sub('<choices>', translated_skeleton)
                  != quick_choices.sub('<choices>', original_skeleton)):
                errors.append(f'Forest event commands changed: {key}')
        if target == 'Data/Events/HaleyHouse':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Haley House quoted field count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Haley House event commands changed: {key}')
        if target == 'Data/Events/HarveyRoom':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Harvey Room quoted field count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Harvey Room event commands changed: {key}')
        if target == 'Data/Events/Hospital':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Hospital quoted field count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Hospital event commands changed: {key}')
        if target == 'Data/Events/IslandHut':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            original_skeleton = quoted.sub('"<text>"', original)
            translated_skeleton = quoted.sub('"<text>"', translated)
            quick_choices = re.compile(r'(?<=quickQuestion ).*?(?=\(break\))')
            original_choices = quick_choices.findall(original_skeleton)
            translated_choices = quick_choices.findall(translated_skeleton)
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Island Hut quoted field count changed: {key}')
            elif len(original_choices) != len(translated_choices):
                errors.append(f'Island Hut quick-question grammar changed: {key}')
            elif any(source_choice.count('#') != target_choice.count('#')
                     for source_choice, target_choice in zip(original_choices,
                                                              translated_choices)):
                errors.append(f'Island Hut quick-question choice count changed: {key}')
            elif (quick_choices.sub('<choices>', translated_skeleton)
                  != quick_choices.sub('<choices>', original_skeleton)):
                errors.append(f'Island Hut event commands changed: {key}')
        if target == 'Data/Events/IslandNorth':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            original_skeleton = quoted.sub('"<text>"', original)
            translated_skeleton = quoted.sub('"<text>"', translated)
            quick_choices = re.compile(r'(?<=quickQuestion ).*?(?=\(break\))')
            original_choices = quick_choices.findall(original_skeleton)
            translated_choices = quick_choices.findall(translated_skeleton)
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Island North quoted field count changed: {key}')
            elif len(original_choices) != len(translated_choices):
                errors.append(f'Island North quick-question grammar changed: {key}')
            elif any(source_choice.count('#') != target_choice.count('#')
                     for source_choice, target_choice in zip(original_choices,
                                                              translated_choices)):
                errors.append(f'Island North quick-question choice count changed: {key}')
            elif (quick_choices.sub('<choices>', translated_skeleton)
                  != quick_choices.sub('<choices>', original_skeleton)):
                errors.append(f'Island North event commands changed: {key}')
        if target == 'Data/Events/IslandSouth':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            original_skeleton = quoted.sub('"<text>"', original)
            translated_skeleton = quoted.sub('"<text>"', translated)
            quick_choices = re.compile(r'(?<=quickQuestion ).*?(?=\(break\))')
            original_choices = quick_choices.findall(original_skeleton)
            translated_choices = quick_choices.findall(translated_skeleton)
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Island South quoted field count changed: {key}')
            elif len(original_choices) != len(translated_choices):
                errors.append(f'Island South quick-question grammar changed: {key}')
            elif any(source_choice.count('#') != target_choice.count('#')
                     for source_choice, target_choice in zip(original_choices,
                                                              translated_choices)):
                errors.append(f'Island South quick-question choice count changed: {key}')
            elif (quick_choices.sub('<choices>', translated_skeleton)
                  != quick_choices.sub('<choices>', original_skeleton)):
                errors.append(f'Island South event commands changed: {key}')
        if target == 'Data/Events/IslandWest':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            original_skeleton = quoted.sub('"<text>"', original)
            translated_skeleton = quoted.sub('"<text>"', translated)
            quick_choices = re.compile(r'(?<=quickQuestion ).*?(?=\(break\))')
            original_choices = quick_choices.findall(original_skeleton)
            translated_choices = quick_choices.findall(translated_skeleton)
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Island West quoted field count changed: {key}')
            elif len(original_choices) != len(translated_choices):
                errors.append(f'Island West quick-question grammar changed: {key}')
            elif any(source_choice.count('#') != target_choice.count('#')
                     for source_choice, target_choice in zip(original_choices,
                                                              translated_choices)):
                errors.append(f'Island West quick-question choice count changed: {key}')
            elif (quick_choices.sub('<choices>', translated_skeleton)
                  != quick_choices.sub('<choices>', original_skeleton)):
                errors.append(f'Island West event commands changed: {key}')
        if target == 'Data/Events/JoshHouse':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            original_skeleton = quoted.sub('"<text>"', original)
            translated_skeleton = quoted.sub('"<text>"', translated)
            quick_choices = re.compile(r'(?<=quickQuestion ).*?(?=\(break\))')
            original_choices = quick_choices.findall(original_skeleton)
            translated_choices = quick_choices.findall(translated_skeleton)
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Josh House quoted field count changed: {key}')
            elif len(original_choices) != len(translated_choices):
                errors.append(f'Josh House quick-question grammar changed: {key}')
            elif any(source_choice.count('#') != target_choice.count('#')
                     for source_choice, target_choice in zip(original_choices,
                                                              translated_choices)):
                errors.append(f'Josh House quick-question choice count changed: {key}')
            elif (quick_choices.sub('<choices>', translated_skeleton)
                  != quick_choices.sub('<choices>', original_skeleton)):
                errors.append(f'Josh House event commands changed: {key}')
        if target == 'Data/Events/LeahHouse':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Leah House quoted field count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Leah House event commands changed: {key}')
        if target == 'Data/Events/ManorHouse':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            original_skeleton = quoted.sub('"<text>"', original)
            translated_skeleton = quoted.sub('"<text>"', translated)
            quick_choices = re.compile(r'(?<=quickQuestion ).*?(?=\(break\))')
            original_choices = quick_choices.findall(original_skeleton)
            translated_choices = quick_choices.findall(translated_skeleton)
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Manor House quoted field count changed: {key}')
            elif len(original_choices) != len(translated_choices):
                errors.append(f'Manor House quick-question grammar changed: {key}')
            elif any(source_choice.count('#') != target_choice.count('#')
                     for source_choice, target_choice in zip(original_choices,
                                                              translated_choices)):
                errors.append(f'Manor House quick-question choice count changed: {key}')
            elif (quick_choices.sub('<choices>', translated_skeleton)
                  != quick_choices.sub('<choices>', original_skeleton)):
                errors.append(f'Manor House event commands changed: {key}')
        if target == 'Data/Events/Mine':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Mine quoted field count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Mine event commands changed: {key}')
        if target == 'Data/Events/Mountain':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            original_skeleton = quoted.sub('"<text>"', original)
            translated_skeleton = quoted.sub('"<text>"', translated)
            quick_choices = re.compile(r'(?<=quickQuestion ).*?(?=\(break\))')
            original_choices = quick_choices.findall(original_skeleton)
            translated_choices = quick_choices.findall(translated_skeleton)
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Mountain quoted field count changed: {key}')
            elif len(original_choices) != len(translated_choices):
                errors.append(f'Mountain quick-question grammar changed: {key}')
            elif any(source_choice.count('#') != target_choice.count('#')
                     for source_choice, target_choice in zip(original_choices,
                                                              translated_choices)):
                errors.append(f'Mountain quick-question choice count changed: {key}')
            elif (quick_choices.sub('<choices>', translated_skeleton)
                  != quick_choices.sub('<choices>', original_skeleton)):
                errors.append(f'Mountain event commands changed: {key}')
        if target == 'Data/Events/QiNutRoom':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Qi Nut Room quoted field count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Qi Nut Room event commands changed: {key}')
        if target == 'Data/Events/Railroad':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Railroad quoted field count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Railroad event commands changed: {key}')
        if target == 'Data/Events/Saloon':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Saloon quoted field count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Saloon event commands changed: {key}')
        if target == 'Data/Events/SamHouse':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Sam House quoted field count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Sam House event commands changed: {key}')
        if target == 'Data/Events/SandyHouse':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Sandy House quoted field count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Sandy House event commands changed: {key}')
        if target == 'Data/Events/ScienceHouse':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            original_skeleton = quoted.sub('"<text>"', original)
            translated_skeleton = quoted.sub('"<text>"', translated)
            quick_choices = re.compile(r'(?<=quickQuestion ).*?(?=\(break\))')
            original_choices = quick_choices.findall(original_skeleton)
            translated_choices = quick_choices.findall(translated_skeleton)
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Science House quoted field count changed: {key}')
            elif len(original_choices) != len(translated_choices):
                errors.append(f'Science House quick-question grammar changed: {key}')
            elif any(source_choice.count('#') != target_choice.count('#')
                     for source_choice, target_choice in zip(original_choices,
                                                              translated_choices)):
                errors.append(f'Science House quick-question choice count changed: {key}')
            elif (quick_choices.sub('<choices>', translated_skeleton)
                  != quick_choices.sub('<choices>', original_skeleton)):
                errors.append(f'Science House event commands changed: {key}')
        if target == 'Data/Events/SebastianRoom':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Sebastian Room quoted field count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Sebastian Room event commands changed: {key}')
        if target == 'Data/Events/SeedShop':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            original_skeleton = quoted.sub('"<text>"', original)
            translated_skeleton = quoted.sub('"<text>"', translated)
            quick_choices = re.compile(r'(?<=quickQuestion ).*?(?=\(break\))')
            original_choices = quick_choices.findall(original_skeleton)
            translated_choices = quick_choices.findall(translated_skeleton)
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Seed Shop quoted field count changed: {key}')
            elif len(original_choices) != len(translated_choices):
                errors.append(f'Seed Shop quick-question grammar changed: {key}')
            elif any(source_choice.count('#') != target_choice.count('#')
                     for source_choice, target_choice in zip(original_choices,
                                                              translated_choices)):
                errors.append(f'Seed Shop quick-question choice count changed: {key}')
            elif (quick_choices.sub('<choices>', translated_skeleton)
                  != quick_choices.sub('<choices>', original_skeleton)):
                errors.append(f'Seed Shop event commands changed: {key}')
        if target == 'Data/Events/Sewer':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Sewer quoted field count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Sewer event commands changed: {key}')
        if target == 'Data/Events/Sunroom':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            original_skeleton = quoted.sub('"<text>"', original)
            translated_skeleton = quoted.sub('"<text>"', translated)
            quick_choices = re.compile(r'(?<=quickQuestion ).*?(?=\(break\))')
            original_choices = quick_choices.findall(original_skeleton)
            translated_choices = quick_choices.findall(translated_skeleton)
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Sunroom quoted field count changed: {key}')
            elif len(original_choices) != len(translated_choices):
                errors.append(f'Sunroom quick-question grammar changed: {key}')
            elif any(source_choice.count('#') != target_choice.count('#')
                     for source_choice, target_choice in zip(original_choices,
                                                              translated_choices)):
                errors.append(f'Sunroom quick-question choice count changed: {key}')
            elif (quick_choices.sub('<choices>', translated_skeleton)
                  != quick_choices.sub('<choices>', original_skeleton)):
                errors.append(f'Sunroom event commands changed: {key}')
        if target == 'Data/Events/Temp':
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'Temp quoted field count changed: {key}')
            elif quoted.sub('"<text>"', translated) != quoted.sub('"<text>"', original):
                errors.append(f'Temp event commands changed: {key}')
        if target in ('Data/Events/Town', 'Data/Events/Trailer',
                      'Data/Events/Trailer_Big', 'Data/Events/WizardHouse',
                      'Data/Events/Woods'):
            event_name = target.rsplit('/', 1)[-1]
            quoted = re.compile(r'"(?:\\.|[^"\\])*"')
            original_skeleton = quoted.sub('"<text>"', original)
            translated_skeleton = quoted.sub('"<text>"', translated)
            quick_choices = re.compile(r'(?<=quickQuestion ).*?(?=\(break\))')
            original_choices = quick_choices.findall(original_skeleton)
            translated_choices = quick_choices.findall(translated_skeleton)
            if len(quoted.findall(original)) != len(quoted.findall(translated)):
                errors.append(f'{event_name} quoted field count changed: {key}')
            elif any(source_field.count('~') != target_field.count('~')
                     for source_field, target_field in zip(quoted.findall(original),
                                                            quoted.findall(translated))):
                errors.append(f'{event_name} split-speech branch count changed: {key}')
            elif (target in ('Data/Events/Trailer', 'Data/Events/Trailer_Big')
                  and any(source_field.count('#') != target_field.count('#')
                          for source_field, target_field in zip(quoted.findall(original),
                                                                 quoted.findall(translated)))):
                errors.append(f'{event_name} quoted response structure changed: {key}')
            elif len(original_choices) != len(translated_choices):
                errors.append(f'{event_name} quick-question grammar changed: {key}')
            elif any(source_choice.count('#') != target_choice.count('#')
                     for source_choice, target_choice in zip(original_choices,
                                                              translated_choices)):
                errors.append(f'{event_name} quick-question choice count changed: {key}')
            elif (quick_choices.sub('<choices>', translated_skeleton)
                  != quick_choices.sub('<choices>', original_skeleton)):
                errors.append(f'{event_name} event commands changed: {key}')
            if target == 'Data/Events/Trailer':
                dialogue_branch = re.compile(r'\$(?:p|q|r)\s+[^#|"\\]*')
                original_branches = [dialogue_branch.findall(field)
                                     for field in quoted.findall(original)]
                translated_branches = [dialogue_branch.findall(field)
                                       for field in quoted.findall(translated)]
                if translated_branches != original_branches:
                    errors.append(f'Trailer dialogue branch commands changed: {key}')
        if (target == 'Strings/StringsFromCSFiles'
                and re.fullmatch(r'Dialogue\.cs\.(?:79[5-9]|80[0-9]|810)', key)
                and translated != original):
            errors.append(f'Dialogue color control identifier changed: {key}')
        if (target == 'Strings/StringsFromCSFiles'
                and key == 'Farmer.cs.1919' and '{1}{0}' not in translated):
            errors.append('Singleton received-item article and item are not adjacent: Farmer.cs.1919')
        if (target == 'Strings/StringsFromCSFiles'
                and key == 'Farmer.cs.1922'
                and translated.find('{1}') > translated.find('{0}')):
            errors.append('Plural received-item name/count order changed: Farmer.cs.1922')
        if target == 'Strings/Lexicon' and key.startswith('Random'):
            if len(original.split('#')) != len(translated.split('#')):
                errors.append(f'Random vocabulary variant count changed: {key}')
            if any(not variant.strip() for variant in translated.split('#')):
                errors.append(f'Empty random vocabulary variant: {key}')
        if translated != unicodedata.normalize('NFC', translated):
            errors.append(f'Non-NFC Unicode: {key}')
        if any(unicodedata.category(c) == 'Cf' for c in translated):
            errors.append(f'Unexpected Unicode formatting control: {key}')
        if original.strip() and not translated.strip():
            errors.append(f'Empty translation: {key}')
        visible_original, visible_translated = original, translated
        if target == 'Data/Achievements':
            visible_original = '^'.join(original.split('^')[:2])
            visible_translated = '^'.join(translated.split('^')[:2])
        elif target == 'Data/Boots':
            visible_original = '/'.join((original.split('/')[1], original.split('/')[6]))
            visible_translated = '/'.join((translated.split('/')[1], translated.split('/')[6]))
        elif target == 'Data/Bundles':
            visible_original = original.split('/')[6]
            visible_translated = translated.split('/')[6]
        elif target == 'Data/Monsters':
            visible_original = original.split('/')[-1]
            visible_translated = translated.split('/')[-1]
        elif target == 'Data/NPCGiftTastes':
            if key.startswith('Universal_'):
                visible_original = ''
                visible_translated = ''
            else:
                visible_original = ' '.join(original.split('/')[0:10:2])
                visible_translated = ' '.join(translated.split('/')[0:10:2])
        elif target == 'Data/hats':
            original_fields = original.split('/')
            translated_fields = translated.split('/')
            visible_original = ' '.join((original_fields[0], original_fields[1], original_fields[5]))
            visible_translated = ' '.join((translated_fields[0], translated_fields[1], translated_fields[5]))
        elif target == 'Data/mail':
            item_command = re.compile(r'%item .*?%%')
            visible_original = item_command.sub('', original)
            visible_translated = item_command.sub('', translated)
        elif target == 'Strings/1_6_Strings' and key == 'ForestPylonEvent':
            event_text = re.compile(r'"((?:\\.|[^"\\])*)"')
            visible_original = ' '.join(event_text.findall(original))
            visible_translated = ' '.join(event_text.findall(translated))
        elif target == 'Data/Quests':
            original_fields = original.split('/')
            translated_fields = translated.split('/')
            visible_original = ' '.join(original_fields[1:4] + original_fields[9:])
            visible_translated = ' '.join(translated_fields[1:4] + translated_fields[9:])
        elif target == 'Data/SecretNotes':
            if re.fullmatch(r'!image \d+', original):
                visible_original = ''
                visible_translated = ''
            else:
                visible_original = re.sub(r'%revealtaste:[^%]+', '', original)
                visible_translated = re.sub(r'%revealtaste:[^%]+', '', translated)
        elif target.startswith('Data/Events/'):
            event_text = re.compile(r'"((?:\\.|[^"\\])*)"')
            visible_original = ' '.join(event_text.findall(original))
            visible_translated = ' '.join(event_text.findall(translated))
            if target in ('Data/Events/Forest', 'Data/Events/IslandHut',
                          'Data/Events/IslandNorth', 'Data/Events/IslandSouth',
                          'Data/Events/IslandWest', 'Data/Events/JoshHouse',
                          'Data/Events/ManorHouse', 'Data/Events/Mountain',
                          'Data/Events/ScienceHouse', 'Data/Events/SeedShop',
                          'Data/Events/Sunroom', 'Data/Events/Town',
                          'Data/Events/Trailer'):
                quick_choices = re.compile(r'(?<=quickQuestion ).*?(?=\(break\))')
                visible_original += ' ' + ' '.join(quick_choices.findall(original))
                visible_translated += ' ' + ' '.join(quick_choices.findall(translated))
        elif (target == 'Data/ExtraDialogue'
              and key in ('SkullCavern_100_event',
                          'SkullCavern_100_event_honorable')):
            event_text = re.compile(r'"((?:\\.|[^"\\])*)"')
            visible_original = ' '.join(event_text.findall(original))
            visible_translated = ' '.join(event_text.findall(translated))
        elif target == 'Data/ExtraDialogue' and key in EXTRA_DIALOGUE_SUMMIT_FRAGMENTS:
            visible_original = ' '.join(summit_fragment_parts(original)[0])
            visible_translated = ' '.join(summit_fragment_parts(translated)[0])
        lexical_original = re.sub(r'\b\d{1,3}(?:,\d{3})*g\b', '', visible_original)
        if original == translated:
            if not batch.get('preserveReasons', {}).get(key, '').strip():
                errors.append(f'Unjustified unchanged record: {key}')
        elif key in batch.get('preserveReasons', {}):
            errors.append(f'Preservation reason attached to changed text: {key}')
        elif (not singleton_quantity and re.search('[A-Za-z]', lexical_original)
              and not re.search('[А-Яа-яѝЍ]', visible_translated)):
            warnings.append(f'No Bulgarian Cyrillic in translated record: {key}')
        prose = re.sub(r'\{[^}]*\}|\$[\w]+|%[\w]+|https?://\S+', '', visible_translated)
        if (original != translated
                and re.search(r'\b(the|and|with|from|for|your|you|this|that|fish|farm|festival|bundle)\b', prose, re.I)):
            warnings.append(f'Potential English prose residue: {key}')
    if set(batch.get('sourceHashes', {})) != set(batch['entries']):
        errors.append('Source references do not match batch entries exactly')
    if set(batch.get('preserveReasons', {})) - set(batch['entries']):
        errors.append('Preservation reason without an entry')
    return source, glossary_hash, errors, warnings


def apply(batch, source, glossary_hash):
    if batch.get('status') != 'reviewed' or not batch.get('editorialReview'):
        raise ValueError('Batch has no explicit completed editorial attestation')
    if not re.fullmatch(r'\d{4}-[a-z0-9-]+', batch['id']):
        raise ValueError('Invalid batch ID')
    folder = progress.PAYLOAD / 'assets/translations/bulgarian'
    folder.mkdir(parents=True, exist_ok=True)
    output = folder / (batch['id'] + '.json')
    for file in folder.glob('*.json'):
        if file == output:
            continue
        for patch in progress.read(file)['Changes']:
            if patch['Target'] == batch['target']:
                applied = set(patch.get('Entries', {}))
                applied.update(key + '.' + field for key, fields in patch.get('Fields', {}).items()
                               for field in fields)
                if applied & set(batch['entries']):
                    raise ValueError(f'Overlapping applied batch: {file.name}')
    records = progress.read(progress.STATE / 'reviewed-records.json')
    retained = [r for r in records['records'] if r['batch'] != batch['id']]
    for key, translated in batch['entries'].items():
        preserved = key in batch.get('preserveReasons', {})
        record = {'target': batch['target'], 'key': key,
                  'sourceSha256': progress.digest(source[key]),
                  'translationSha256': progress.digest(translated),
                  'glossarySha256': glossary_hash, 'batch': batch['id'],
                  'status': 'reviewed-preserve' if preserved else 'reviewed-translation'}
        if preserved:
            record['reason'] = batch['preserveReasons'][key]
        retained.append(record)
    change = {'Action': 'EditData', 'Target': batch['target'],
              'When': {'Language': 'bg-vnrevival'}}
    if batch['target'] in ('Data/Buildings', 'Data/Pets', 'Data/Characters',
                            'Data/JukeboxTracks'):
        fields = {}
        for identity, value in batch['entries'].items():
            key, field = identity.rsplit('.', 1)
            fields.setdefault(key, {})[field] = value
        change['Fields'] = fields
    else:
        change['Entries'] = batch['entries']
    progress.write(output, {'Changes': [change]})
    records['records'] = retained
    progress.write(progress.STATE / 'reviewed-records.json', records)
    checkpoint = progress.read(progress.STATE / 'checkpoint.json')
    checkpoint['phase'] = 'game-translation'
    checkpoint['reviewedGameRecords'] = len(retained)
    checkpoint['projectPercent'] = 100 * len(retained) / checkpoint['sourceRecordCount']
    checkpoint['lastAppliedBatch'] = batch['id']
    progress.write(progress.STATE / 'checkpoint.json', checkpoint)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=('pin', 'check', 'apply'))
    parser.add_argument('batch', type=Path)
    args = parser.parse_args()
    batch = progress.read(args.batch)
    if args.command == 'pin':
        if batch.get('sourceHashes') or batch.get('glossarySha256'):
            raise ValueError('Batch already pinned; do not silently replace editorial references')
        source = source_entries(batch['target'])
        batch['sourceHashes'] = {key: progress.digest(source[key]) for key in batch['entries']}
        batch['glossarySha256'] = progress.digest((progress.ROOT / 'Documentation/glossary/glossary.bg.json').read_text())
        progress.write(args.batch, batch)
    source, glossary_hash, errors, warnings = validate(batch)
    report = {'batch': batch['id'], 'checkedRecords': len(batch['entries']),
              'errors': errors, 'warnings': warnings}
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if errors or warnings:
        return 1
    if args.command == 'apply':
        apply(batch, source, glossary_hash)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

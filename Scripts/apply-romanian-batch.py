#!/usr/bin/env python3
"""Validate/materialize an explicitly reviewed, directly authored Romanian batch."""
import argparse
import json
import re
from pathlib import Path
from importlib.util import spec_from_file_location, module_from_spec

ROOT = Path(__file__).resolve().parents[1]
spec = spec_from_file_location('ro_progress', ROOT / 'Scripts/audit-romanian-progress.py')
progress = module_from_spec(spec)
spec.loader.exec_module(progress)
read, digest = progress.read, progress.digest
DOC = ROOT / 'Documentation/romanian'
CHECKS = ['english-fidelity', 'context', 'terminology', 'romanian-editorial', 'tokens']
PLAIN_STRING_TARGETS = {
    'Strings/UI', 'Strings/EnchantmentNames', 'Strings/Tools', 'Strings/Weapons',
    'Strings/Quests', 'Strings/WorldMap', 'Strings/animationDescriptions',
    'Strings/Events', 'Strings/FarmAnimals', 'Data/Festivals/FestivalDates',
    'Data/EngagementDialogue', 'Characters/Dialogue/Gil', 'Strings/BundleNames',
    'Strings/NPCNames', 'Strings/Pants', 'Strings/MovieConcessions',
    'Strings/Buildings',
    'Strings/SpeechBubbles',
    'Strings/Movies',
    'Data/TV/TipChannel',
    'Strings/credits',
    'Strings/Shirts',
    'Strings/BigCraftables',
    'Strings/Furniture',
    'Strings/Notes',
    'Strings/schedules/Pierre', 'Strings/schedules/Emily',
    'Strings/schedules/Abigail', 'Strings/schedules/Willy',
    'Strings/schedules/Sam', 'Strings/schedules/Caroline',
    'Strings/schedules/Harvey', 'Strings/schedules/Alex',
    'Strings/schedules/Haley',
    'Strings/schedules/Linus', 'Strings/schedules/Pam',
    'Strings/schedules/Demetrius', 'Strings/schedules/Clint',
    'Strings/schedules/Elliott', 'Strings/schedules/Gus',
    'Strings/schedules/Leah', 'Strings/schedules/Robin',
    'Strings/schedules/Vincent', 'Strings/schedules/Leo',
    'Strings/schedules/Marnie', 'Strings/schedules/Sandy',
    'Strings/schedules/Jas', 'Strings/schedules/George',
    'Strings/schedules/Evelyn', 'Strings/schedules/Penny',
    'Strings/schedules/Maru',
    'Strings/schedules/Lewis', 'Strings/schedules/Sebastian',
    'Strings/schedules/Shane',
    'Strings/schedules/Jodi',
    'Strings/Locations',
    'Strings/SpecialOrderStrings',
    'Strings/StringsFromMaps',
    'Strings/Objects',
    'Strings/StringsFromCSFiles',
}
MIXED_DIALOGUE_TARGETS = {'Strings/1_6_Strings'}
ALTERNATIVE_DIALOGUE_TARGETS = {
    'Strings/Characters',
    'Characters/Dialogue/Abigail',
    'Characters/Dialogue/Alex',
    'Characters/Dialogue/Elliott',
    'Characters/Dialogue/Emily',
    'Characters/Dialogue/Haley',
    'Characters/Dialogue/Leah',
    'Characters/Dialogue/Maru',
    'Characters/Dialogue/MarriageDialogue',
    'Characters/Dialogue/Penny',
    'Characters/Dialogue/Sam',
    'Characters/Dialogue/Sebastian',
    'Strings/MovieReactions',
    'Strings/SimpleNonVillagerDialogues', 'Characters/Dialogue/Sandy',
    'Characters/Dialogue/Dwarf', 'Characters/Dialogue/Wizard',
    'Characters/Dialogue/Mister Qi', 'Characters/Dialogue/Leo',
    'Characters/Dialogue/LeoMainland', 'Characters/Dialogue/Krobus',
    'Characters/Dialogue/Vincent', 'Characters/Dialogue/rainy',
    'Characters/Dialogue/George', 'Characters/Dialogue/Kent',
    'Characters/Dialogue/Gus', 'Characters/Dialogue/Marnie',
    'Characters/Dialogue/Jas', 'Characters/Dialogue/Willy',
    'Characters/Dialogue/Clint', 'Characters/Dialogue/Evelyn',
    'Characters/Dialogue/Caroline', 'Characters/Dialogue/Jodi',
    'Characters/Dialogue/Linus', 'Characters/Dialogue/MarriageDialogueSam',
    'Characters/Dialogue/MarriageDialoguePenny',
    'Characters/Dialogue/MarriageDialogueMaru',
    'Characters/Dialogue/MarriageDialogueEmily',
    'Characters/Dialogue/MarriageDialogueElliott',
    'Characters/Dialogue/MarriageDialogueAlex',
    'Characters/Dialogue/MarriageDialogueHaley',
    'Characters/Dialogue/MarriageDialogueHarvey',
    'Characters/Dialogue/MarriageDialogueShane',
    'Characters/Dialogue/MarriageDialogueSebastian',
    'Characters/Dialogue/MarriageDialogueAbigail',
    'Characters/Dialogue/MarriageDialogueLeah',
    'Characters/Dialogue/MarriageDialogueKrobus',
    'Characters/Dialogue/Lewis',
    'Characters/Dialogue/Pam',
    'Characters/Dialogue/Shane',
    'Characters/Dialogue/Pierre', 'Characters/Dialogue/Robin',
    'Characters/Dialogue/Demetrius', 'Characters/Dialogue/Harvey',
}
SLASH_EQUIPMENT_TARGETS = {'Data/Boots'}
SLASH_RECIPE_TARGETS = {'Data/TV/CookingChannel'}
SLASH_FIRST_FIELD_TARGETS = {'Data/Fish'}
SLASH_BUNDLE_TARGETS = {'Data/Bundles'}
SLASH_MONSTER_TARGETS = {'Data/Monsters'}
SLASH_HAT_TARGETS = {'Data/hats'}
GIFT_TASTE_TARGETS = {'Data/NPCGiftTastes'}
MAIL_TARGETS = {'Data/mail'}
SECRET_NOTE_TARGETS = {'Data/SecretNotes'}
QUEST_TARGETS = {'Data/Quests'}
CARET_ACHIEVEMENT_TARGETS = {'Data/Achievements'}
TECHNICAL_IDENTITY_TARGETS = {
    'Data/HairData', 'Data/PaintData', 'Data/ChairTiles', 'Data/AquariumFish',
    'Data/CookingRecipes', 'Data/CraftingRecipes',
    'Data/Furniture',
    'Data/animationDescriptions',
}
EVENT_TARGETS = {
    'Data/Events/AbandonedJojaMart',
    'Data/Events/AnimalShop',
    'Data/Events/ArchaeologyHouse',
    'Data/Events/Backwoods',
    'Data/Events/BathHouse_Pool',
    'Data/Events/Beach',
    'Data/Events/BoatTunnel',
    'Data/Events/BusStop',
    'Data/Events/CommunityCenter',
    'Data/Events/DesertFestival',
    'Data/Events/ElliottHouse',
    'Data/Events/Farm',
    'Data/Events/FarmHouse',
    'Data/Events/FishShop',
    'Data/Events/Forest',
    'Data/Events/HaleyHouse',
    'Data/Events/HarveyRoom',
    'Data/Events/Hospital',
    'Data/Events/IslandHut',
    'Data/Events/IslandNorth',
    'Data/Events/IslandSouth',
    'Data/Events/IslandWest',
    'Data/Events/JoshHouse',
    'Data/Events/LeahHouse',
    'Data/Events/ManorHouse',
    'Data/Events/Mine',
    'Data/Events/Mountain',
    'Data/Events/QiNutRoom',
    'Data/Events/Railroad',
    'Data/Events/SandyHouse',
    'Data/Events/Sewer',
    'Data/Events/Sunroom',
    'Data/Events/SamHouse',
    'Data/Events/ScienceHouse',
    'Data/Events/Temp',
    'Data/Events/Trailer',
    'Data/Events/Trailer_Big',
    'Data/Events/WizardHouse',
    'Data/Events/Woods',
    'Data/Events/SebastianRoom',
    'Data/Events/SeedShop',
    'Data/Events/Saloon',
    'Data/Events/Town',
}
FESTIVAL_TARGETS = {
    'Data/Festivals/spring13',
    'Data/Festivals/fall16',
    'Data/Festivals/fall27',
    'Data/Festivals/spring24',
    'Data/Festivals/summer11',
    'Data/Festivals/summer28',
    'Data/Festivals/winter25',
    'Data/Festivals/winter8',
}
FESTIVAL_TECHNICAL_KEYS = {'conditions', 'set-up', 'set-up_y2', 'shop_y2'}
LOCATION_EVENT_KEYS = {
    'IslandNorth_Event_SafariManAppear', 'IslandFieldOffice_Intro_Event',
    'IslandHut_Event_ParrotBoyIntro', 'IslandSecret_Event_BirdieIntro',
    'IslandSecret_Event_BirdieFinished', 'alreadyGotNuts', 'FieldOfficeFinale',
}
SUPPORTED_TARGETS = (PLAIN_STRING_TARGETS | MIXED_DIALOGUE_TARGETS
                     | ALTERNATIVE_DIALOGUE_TARGETS | SLASH_EQUIPMENT_TARGETS
                     | SLASH_RECIPE_TARGETS | SLASH_FIRST_FIELD_TARGETS
                     | SLASH_BUNDLE_TARGETS
                     | SLASH_MONSTER_TARGETS
                     | SLASH_HAT_TARGETS
                     | GIFT_TASTE_TARGETS
                     | MAIL_TARGETS
                     | SECRET_NOTE_TARGETS
                     | QUEST_TARGETS
                     | CARET_ACHIEVEMENT_TARGETS
                     | TECHNICAL_IDENTITY_TARGETS
                     | EVENT_TARGETS
                     | FESTIVAL_TARGETS
                     | {'Strings/Lexicon', 'Data/ExtraDialogue'})
EXTRA_DIALOGUE_EVENTS = {
    'SkullCavern_100_event': False,
    'SkullCavern_100_event_honorable': False,
    **{'SummitEvent_Dialogue3_' + name: True for name in
       ['Alex', 'Sebastian', 'Shane', 'Harvey', 'Emily', 'Haley', 'Maru']},
}
DIALOGUE_SLASH_ALTERNATIVES = {
    ('Characters/Dialogue/Gus', 'SeedShop_Entry'),
    ('Characters/Dialogue/Pam', 'Saloon_Entry'),
    ('Characters/Dialogue/Pam', 'Trailer_Entry'),
}
DIALOGUE_CARET_ALTERNATIVES = {
    ('Strings/Characters', 'Phone_Clint_Open_Rare'),
    ('Characters/Dialogue/Abigail', 'Event_Grave3'),
    *{('Characters/Dialogue/Alex', key) for key in [
      'Introduction', 'Resort_Chair', 'Tue', 'Wed', 'Fri', 'Fri8',
      'event_box3', 'summer_Mon', 'summer_Wed', 'summer_Wed_01_03',
      'summer_Thu', 'fall_Wed']},
    ('Characters/Dialogue/Elliott', 'event_boat1'),
    ('Characters/Dialogue/Emily', 'summer_Sun6'),
    *{('Characters/Dialogue/Haley', key) for key in [
      'Introduction', 'FlowerDance_Accept', 'dating_Haley_memory_oneday',
      'married_Emily', 'Tue', 'winter_Sun10']},
    ('Characters/Dialogue/Leah', 'event_sculpt3'),
    ('Characters/Dialogue/Maru', 'married_Sebastian'),
    *{('Characters/Dialogue/MarriageDialogue', key) for key in [
      'Rainy_Night_3', 'Indoor_Night_2', 'Indoor_Night_Alex',
      'Indoor_Night_Elliott', 'Good_3']},
    ('Characters/Dialogue/Penny', 'event_pool4'),
    ('Characters/Dialogue/Sam', 'Wed10'),
    *{('Characters/Dialogue/Sebastian', key) for key in [
      'dating_Sebastian', 'event_garage3']},
    *{('Strings/MovieReactions', key) for key in [
      'Clint_like_BeforeMovie', 'Clint_like_DuringMovie']},
}
DIALOGUE_QUERY_PIPE = {
    *{('Characters/Dialogue/Abigail', key) for key in [
      'Sun_old', 'Mon8', 'summer_Sun_old', 'fall_Tue', 'fall_Sat',
      'fall_Sun_old', 'winter_Sun_old']},
    ('Characters/Dialogue/Alex', 'summer_Wed_01_old'),
    *{('Characters/Dialogue/Emily', key) for key in ['Wed8', 'fall_15']},
    *{('Characters/Dialogue/Haley', key) for key in ['summer_Tue4', 'fall_Mon6']},
    *{('Characters/Dialogue/Leah', key) for key in ['Mon_old', 'Wed8', 'Sat8']},
    ('Characters/Dialogue/Maru', 'Sun_01_old'),
    *{('Characters/Dialogue/Penny', key) for key in [
      'Tue4', 'Sat2', 'summer_Mon4', 'summer_Fri']},
    ('Characters/Dialogue/Sam', 'winter_Wed'),
    ('Characters/Dialogue/Sebastian', 'Thu8'),
    ('Characters/Dialogue/Marnie', 'Tue'), ('Characters/Dialogue/Jodi', 'Fri'),
    ('Characters/Dialogue/Jodi', 'Mon2'),
    ('Characters/Dialogue/Demetrius', 'summer_Fri'),
    ('Characters/Dialogue/Harvey', 'Tue8'),
    ('Characters/Dialogue/Harvey', 'Thu8'),
    ('Characters/Dialogue/Pam', 'Wed'),
    ('Characters/Dialogue/Shane', 'Wed4'),
    ('Characters/Dialogue/Shane', 'Fri4'),
    ('Characters/Dialogue/Shane', 'Sat4'),
    *{('Characters/Dialogue/Pierre', key) for key in
      ['Wed', 'Wed6', 'summer_Wed', 'summer_Wed2', 'winter_Wed']},
}
DIALOGUE_LEADING_CONDITIONAL_PIPE = {
    ('Characters/Dialogue/Alex', 'Wed_01_old'),
    ('Characters/Dialogue/Haley', 'summer_Sat_old'),
    ('Characters/Dialogue/Penny', 'Mon_old'),
    ('Characters/Dialogue/Sam', 'Wed_old'),
    *{('Characters/Dialogue/Sebastian', key) for key in ['Fri_old', 'fall_Fri_old']},
}
DIALOGUE_EXACT_FIRST_COMMAND = {
    ('Characters/Dialogue/Jodi', 'Sun'),
    ('Characters/Dialogue/MarriageDialogueMaru', 'spouseRoom_Maru'),
    ('Characters/Dialogue/MarriageDialogueAbigail', 'spouseRoom_Abigail'),
    ('Characters/Dialogue/MarriageDialogueKrobus', 'spouseRoom_Krobus'),
    *{('Characters/Dialogue/Sebastian', key) for key in [
      'AcceptGift_(O)227', 'AcceptGift_(O)305', 'Thu',
      'summer_Mountain_58_35']},
    *{('Characters/Dialogue/MarriageDialogue', key) for key in [
      'Indoor_Night_Sebastian', 'Indoor_Night_Elliott', 'Indoor_Night_Sam',
      'jobReturn_Harvey', 'jobReturn_Penny', 'jobReturn_Maru',
      'spouseRoom_Maru', 'spouseRoom_Abigail', 'spouseRoom_Haley',
      'spouseRoom_Leah', 'spouseRoom_Penny', 'spouseRoom_Sebastian',
      'spouseRoom_Harvey', 'spouseRoom_Elliott', 'spouseRoom_Alex',
      'spouseRoom_Sam', 'spouseRoom_Shane']},
}
DIALOGUE_Y_QUESTIONS = {
    ('Characters/Dialogue/Jas', 'cropMatured_595'),
    ('Characters/Dialogue/Demetrius', 'eventSeen_65_memory_oneweek'),
    ('Characters/Dialogue/Penny', 'eventSeen_35_memory_oneweek'),
}
DIALOGUE_Y_VISIBLE_CHOICES = {
    ('Characters/Dialogue/Caroline', 'houseUpgrade_1'),
    ('Strings/Characters', 'Phone_Ring_Lewis'),
}


def markers(text):
    gender_choices = re.findall(r'\$\{[^{}^]+\^[^{}^]+\}\$', text)
    percent_tokens = (
        'adj|noun|place|spouse|name|firstnameletter|time|band|book|pet|favorite|'
        'fork|year|kid1|kid2|revealtaste|season|farm|noturn'
    )
    expressions = [r'\{\{[^}]+\}\}', r'(?<!\$)\{[A-Za-z0-9_]+(?::[^{}]+)?\}',
                   rf'%(?:{percent_tokens})(?![A-Za-z0-9_])', r'\$[A-Za-z0-9]+',
                   r'\[(?:#|image|textcolor|letterbg|LocalizedText|FarmerStat|HOURS|MINUTES|DAY_OF|\d)[^\]]*\]',
                   r'https?://[^\s)]+']
    return ([[len(gender_choices)]] + [sorted(re.findall(pattern, text)) for pattern in expressions]
            + [text.count(char) for char in '@#^|_\\\n<>$*¾`%~'])


def dialogue_controls(value):
    controls = re.findall(r'\$(?:[A-Za-z]+|\d+)|#|\^', value)
    commands = [part for part in value.split('#') if re.match(r'^\$(?:q|r)\s', part)]
    return controls, commands


def event_parts(value, fragment=False):
    """Separate only known speak/message text; preserve every command byte."""
    # Summit snippets start inside an already-open speak string at runtime.
    normalized = 'speak __fragment__ "' + value if fragment else value
    skeleton, fields, cursor = [], [], 0
    for match in re.finditer(r'"([^"\\]*(?:\\.[^"\\]*)*)"', normalized):
        prefix = normalized[cursor:match.start()]
        if re.search(r'(?:^|/|\\|\(break\))(?:speak [A-Za-z0-9_]+|splitSpeak [A-Za-z0-9_]+|textAboveHead [A-Za-z0-9_]+|message|spriteText \d+|question [A-Za-z0-9_]+|end (?:dialogue|dialogueWarpOut) [A-Za-z0-9_]+) $', prefix):
            skeleton.extend([prefix, '"<reviewed-dialogue>"'])
            fields.append(match.group(1))
        else:
            assert re.search(r'(?:^|/)addTemporaryActor $', prefix), 'Unknown quoted event argument'
            skeleton.extend([prefix, match.group(0)])
        cursor = match.end()
    skeleton.append(normalized[cursor:])
    commands = ''.join(skeleton)
    assert commands.count('"') % 2 == 0, 'Unbalanced event quotes'
    return commands, fields


def event_questions(value):
    """Mask quick-question labels while returning their visible choices in order."""
    choices = []

    def replace(match):
        fields = match.group(2).split('#')
        assert len(fields) >= 2, 'Unknown quick-question structure'
        if fields[0] == '':
            visible = fields[1:]
            shape = 'choices-only'
        else:
            visible = fields
            shape = 'prompt-and-choices'
        assert all(field.strip() for field in visible), 'Empty quick-question text'
        choices.extend(visible)
        return match.group(1) + f'<reviewed-question:{shape}>'

    masked = re.sub(r'(/quickQuestion )(.+?)(?=\(break\))', replace, value)
    return masked, choices


def event_visible_text(value, fragment=False):
    masked, choices = event_questions(value)
    return event_parts(masked, fragment)[1] + choices


def festival_event_record(value):
    return bool(re.search(r'(?:^|/)(?:speak [A-Za-z0-9_{}]+|splitSpeak [A-Za-z0-9_{}]+|textAboveHead [A-Za-z0-9_{}]+|message|spriteText \d+|question [A-Za-z0-9_{}]+|end (?:dialogue|dialogueWarpOut) [A-Za-z0-9_{}]+) "', value))


def validate_grammar(target, source, translated, key=None):
    """Check the documented grammar of each supported original asset."""
    assert target in SUPPORTED_TARGETS, 'Target grammar is not implemented'
    assert markers(source) == markers(translated), 'Marker mismatch'
    if target == 'Strings/Locations' and key in LOCATION_EVENT_KEYS:
        original_event, translated_event = source, translated
        if key == 'IslandSecret_Event_BirdieFinished':
            question_pattern = re.compile(r'(/quickQuestion )(.+?)(\(break\))')
            original_question = question_pattern.search(original_event)
            translated_question = question_pattern.search(translated_event)
            assert original_question and translated_question, 'Birdie quick-question structure changed'
            original_choices = original_question.group(2).split('#')
            translated_choices = translated_question.group(2).split('#')
            assert len(original_choices) == len(translated_choices) and len(original_choices) == 3, 'Birdie quick-question choice count changed'
            assert translated_choices[0] == original_choices[0] == '', 'Birdie quick-question prefix changed'
            assert all(choice.strip() for choice in translated_choices[1:]), 'Empty Birdie quick-question choice'
            original_event = question_pattern.sub(r'\1<reviewed-question>\3', original_event, count=1)
            translated_event = question_pattern.sub(r'\1<reviewed-question>\3', translated_event, count=1)
        original_commands, original_fields = event_parts(original_event)
        translated_commands, translated_fields = event_parts(translated_event)
        assert original_commands == translated_commands, 'Embedded location-event commands changed'
        assert len(original_fields) == len(translated_fields), 'Embedded location-event dialogue count changed'
        for index, (left, right) in enumerate(zip(original_fields, translated_fields)):
            assert right.strip(), f'Empty embedded location-event dialogue {index}'
            assert markers(left) == markers(right), f'Embedded location-event markers changed: {index}'
            assert dialogue_controls(left) == dialogue_controls(right), f'Embedded location-event controls changed: {index}'
    elif target == 'Strings/Locations' and key.startswith('ScienceHouse_Renovation_'):
        original_fields, translated_fields = source.split('/'), translated.split('/')
        assert len(original_fields) == len(translated_fields) == 3, 'Location renovation field count changed'
        assert all(field.strip() for field in translated_fields), 'Empty location renovation field'
        for index, (left, right) in enumerate(zip(original_fields, translated_fields)):
            assert markers(left) == markers(right), f'Location renovation markers changed: {index}'
    elif target == 'Strings/Locations' and key.startswith('Gourmand_'):
        original_fields, translated_fields = source.split('|'), translated.split('|')
        assert len(original_fields) == len(translated_fields), 'Gourmand dialogue field count changed'
        assert all(field.strip() for field in translated_fields), 'Empty Gourmand dialogue field'
        for index, (left, right) in enumerate(zip(original_fields, translated_fields)):
            assert markers(left) == markers(right), f'Gourmand dialogue markers changed: {index}'
            assert dialogue_controls(left) == dialogue_controls(right), f'Gourmand dialogue controls changed: {index}'
    elif target == 'Strings/Lexicon':
        # Lexicon selects a single alternative with Split('#') and random.Choose.
        original_choices, translated_choices = source.split('#'), translated.split('#')
        assert len(original_choices) == len(translated_choices), 'Lexicon alternative count changed'
        assert all(choice.strip() for choice in translated_choices), 'Empty Lexicon alternative'
    elif target in ALTERNATIVE_DIALOGUE_TARGETS:
        if (target, key) in DIALOGUE_EXACT_FIRST_COMMAND:
            original_commands = [part for part in source.split('#') if part.startswith('$')]
            translated_commands = [part for part in translated.split('#') if part.startswith('$')]
            assert original_commands[:1] == translated_commands[:1], 'Dialogue conditional command changed'
        if (target, key) in DIALOGUE_LEADING_CONDITIONAL_PIPE:
            original_prefix, original_body = source.rsplit('#', 1)
            translated_prefix, translated_body = translated.rsplit('#', 1)
            assert original_prefix == translated_prefix, 'Dialogue conditional command changed'
            original_choices, translated_choices = original_body.split('|'), translated_body.split('|')
        elif (target, key) in DIALOGUE_QUERY_PIPE:
            original_prefix, original_body = source.split('#', 1)
            translated_prefix, translated_body = translated.split('#', 1)
            assert original_prefix == translated_prefix, 'Dialogue query condition changed'
            original_choices, translated_choices = original_body.split('|'), translated_body.split('|')
        elif (target, key) in DIALOGUE_Y_QUESTIONS | DIALOGUE_Y_VISIBLE_CHOICES:
            question_pattern = re.compile(r"^(.*?)(\$y )'(.*)'(.*)$", re.DOTALL)
            original_match, translated_match = question_pattern.match(source), question_pattern.match(translated)
            assert original_match and translated_match, 'Dialogue question wrapper changed'
            assert original_match.group(2) == translated_match.group(2), 'Dialogue question command changed'
            assert markers(original_match.group(1)) == markers(translated_match.group(1)), 'Dialogue question prefix markers changed'
            assert dialogue_controls(original_match.group(1)) == dialogue_controls(translated_match.group(1)), 'Dialogue question prefix controls changed'
            original_choices, translated_choices = original_match.group(3).split('_'), translated_match.group(3).split('_')
            assert markers(original_match.group(4)) == markers(translated_match.group(4)), 'Dialogue question suffix markers changed'
            assert dialogue_controls(original_match.group(4)) == dialogue_controls(translated_match.group(4)), 'Dialogue question suffix controls changed'
            if (target, key) in DIALOGUE_Y_QUESTIONS:
                assert original_choices[1::2] == translated_choices[1::2], 'Dialogue response IDs changed'
        else:
            if (target, key) in DIALOGUE_SLASH_ALTERNATIVES:
                separator = '/'
            elif (target, key) in DIALOGUE_CARET_ALTERNATIVES:
                separator = '^'
            else:
                separator = '||'
            original_choices, translated_choices = source.split(separator), translated.split(separator)
        assert len(original_choices) == len(translated_choices), 'Dialogue alternative count changed'
        assert all(choice.strip() for choice in translated_choices), 'Empty dialogue alternative'
        for index, (left, right) in enumerate(zip(original_choices, translated_choices)):
            assert markers(left) == markers(right), f'Dialogue alternative markers changed: {index}'
            assert dialogue_controls(left) == dialogue_controls(right), f'Dialogue alternative controls changed: {index}'
    elif target in SLASH_EQUIPMENT_TARGETS:
        original_fields, translated_fields = source.split('/'), translated.split('/')
        assert len(original_fields) == len(translated_fields) == 7, 'Equipment field count changed'
        assert translated_fields[2:6] == original_fields[2:6], 'Equipment price/stat/index fields changed'
        assert translated_fields[0] == translated_fields[6], 'Equipment internal/display names differ'
        assert translated_fields[0].strip() and translated_fields[1].strip(), 'Empty equipment name/description'
        assert markers(original_fields[0]) == markers(translated_fields[0]), 'Equipment name markers changed'
        assert markers(original_fields[1]) == markers(translated_fields[1]), 'Equipment description markers changed'
    elif target in SLASH_RECIPE_TARGETS:
        original_fields, translated_fields = source.split('/'), translated.split('/')
        assert len(original_fields) == len(translated_fields) == 2, 'Recipe field count changed'
        assert all(field.strip() for field in translated_fields), 'Empty recipe name or description'
        for index, (left, right) in enumerate(zip(original_fields, translated_fields)):
            assert markers(left) == markers(right), f'Recipe field markers changed: {index}'
            assert dialogue_controls(left) == dialogue_controls(right), f'Recipe dialogue controls changed: {index}'
    elif target in SLASH_FIRST_FIELD_TARGETS:
        original_fields, translated_fields = source.split('/'), translated.split('/')
        assert len(original_fields) == len(translated_fields), 'Slash field count changed'
        assert translated_fields[1:] == original_fields[1:], 'Technical slash fields changed'
        assert translated_fields[0].strip(), 'Empty visible first field'
        assert markers(original_fields[0]) == markers(translated_fields[0]), 'Visible first-field markers changed'
    elif target in SLASH_BUNDLE_TARGETS:
        original_fields, translated_fields = source.split('/'), translated.split('/')
        assert len(original_fields) == len(translated_fields) == 7, 'Bundle field count changed'
        assert translated_fields[1:6] == original_fields[1:6], 'Bundle reward, ingredients, color or flags changed'
        assert translated_fields[0] == translated_fields[6], 'Bundle internal/display names differ'
        assert translated_fields[0].strip(), 'Empty bundle name'
        assert markers(original_fields[0]) == markers(translated_fields[0]), 'Bundle name markers changed'
    elif target in SLASH_MONSTER_TARGETS:
        original_fields, translated_fields = source.split('/'), translated.split('/')
        assert len(original_fields) == len(translated_fields) == 15, 'Monster field count changed'
        assert translated_fields[:14] == original_fields[:14], 'Monster stats, drops or behavior fields changed'
        assert translated_fields[14].strip(), 'Empty monster display name'
        assert markers(original_fields[14]) == markers(translated_fields[14]), 'Monster display-name markers changed'
    elif target in SLASH_HAT_TARGETS:
        original_fields, translated_fields = source.split('/'), translated.split('/')
        assert len(original_fields) == len(translated_fields) and len(original_fields) in {6, 7}, 'Hat field count changed'
        assert translated_fields[2:5] == original_fields[2:5], 'Hat hair, ignore-offset or metadata fields changed'
        assert translated_fields[0] == translated_fields[5], 'Hat internal/display names differ'
        if len(original_fields) == 7:
            assert translated_fields[6] == original_fields[6], 'Hat numeric ID changed'
        assert translated_fields[0].strip() and translated_fields[1].strip(), 'Empty hat name or description'
        assert markers(original_fields[0]) == markers(translated_fields[0]), 'Hat name markers changed'
        assert markers(original_fields[1]) == markers(translated_fields[1]), 'Hat description markers changed'
    elif target in GIFT_TASTE_TARGETS:
        if key.startswith('Universal_'):
            assert translated == source, 'Universal gift category IDs must remain byte-identical'
        else:
            original_fields, translated_fields = source.split('/'), translated.split('/')
            assert len(original_fields) == len(translated_fields) == 11, 'Gift-taste field count changed'
            assert translated_fields[1::2] == original_fields[1::2], 'Gift-taste item ID fields changed'
            assert translated_fields[10] == original_fields[10] == '', 'Gift-taste trailing field changed'
            for index in range(0, 10, 2):
                assert translated_fields[index].strip(), f'Empty gift dialogue field {index}'
                assert markers(original_fields[index]) == markers(translated_fields[index]), f'Gift dialogue markers changed: {index}'
                assert dialogue_controls(original_fields[index]) == dialogue_controls(translated_fields[index]), f'Gift dialogue controls changed: {index}'
    elif target in MAIL_TARGETS:
        item_pattern = re.compile(r'%item [^%]*%%')
        assert item_pattern.findall(source) == item_pattern.findall(translated), 'Mail attachment directive changed'
        assert source.count('%secretsanta') == translated.count('%secretsanta'), 'Mail secret-Santa token changed'
        assert source.count('[#]') == translated.count('[#]'), 'Mail subject separator changed'
        assert source.count('+') == translated.count('+'), 'Mail emote marker changed'
        translated_parts = translated.split('[#]')
        assert translated_parts[0].strip(), 'Empty mail body'
        if len(translated_parts) == 2:
            assert translated_parts[1].strip(), 'Empty mail subject'
        else:
            assert len(translated_parts) == 1, 'Multiple mail subject separators'
    elif target in SECRET_NOTE_TARGETS:
        reveal_pattern = re.compile(r'%revealtaste:[^%^]+:\d+')
        assert reveal_pattern.findall(source) == reveal_pattern.findall(translated), 'Secret-note reveal commands changed'
        image_pattern = re.compile(r'!image \d+')
        assert image_pattern.findall(source) == image_pattern.findall(translated), 'Secret-note image directive changed'
        assert source.count('^') == translated.count('^'), 'Secret-note page/line separators changed'
        assert source.count('@') == translated.count('@'), 'Secret-note player placeholder changed'
    elif target in QUEST_TARGETS:
        original_fields, translated_fields = source.split('/'), translated.split('/')
        assert len(original_fields) == len(translated_fields) and len(original_fields) in {9, 10}, 'Quest field count changed'
        assert translated_fields[0] == original_fields[0], 'Quest type changed'
        assert translated_fields[4:9] == original_fields[4:9], 'Quest target, conditions, reward, or flags changed'
        for index in (1, 2, 3):
            assert translated_fields[index].strip(), f'Empty quest text field {index}'
            assert markers(original_fields[index]) == markers(translated_fields[index]), f'Quest text markers changed: {index}'
        if len(original_fields) == 10:
            assert translated_fields[9].strip(), 'Empty quest completion dialogue'
            assert markers(original_fields[9]) == markers(translated_fields[9]), 'Quest completion markers changed'
            assert dialogue_controls(original_fields[9]) == dialogue_controls(translated_fields[9]), 'Quest completion dialogue controls changed'
    elif target in CARET_ACHIEVEMENT_TARGETS:
        original_fields, translated_fields = source.split('^'), translated.split('^')
        assert len(original_fields) == len(translated_fields) == 5, 'Achievement field count changed'
        assert translated_fields[2:] == original_fields[2:], 'Achievement flags, prerequisite or icon changed'
        assert all(field.strip() for field in translated_fields[:2]), 'Empty achievement title or description'
        for index in range(2):
            assert markers(original_fields[index]) == markers(translated_fields[index]), f'Achievement markers changed: {index}'
    elif target in TECHNICAL_IDENTITY_TARGETS:
        assert translated == source, 'Technical record must remain byte-identical'
    elif target in EVENT_TARGETS or (target in FESTIVAL_TARGETS and festival_event_record(source)):
        original_masked, original_questions = event_questions(source)
        translated_masked, translated_questions = event_questions(translated)
        assert len(original_questions) == len(translated_questions), 'Event quick-question choice count changed'
        for index, (left, right) in enumerate(zip(original_questions, translated_questions)):
            assert right.strip(), f'Empty event quick-question choice {index}'
            assert markers(left) == markers(right), f'Event quick-question markers changed: {index}'
            assert dialogue_controls(left) == dialogue_controls(right), f'Event quick-question controls changed: {index}'
        original_commands, original_fields = event_parts(original_masked)
        translated_commands, translated_fields = event_parts(translated_masked)
        assert original_commands == translated_commands, 'Event command, argument or quote structure changed'
        assert len(original_fields) == len(translated_fields), 'Event dialogue count changed'
        for index, (left, right) in enumerate(zip(original_fields, translated_fields)):
            assert right.strip(), f'Empty event dialogue {index}'
            assert markers(left) == markers(right), f'Event dialogue markers changed: {index}'
            assert dialogue_controls(left) == dialogue_controls(right), f'Event dialogue controls changed: {index}'
    elif target in FESTIVAL_TARGETS:
        if key in FESTIVAL_TECHNICAL_KEYS:
            assert translated == source, 'Festival technical record must remain byte-identical'
        else:
            assert translated.strip(), 'Empty festival text'
            assert dialogue_controls(source) == dialogue_controls(translated), 'Festival dialogue controls changed'
    elif target in MIXED_DIALOGUE_TARGETS:
        if key == 'ForestPylonEvent':
            original_commands, original_fields = event_parts(source)
            translated_commands, translated_fields = event_parts(translated)
            assert original_commands == translated_commands, 'Event command, argument or quote structure changed'
            assert len(original_fields) == len(translated_fields), 'Event dialogue count changed'
            for index, (left, right) in enumerate(zip(original_fields, translated_fields)):
                assert right.strip(), f'Empty event dialogue {index}'
                assert markers(left) == markers(right), f'Event dialogue markers changed: {index}'
                assert dialogue_controls(left) == dialogue_controls(right), f'Event dialogue control order changed: {index}'
        elif key == 'StarterChicken_Names':
            original_pairs, translated_pairs = source.split(' | '), translated.split(' | ')
            assert len(original_pairs) == len(translated_pairs), 'Starter chicken pair count changed'
            for index, (left, right) in enumerate(zip(original_pairs, translated_pairs)):
                original_names, translated_names = left.split(','), right.split(',')
                assert len(original_names) == len(translated_names) == 2, f'Starter chicken pair shape changed: {index}'
                assert all(name.strip() for name in translated_names), f'Empty starter chicken name: {index}'
                assert markers(left) == markers(right), f'Starter chicken markers changed: {index}'
        elif key.startswith('Scholar_') and key.endswith(('_Options', '_Answers')):
            original_fields, translated_fields = source.split(','), translated.split(',')
            assert len(original_fields) == len(translated_fields), 'Scholar option/answer count changed'
            assert all(field.strip() for field in translated_fields), 'Empty Scholar option/answer'
            for index, (left, right) in enumerate(zip(original_fields, translated_fields)):
                assert markers(left) == markers(right), f'Scholar field markers changed: {index}'
        elif key.startswith('Renovation_'):
            original_fields, translated_fields = source.split('/'), translated.split('/')
            assert len(original_fields) == len(translated_fields) == 3, 'Renovation field count changed'
            for index, (left, right) in enumerate(zip(original_fields, translated_fields)):
                assert right.strip(), f'Empty renovation field {index}'
                assert markers(left) == markers(right), f'Renovation markers changed: {index}'
        else:
            assert dialogue_controls(source) == dialogue_controls(translated), 'Dialogue control order changed'
    elif target == 'Data/ExtraDialogue':
        if '/' in source or '/' in translated:
            assert key in EXTRA_DIALOGUE_EVENTS, 'Embedded event grammar is not implemented for this key'
            original_commands, original_fields = event_parts(source, EXTRA_DIALOGUE_EVENTS[key])
            translated_commands, translated_fields = event_parts(translated, EXTRA_DIALOGUE_EVENTS[key])
            assert original_commands == translated_commands, 'Event command, argument or quote structure changed'
            assert len(original_fields) == len(translated_fields), 'Event dialogue count changed'
            for index, (left, right) in enumerate(zip(original_fields, translated_fields)):
                assert right.strip(), f'Empty event dialogue {index}'
                assert markers(left) == markers(right), f'Event dialogue markers changed: {index}'
                assert dialogue_controls(left) == dialogue_controls(right), f'Event dialogue control order changed: {index}'
        else:
            assert dialogue_controls(source) == dialogue_controls(translated), 'Dialogue control order or question/response ID changed'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('batch', type=Path)
    parser.add_argument('--check-only', action='store_true')
    args = parser.parse_args()
    batch = read(args.batch)
    assert batch['locale'] == 'ro' and batch['reviewChecks'] == CHECKS
    assert batch.get('reviewNotes', '').strip()
    state = read(DOC / 'checkpoint.json')
    assert state['glossaryCleanFullAudits'] >= 2, 'Glossary must pass its editorial gate'
    glossary_file = ROOT / 'Documentation/glossary/glossary.ro.json'
    glossary_hash = digest(glossary_file.read_text())
    assert glossary_hash == state['glossarySnapshotSha256'] == batch['glossarySha256']
    target = batch['target']
    # More complex targets need their own field/event grammar before using this writer.
    assert target in SUPPORTED_TARGETS, 'Target grammar is not implemented'
    source = read(Path(state['sourceRoot']) / (target + '.json'))['content']
    if target == 'Strings/credits':
        assert isinstance(source, list), 'Credits source must be an indexed list'
        source = {str(index): value for index, value in enumerate(source)}
    destination = progress.PAYLOAD / 'assets/translations/romanian' / (target + '.json')
    existing = read(destination) if destination.exists() else {'Changes': [{
        'Action': 'EditData', 'Target': target, 'When': {'Language': 'ro-vnrevival'}, 'Entries': {}}]}
    assert len(existing['Changes']) == 1 and existing['Changes'][0]['Target'] == target
    entries = existing['Changes'][0]['Entries']
    reviews = read(DOC / 'reviewed-records.json')
    assert 0 < len(batch['entries']) <= 80
    for key, row in batch['entries'].items():
        assert key in source and source[key] == row['source'], f'Source mismatch: {key}'
        translated = row['translation']
        assert isinstance(translated, str) and (translated.strip() or not source[key].strip()), key
        assert '\ufffd' not in translated, key
        try:
            validate_grammar(target, source[key], translated, key)
        except AssertionError as error:
            raise AssertionError(f'{key}: {error}') from error
        if source[key] == translated:
            assert row.get('preservationReason', '').strip(), f'Identity needs explanation: {key}'
        if (target in EVENT_TARGETS
                or (target in FESTIVAL_TARGETS and festival_event_record(source[key]))
                or (target == 'Data/ExtraDialogue' and key in EXTRA_DIALOGUE_EVENTS)
                or (target in MIXED_DIALOGUE_TARGETS and key == 'ForestPylonEvent')):
            event_review = row.get('eventReview', {})
            assert event_review.get('commands') == 'exactly-preserved', f'Event command review missing: {key}'
            fragment = EXTRA_DIALOGUE_EVENTS[key] if target == 'Data/ExtraDialogue' else False
            assert event_review.get('visibleTextSegments') == len(event_visible_text(source[key], fragment)), f'Incomplete event text review: {key}'
        if key in entries and entries[key] != translated:
            assert row.get('previousTranslation') == entries[key], f'Unacknowledged overwrite: {key}'
        entries[key] = translated
        record_id = target + '\u0000' + key
        reviews[record_id] = {
            'sourceSha256': digest(source[key]), 'translationSha256': digest(translated),
            'glossarySha256': glossary_hash, 'batch': args.batch.name, 'checks': CHECKS,
            **({'preservationReason': row['preservationReason']} if 'preservationReason' in row else {}),
            **({'eventReview': row['eventReview']} if 'eventReview' in row else {}),
        }
    if not args.check_only:
        # Keep English order even when a later batch handles a deferred contextual record.
        existing['Changes'][0]['Entries'] = {k: entries[k] for k in source if k in entries}
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(json.dumps(existing, ensure_ascii=False, indent=2) + '\n')
        (DOC / 'reviewed-records.json').write_text(json.dumps(reviews, ensure_ascii=False, indent=2) + '\n')
        state['reviewedRecords'] = len(reviews)
        state['percent'] = round(100 * len(reviews) / state['sourceRecords'], 3)
        state['lastBatch'] = args.batch.name
        state['nextAction'] = 'Continue the next unfinished English asset with its explicit runtime grammar, then perform its full section audit. Consult checkpoint glossaryCanonicalParity before the final release gate.'
        (DOC / 'checkpoint.json').write_text(json.dumps(state, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'batch': args.batch.name, 'records': len(batch['entries']), 'checkOnly': args.check_only}))


if __name__ == '__main__':
    main()

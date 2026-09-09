#!/usr/bin/env python3
"""Validate and save a directly translated, editorially reviewed Serbian batch."""
import hashlib
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATE = ROOT / 'Documentation/serbian'
PATCHES = ROOT / 'Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/serbian'


def read(file):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f'Duplicate JSON key: {key} in {file}')
            result[key] = value
        return result
    return json.loads(file.read_text(), object_pairs_hook=unique)


def sha(value):
    return hashlib.sha256(value.encode()).hexdigest()


def encode(value):
    return json.dumps(value, ensure_ascii=False, indent=2) + '\n'


def signature(value):
    patterns = [r'\{\{[^}]+\}\}', r'\{[A-Za-z0-9_:]+\}',
                r'\[(?:#|image|textcolor|letterbg|LocalizedText|FarmerStat|HOURS|MINUTES|DAY_OF|\d)[^\]]*\]',
                r'%[a-z][A-Za-z0-9_]*', r'\$[A-Za-z0-9]+', r'\([A-Z]+\)[A-Za-z0-9_]+']
    return ([sorted(re.findall(p, value)) for p in patterns]
            + [{c: value.count(c) for c in '@#^|_\\\n+%$<>[]*¾'}]
            + [value.endswith(' ')])


EVENT_COMMAND = re.compile(r'(?:^|/)(?:speak|splitSpeak|message|question|quickQuestion|textAboveHead|spriteText|end dialogue(?:WarpOut)?|addTemporaryActor|viewport|pause|warp) ')
EVENT_TEXT = re.compile(r'(?P<prefix>(?:^|/|\(break\)|\\)(?:speak\s+\S+|splitSpeak\s+\S+|message|textAboveHead\s+\S+|spriteText\s+\S+|end\s+dialogue(?:WarpOut)?\s+\S+|question\s+\S+)\s+")(?P<text>(?:[^"\\]|\\.)*)(?P<close>")')
EVENT_QUICK_QUESTION = re.compile(r'(?P<prefix>(?:^|/)quickQuestion )(?P<text>[^/]*?)(?=\(break\))')
DIALOGUE_CONTROL = re.compile(r'^\$(?:q|r|p|query|c|d|y|1)(?:\s|$)')
DIALOGUE_RUNTIME_PERCENT = re.compile(r'%[a-z][A-Za-z0-9_]*(?::[A-Za-z0-9_]+)*')


def visible_text(source, translated):
    """Allow quoted speech and delimited quick-question choices, preserving commands."""
    if source.startswith('$q '):
        original_fields = source.split('#')
        translated_fields = translated.split('#')
        assert len(original_fields) == len(translated_fields), 'Dialogue question field count changed'
        assert len(original_fields) >= 4 and len(original_fields) % 2 == 0, 'Unsupported dialogue question layout'
        assert translated_fields[0] == original_fields[0], 'Dialogue question header changed'
        for index in range(2, len(original_fields), 2):
            assert original_fields[index].startswith('$r '), 'Unsupported dialogue response header'
            assert translated_fields[index] == original_fields[index], 'Dialogue response ID or command changed'
        for index in range(1, len(original_fields), 2):
            if original_fields[index].strip():
                assert translated_fields[index].strip(), 'Empty dialogue prompt or choice'
            else:
                assert translated_fields[index] == original_fields[index], 'Intentional blank dialogue prompt changed'
            assert signature(original_fields[index]) == signature(translated_fields[index]), 'Dialogue choice tokens changed'
        return '\n'.join(translated_fields[1::2])
    if not EVENT_COMMAND.search(source):
        return translated
    original_parts = list(EVENT_TEXT.finditer(source))
    translated_parts = list(EVENT_TEXT.finditer(translated))
    original_questions = list(EVENT_QUICK_QUESTION.finditer(source))
    translated_questions = list(EVENT_QUICK_QUESTION.finditer(translated))
    assert (original_parts or original_questions), 'Unsupported event text schema'
    assert len(original_parts) == len(translated_parts), 'Event speech field count changed'
    assert len(original_questions) == len(translated_questions), 'Quick-question schema changed'
    def skeleton(value):
        value = EVENT_TEXT.sub(lambda m: m['prefix'] + '<TEXT>' + m['close'], value)
        return EVENT_QUICK_QUESTION.sub(lambda m: m['prefix'] + '<CHOICES>', value)
    assert skeleton(source) == skeleton(translated), 'Event command, ID, order, or non-speech data changed'
    rendered_parts = []
    for original, result in zip(original_parts, translated_parts):
        assert signature(original['text']) == signature(result['text']), 'Event speech token mismatch'
        if original['text'].startswith('#$q '):
            assert result['text'].startswith('#$q '), 'Leading nested dialogue question marker changed'
            rendered_parts.append(visible_text(original['text'][1:], result['text'][1:]))
        elif original['text'].startswith('$q '):
            rendered_parts.append(visible_text(original['text'], result['text']))
        elif original['text'].startswith("$y '"):
            rendered_parts.append(validate_dialogue(original['text'], result['text']))
        else:
            rendered_parts.append(result['text'])
        if original['prefix'].lstrip('/\\').startswith('splitSpeak '):
            assert len(original['text'].split('~')) == len(result['text'].split('~')), 'Split-speech branch count changed'
            assert all(part.strip() for part in result['text'].split('~')), 'Empty split-speech branch'
        if original['prefix'].lstrip('/\\').startswith('question '):
            original_choices = original['text'].split('#')
            result_choices = result['text'].split('#')
            assert len(original_choices) == len(result_choices), 'Event question choice count changed'
            for original_choice, result_choice in zip(original_choices, result_choices):
                if original_choice.strip():
                    assert result_choice.strip(), 'Empty event question choice'
                else:
                    assert result_choice == original_choice, 'Intentional blank event question prompt changed'
    for original, result in zip(original_questions, translated_questions):
        original_choices = original['text'].split('#')
        result_choices = result['text'].split('#')
        assert len(original_choices) == len(result_choices), 'Event choice count changed'
        for original_choice, result_choice in zip(original_choices, result_choices):
            if original_choice.strip():
                assert result_choice.strip(), 'Empty event prompt or choice'
            else:
                assert result_choice == original_choice, 'Intentional empty event prompt changed'
            assert signature(original_choice) == signature(result_choice), 'Event choice token mismatch'
    return '\n'.join(rendered_parts + [m['text'] for m in translated_questions])


def validate_dialogue(source, translated):
    """Preserve dialogue commands, response IDs, and branch-local tokens."""
    if source.startswith("$y '"):
        assert translated.startswith("$y '"), 'Dialogue $y question wrapper changed'
        source_close = source.rfind("'")
        translated_close = translated.rfind("'")
        assert source_close >= 4 and translated_close >= 4, 'Unsupported dialogue $y question wrapper'
        source_fields = source[4:source_close].split('_')
        translated_fields = translated[4:translated_close].split('_')
        assert len(source_fields) == len(translated_fields), 'Dialogue $y field count changed'
        for original, result in zip(source_fields, translated_fields):
            assert result.strip(), 'Empty dialogue $y field'
            assert signature(original) == signature(result), 'Dialogue $y field tokens changed'
        source_suffix = source[source_close + 1:]
        translated_suffix = translated[translated_close + 1:]
        if source_suffix or translated_suffix:
            assert source_suffix and translated_suffix, 'Dialogue $y suffix changed'
            return '\n'.join(translated_fields) + '\n' + validate_dialogue(source_suffix, translated_suffix)
        return '\n'.join(translated_fields)
    source_parts = source.split('#')
    translated_parts = translated.split('#')
    assert len(source_parts) == len(translated_parts), 'Dialogue field count changed'
    visible = []
    for original, result in zip(source_parts, translated_parts):
        if DIALOGUE_CONTROL.match(original) or re.fullmatch(r'\$[A-Za-z0-9]+', original):
            assert result == original, f'Dialogue command changed: {original}'
            continue
        assert not DIALOGUE_CONTROL.match(result), 'Dialogue command moved into visible text'
        assert DIALOGUE_RUNTIME_PERCENT.findall(original) == DIALOGUE_RUNTIME_PERCENT.findall(result), 'Dialogue percent token changed'
        assert signature(original) == signature(result), 'Dialogue field tokens changed'
        original_variants = original.split('/')
        result_variants = result.split('/')
        assert len(original_variants) == len(result_variants), 'Dialogue random-variant count changed'
        for original_variant, result_variant in zip(original_variants, result_variants):
            if original_variant:
                assert result_variant.strip(), 'Empty dialogue random variant'
            else:
                assert result_variant == '', 'Dialogue text moved into empty random variant'
            assert signature(original_variant) == signature(result_variant), 'Dialogue random-variant tokens changed'
        original_pipes = original.split('|')
        result_pipes = result.split('|')
        assert len(original_pipes) == len(result_pipes), 'Dialogue conditional branch count changed'
        for original_pipe, result_pipe in zip(original_pipes, result_pipes):
            # A caret preceded by '(' belongs to an emoticon such as (^_-), not a gender branch.
            original_branches = re.split(r'(?<!\()\^', original_pipe)
            result_branches = re.split(r'(?<!\()\^', result_pipe)
            assert len(original_branches) == len(result_branches), 'Dialogue gender branch count changed'
            for original_branch, result_branch in zip(original_branches, result_branches):
                if original_branch:
                    assert result_branch.strip(), 'Empty dialogue branch'
                else:
                    assert result_branch == '', 'Dialogue text moved into empty branch'
                assert signature(original_branch) == signature(result_branch), 'Dialogue branch tokens changed'
        visible.append(result)
    return '\n'.join(visible)


def validate_achievements(source, translated):
    """Translate the visible title/objective while preserving achievement metadata."""
    original_fields = source.split('^')
    translated_fields = translated.split('^')
    assert len(original_fields) == len(translated_fields) == 5, 'Achievement field count changed'
    assert all(field.strip() for field in translated_fields[:2]), 'Empty achievement title or objective'
    assert translated_fields[2:] == original_fields[2:], 'Achievement metadata changed'
    for original, result in zip(original_fields[:2], translated_fields[:2]):
        assert signature(original) == signature(result), 'Achievement visible-field tokens changed'
    return '\n'.join(translated_fields[:2])


def validate_aquarium_fish(source, translated):
    """Aquarium placement and animation records contain no player-facing text."""
    assert translated == source, 'Aquarium fish technical record changed'
    fields = source.split('/')
    assert 2 <= len(fields) <= 8, 'Unsupported aquarium fish field count'
    assert re.fullmatch(r'-?\d+', fields[0]), 'Invalid aquarium fish sprite index'
    assert fields[1] in {'float', 'fish', 'eel', 'cephalopod', 'static', 'ground',
                         'crawl', 'front_crawl'}, 'Invalid aquarium fish behavior'
    assert all(not field or re.fullmatch(r'\d+(?: \d+)*', field)
               for field in fields[2:]), 'Invalid aquarium fish animation metadata'
    return ''


def validate_boots(source, translated):
    """Translate both display-name copies and the description; preserve item stats."""
    original_fields = source.split('/')
    translated_fields = translated.split('/')
    assert len(original_fields) == len(translated_fields) == 7, 'Boot field count changed'
    assert translated_fields[2:6] == original_fields[2:6], 'Boot price, stats, or index changed'
    assert translated_fields[0] == translated_fields[6], 'Boot display-name copies differ'
    assert all(field.strip() for field in (translated_fields[0], translated_fields[1])), 'Empty boot name or description'
    for index in (0, 1, 6):
        assert signature(original_fields[index]) == signature(translated_fields[index]), 'Boot visible-field tokens changed'
    return '\n'.join((translated_fields[0], translated_fields[1]))


def validate_bundles(source, translated):
    """Translate the two bundle-name copies while preserving rewards and requirements."""
    original_fields = source.split('/')
    translated_fields = translated.split('/')
    assert len(original_fields) == len(translated_fields) == 7, 'Bundle field count changed'
    assert translated_fields[1:6] == original_fields[1:6], 'Bundle reward or requirement metadata changed'
    assert translated_fields[0] == translated_fields[6], 'Bundle display-name copies differ'
    assert translated_fields[0].strip(), 'Empty bundle name'
    assert signature(original_fields[0]) == signature(translated_fields[0]), 'Bundle name tokens changed'
    return translated_fields[0]


def validate_chair_tiles(source, translated):
    """Chair tile records are non-visible seat geometry and animation metadata."""
    assert translated == source, 'Chair tile technical record changed'
    fields = source.split('/')
    assert len(fields) == 7, 'Chair tile field count changed'
    assert all(re.fullmatch(r'\d+', field) for field in fields[:2]), 'Invalid chair tile size'
    assert fields[2] in {'up', 'down', 'left', 'right', 'opposite'}, 'Invalid chair direction'
    assert re.fullmatch(r'[a-z_]+(?: (?:short|tall))?', fields[3]), 'Invalid chair type'
    assert all(re.fullmatch(r'-?\d+', field) for field in fields[4:6]), 'Invalid chair animation offset'
    assert fields[6] in {'true', 'false'}, 'Invalid chair draw-order flag'
    return ''


def validate_cooking_recipe(source, translated):
    """Cooking recipe values are non-visible ingredients, output IDs, and unlock rules."""
    assert translated == source, 'Cooking recipe technical record changed'
    fields = source.split('/')
    assert len(fields) == 5, 'Cooking recipe field count changed'
    assert re.fullmatch(r'(?:-?\w+ \d+)(?: (?:-?\w+) \d+)*', fields[0]), 'Invalid cooking ingredients'
    assert re.fullmatch(r'\d+ \d+', fields[1]), 'Invalid cooking yield metadata'
    assert re.fullmatch(r'[A-Za-z0-9_-]+', fields[2]), 'Invalid cooking output ID'
    assert re.fullmatch(r'(?:default|null|[lfs](?: [A-Za-z]+)? \d+)', fields[3]), 'Invalid cooking unlock rule'
    assert fields[4] == '', 'Cooking reserved field changed'
    return ''


def validate_crafting_recipe(source, translated):
    """Crafting recipe values are non-visible ingredients, output IDs, and unlock rules."""
    assert translated == source, 'Crafting recipe technical record changed'
    fields = source.split('/')
    assert len(fields) == 6, 'Crafting recipe field count changed'
    ingredient_tokens = fields[0].split()
    assert len(ingredient_tokens) >= 2 and len(ingredient_tokens) % 2 == 0, 'Invalid crafting ingredients'
    assert all(re.fullmatch(r'(?:\(BC\))?-?[A-Za-z0-9_]+', ingredient_tokens[i])
               and re.fullmatch(r'\d+', ingredient_tokens[i + 1])
               for i in range(0, len(ingredient_tokens), 2)), 'Invalid crafting ingredient pair'
    assert fields[1] in {'Field', 'Home'}, 'Invalid crafting category'
    assert re.fullmatch(r'[A-Za-z0-9_-]+(?: \d+)?', fields[2]), 'Invalid crafting output metadata'
    assert fields[3] in {'true', 'false', 'Ring'}, 'Invalid crafting type flag'
    assert re.fullmatch(r'(?:default|null|[lfs](?: [A-Za-z]+)? \d+)', fields[4]), 'Invalid crafting unlock rule'
    assert (fields[5] == '' or
            re.fullmatch(r'\[LocalizedText Strings\\Objects:[A-Za-z0-9_]+\]', fields[5])), 'Invalid crafting display-name reference'
    return ''


def validate_engagement_dialogue(source, translated):
    """Engagement dialogue uses the same field and token grammar as NPC dialogue."""
    return validate_dialogue(source, translated)


def validate_extra_dialogue(source, translated):
    """Validate ordinary dialogue and the event-script fragments stored beside it."""
    if not EVENT_COMMAND.search(source):
        return validate_dialogue(source, translated)
    first_event_text = EVENT_TEXT.search(source)
    first_quote = source.find('"')
    if first_quote >= 0 and (first_event_text is None or first_quote < first_event_text.start()):
        # Summit spouse lines begin inside an already-open event speech field, then
        # close it before continuing with normal event commands. Supply the missing
        # opening command so the ordinary event validator can see that first line.
        return visible_text('speak Placeholder "' + source,
                            'speak Placeholder "' + translated)
    return visible_text(source, translated)


def validate_festival_date(source, translated):
    """Festival-date values are plain player-facing festival titles."""
    assert source.strip() and translated.strip(), 'Empty festival title'
    assert signature(source) == signature(translated), 'Festival title token mismatch'
    assert not re.search(r'[/#|^]', source + translated), 'Unsupported festival title structure'
    return translated


def validate_festival(key, source, translated):
    """Validate festival metadata, event scripts, and attendee dialogue."""
    if key == 'conditions' or key.startswith('shop') or key.startswith('secretSanta'):
        assert translated == source, 'Festival technical metadata changed'
        return ''
    if EVENT_COMMAND.search(source):
        if EVENT_TEXT.search(source) or EVENT_QUICK_QUESTION.search(source):
            return visible_text(source, translated)
        assert translated == source, 'Textless festival event script changed'
        return ''
    return validate_dialogue(source, translated)


def validate_fish(source, translated):
    """Translate the fish display name while preserving all catch metadata."""
    original_fields = source.split('/')
    translated_fields = translated.split('/')
    assert len(original_fields) == len(translated_fields), 'Fish field count changed'
    assert len(original_fields) in {8, 14}, 'Unsupported fish record layout'
    assert translated_fields[1:] == original_fields[1:], 'Fish catch metadata changed'
    assert translated_fields[0].strip(), 'Empty fish display name'
    assert signature(original_fields[0]) == signature(translated_fields[0]), 'Fish display-name tokens changed'
    if len(original_fields) == 8:
        assert original_fields[1] == 'trap', 'Invalid crab-pot fish type'
        assert original_fields[4] in {'ocean', 'freshwater'}, 'Invalid crab-pot water type'
        assert all(re.fullmatch(r'\d+', field) for field in original_fields[5:7]), 'Invalid crab-pot size metadata'
        assert original_fields[7] in {'true', 'false'}, 'Invalid crab-pot tutorial flag'
    else:
        assert re.fullmatch(r'\d+', original_fields[1]), 'Invalid fish difficulty'
        assert original_fields[2] in {'floater', 'smooth', 'dart', 'mixed', 'sinker'}, 'Invalid fish motion type'
        assert all(re.fullmatch(r'\d+', field) for field in original_fields[3:5]), 'Invalid fish size metadata'
        assert original_fields[7] in {'sunny', 'rainy', 'both'}, 'Invalid fish weather rule'
        assert original_fields[13] in {'true', 'false'}, 'Invalid fish tutorial flag'
    return translated_fields[0]


def validate_furniture(source, translated):
    """Furniture records localize through Strings/Furniture references, not inline names."""
    assert translated == source, 'Furniture technical record changed'
    fields = source.split('/')
    assert len(fields) in {8, 10, 11, 12}, 'Unsupported furniture record layout'
    assert fields[0].strip(), 'Empty furniture internal name'
    assert fields[1] in {
        'armchair', 'bed', 'bed child', 'bed double', 'bench', 'bookcase',
        'chair', 'couch', 'decor', 'dresser', 'fireplace', 'fishtank',
        'lamp', 'long table', 'other', 'painting', 'randomized_plant',
        'rug', 'sconce', 'table', 'torch', 'window'
    }, 'Invalid furniture type'
    assert re.fullmatch(r'\[LocalizedText Strings\\Furniture:[A-Za-z0-9_]+\]', fields[7]), 'Missing furniture localization reference'
    return ''


def validate_hair_data(source, translated):
    """Hairstyle records contain only texture coordinates and rendering flags."""
    assert translated == source, 'Hairstyle technical record changed'
    fields = source.split('/')
    assert len(fields) == 6, 'Hairstyle field count changed'
    assert re.fullmatch(r'[A-Za-z0-9_]+', fields[0]), 'Invalid hairstyle texture asset'
    assert all(re.fullmatch(r'-?\d+', field) for field in fields[1:3] + fields[4:5]), 'Invalid hairstyle coordinates or ID'
    assert fields[3] in {'true', 'false'} and fields[5] in {'true', 'false'}, 'Invalid hairstyle flag'
    return ''


def validate_monsters(source, translated):
    """Translate the monster display name while preserving combat and drop data."""
    original_fields = source.split('/')
    translated_fields = translated.split('/')
    assert len(original_fields) == len(translated_fields) == 15, 'Monster field count changed'
    assert translated_fields[:14] == original_fields[:14], 'Monster combat or drop metadata changed'
    assert translated_fields[14].strip(), 'Empty monster display name'
    assert signature(original_fields[14]) == signature(translated_fields[14]), 'Monster display-name tokens changed'
    assert all(re.fullmatch(r'-?\d+', field) for field in original_fields[:4]), 'Invalid monster stat metadata'
    assert original_fields[4] in {'true', 'false'}, 'Invalid monster glider flag'
    assert re.fullmatch(r'-?\d+', original_fields[5]), 'Invalid monster duration metadata'
    assert original_fields[12] in {'true', 'false'}, 'Invalid monster mine-monster flag'
    return translated_fields[14]


def validate_npc_gift_tastes(key, source, translated):
    """Translate five NPC gift reactions while preserving every taste item ID."""
    if key.startswith('Universal_'):
        assert translated == source, 'Universal gift-taste IDs changed'
        assert re.fullmatch(r'(?:-?[A-Za-z0-9_]+)(?: -?[A-Za-z0-9_]+)*', source), 'Invalid universal gift-taste list'
        return ''
    original_fields = source.split('/')
    translated_fields = translated.split('/')
    assert len(original_fields) == len(translated_fields) == 11, 'NPC gift-taste field count changed'
    assert translated_fields[1::2] == original_fields[1::2], 'NPC gift-taste item IDs changed'
    rendered = []
    for index in (0, 2, 4, 6, 8):
        assert translated_fields[index].strip(), 'Empty NPC gift reaction'
        rendered.append(validate_dialogue(original_fields[index], translated_fields[index]))
    return '\n'.join(rendered)


def validate_paint_data(source, translated):
    """Building paint records contain region IDs and hue/saturation limits only."""
    assert translated == source, 'Building paint technical record changed'
    fields = source.split('/')
    assert len(fields) == 6, 'Building paint field count changed'
    assert fields[0::2] == ['Building', 'Roof', 'Trim'], 'Building paint region IDs changed'
    assert all(re.fullmatch(r'-?\d+ -?\d+', field) for field in fields[1::2]), 'Invalid building paint limits'
    return ''


def validate_quests(source, translated):
    """Translate fixed quest copy while preserving quest type, target and rewards."""
    original_fields = source.split('/')
    translated_fields = translated.split('/')
    assert len(original_fields) == len(translated_fields) and len(original_fields) in {9, 10}, 'Quest field count changed'
    assert translated_fields[0] == original_fields[0], 'Quest type changed'
    assert translated_fields[4:9] == original_fields[4:9], 'Quest target, reward or flag metadata changed'
    rendered = []
    for index in (1, 2, 3):
        assert translated_fields[index].strip(), 'Empty quest title, description or objective'
        assert signature(original_fields[index]) == signature(translated_fields[index]), 'Quest visible-field tokens changed'
        rendered.append(translated_fields[index])
    if len(original_fields) == 10:
        assert translated_fields[9].strip(), 'Empty quest completion dialogue'
        rendered.append(validate_dialogue(original_fields[9], translated_fields[9]))
    return '\n'.join(rendered)


def validate_secret_notes(source, translated):
    """Translate readable note text while preserving reveal commands and layout."""
    if source.startswith('!image '):
        assert translated == source, 'Secret-note image command changed'
        assert re.fullmatch(r'!image \d+', source), 'Invalid secret-note image command'
        return ''
    assert not translated.startswith('!image '), 'Text note changed into image command'
    assert signature(source) == signature(translated), 'Secret-note layout or runtime token changed'
    assert source.count('^') == translated.count('^'), 'Secret-note line layout changed'
    assert re.findall(r'%revealtaste:[A-Za-z]+:\d+', source) == re.findall(r'%revealtaste:[A-Za-z]+:\d+', translated), 'Secret-note taste reveal changed'
    return translated


def validate_cooking_channel(source, translated):
    """Translate the recipe title and the Queen of Sauce episode script."""
    original_fields = source.split('/', 1)
    translated_fields = translated.split('/', 1)
    assert len(original_fields) == len(translated_fields) == 2, 'Cooking-channel field count changed'
    assert all(field.strip() for field in translated_fields), 'Empty cooking-channel title or script'
    for original, result in zip(original_fields, translated_fields):
        assert signature(original) == signature(result), 'Cooking-channel visible-field tokens changed'
    return '\n'.join(translated_fields)


def validate_tip_channel(source, translated):
    """Translate Livin' Off the Land tips while preserving layout and spacing."""
    assert source.strip() and translated.strip(), 'Empty tip-channel script'
    assert signature(source) == signature(translated), 'Tip-channel layout or token changed'
    assert source.count('^') == translated.count('^'), 'Tip-channel page layout changed'
    return translated


def validate_animation_descriptions(source, translated):
    """Animation definitions contain frame data and optional localization keys only."""
    assert translated == source, 'Animation-description technical record changed'
    fields = source.split('/')
    assert 3 <= len(fields) <= 6, 'Animation-description field count changed'
    for field in fields:
        assert (field == '' or field in {'silent', 'laying_down'}
                or re.fullmatch(r'offset -?\d+ -?\d+', field)
                or re.fullmatch(r'\d+(?: \d+)*', field)
                or re.fullmatch(r'Strings\\animationDescriptions:[a-z0-9_]+', field)), 'Invalid animation-description field'
    return ''


def validate_hats(source, translated):
    """Translate hat names and descriptions while preserving render metadata."""
    original_fields = source.split('/')
    translated_fields = translated.split('/')
    assert len(original_fields) == len(translated_fields) and len(original_fields) in {6, 7}, 'Hat field count changed'
    assert translated_fields[2:5] == original_fields[2:5], 'Hat render metadata changed'
    if len(original_fields) == 7:
        assert translated_fields[6] == original_fields[6], 'Hat texture index changed'
    assert translated_fields[0] == translated_fields[5], 'Hat display-name copies differ'
    assert translated_fields[0].strip() and translated_fields[1].strip(), 'Empty hat name or description'
    for index in (0, 1, 5):
        assert signature(original_fields[index]) == signature(translated_fields[index]), 'Hat visible-field tokens changed'
    return '\n'.join((translated_fields[0], translated_fields[1]))


def validate_mail(source, translated):
    """Translate letter bodies and subjects while preserving mail commands and layout."""
    assert source.strip() and translated.strip(), 'Empty mail record'
    assert signature(source) == signature(translated), 'Mail layout or token changed'
    item_pattern = r'%item\s+.*?\s+%%'
    assert re.findall(item_pattern, source) == re.findall(item_pattern, translated), 'Mail item command changed'
    for pattern, label in ((r'%secretsanta', 'secret-santa token'),
                           (r'\{\d+\}', 'format placeholder')):
        assert re.findall(pattern, source) == re.findall(pattern, translated), f'Mail {label} changed'
    source_parts = source.split('[#]')
    translated_parts = translated.split('[#]')
    assert len(source_parts) == len(translated_parts) and len(source_parts) in {1, 2}, 'Mail subject separator changed'
    assert all(part.strip() for part in translated_parts), 'Empty mail body or subject'
    return re.sub(item_pattern, '', '\n'.join(translated_parts))


def validate_credits(source, translated):
    """Translate credit labels while preserving names, images, links and control tags."""
    if not source or source.startswith('[image]'):
        assert translated == source, 'Blank or image credit changed'
        return ''
    if source.startswith('[link]'):
        original = source.split(' ', 2)
        result = translated.split(' ', 2)
        assert len(original) == len(result) == 3 and result[:2] == original[:2], 'Credit link target changed'
        return result[2]
    if source.startswith(('[1]', '[3]')):
        assert translated[:3] == source[:3], 'Credit style tag changed'
        return translated[3:]
    match = re.fullmatch(r'(.+) \(([^()]*)\)', source)
    if match:
        translated_match = re.fullmatch(r'(.+) \(([^()]*)\)', translated)
        assert translated_match and translated_match.group(1) == match.group(1), 'Credit contributor name changed'
        return translated_match.group(2)
    assert translated == source, 'Credit contributor or organization name changed'
    return ''


batch = read(Path(sys.argv[1]))
assert batch['locale'] == 'sr'
assert batch['review'] == 'source-meaning-terminology-Serbian-grammar-voice-context-tokens'
assert 1 <= len(batch['entries']) <= 80
assert len(batch['entries']) >= 40 or batch.get('smallBatchReason')
snapshot = (ROOT / 'Documentation/glossary/glossary.sr.json').read_text()
assert batch['glossarySha256'] == sha(snapshot)
glossary_source = read(ROOT / 'Documentation/glossary/glossary.en.json')
glossary_sr = json.loads(snapshot)['sr']
exact_terms = {e['term'].casefold(): glossary_sr[e['id']]['term'] for e in glossary_source
               if ' / ' not in e['term'] and ' / ' not in glossary_sr[e['id']]['term']}
checkpoint = read(STATE / 'checkpoint.json')
assert checkpoint['glossaryCleanFullAudits'] == 2
assert checkpoint['glossaryFrozenSha256'] == sha(snapshot)
manifest = read(STATE / 'source-manifest.json')
target = batch['target']
asset = next(a for a in manifest['assets'] if a['path'] == target + '.json')
source_file = Path(manifest['sourceRoot']) / asset['path']
assert hashlib.sha256(source_file.read_bytes()).hexdigest() == asset['sha256']
original = read(source_file)['content']
source = {str(k): v for k, v in (enumerate(original) if isinstance(original, list) else original.items())}
destination = PATCHES / (target + '.json')
document = read(destination) if destination.exists() else {'Changes': [{
    'Action': 'EditData', 'Target': target, 'When': {'Language': 'sr-vnrevival'}, 'Entries': {}}]}
assert len(document['Changes']) == 1 and 'Format' not in document
change = document['Changes'][0]
assert change['Target'] == target and change['When'] == {'Language': 'sr-vnrevival'}
ledger_file = STATE / 'reviewed-records.json'
ledger = read(ledger_file) if ledger_file.exists() else []
index = {(r['target'], r['key']): r for r in ledger}
assert len(index) == len(ledger)
preserved = batch.get('preservedReasons', {})
assert set(preserved) <= set(batch['entries'])
assert set(batch.get('contextNotes', {})) <= set(batch['entries'])
assert set(batch.get('speakerGenderBranches', [])) <= set(batch['entries'])
speaker_prefixes = read(STATE / 'speaker-prefixes.json')
for key, value in batch['entries'].items():
    assert key in source and isinstance(value, str), key
    assert value or not source[key], key
    assert value == unicodedata.normalize('NFC', value) and '\ufffd' not in value, key
    for original_speaker, translated_speaker in speaker_prefixes.items():
        if source[key].startswith(original_speaker + ':'):
            assert value.casefold().startswith(translated_speaker.casefold() + ':'), f'Speaker label missing or inconsistent: {key}'
    assert signature(value) == signature(source[key]), f'Token/markup mismatch: {key}'
    if key in batch.get('speakerGenderBranches', []):
        original_branches = source[key].split('/')
        translated_branches = value.split('/')
        assert len(original_branches) == len(translated_branches) == 2, f'Speaker gender branch count: {key}'
        for original_branch, translated_branch in zip(original_branches, translated_branches):
            assert translated_branch.strip(), f'Empty speaker gender branch: {key}'
            assert signature(original_branch) == signature(translated_branch), f'Speaker gender branch tokens changed: {key}'
    if target == 'Strings/Lexicon' and key.startswith('Random'):
        source_options = source[key].split('#')
        translated_options = value.split('#')
        assert len(source_options) == len(translated_options), f'Lexicon option count: {key}'
        assert all(option.strip() for option in translated_options), f'Empty Lexicon option: {key}'
        assert [option.startswith('...') for option in source_options] == [
            option.startswith('...') for option in translated_options
        ], f'Lexicon hesitation prefixes changed: {key}'
    assert (value == source[key]) == (key in preserved), f'Preservation reason required: {key}'
    if key in preserved:
        assert preserved[key].strip(), key
    elif key in batch.get('numericDisplayReasons', {}):
        assert batch['numericDisplayReasons'][key].strip(), key
        if target == 'Data/Bundles' and key.startswith('Vault/'):
            original_label = source[key].split('/')[0]
            translated_label = value.split('/')[0]
            assert re.fullmatch(r'\d{1,2},\d{3}g', original_label), key
            assert re.fullmatch(r'\d{1,2}\.\d{3}g', translated_label), key
            assert re.findall(r'\d+', original_label) == re.findall(r'\d+', translated_label), key
        else:
            assert re.fullmatch(r'\d+(?:st|nd|rd|th)(?:,\d+(?:st|nd|rd|th))*', source[key]), key
            assert re.fullmatch(r'\d+\.(?:,\d+\.)*', value), key
            assert re.findall(r'\d+', source[key]) == re.findall(r'\d+', value), key
    else:
        assert re.search('[А-Яа-яЉЊЋЏЂљњћџђ]', value), f'Serbian text missing: {key}'
    if key.startswith('Scholar_Question_') and key.endswith(('_Options', '_Answers')):
        assert len(source[key].split(',')) == len(value.split(',')), f'Quiz option count/order schema: {key}'
        assert all(part.strip() for part in value.split(',')), f'Empty quiz option: {key}'
    if target == 'Strings/animationDescriptions' and key == 'sam_pool':
        original_command, _, original_body = source[key].partition('#')
        translated_command, _, translated_body = value.partition('#')
        assert original_command == translated_command == '$c .5', 'Sam pool probability command changed'
        original_branches = original_body.split('#$e#')
        translated_branches = translated_body.split('#$e#')
        assert len(original_branches) == len(translated_branches) == 2, 'Sam pool branch structure changed'
        for original_branch, translated_branch in zip(original_branches, translated_branches):
            assert translated_branch.strip(), 'Empty Sam pool branch'
            assert signature(original_branch) == signature(translated_branch), 'Sam pool branch tokens changed'
    if target == 'Strings/SimpleNonVillagerDialogues':
        original_parts = source[key].split('||')
        translated_parts = value.split('||')
        assert len(original_parts) == len(translated_parts), 'Non-villager dialogue sequence changed'
        for original_part, translated_part in zip(original_parts, translated_parts):
            assert translated_part.strip(), 'Empty non-villager dialogue part'
            original_speaker, original_speech = original_part.split(':', 1)
            translated_speaker, translated_speech = translated_part.split(':', 1)
            assert translated_speaker == speaker_prefixes[original_speaker], 'Non-villager speaker label mismatch'
            assert translated_speech.strip(), 'Empty non-villager speech'
            assert signature(original_speech) == signature(translated_speech), 'Non-villager per-speech token mismatch'
    if target == 'Strings/1_6_Strings' and key == 'StarterChicken_Names':
        original_pairs = [pair.split(',') for pair in source[key].split('|')]
        translated_pairs = [pair.split(',') for pair in value.split('|')]
        assert len(original_pairs) == len(translated_pairs), 'Starting chicken pair count changed'
        assert all(len(pair) == 2 and all(name.strip() for name in pair) for pair in translated_pairs), 'Each starting chicken pair requires two nonempty names'
    if ((target == 'Strings/1_6_Strings' and key.startswith('Renovation_'))
            or (target == 'Strings/Locations' and key.startswith('ScienceHouse_Renovation_'))):
        assert len(source[key].split('/')) == len(value.split('/')) == 3, f'Renovation title/description/prompt fields changed: {key}'
        assert all(part.strip() for part in value.split('/')), key
    if target == 'Strings/Characters' and key == 'Phone_Ring_Lewis':
        original_prompt = source[key].split("$y '", 1)
        translated_prompt = value.split("$y '", 1)
        assert len(original_prompt) == len(translated_prompt) == 2, 'Lewis phone question command missing'
        assert original_prompt[1].endswith("'") and translated_prompt[1].endswith("'"), 'Lewis phone question closing quote missing'
        original_fields = original_prompt[1][:-1].split('_')
        translated_fields = translated_prompt[1][:-1].split('_')
        assert len(original_fields) == len(translated_fields) == 9, 'Lewis phone question requires four choice/reply pairs'
        assert all(field.strip() for field in translated_fields), 'Empty Lewis phone question field'
        for original_field, translated_field in zip([original_prompt[0]] + original_fields, [translated_prompt[0]] + translated_fields):
            assert signature(original_field) == signature(translated_field), 'Lewis phone control token moved between branches'
    rendered = (''
                if target.startswith('Data/Events/') and key in preserved
                else validate_dialogue(source[key], value)
                if target.startswith('Characters/Dialogue/')
                else validate_achievements(source[key], value)
                if target == 'Data/Achievements'
                else validate_aquarium_fish(source[key], value)
                if target == 'Data/AquariumFish'
                else validate_boots(source[key], value)
                if target == 'Data/Boots'
                else validate_bundles(source[key], value)
                if target == 'Data/Bundles'
                else validate_chair_tiles(source[key], value)
                if target == 'Data/ChairTiles'
                else validate_cooking_recipe(source[key], value)
                if target == 'Data/CookingRecipes'
                else validate_crafting_recipe(source[key], value)
                if target == 'Data/CraftingRecipes'
                else validate_engagement_dialogue(source[key], value)
                if target == 'Data/EngagementDialogue'
                else validate_extra_dialogue(source[key], value)
                if target == 'Data/ExtraDialogue'
                else validate_festival_date(source[key], value)
                if target == 'Data/Festivals/FestivalDates'
                else validate_festival(key, source[key], value)
                if target.startswith('Data/Festivals/')
                else validate_fish(source[key], value)
                if target == 'Data/Fish'
                else validate_furniture(source[key], value)
                if target == 'Data/Furniture'
                else validate_hair_data(source[key], value)
                if target == 'Data/HairData'
                else validate_monsters(source[key], value)
                if target == 'Data/Monsters'
                else validate_npc_gift_tastes(key, source[key], value)
                if target == 'Data/NPCGiftTastes'
                else validate_paint_data(source[key], value)
                if target == 'Data/PaintData'
                else validate_quests(source[key], value)
                if target == 'Data/Quests'
                else validate_secret_notes(source[key], value)
                if target == 'Data/SecretNotes'
                else validate_cooking_channel(source[key], value)
                if target == 'Data/TV/CookingChannel'
                else validate_tip_channel(source[key], value)
                if target == 'Data/TV/TipChannel'
                else validate_animation_descriptions(source[key], value)
                if target == 'Data/animationDescriptions'
                else validate_hats(source[key], value)
                if target == 'Data/hats'
                else validate_mail(source[key], value)
                if target == 'Data/mail'
                else validate_credits(source[key], value)
                if target == 'Strings/credits'
                else visible_text(source[key], value)
                if target.startswith('Data/Events/')
                else visible_text(source[key], value))
    visible = re.sub(r'\{\{[^}]+\}\}|\{[A-Za-z0-9_:]+\}|\[[^\]]*\]|\$[A-Za-z0-9]+|%[a-z][A-Za-z0-9_]*(?::[A-Za-z0-9_]+)*', '', rendered)
    for word in re.findall('[A-Za-zА-Яа-яЉЊЋЏЂљњћџђ]+', visible):
        assert not (re.search('[A-Za-z]', word) and re.search('[А-Яа-яЉЊЋЏЂљњћџђ]', word)), f'Mixed Latin/Cyrillic word: {key}: {word}'
    latin = sorted(set(re.findall('[A-Za-z]{2,}', visible)))
    assert latin == sorted(batch.get('allowedLatin', {}).get(key, [])), f'Unreviewed Latin fragments: {key}: {latin}'
    glossary_id = batch.get('glossaryIds', {}).get(key)
    canonical_term = exact_terms.get(source[key].casefold())
    if glossary_id:
        assert glossary_id in glossary_sr, key
        assert value.casefold() in [v.casefold() for v in glossary_sr[glossary_id]['term'].split(' / ')], key
    elif canonical_term:
        assert value.casefold() == canonical_term.casefold(), f'Exact glossary mismatch: {key}: {canonical_term}'
    # Each structured Data target must be admitted only after adding its own schema validator.
    assert (target.startswith('Strings/') or target.startswith('Characters/Dialogue/')
            or target.startswith('Data/Events/')
            or target.startswith('Data/Festivals/')
            or target in {'Data/Achievements', 'Data/AquariumFish', 'Data/Boots',
                          'Data/Bundles', 'Data/ChairTiles', 'Data/CookingRecipes',
                          'Data/CraftingRecipes', 'Data/EngagementDialogue',
                          'Data/ExtraDialogue', 'Data/Festivals/FestivalDates',
                          'Data/Fish', 'Data/Furniture', 'Data/HairData',
                          'Data/Monsters', 'Data/NPCGiftTastes',
                          'Data/PaintData', 'Data/Quests',
                          'Data/SecretNotes', 'Data/TV/CookingChannel',
                          'Data/TV/TipChannel', 'Data/animationDescriptions',
                          'Data/hats', 'Data/mail'}), 'Add Data schema validation before proceeding'
    previous = index.get((target, key))
    if previous and previous['translationSha256'] != sha(value):
        assert batch.get('correctsReviewed') is True, f'Reviewed record overwrite: {key}'
    record = {'target': target, 'key': key, 'sourceSha256': sha(source[key]),
              'translationSha256': sha(value), 'glossarySha256': sha(snapshot),
              'batch': batch['id'], 'status': 'preserved-reviewed' if key in preserved else 'translated-reviewed',
              'reviewedAgainstEnglish': True, 'terminologyChecked': True,
              'serbianEditorialChecked': True, 'tokensAndContextChecked': True}
    if key in preserved:
        record['reason'] = preserved[key]
    elif key in batch.get('numericDisplayReasons', {}):
        record['numericDisplayReason'] = batch['numericDisplayReasons'][key]
    if key in batch.get('contextNotes', {}):
        assert batch['contextNotes'][key].strip(), key
        record['contextNote'] = batch['contextNotes'][key]
    index[(target, key)] = record
    change['Entries'][key] = value
# Stable order follows the English asset, independent of batch order.
change['Entries'] = {k: change['Entries'][k] for k in source if k in change['Entries']}
output = encode(document)
ordered_ledger = sorted(index.values(), key=lambda r: (r['target'], r['key']))
if '--check' not in sys.argv:
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(output)
    ledger_file.write_text(encode(ordered_ledger))
    checkpoint['reviewedRecords'] = len(ordered_ledger)
    checkpoint['projectPercent'] = min(99.999, len(ordered_ledger) / manifest['totalRecords'] * 100)
    checkpoint['lastBatch'] = batch['id']
    (STATE / 'checkpoint.json').write_text(encode(checkpoint))
print(encode({'batch': batch['id'], 'records': len(batch['entries']),
              'errors': 0, 'warnings': 0, 'checkOnly': '--check' in sys.argv}))

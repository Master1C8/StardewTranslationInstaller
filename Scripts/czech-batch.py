#!/usr/bin/env python3
"""Materialize directly authored Czech wording; record approval only on request.

This script never generates translation wording or infers editorial quality.
Run apply, read the complete source/translation comparison, then approve only
after the model has actually completed every editorial check for every row.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import unicodedata

ROOT = Path(__file__).resolve().parent.parent
DOC = ROOT / 'Documentation/czech'
PAYLOAD = ROOT / 'Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/czech'
SOURCE = Path.home() / 'Developer/data/stardew-english-unpacked'
TYPED_SOURCE = Path('/private/tmp/stardew-cs-inspector/english')
CHECKS = ['sourceMeaning', 'detailsAndTone', 'glossary', 'czechGrammar', 'englishResidue', 'characterVoice', 'context', 'tokensAndStructure']

def read(path):
    def unique(pairs):
        d = {}
        for k, v in pairs:
            if k in d:
                raise ValueError('Duplicate JSON key: ' + k)
            d[k] = v
        return d
    return json.loads(path.read_text(), object_pairs_hook=unique)

def sha(value):
    return hashlib.sha256(value.encode()).hexdigest()

def signature(value):
    gender_pattern = r'\$\{[^}]+\}\$'
    gender_shapes = sorted((token.count('^'), token.count('¦')) for token in re.findall(gender_pattern, value))
    value = re.sub(gender_pattern, '$GENDER$', value)
    patterns = [r'\{\{[^}]+\}\}', r'(?<!\{)\{[^{}]+\}(?!\})', r'\[(?:#|image|link|textcolor|letterbg|LocalizedText|FarmerStat|HOURS|MINUTES|DAY_OF|\d)[^\]]*\]', r'%[a-z][A-Za-z0-9_]*', r'\$[A-Za-z0-9]+', r'\([A-Z]+\)[A-Za-z0-9_]+', r'https?://[^\s)]+']
    return (gender_shapes, [sorted(re.findall(p, value)) for p in patterns], [value.count(c) for c in '@#^|/\\<\n%$_[]*¾'])

def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(value, ensure_ascii=False, indent=2) + '\n'
    if not path.exists() or path.read_text() != text:
        path.write_text(text)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['apply', 'review', 'approve'])
    parser.add_argument('draft', type=Path)
    parser.add_argument('--note', help='Actual completed full-entry editorial review finding, required for approval.')
    args = parser.parse_args()
    draft = read(args.draft)
    assert re.fullmatch(r'[0-9]{3}-[a-z0-9-]+', draft['id'])
    assert draft['kind'] in ('short', 'long')
    has_entries = 'entries' in draft
    has_fields = 'fields' in draft
    assert has_entries != has_fields, 'A batch must contain exactly one of entries or fields.'
    authored_rows = (list(draft['entries'].items()) if has_entries else [
        ((key, field), value)
        for key, fields in draft['fields'].items()
        for field, value in fields.items()
    ])
    minimum, maximum = (40, 80) if draft['kind'] == 'short' else (15, 30)
    assert minimum <= len(authored_rows) <= maximum or draft.get('complexityReason')
    glossary_path = ROOT / 'Documentation/glossary/glossary.cs.json'
    glossary_hash = hashlib.sha256(glossary_path.read_bytes()).hexdigest()
    audit = read(DOC / 'glossary-audit-state.json')
    assert audit['locked'] and audit['cleanFullAudits'] >= 2 and audit['glossarySHA256'] == glossary_hash
    target = draft['target']
    if has_entries:
        source_content = read(SOURCE / (target + '.json'))['content']
        # Plain string dictionaries include Strings assets and character dialogue.
        # String lists (currently Strings/credits) use their stable zero-based
        # index as the Content Patcher entry key.
        if isinstance(source_content, dict) and all(isinstance(k, str) and isinstance(v, str) for k, v in source_content.items()):
            source = source_content
        elif isinstance(source_content, list) and all(isinstance(v, str) for v in source_content):
            source = {str(index): value for index, value in enumerate(source_content)}
        else:
            raise AssertionError('Entry batches support plain string dictionaries and string lists only.')
    else:
        source = read(TYPED_SOURCE / (target + '.json'))
    manifest = {(r['target'], r['key'], r['field']): r['sourceSHA256'] for r in read(DOC / 'source-manifest.json')['rows']}
    rows = []
    for identity, value in authored_rows:
        key, field = (identity, None) if has_entries else identity
        original = source[key] if field is None else source[key][field]
        assert isinstance(value, str) and (value or original == '') and '\ufffd' not in value, key
        assert unicodedata.normalize('NFC', value) == value, key
        assert manifest[target, key, field] == sha(original), 'English drift: ' + key + ('.' + field if field else '')
        reason_key = key if field is None else key + '.' + field
        source_signature = signature(original)
        translation_signature = signature(value)
        structure_reason = draft.get('structureReasons', {}).get(reason_key)
        if source_signature != translation_signature:
            assert structure_reason and structure_reason.strip(), 'Control-token mismatch: ' + key
        else:
            assert not structure_reason, 'Unneeded structure reason: ' + key
        reason = draft.get('preservationReasons', {}).get(reason_key)
        if reason is None and draft.get('commonPreservationReason'):
            assert value == original, 'A common preservation reason can only cover source-equal technical rows: ' + key
            reason = draft['commonPreservationReason']
        assert value != original or reason, 'Source-equal row needs a specific reason: ' + key
        row = dict(target=target, key=key, field=field, source=original, translation=value, sourceSHA256=sha(original), translationSHA256=sha(value))
        if reason:
            row['preservationReason'] = reason
        if structure_reason:
            row['structureReason'] = structure_reason
        rows.append(row)
    patch_key = 'Entries' if has_entries else 'Fields'
    patch = {'Changes': [{'Action': 'EditData', 'Target': target, 'When': {'Language': 'cs-vnrevival'}, patch_key: draft[patch_key.lower()]}]}
    patch_path = PAYLOAD / (draft['id'] + '.json')
    ledger_path = DOC / 'batches' / (draft['id'] + '.json')
    if args.action == 'apply':
        # A changed approved patch needs an explicit new full batch review.
        if ledger_path.exists() and read(patch_path) != patch:
            ledger_path.unlink()
        write(patch_path, patch)
    else:
        assert read(patch_path) == patch, 'Apply the current draft before reviewing/approving.'
    if args.action == 'review':
        for n, row in enumerate(rows, 1):
            label = row['key'] + ('.' + row['field'] if row['field'] else '')
            print(f"{n}. {label}\nEN {row['source']}\nCS {row['translation']}")
    elif args.action == 'approve':
        assert args.note and args.note.strip(), 'Approval requires an actual editorial finding.'
        for row in rows:
            row['reviewChecks'] = CHECKS
        write(ledger_path, dict(id=draft['id'], locale='cs', kind=draft['kind'], glossarySHA256=glossary_hash, reviewNote=args.note, rows=rows))
        print(f'Approved {len(rows)} explicitly reviewed rows; structural markers match or have a documented runtime-verified exception.')
    else:
        print(f'Applied {len(rows)} authored rows; editorial approval is pending.')

if __name__ == '__main__':
    main()

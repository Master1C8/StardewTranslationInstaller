#!/usr/bin/env python3
"""Latin American Spanish inventory, validation, and reviewed-only coverage.

This tool never generates translated wording. apply accepts manually authored
batches and emits only reviewed records. The full runtime/release gate is separate.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
DOC = ROOT / 'Documentation/latin-american-spanish'
OUTPUT = ROOT / 'Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/es-419'
SOURCE = Path('/Users/antonkrutov/Developer/data/stardew-english-unpacked')
LOCALE = 'es-419-vnrevival'
TECHNICAL_ONLY = {
    'Data/AquariumFish', 'Data/ChairTiles', 'Data/CookingRecipes',
    'Data/CraftingRecipes', 'Data/Furniture', 'Data/HairData',
    'Data/animationDescriptions'
}

def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()

def read(path):
    def pairs(values):
        result = {}
        for key,value in values:
            if key in result:
                raise ValueError(f'Duplicate JSON key in {path}: {key}')
            result[key] = value
        return result
    return json.loads(path.read_text(), object_pairs_hook=pairs)

def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(value, ensure_ascii=False, indent=2) + '\n'
    if not path.exists() or path.read_text() != text:
        path.write_text(text)

def asset(target):
    if target not in {e['target'] for e in read(DOC/'source-inventory.json')['assets']}:
        raise ValueError(f'Target outside pinned English inventory: {target}')
    value = read(SOURCE/(target+'.json'))['content']
    if isinstance(value, list):
        value = {str(i):v for i,v in enumerate(value)}
    if not isinstance(value,dict) or any(not isinstance(v,str) for v in value.values()):
        raise ValueError(f'Unsupported English structure: {target}')
    return value

def all_sources():
    return {e['target']:asset(e['target']) for e in read(DOC/'source-inventory.json')['assets']}

def ledger():
    path = DOC/'reviewed-records.json'
    return read(path) if path.exists() else {}

def record_id(target, key):
    return target+'\u0000'+key

def markers(text):
    expressions = [r'\{\{[^}]+\}\}',r'\{[A-Za-z0-9_]+(?::[^}]+)?\}',
                   r'\$[A-Za-z0-9]+',r'%[a-z][A-Za-z0-9_]*',
                   r'\[(?:#|image|textcolor|letterbg|LocalizedText|FarmerStat|HOURS|MINUTES|DAY_OF|\d)[^\]]*\]',
                   r'\([A-Z]+\)[A-Za-z0-9_]+']
    result = [sorted(re.findall(pattern,text)) for pattern in expressions]
    result += [text.count(c) for c in '@#^|\\\n']
    return result

def validate_record(target, key, original, translated, note='', runtime_structure_reason=''):
    errors = []
    if not isinstance(translated,str): return [f'{target}:{key}: translation must be text']
    if markers(original) != markers(translated):
        allowed_gender_branch = (
            (target, key) == ('Strings/Lexicon', 'GenericPlayerTerm')
            and bool(runtime_structure_reason.strip())
            and original.count('^') == 0
            and translated.count('^') == 1
            and all(part.strip() for part in translated.split('^'))
        )
        if not allowed_gender_branch:
            errors.append(f'{target}:{key}: placeholder/control-token mismatch')
    # Every record in these four source assets was inspected; the text fields
    # are engine enums and asset identifiers. See technical-source-review.json.
    if target in TECHNICAL_ONLY and original != translated:
        errors.append(f'{target}:{key}: technical-only asset must remain unchanged')
    if original and not translated:
        errors.append(f'{target}:{key}: empty translation')
    if '\ufffd' in translated:
        errors.append(f'{target}:{key}: replacement character')
    if original == translated and not note.strip():
        errors.append(f'{target}:{key}: identical wording requires an explicit review reason')
    structured = target in {'Data/Achievements','Data/AquariumFish','Data/Boots','Data/Bundles','Data/ChairTiles','Data/CookingRecipes','Data/CraftingRecipes','Data/Fish','Data/Furniture','Data/HairData','Data/Monsters','Data/NPCGiftTastes','Data/PaintData','Data/Quests','Data/animationDescriptions','Data/hats'}
    if structured:
        if original.count('/') != translated.count('/'):
            errors.append(f'{target}:{key}: structured field count differs')
        for before,after in zip(original.split('/'),translated.split('/')):
            if re.fullmatch(r'[0-9 .,+;:_\-]*',before) and before != after:
                errors.append(f'{target}:{key}: numeric/empty technical field changed')
    is_event = target.startswith('Data/Events/') or bool(re.search(r'(?:^|/)(?:speak|message|pause|move|warp|viewport) ',original))
    if is_event:
        def skeleton(value):
            # Some reusable event fragments begin with dialogue text and its
            # closing quote, followed by commands and another quoted line.
            # Mask that leading text while retaining the command boundary.
            boundary = re.search(r'"/[A-Za-z][A-Za-z0-9]*\b', value) if value.count('"') % 2 else None
            if boundary:
                value = 'TEXT\x00' + value[boundary.start() + 1:]
            # quickQuestion stores its player-facing choices inline before
            # the first branch marker instead of quoting them.
            value = re.sub(r'(/quickQuestion )(.*?)(?=\(break\))', r'\1CHOICES', value)
            value = re.sub(r'"(?:\\.|[^"\\])*"', '"TEXT"', value)
            return value.replace('\x00', '"')
        if skeleton(original) != skeleton(translated):
            errors.append(f'{target}:{key}: event commands differ; needs a specific parser before applying')
    return errors

def patch_path(target):
    return OUTPUT/(target+'.json')

def replace_quoted_text(source, replacements):
    """Replace reviewed dialogue literals while leaving an event command skeleton exact."""
    replacements = dict(replacements)
    seen = set()
    def substitute(match):
        value = match.group(1)
        if value not in replacements:
            return match.group(0)
        translated = replacements[value]
        seen.add(value)
        if not isinstance(translated, str):
            raise ValueError('Quoted replacement must be text')
        return '"' + translated.replace('\\', '\\\\').replace('"', '\\"') + '"'
    translated = re.sub(r'"((?:\\.|[^"\\])*)"', substitute, source)
    missing = replacements.keys() - seen
    if missing:
        raise ValueError('Quoted source text not found: ' + ', '.join(missing))
    return translated

def replace_quick_questions(source, replacements):
    """Replace reviewed inline quickQuestion choices without changing commands."""
    replacements = dict(replacements)
    seen = set()
    def substitute(match):
        value = match.group(1)
        if value not in replacements:
            return match.group(0)
        translated = replacements[value]
        seen.add(value)
        if not isinstance(translated, str):
            raise ValueError('Quick-question replacement must be text')
        return '/quickQuestion ' + translated
    translated = re.sub(r'/quickQuestion (.*?)(?=\(break\))', substitute, source)
    missing = replacements.keys() - seen
    if missing:
        raise ValueError('Quick-question source text not found: ' + ', '.join(missing))
    return translated

def apply(batch_path):
    batch = read(batch_path)
    if batch.get('locale') != 'es-419' or batch.get('reviewed') is not True:
        raise ValueError('Batch must attest es-419 line-by-line editorial review')
    checkpoint = read(DOC/'checkpoint.json')
    glossary_path = ROOT/'Documentation/glossary/glossary.es-419.json'
    glossary_sha = hashlib.sha256(glossary_path.read_bytes()).hexdigest()
    glossary_gate = checkpoint.get('glossary', {})
    if glossary_gate.get('consecutiveCleanFullAudits') != 2 or glossary_gate.get('locked') is not True:
        raise ValueError('Glossary editorial gate is not current')
    target = batch['target']; source_path = SOURCE/(target+'.json')
    source = asset(target)
    if batch['sourceAssetSha256'] != hashlib.sha256(source_path.read_bytes()).hexdigest():
        raise ValueError('Batch was reviewed against another source version')
    preserve_all = batch.get('preserveAllSourceEntries') is True
    if preserve_all and target not in TECHNICAL_ONLY:
        raise ValueError(f'Whole-asset technical preservation is not authorized for {target}')
    technical_reason = batch.get('technicalReviewReason', '').strip()
    if preserve_all and not technical_reason:
        raise ValueError('Whole-asset technical preservation requires a review reason')
    batch_entries = dict(source if preserve_all else batch.get('entries', {}))
    for key in batch.get('preserveSourceEntries', []):
        if key not in source:
            raise ValueError(f'Unknown English key: {target}:{key}')
        if key in batch_entries:
            raise ValueError(f'Duplicate batch key: {target}:{key}')
        batch_entries[key] = source[key]
    quoted = batch.get('quotedReplacements', {})
    quick_questions = batch.get('quickQuestionReplacements', {})
    for key in quoted.keys() | quick_questions.keys():
        if key not in source:
            raise ValueError(f'Unknown English key: {target}:{key}')
        if key in batch_entries:
            raise ValueError(f'Duplicate batch key: {target}:{key}')
        value = source[key]
        if key in quoted:
            value = replace_quoted_text(value, quoted[key])
        if key in quick_questions:
            value = replace_quick_questions(value, quick_questions[key])
        batch_entries[key] = value
    records = ledger(); entries = {}; errors = []
    file = patch_path(target)
    if file.exists(): entries = read(file)['Changes'][0]['Entries']
    for key,value in batch_entries.items():
        if key not in source:
            errors.append(f'Unknown English key: {target}:{key}'); continue
        note = batch.get('notes',{}).get(key,'') or technical_reason
        runtime_structure_reason = batch.get('runtimeStructureReasons',{}).get(key,'')
        errors.extend(validate_record(target,key,source[key],value,note,runtime_structure_reason))
        entries[key] = value
        records[record_id(target,key)] = {'sourceSha256':digest(source[key]),'translationSha256':digest(value),
              'glossarySha256':glossary_sha,'review':'es-419 source fidelity, terminology, naturalness, context and tokens',
              'batch':batch_path.relative_to(ROOT).as_posix(),'note':note,
              'runtimeStructureReason':runtime_structure_reason}
    if errors: raise ValueError('\n'.join(errors))
    if not batch_entries: raise ValueError('Empty batch')
    ordered = {k:entries[k] for k in source if k in entries}
    write(file,{'Changes':[{'Action':'EditData','Target':target,'When':{'Language':LOCALE},'Entries':ordered}]})
    write(DOC/'reviewed-records.json',records)
    print(json.dumps({'applied':len(batch_entries),'target':target,'errors':0},indent=2))

def audit():
    sources = all_sources(); expected = {record_id(t,k):v for t,entries in sources.items() for k,v in entries.items()}
    records = ledger(); errors=[]; actual={}
    glossary_sha=hashlib.sha256((ROOT/'Documentation/glossary/glossary.es-419.json').read_bytes()).hexdigest()
    for item in read(DOC/'source-inventory.json')['assets']:
        if hashlib.sha256((SOURCE/(item['target']+'.json')).read_bytes()).hexdigest()!=item['jsonSha256']:
            errors.append('Pinned source drift: '+item['target'])
    for file in sorted(OUTPUT.rglob('*.json')) if OUTPUT.exists() else []:
        document=read(file)
        if set(document)!={'Changes'} or not document['Changes']: errors.append('Invalid secondary file: '+str(file))
        for change in document['Changes']:
            target=change.get('Target')
            if change.get('Action')!='EditData' or change.get('When')!={'Language':LOCALE}:
                errors.append('Invalid es-419 patch: '+str(file))
            for key,text in change.get('Entries',{}).items():
                identity=record_id(target,key)
                if identity in actual: errors.append('Duplicate patch record: '+identity)
                actual[identity]=text
                if identity not in expected: errors.append('Unknown source record: '+identity); continue
                evidence=records.get(identity,{})
                errors.extend(validate_record(target,key,expected[identity],text,evidence.get('note',''),
                                              evidence.get('runtimeStructureReason','')))
                if evidence.get('sourceSha256')!=digest(expected[identity]) or evidence.get('translationSha256')!=digest(text):
                    errors.append('Missing/stale line review: '+identity)
                if evidence.get('glossarySha256')!=glossary_sha: errors.append('Stale glossary review: '+identity)
    for identity in set(records)-set(actual): errors.append('Reviewed record missing from payload: '+identity)
    valid=sum(1 for identity in actual if identity in records and identity in expected
              and records[identity].get('sourceSha256')==digest(expected[identity])
              and records[identity].get('translationSha256')==digest(actual[identity])
              and records[identity].get('glossarySha256')==glossary_sha)
    report={'locale':'es-419','sourceRecords':len(expected),'reviewedRecords':valid,'remainingRecords':len(expected)-valid,
            'coveragePercent':round(valid/len(expected)*100,6),'errors':errors,'warnings':[],
            'releaseReady':False,'scope':'All pinned English dictionary entries and credit array elements; runtime gate separate.'}
    write(DOC/'coverage.json',report)
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return bool(errors)

def main():
    p=argparse.ArgumentParser(); sub=p.add_subparsers(dest='command',required=True)
    nxt=sub.add_parser('next'); nxt.add_argument('target'); nxt.add_argument('--count',type=int,default=60)
    ap=sub.add_parser('apply'); ap.add_argument('batch',type=Path)
    sub.add_parser('audit')
    a=p.parse_args()
    if a.command=='apply': apply(a.batch.resolve())
    elif a.command=='audit': return audit()
    else:
        records=ledger(); source=asset(a.target)
        pending=[(k,v) for k,v in source.items() if record_id(a.target,k) not in records][:a.count]
        print(json.dumps({'locale':'es-419','target':a.target,
              'sourceAssetSha256':hashlib.sha256((SOURCE/(a.target+'.json')).read_bytes()).hexdigest(),
              'pendingEnglish':dict(pending)},ensure_ascii=False,indent=2))
    return 0

if __name__=='__main__':
    try: raise SystemExit(main())
    except (ValueError,KeyError) as error:
        print(str(error),file=sys.stderr); raise SystemExit(1)

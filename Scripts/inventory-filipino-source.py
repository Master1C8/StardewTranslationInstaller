#!/usr/bin/env python3
"""Inventory English source evidence only; never generate translated wording."""
import argparse
import hashlib
import json
from pathlib import Path
import re


def digest(data):
    return hashlib.sha256(data).hexdigest()


def canonical_hash(value):
    return digest(json.dumps(value, ensure_ascii=False, sort_keys=True,
                             separators=(',', ':')).encode())


def leaves(value, path=()):
    if isinstance(value, dict):
        for key, child in value.items():
            yield from leaves(child, (*path, str(key)))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from leaves(child, (*path, str(index)))
    elif isinstance(value, str):
        yield path, value


def read_assets(root):
    return {p.relative_to(root).with_suffix('').as_posix():
            (p, json.loads(p.read_text())['content'])
            for p in sorted(root.rglob('*.json'))}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--prepared', type=Path, required=True)
    parser.add_argument('--fresh', type=Path, required=True)
    parser.add_argument('--modern', type=Path, required=True)
    parser.add_argument('--game-content', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    prepared, fresh, modern = map(read_assets,
                                 (args.prepared, args.fresh, args.modern))
    if not prepared or prepared.keys() != fresh.keys():
        raise ValueError('Prepared and fresh English asset sets differ or are empty')
    if prepared.keys() & modern.keys():
        raise ValueError('Supplemental and prepared assets overlap')
    assets, rows, refs, unresolved = [], [], [], []
    for target, (file, content) in (prepared | modern).items():
        if '.' in Path(target).name:
            raise ValueError(f'Locale-suffixed source rejected: {target}')
        xnb = args.game_content / (target + '.xnb')
        record = dict(target=target, xnbSHA256=digest(xnb.read_bytes()),
                      extractionSHA256=digest(file.read_bytes()),
                      contentSHA256=canonical_hash(content))
        if target in prepared:
            if content != fresh[target][1]:
                raise ValueError(f'Prepared English differs from fresh extraction: {target}')
            record['kind'] = 'prepared text or legacy data; visibility review pending'
            record['freshContentMatches'] = True
            for path, text in leaves(content):
                rows.append(dict(target=target, path=list(path),
                                 sourceSHA256=canonical_hash(text),
                                 status='unreviewed'))
        else:
            record['kind'] = 'supplemental structured data; field review pending'
            for path, text in leaves(content):
                for match in re.finditer(r'Strings[/\\]+([A-Za-z0-9_]+):([^\s\[\]]+)', text):
                    destination, key = 'Strings/' + match[1], match[2]
                    ref = dict(origin=target, path=list(path), target=destination, key=key)
                    refs.append(ref)
                    if key not in prepared.get(destination, (None, {}))[1]:
                        unresolved.append(ref)
                if target == 'Data/SpecialOrders':
                    for key in re.findall(r'\[([A-Za-z0-9_]+)\]', text):
                        ref = dict(origin=target, path=list(path),
                                   target='Strings/SpecialOrderStrings', key=key)
                        refs.append(ref)
                        if key not in prepared['Strings/SpecialOrderStrings'][1]:
                            unresolved.append(ref)
        assets.append(record)
    if unresolved:
        raise ValueError(f'Unresolved source references: {unresolved}')
    report = dict(
        locale='fil', evidenceOnly=True,
        note='Counts are raw source records, not a reviewed player-visible coverage denominator. '
             'Resolved references do not prove absence of other visible text in structured data.',
        preparedAssets=len(prepared), supplementalAssets=len(modern),
        rawPreparedStringRecords=len(rows), reviewedGameStrings=0,
        supplementalReferenceOccurrences=len(refs),
        supplementalUniqueReferenceTargets=len({(r['target'], r['key']) for r in refs}),
        unresolvedReferences=unresolved, assets=assets, sourceRecords=rows)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({k: v for k, v in report.items()
                      if k not in ('assets', 'sourceRecords')}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()

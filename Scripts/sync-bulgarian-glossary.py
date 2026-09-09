#!/usr/bin/env python3
"""Merge the reviewed bg snapshot into canonical local JSON, without publishing.

Default is a dry run. --write requires owner authorization for the bg layer.
All bytes outside the bg value are preserved, including other locales' edits.
"""
import argparse
import hashlib
import json
import os
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANONICAL = Path('/Users/antonkrutov/Desktop/SiteForMods/data/games/stardew-valley')


def value_span(text, wanted):
    decoder = json.JSONDecoder()
    cursor = text.index('{') + 1
    while True:
        while text[cursor].isspace() or text[cursor] == ',':
            cursor += 1
        if text[cursor] == '}':
            raise ValueError(f'Missing canonical layer: {wanted}')
        key, cursor = decoder.raw_decode(text, cursor)
        while text[cursor].isspace():
            cursor += 1
        assert text[cursor] == ':'
        cursor += 1
        while text[cursor].isspace():
            cursor += 1
        start = cursor
        _, cursor = decoder.raw_decode(text, cursor)
        if key == wanted:
            return start, cursor


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    snapshot = ROOT / 'Documentation/glossary/glossary.bg.json'
    reviewed = json.loads(snapshot.read_text())['bg']
    checkpoint = json.loads((ROOT / 'Documentation/bulgarian/checkpoint.json').read_text())['glossary']
    assert checkpoint['locked'] and checkpoint['consecutiveCleanFullAudits'] >= 2
    assert hashlib.sha256(snapshot.read_bytes()).hexdigest() == checkpoint['workingSnapshotSha256']
    source = (CANONICAL / 'glossary.json').read_bytes()
    assert json.loads(source) == json.loads((ROOT / 'Documentation/glossary/glossary.en.json').read_bytes())
    baseline = {e['id']: e['translation'] for e in json.loads((ROOT / 'Documentation/bulgarian/glossary-live.json').read_text())['entries']}
    path = CANONICAL / 'glossary-translations.json'
    original = path.read_bytes()
    text = original.decode('utf-8')
    document = json.loads(text)
    if document['bg'] == reviewed:
        print('Canonical bg and reviewed snapshot already match; no write.')
        return
    if document['bg'] != baseline:
        raise ValueError('Canonical bg changed since acquisition; reconcile before writing')
    start, end = value_span(text, 'bg')
    replacement = json.dumps(reviewed, ensure_ascii=False, indent=2).replace('\n', '\n  ')
    updated = (text[:start] + replacement + text[end:]).encode('utf-8')
    after = json.loads(updated)
    assert after['bg'] == reviewed
    assert {k: v for k, v in after.items() if k != 'bg'} == {k: v for k, v in document.items() if k != 'bg'}
    changed = sum(reviewed[k] != baseline[k] for k in reviewed)
    print(f'{len(reviewed)} reviewed entries; {changed} changed entries; all non-bg bytes retained.')
    if not args.write:
        print('Dry run only; no canonical file changed.')
        return
    assert path.read_bytes() == original, 'Concurrent canonical modification; retry after inspection'
    assert (CANONICAL / 'glossary.json').read_bytes() == source, 'Concurrent English source modification'
    descriptor, temporary = tempfile.mkstemp(prefix='.bg-reviewed-', suffix='.json', dir=CANONICAL)
    try:
        with os.fdopen(descriptor, 'wb') as stream:
            stream.write(updated)
            stream.flush()
            os.fsync(stream.fileno())
        os.chmod(temporary, path.stat().st_mode & 0o777)
        assert path.read_bytes() == original, 'Concurrent canonical modification before replacement'
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)
    assert path.read_bytes() == updated
    assert (CANONICAL / 'glossary.json').read_bytes() == source
    print('Canonical bg synchronized locally; protected English and other locales unchanged.')


if __name__ == '__main__':
    main()

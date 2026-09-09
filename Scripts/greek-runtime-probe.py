#!/usr/bin/env python3
"""Run an isolated native Harmony probe without opening Stardew or the installer."""
import argparse
import os
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--csc', default=os.environ.get('CSC_BIN', 'csc'))
parser.add_argument('--game-path', type=Path, default=Path.home() / 'Library/Application Support/Steam/steamapps/common/Stardew Valley/Contents/MacOS')
args = parser.parse_args()
game = args.game_path
payload = ROOT / 'Sources/StardewTranslationInstaller/Resources'
with tempfile.TemporaryDirectory(prefix='stardew-greek-runtime-') as directory:
    probe = Path(directory)
    references = []
    for parent in (game, game / 'smapi-internal'):
        for source in parent.iterdir():
            if not source.is_file():
                continue
            target = probe / source.name
            if not target.exists():
                target.symlink_to(source)
            if source.suffix == '.dll':
                data = source.read_bytes()
                if data.startswith(b'MZ') and b'BSJB' in data:
                    references.append('-r:' + str(source))
    mod = payload / 'LanguageSwitcherPayload/VNRevival.LanguageSwitcher.dll'
    (probe / mod.name).symlink_to(mod)
    subprocess.run([args.csc, '-noconfig', '-nostdlib', '-langversion:9.0',
                    '-target:exe', '-out:' + str(probe / 'GreekProbe.dll'),
                    *references, '-r:' + str(mod),
                    str(ROOT / 'Tools/GreekRuntimeProbe/Program.cs')], check=True)
    # Use the game's matching self-contained .NET runtime, without opening it.
    # Retarget a temporary apphost copy to the probe's explicitly compiled entry.
    original = b'Stardew Valley.dll\0'
    replacement = b'GreekProbe.dll\0'
    apphost = (game / 'Stardew Valley').read_bytes()
    assert apphost.count(original) == 1, 'Unexpected game apphost layout'
    host = probe / 'greek-probe'
    host.write_bytes(apphost.replace(original, replacement.ljust(len(original), b'\0')))
    host.chmod(0o755)
    subprocess.run(['codesign', '--force', '--sign', '-', str(host)], check=True)
    for suffix in ('runtimeconfig.json', 'deps.json'):
        (probe / ('GreekProbe.' + suffix)).symlink_to(game / ('Stardew Valley.' + suffix))
    subprocess.run([str(host),
                    str(payload / 'ModPayload/assets/translations/greek/Strings/UI.json'),
                    str(ROOT / 'Documentation/greek/batches')],
                   cwd=probe, check=True)

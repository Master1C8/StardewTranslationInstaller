#!/usr/bin/env python3
"""Read base English assets missing from the pinned xnbcli extraction.

Uses the installed game's ContentManager for newer typed GameData readers.
Compiles a console dumper with csc in a temporary directory. It does not start
Stardew Valley, SMAPI, the installer, or touch installed Content/Mods/save files.
"""
import pathlib
import shutil
import subprocess
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
GAME = pathlib.Path('/Users/antonkrutov/Library/Application Support/Steam/steamapps/common/Stardew Valley/Contents')
ENGLISH = pathlib.Path('/Users/antonkrutov/Developer/data/stardew-english-unpacked')
OUTPUT = ROOT / '.bulgarian-source/supplement'

PROGRAM = r'''
using System;
using System.IO;
using System.Text.Json;
using Microsoft.Xna.Framework.Content;
class Services : IServiceProvider { public object GetService(Type type) { return null; } }
class Dump {
 static int Main(string[] args) {
  var cm = new ContentManager(new Services(), args[0]);
  var options = new JsonSerializerOptions { IncludeFields = true, WriteIndented = true };
  int failures = 0;
  foreach (var target in File.ReadAllLines(args[1])) {
   try {
    var value = cm.Load<object>(target);
    var output = Path.Combine(args[2], target + ".json");
    Directory.CreateDirectory(Path.GetDirectoryName(output));
    File.WriteAllText(output, JsonSerializer.Serialize(new { content = value }, options));
    Console.WriteLine("OK " + target);
   } catch(Exception e) { failures++; Console.WriteLine("FAIL " + target + ": " + e); }
  }
  return failures == 0 ? 0 : 1;
 }
}
'''


def main():
    compiler = shutil.which('csc')
    if not compiler:
        raise RuntimeError('The local C# compiler csc is required')
    content = GAME / 'Resources/Content'
    runtime = GAME / 'MacOS'
    targets = []
    for folder in ('Data', 'Strings', 'Characters/Dialogue'):
        for file in sorted((content / folder).rglob('*.xnb')):
            # Every suffixed asset is excluded, including official translations.
            if '.' in file.stem:
                continue
            relative = file.relative_to(content).with_suffix('')
            if not (ENGLISH / relative.with_suffix('.json')).exists():
                targets.append(relative.as_posix())
    if not ENGLISH.exists() or not targets:
        raise RuntimeError('Missing extraction or no supplemental targets; inspect source paths')
    with tempfile.TemporaryDirectory(prefix='stardew-bg-dump-') as temporary:
        staging = pathlib.Path(temporary)
        source = staging / 'Dump.cs'
        source.write_text(PROGRAM)
        references = [p for p in runtime.glob('*.dll') if p.name.startswith('System.')
                      or p.name in ('MonoGame.Framework.dll', 'StardewValley.GameData.dll',
                                    'mscorlib.dll', 'netstandard.dll')]
        subprocess.run([compiler, '-nologo', '-noconfig', '-nostdlib', '-target:exe',
                        '-out:' + str(staging / 'Stardew Valley.dll')]
                       + ['-r:' + str(p) for p in references] + [str(source)], check=True)
        for file in runtime.iterdir():
            if file.name != 'Stardew Valley.dll' and file.suffix in ('.dll', '.dylib', '.json'):
                (staging / file.name).symlink_to(file)
        # The copied apphost starts our newly compiled console entry point.
        # The game's actual executable and game assembly are never executed.
        host = staging / 'dump'
        shutil.copyfile(runtime / 'Stardew Valley', host)
        host.chmod(0o755)
        target_file = staging / 'targets.txt'
        target_file.write_text('\n'.join(targets) + '\n')
        subprocess.run([str(host), str(content), str(target_file), str(OUTPUT)], check=True)


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Probe the compiled Bulgarian article postfix using isolated game language state.

Runs our console entry point only; installed assets, saves and mods are read-only.
The copied apphost points at BGProbe.dll; it does not start Stardew Valley.
"""
import pathlib,tempfile,subprocess,shutil,json
r=pathlib.Path('/Users/antonkrutov/Library/Application Support/Steam/steamapps/common/Stardew Valley/Contents/MacOS')
payload=pathlib.Path(__file__).resolve().parents[1]/'Sources/StardewTranslationInstaller/Resources/LanguageSwitcherPayload'
with tempfile.TemporaryDirectory(prefix='bg-article-probe-') as d:
 p=pathlib.Path(d); refs=[x for x in r.glob('*.dll') if x.name.startswith('System.') or x.name in ('mscorlib.dll','netstandard.dll','Stardew Valley.dll','StardewValley.GameData.dll','StardewModdingAPI.dll','MonoGame.Framework.dll')]+[r/'smapi-internal/0Harmony.dll',payload/'VNRevival.LanguageSwitcher.dll']
 subprocess.run(['csc','-nologo','-noconfig','-nostdlib','-target:exe','-out:'+str(p/'BGProbe.dll')]+['-r:'+str(x) for x in refs]+[str(pathlib.Path(__file__).resolve().parents[1]/'Tools/BulgarianRuntimeProbe/Program.cs')],check=True)
 for folder in (r/'smapi-internal',r,payload):
  for x in folder.iterdir():
   if x.suffix in ('.dll','.dylib') and not (p/x.name).exists():(p/x.name).symlink_to(x)
 (p/'BGProbe.runtimeconfig.json').symlink_to(r/'Stardew Valley.runtimeconfig.json')
 (p/'BGProbe.deps.json').write_text(json.dumps({'runtimeTarget':{'name':'.NETCoreApp,Version=v6.0'},'targets':{'.NETCoreApp,Version=v6.0':{'BGProbe/1.0.0':{'runtime':{x.name:{} for x in p.glob('*.dll')},'native':{x.name:{} for x in p.glob('*.dylib')}}}},'libraries':{'BGProbe/1.0.0':{'type':'project','serviceable':False,'sha512':''}}}))
 b=(r/'Stardew Valley').read_bytes();old=b'Stardew Valley.dll\x00';new=b'BGProbe.dll\x00';assert b.count(old)==1;b=b.replace(old,new+b'\x00'*(len(old)-len(new)));host=p/'probe';host.write_bytes(b);host.chmod(0o755)
 subprocess.run([str(host)],cwd=p,check=True)

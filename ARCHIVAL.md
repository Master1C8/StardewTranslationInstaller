# Source-only archival

Keep the editable mod JSON, XNB spritefont/texture assets and licenses, final reviewed records/overrides/glossaries, current native and language-switcher source, and rebuild tools. Compiled app/DLL/PDB/cache copies are generated on demand. Historical batches/repair snapshots/screenshots are indexed in `ARCHIVAL-EVIDENCE.json` at Git `75d7fc644cf162ecbfc88cf92679ae1e63418b91`.

## Restore and build

```sh
zsh Scripts/build-app.sh
zsh Scripts/build-windows-release.sh
```

Both normal builders now compile the language switcher from `Tools/VNRevivalLanguageSwitcher` before packaging. Requires Swift/macOS Command Line Tools, .NET, Node, MinGW-w64 and the matching installed Stardew/SMAPI game reference assemblies. `STARDEW_GAME_PATH` selects a nondefault original installation; the default is the owner's Steam game directory. No game is launched or modified by building. Missing `xTile` reference in the .NET project was repaired; runtime source/behavior was unchanged.

Fresh universal macOS and Windows packaging passed on 2026-11-03 (`stardew-macos-xtile-build`, `stardew-windows-build`); all 78 compressed XNB verification cases passed unchanged. Native sources/data stay in Git, so no extra generated payload download is needed for a source rebuild. Normal clone/checkout restores those retained source assets. The current accepted 1.17.30 installers and build evidence remain checksummed in draft `storage-recovery-2026-11-03` in `Master1C8/StardewTranslationInstaller`. New verification builds are ad hoc signed, not notarized or newly published.

After verification remove `.build/`, `.build-app/`, `dist/`, Tools `bin/obj` caches and regenerated language-switcher DLL/PDB. Keep authored source, editable mod/font/texture assets, dependency/project metadata, compact verification records and normal Git metadata. Earlier detailed audits can be read with `git show REV:path` or restored at exact prerequisite paths when needed by an older editorial recipe. Saves and the installed game remain outside cleanup.

The superseded standalone working-copy recovery pack/ZIP is retained in normal
Git history at `3b206fabbb6d038e75ba250acd57c52fab2a070f`, under
`Documentation/Recovery/2026-10-06-working-copies`. It is not an active source
folder or a current build dependency. All current authored mod files remain here.

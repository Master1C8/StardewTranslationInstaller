# Stardew Valley — VN Revival Translation Installer

The native Windows and macOS application installs the shared VN Revival language
package for Stardew Valley. It starts installation when opened; after installation,
choose your language inside the game. There is no installer language picker.
A licensed copy of the game is required. The installer obtains pinned SMAPI and
Content Patcher dependencies and checks their SHA-256 before installation.

Windows uses the native x64 installer. The macOS app is universal (Apple silicon
and Intel). Extract the complete Windows ZIP and keep `Resources` beside the EXE.
Use the generated VN Revival desktop shortcut to launch with SMAPI.

## Installation, recovery and development

The download page contains platform-specific instructions and current compatibility.
The installer preserves unrelated mods and owns only its VN Revival package.
Do not treat removing the installer app as uninstalling the game mod. Close the game
before changing installed mods, preserve saves and follow the package instructions.

Build scripts: `Scripts/build-app.sh`, `Scripts/build-windows-release.sh` and the
Developer ID/notarization path `Scripts/build-release-app.sh`. See the historical
build notes below for commands; the signed path requires separately configured
publisher credentials. A local ad-hoc build is not a notarized release.

## Downloads and project links

- [Download and installation instructions](https://vnrevival.fun/ru/games/stardew-valley)
- [VN Revival project](https://vnrevival.fun/info/about)
- [Application privacy and security](https://vnrevival.fun/info/app-security)
- [Source repository](https://github.com/Master1C8/StardewTranslationInstaller)
- [Report an issue](https://github.com/Master1C8/StardewTranslationInstaller/issues) — include OS, game version, release version and archive SHA-256; omit saves, credentials and private logs.

## Authorship and verification

Maintained by [Anton / Master1C8](https://github.com/Master1C8) for VN Revival.
Codex is an AI development and translation tool, not a human editor. Human review,
Codex-assisted work and automated checks are separate activities; historical
receipts describe only the work and revision they actually cover.

Use the exact downloaded file's checksum and any recorded source-commit/build link
on the game page. The repository's latest branch is not evidence of an older
archive's source. SHA-256 proves byte identity; it is distinct from publisher
signing, Apple notarization, a build attestation and an independent security review.
This project is not affiliated with the original game's developer.

[Historical working and build notes](Documentation/README-history-2026-10-20.md)
are retained unchanged for development traceability. They do not replace the current
download instructions or establish the provenance of newly generated files.

## Local provenance builds

Use `python3 Scripts/build-provenance.py --release dist/NEW_RELEASE_DIRECTORY
--game-path /path/to/Stardew/Contents/MacOS` from clean, pushed canonical main.
The recipe runs the complete technical audit and both platform builds locally,
records the actual source commit, tool identities, resource inventory and read-only
game-reference hashes, then compares every ZIP entry against the final stage.
It rejects resource changes during compilation; generated managed binaries must be
reviewed and committed before the provenance build. No cloud build or paid signing
service is required. `Scripts/csc-dotnet.sh` uses the installed .NET SDK compiler;
`CSC_BIN` explicitly selects it without a NuGet dependency restore. Exact older
archives retain their original provenance status.

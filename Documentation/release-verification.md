# Published release verification

Windows and universal macOS 1.17.25 were published on October 20, 2026.
Download the platform ZIP, evidence ZIP and `PUBLICATION-SHA256SUMS` from
[the published release](https://github.com/Master1C8/StardewTranslationInstaller/releases/tag/release-1.17.25-0ee3acc6c6d0).

Compare each downloaded ZIP with its checksum line using `shasum -a 256` on
macOS or `Get-FileHash <file> -Algorithm SHA256` on Windows. If all ZIPs are
downloaded, `shasum -a 256 -c PUBLICATION-SHA256SUMS` verifies the complete set.

```text
cdbd0d35ce8fcc0fb1d6814bfba2a1e8342e5853bb827856f8eb9214ba250789  Stardew-Installer-Windows-1.17.25.zip
b20d704e8729f46079696e7d4ed0b1dc677a21255ac4d455255f0f764f7c12f2  Stardew-Installer-macOS-1.17.25.zip
2ce96fbd11ef1321ec90c1d6097736d02322d05fe4e0d7eeb4545546a7a56add  Stardew-1.17.25-0ee3acc6c6d0-evidence.zip
```

The actual build commit is
[`0ee3acc6c6d0f75fd591934730b133b8c358e918`](https://github.com/Master1C8/StardewTranslationInstaller/commit/0ee3acc6c6d0f75fd591934730b133b8c358e918).
Match it with the release tag, `provenance.json` and each installer archive's
root `vnrevival-release.json`; the latest repository HEAD may be a later
documentation commit. The source listing, build log, payload inventory and
read-only game reference hashes identify the actual inputs and test boundaries.

Locally built Windows x86-64 and universal Apple Silicon / Intel macOS installers (macOS 14+).
Actual source commit: `0ee3acc6c6d0f75fd591934730b133b8c358e918`.

Download the platform installer, `Stardew-1.17.25-0ee3acc6c6d0-evidence.zip` and `PUBLICATION-SHA256SUMS`.
Compare SHA-256, then inspect `provenance.json`, the platform manifest and the installer
ZIP's root `vnrevival-release.json`. They identify this release tag's exact source.
`source-tree.txt`, `build.log`, `payload-materials.json` and
`game-reference-materials.json` record source, tools, payload and read-only compilation
and probe dependencies. The game-reference file contains hashes, not original game data.

The build ran the retained-locale data/editorial gates, 15 native installer tests,
font/layout checks and isolated Hebrew, Arabic/Persian/Serbian language-switcher,
Greek and Bulgarian probes against game libraries. Both architecture checks passed;
every archive file was compared against the final stage. No new real-game playthrough
or visual acceptance run is claimed. macOS uses an ad hoc signature without
notarization. This is an unsigned local build statement, not a GitHub build
attestation or independent security review. Earlier 1.17.24 archive provenance
remains unknown; these source records apply only to the linked 1.17.25 files.

Historical records retain their original dates and statuses. No earlier
archive is assigned this release's source commit or checksum.

# RTL rendering repair — 1.17.26

## Current checkpoint

The owner requested repair of reversed Hebrew/Arabic/Persian text and detached
Arabic-script letters, followed by installer and screenshot updates. This is
renderer maintenance; translation text, fonts and save contents are preserved.
No application deployment or server lifecycle action is authorized by this work.

The unified pack/application advances to 1.17.26 and the shared language switcher
to 1.9.21. `ar-vnrevival`, `fa-vnrevival`, and `he-vnrevival` map explicitly to
site locales `ar`, `fa`, and `he` in `Scripts/visual-qa/locales.json`.

## Defect and regression boundary

The prior renderer prefix mutated Harmony's `__args` array, but the SMAPI-bundled
Harmony did not propagate those replacements to the original by-value text
parameters. Reflection-only prefix tests therefore passed while the real game
received untransformed strings. Bind explicit `ref __0`/`ref __1` arguments for
string/StringBuilder measurement and drawing, and bind SpriteText's text,
progressive cutoff, width and alignment arguments explicitly.

Patch the central `SpriteText.drawString` and its measurements, allowing wrapper
methods to reach that central boundary. Preserve the rendering-depth finalizer
so forwarded calls do not apply bidi/shaping twice.

`Scripts/run-hebrew-rtl-probe.sh` now exercises real Harmony patch application,
argument binding, forwarding, StringBuilder immutability, measurement, RTL layout,
and an unchanged Latin-only control for all three locales. Its dummy renderer
methods isolate Harmony; the native game runs below exercise actual rendering.

## Native verification

All fifteen native frames from the first SDK-build cycle were opened individually
and reviewed: title,
character creation, real Gus dialogue, axe tooltip/inventory, expanded journal
for each of `ar`, `fa`, and `he`. Arabic/Persian joining and Hebrew reading order
are correct in these frames. Inventory `zc`, `500g`, `0g`, date digits and journal
`3/28` retain their internal left-to-right order. Fields/panels and full tooltips
fit. No screenshot is resized, annotated or repaired after capture.

Each run reached `VN_QA_STATE advanced world` after normal dialogue completion,
loaded its exact two fonts and TitleButtons without adjacent Content Patcher
errors, restored startup preferences, removed the temporary driver and stopped
the task-owned game. Before/after hashes of the prepared save match. The captured
switcher DLL matched both source payload and installed DLL at capture time:

`565fb59022e41225033f513bea3afc88d01097bf50034168cb810e661c3f71c3`

Private capture evidence is under
`Documentation/rtl-rendering-20261024/reviewed/<locale>/visual-qa/` and the flat
fifteen-PNG upload directory is
`Documentation/rtl-rendering-20261024/reviewed/visual-qa-upload/`.
Earlier rejected captures remain preserved outside that upload directory.
This directory is deliberately ignored by Git. The runner's capture recipe
and concrete regressions are documented in `Scripts/visual-qa/README.md`.

All 15 Swift installer tests pass after updating the switcher version assertion.
The first full release audit also passed retained-locale data checks, font and
layout checks, both architecture checks and isolated language probes, and built
both installers. Provenance correctly refused them because its canonical direct
compiler recipe rebuilt the SDK-produced DLL/PDB with different bytes.

The direct-compiler build is reproducible across two invocations. Its DLL hash is
`12d73f415804897bb73a824f666b31f9e8c449f9c70346ab3cc5cec3edae8174`.
The earlier fifteen-frame review remains evidence for the SDK build identified
above. The Mac became locked during the follow-up runner check. That title-screen
task was interrupted, its game/driver cleaned up, and preferences verified against
the original backup. The owner subsequently unlocked the Mac and final recapture
completed. The runner checks source/installed DLL equality before either mode.

Both final archives passed `Scripts/build-provenance.py` from clean pushed commit
`bfaa5f1fbc050aca208eb34e1ef648fc7a7d6f1f` on October 25. They are stored in
`dist/1.17.26-provenance-20261025/`, alongside `provenance.json`, full source and
payload inventories, build log and `SHA256SUMS`:

| Platform | Archive | SHA-256 | Verified archive entries |
| --- | --- | --- | --- |
| Windows x86-64 | `Stardew-Installer-Windows-1.17.26.zip` | `a4fb19ec8a472621631d9311ea108dca1d31da2e4f0e5a47c927495b9a37629b` | 5318 |
| macOS arm64/x86-64 | `Stardew-Installer-macOS-1.17.26.zip` | `4062bfc2eef0ebc6aca8721eefc81e5906e49455a6da47fd5bede5104661b369` | 5319 |

The macOS app has an ad hoc signature and is not notarized. The source,
installed switcher and both archive DLLs have the final direct-compiler hash.
Complete content-pack inventory comparison found only its old installed manifest
version differed; that manifest was backed up and updated to 1.17.26. The capture
runner now reports the actual loaded pack version from SMAPI separately from its
source manifest version.

Final-binary recapture passed for all three locales on October 25. Each of the
fifteen full-resolution PNGs was opened individually and reviewed; per-image
observations and exact hashes are in
`Documentation/rtl-rendering-20261024/release-final-02/<locale>/visual-qa/`.
The flat `release-final-02/visual-qa-upload/` directory is the current prepared
upload set. All three runs report actual/source pack 1.17.26 and the exact final
DLL hash above, reach `advanced world` after normal dialogue progression, preserve
all protected save hashes, restore original preferences byte-for-byte and remove
the temporary driver. Arabic/Persian joining, Hebrew order, mixed `zc`, `500g`,
`0g`, date digits and quest `3/28` passed these frame-level checks.

The first final-binary attempt stopped after its dialogue disappeared before
capture; its rejected gameplay image remains preserved. The bridge now suppresses
physical button input only during command-driven runs and validates the current
menu immediately before each framebuffer write. The ordinary Oculix path remains
interactive. This final three-locale run validates the revised bridge; it does
not establish the cause of the earlier unexpected input/state change.

Production uploads and the separate post-upload review remain pending.
Native verification is macOS only; these captures do not claim a Windows
playthrough, exhaustive game coverage, or language-picker navigation coverage.

## Production handoff

The read-only Model usage CLI returned zero existing production usage records
on October 24. The comparison manifest was only a dry run and did not write
usage. The previous two chats and this chat have measured session telemetry.
Preserve nonoverlapping application/QA records at a stated cutoff; do not add
cached input or reasoning subsets twice. Production usage has not been written.

The canonical GitHub profile and repository identity/visibility were verified.
The private project-URL dry run stopped with:

`Production game-card edit failed: commit the game editor implementation before production use`

Archive dry runs for both platforms also stopped before transfer with:

`Production mod file sync failed: commit the mod file sync wrapper before production use`

SiteForMods has unrelated staged changes, including `scripts/cli/game.mjs` and
screenshot export/review infrastructure. Preserve that index and working tree;
do not commit, stash, reset or deploy it as part of this repair. Once its owning
work is committed, use the public CLI for exact project-URL/usage verification,
archive dry runs/apply, screenshot dry run/apply, and complete post-upload
`vn-game-screenshot-review`. No upload or post-upload acceptance is claimed yet.

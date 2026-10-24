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

All fifteen final native frames were opened individually and reviewed: title,
character creation, real Gus dialogue, axe tooltip/inventory, expanded journal
for each of `ar`, `fa`, and `he`. Arabic/Persian joining and Hebrew reading order
are correct in these frames. Inventory `zc`, `500g`, `0g`, date digits and journal
`3/28` retain their internal left-to-right order. Fields/panels and full tooltips
fit. No screenshot is resized, annotated or repaired after capture.

Each run reached `VN_QA_STATE advanced world` after normal dialogue completion,
loaded its exact two fonts and TitleButtons without adjacent Content Patcher
errors, restored startup preferences, removed the temporary driver and stopped
the task-owned game. Before/after hashes of the prepared save match. The captured
switcher DLL matches both canonical source payload and installed DLL:

`565fb59022e41225033f513bea3afc88d01097bf50034168cb810e661c3f71c3`

Private capture evidence is under
`Documentation/rtl-rendering-20261024/reviewed/<locale>/visual-qa/` and the flat
fifteen-PNG upload directory is
`Documentation/rtl-rendering-20261024/reviewed/visual-qa-upload/`.
Earlier rejected captures remain preserved outside that upload directory.
This directory is deliberately ignored by Git. The runner's capture recipe
and concrete regressions are documented in `Scripts/visual-qa/README.md`.

All 15 Swift installer tests pass after updating the switcher version assertion.
Release builds/provenance and production upload are pending at this checkpoint.
Native verification is macOS only; these captures do not claim a Windows
playthrough, exhaustive game coverage, or language-picker navigation coverage.

## Production handoff

The read-only Model usage CLI returned zero existing production usage records
on October 24. The comparison manifest was only a dry run and did not write
usage. The previous two chats and this chat have measured session telemetry;
final nonoverlapping application/QA records must be prepared at a stated cutoff.

The canonical GitHub profile and repository identity/visibility were verified.
The private project-URL dry run stopped with:

`Production game-card edit failed: commit the game editor implementation before production use`

SiteForMods has unrelated staged changes, including `scripts/cli/game.mjs` and
screenshot export/review infrastructure. Preserve that index and working tree;
do not commit, stash, reset or deploy it as part of this repair. Once its owning
work is committed, use the public CLI for exact project-URL/usage verification,
archive dry runs/apply, screenshot dry run/apply, and complete post-upload
`vn-game-screenshot-review`. No upload or post-upload acceptance is claimed yet.

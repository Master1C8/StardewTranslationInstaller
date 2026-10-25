# RTL rendering repair — 1.17.27

## Current correction — 25 October 2026

The owner identified left-aligned Hebrew journal text in the published 1.17.26
image and requested a repair. The previous blanket RTL acceptance was wrong:
correct letter order and fitting inside a panel did not establish right alignment.
The 1.17.26 acceptance statements below are historical and withdrawn for that
criterion. Original images and rejected review cycles are preserved.

The pack/application is now 1.17.27, switcher 1.9.22. Text translations, fonts,
base-game Content and save contents are unchanged. Native verification is complete;
release builds and replacement uploads are pending at this source checkpoint.
Existing authorization covers both installers and the fifteen RTL screenshots,
not application deployment or server lifecycle actions.

### Responsible boundaries

The existing central SpriteText fix handles dialogue. Journal descriptions and
objectives take a separate path: Game1.parseText → Utility.drawTextWithShadow →
SpriteBatch.DrawString. The latter receives no wrapping width. Preserve the exact
parse-result object's width, font and active adapter in a weak-key table; align
each transformed line against that actual region, removing only trailing parse
separators. Require the same font and adapter at draw time. Preserve color,
shadow, scale, layer and the depth finalizer so shaping/bidi runs once.

Object tooltips can bypass Utility and draw multiline string/StringBuilder
paragraphs directly through SpriteBatch. Keep their measured block origin/extent,
right-align shorter lines within it, and retain native single-line anchors and
centered headings. Rotated, offset-origin and flipped paragraphs retain the
existing path. No viewport-wide or frame-mirroring heuristic is used.

### Verification and rejected candidate

All fifteen Swift installer tests pass. The RTL probe passes exact Hebrew cases,
actual Harmony argument/forwarding checks and all three adapters. Added bounded
paragraph tests cover real MonoGame metrics, four lines including blank/short
lines, scale/color/Y preservation, and negative controls for a different string
identity/font, zero width and Latin text. Real SpriteBatch string/StringBuilder
methods are Harmony-patched and tested for common right edges and guard cleanup;
only final GPU emission is replaced by an observer. These probes do not establish
GPU appearance, which is verified by native captures below.

The first candidate fixed all journals but native Arabic/Persian item tooltips
still exposed left-aligned short lines. That cycle remains rejected under
`Documentation/rtl-alignment-20261025/native-01/`. The final DLL adds the shared
SpriteBatch paragraph repair. Its SHA-256 is:

`54bc81c3adcc41fcd7325aaa3954b1ad0412731f98603959c40e11f343523d3b`

All fifteen final native 1280×780 originals were opened individually: title,
creation, real Gus dialogue, axe tooltip/inventory and expanded journal for ar,
fa and he. Wrapped text, short last lines and journal objectives now share their
intended right edge. Mixed zc, 500g, 0g, date digits and 3/28 retain LTR order.
No screenshot has annotations or post-capture repairs. Native close-button HUD
occlusion is identified in observations rather than treating hidden glyphs as
reviewed. The Hebrew journal reproduces the owner's content and viewport.

Each final run loads actual/source pack 1.17.27 and the exact final DLL above,
loads both exact-locale fonts and TitleButtons, reports zero Content Patcher
errors/warnings, advances from dialogue normally, preserves all protected save
hashes, restores startup preferences and removes the temporary driver. Private
per-image observations, hashes and SMAPI logs are under
`Documentation/rtl-alignment-20261025/native-02/<locale>/visual-qa/`; the flat
`native-02/visual-qa-upload/` set is the replacement input. Probe/build logs are
under `dist/rtl-alignment-20261025/`. These runs are macOS only and do not claim
Windows gameplay, exhaustive game coverage or language-picker navigation.

The visual-QA recipe now explicitly separates SpriteText, bounded SpriteFont
and direct multiline SpriteBatch paths. Regression: Hebrew journal 1.17.26 must
fail alignment review even though bidi and capture logs pass.

## Historical 1.17.26 checkpoint — alignment acceptance withdrawn


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

Production uploads and complete post-upload inspection finished on October 25.
The 15 new RTL images pass; the overall gallery gate fails on preserved legacy
images as documented below.
Native verification is macOS only; these captures do not claim a Windows
playthrough, exhaustive game coverage, or language-picker navigation coverage.

## Production delivery — 25 October 2026

The owner confirmed the unrelated SiteForMods work was committed. The old dirty
CLI blocker is resolved. The canonical GitHub account/repository and private
project URL were verified through their owning tools; the URL was already correct.
Three measured, nonoverlapping Model usage records for this RTL repair were
written through the CLI and verified by an unchanged post-upload dry run. These
records exclude historical translation work and the later publication tail; no
inferred monetary cost or duplicate cached/reasoning subset is included.

The public CLI attached Windows ModFiles **65** and macOS ModFiles **66**, retaining
the old archive records. It replaced exactly five screenshots each for `ar`, `fa`
and `he`, preserved all other locale slots, and advanced the published release to
1.17.26 (release date 2026-10-25). All apply commands completed with cache
invalidation. Final read-back plans show all 15 screenshots as SKIP (zero
replacements/additions) and no release-metadata changes. Each platform upload
and screenshot/metadata operation has its own
transaction boundary; no global transaction is claimed.

The production release capture hashed actual archive bytes and read the embedded
source provenance. Both hashes, sizes and source commit match the table above.
The CLI subsequently downloaded both public ZIPs into
`dist/rtl-repair-20261024/production-{windows,macos}-1.17.26.zip`; exact byte sizes
and SHA-256 matched again. This verifies delivery, not Windows runtime.

SiteForMods commit `90f1232e21eaa5bd29a6fb3abfccb37dadcc7491` on canonical main
(pushed) appends the exact production release identities, registers the new guide
hashes and retains historical records. All 62 generated locale/platform guide
objects match the previously reviewed wording. The complete SEO test matrix
passed 418 checks initially, with its sole stale-fingerprint assertion corrected
after actual delta review and passed separately (1/1, zero skipped). The final
production `content audit --game stardew-valley` reports no missing content.

Registry/guide public rendering awaits a separately authorized application
deployment. No application deployment or server lifecycle action occurred.

## Complete hosted gallery inspection

The CLI exported 100/100 original hosted WebP images across 20 nonempty locale
slots with zero download failures. Every frame was opened individually at original
resolution, including all preserved legacy images. All 15 new RTL images pass
layout, glyphs, content, contamination and bidi checks. The global gate remains
**failed**: 85 preserved legacy images have baked-in locale badges, and nine of
those have additional layout/content findings. No image remains pending.

See [the complete review report](production-gallery-review-20261025.md) for every
locale count, exact regions, severity, next action and immutable receipt hashes.
The per-image ledger, export inventory and originals remain in ignored private
`Documentation/rtl-rendering-20261024/production-final-20261025/` and its sibling
`production-final-review.json`. These legacy findings do not establish current
1.17.26 runtime defects and do not authorize unrelated repair/recapture.

Upload plans, individual apply receipts, capture, successful download receipts,
content audit and test logs remain under `dist/rtl-repair-20261024/`. The private
`publication-progress.json` distinguishes successful publication from failed
whole-gallery visual acceptance. Do not resubmit the successful uploads.

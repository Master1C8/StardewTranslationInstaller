# Automated visual QA

This runner uses Oculix image recognition, a Swift helper for
CoreGraphics input, and a deterministic QuickSave to
capture the same five useful screens for every shipped VN Revival locale:

1. title menu;
2. character creation, including the lower-right Back button;
3. a live dialogue with Gus;
4. the axe description in the inventory;
5. the expanded Introductions journal entry.

The locale is selected before launch through Stardew Valley's
`startup_preferences`. Since synthesized key events don't reliably reach this
MonoGame/SDL build, a local-only SMAPI driver invokes QuickSave's own `TryLoad`
method when Oculix signals that the normal save is ready. The driver is compiled,
installed, and removed during one run. The original language preference is
restored byte-for-byte even if the run fails. The test save is never written:
the game process is stopped after the fifth capture.

## Prerequisites

- Stardew Valley and the unified VN Revival package installed at the standard
  paths used on this workstation;
- QuickSave 1.5.0 with the prepared `zc` save and F7 snapshot;
- OpenJDK 17 at `/opt/homebrew/opt/openjdk@17/bin/java`;
- Oculix 4.0.0 at
  `/Users/antonkrutov/Applications/Oculix/oculixide-4.0.0-macos.jar`;
- ImageMagick at `/opt/homebrew/bin/magick`;
- the Xcode command-line toolchain for compiling the input helper;
- macOS Screen Recording and Accessibility permission for the Java/Oculix
  process (normally Terminal or Codex, depending on how the runner is started).

Environment variables `OCULIX_JAR`, `OCULIX_JAVA`, and `STARDEW_GAME_DIR` can
override the three machine-specific paths.

## Commands

```sh
python3 Scripts/visual-qa/run_visual_qa.py --smoke
python3 Scripts/visual-qa/run_visual_qa.py --list
python3 Scripts/visual-qa/run_visual_qa.py sr-vnrevival
python3 Scripts/visual-qa/run_visual_qa.py --all
```

When Oculix cannot initialize its macOS mouse device, use the project-owned
state bridge for one exact locale and a new output directory:

```sh
python3 Scripts/visual-qa/run_visual_qa.py ar-vnrevival --bridge \
  --output-root Documentation/rtl-rendering-20261024/reviewed
```

Build the switcher with the same compiler path as `Scripts/build-provenance.py`
before installing it for visual QA:

```sh
STARDEW_GAME_PATH="<installed-game>/Contents/MacOS" \
  CSC_BIN="$PWD/Scripts/csc-dotnet.sh" ./Scripts/build-language-switcher.sh
```

SDK Release and direct compiler builds can have different DLL/PDB bytes from
the same source. Both capture modes reject an installed DLL that differs from
the canonical payload. Final runtime evidence must match the actual packaged
DLL hash; a source-level match alone does not establish that boundary.
Evidence records the loaded pack version from SMAPI separately from the source
manifest version. A newer source manifest does not prove the game loaded it.

The bridge uses a native 1280×780 game viewport, verifies each transition on
the game thread, and captures the backbuffer after `Game1.renderScreenBuffer`
has composed the UI. `Rendered` runs too early and may capture the world
without its dialogue or menus. Final-backbuffer rows already run top to bottom;
flipping them produces upside-down frames. Do not repair captured PNGs afterward.
Review each original frame before proceeding to another locale.

Dialogue completion waits for the menu to disappear after its normal typing,
safety timer and closing animation. A click receipt alone is insufficient.
Item hover and the previous mouse sample used for tooltip placement must point
to the same inventory slot. The prepared save's bytes are checked before/after,
and the original startup preferences and temporary driver are restored.

Only in bridge mode, SMAPI suppresses physical button input while commands drive
the game. A desktop/focus click must not dismiss the dialogue between its state
receipt and capture. The ordinary Oculix path remains interactive. Immediately
before saving each framebuffer, the driver checks the actual menu against that
capture's semantic screen; an earlier acknowledgement alone is insufficient.
Regression: close a dialogue between its open receipt and capture. Reject the
frame instead of accepting a gameplay image as dialogue or proceeding blindly.

Regressions: all five captures must show their distinct semantic UI, upright,
with complete panels and the full item tooltip. Capture byte uniqueness alone
cannot prove those states. Test all three RTL locales with mixed player names,
currency and quest progress, and verify return from dialogue to gameplay.

For RTL paragraphs, inspect the right edge of every wrapped line, especially a
short final line. Correct letter order and text fitting the panel do not prove
right alignment. Cover both SpriteText dialogue and SpriteFont journal/body and
objective paths, plus direct multiline SpriteBatch item tooltips: these are
separate renderer boundaries. Compare a long first
line with a much shorter last line and the mixed `3/28` objective. All must end
against their intended bounded right edge. Preserve centered headings and native
standalone label anchors; do not mirror the frame or move text to the viewport
edge. Regression: Hebrew journal 1.17.26 had correct bidi and a left-aligned short
last line; it must fail review despite clean capture/renderer logs.

The full run refuses to start while another Stardew Valley process is active
and refuses to overwrite an existing visual-QA directory. Use `--replace` only
after reviewing the existing evidence. In `--all` mode, only locales with an
evidence file and all five upload-ready screenshots are skipped; empty or
incomplete output is not accepted as completed work. The batch stops on its
first failed locale. A mismatch saves a failure screenshot at the project root and
exits nonzero instead of continuing with blind clicks. Interrupting `--all`
forwards the signal to the active locale and gives its cleanup handler time to
restore the original language and remove the temporary SMAPI driver.

Stable recognition crops are stored under `templates/2x/`. They are input
assets rather than generated evidence, so every locale output directory can be
deleted before a fresh run without making the runner depend on an old capture.

The five uploadable screenshots for every locale are written as regular PNG
files in the shared flat `Documentation/visual-qa-upload/` directory. Their
names use the canonical SiteForMods locale immediately followed by their order,
for example `sr-03-gus-dialogue.png`; the runtime locale remains
`sr-vnrevival` and is recorded separately in evidence. This directory contains
no contact sheets, logs, JSON files, or subdirectories, so it can be passed
directly to `./vnrevival game screenshots sync stardew-valley <root> --dry-run`
in the SiteForMods repository.

Review-only output is written to `Documentation/<locale>/visual-qa/`: the
contact sheet, fresh SMAPI log, hashes, and evidence record. Each uploadable PNG
keeps the native game frame (2560×1600 for Oculix, 1280×780 for the bridge),
without resizing or annotations. The automated result fails if the three exact
locale assets are absent from the log or if Content Patcher logged an error. A successful capture remains
`capture-pass-review-pending` until a person reviews the five images; image
recognition proves that the expected screens opened, not that every glyph and
line break rendered correctly.

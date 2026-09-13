# Automated visual QA

This runner uses Oculix image recognition, small Swift helpers for
CoreGraphics input and bidi-aware CoreText labels, and a deterministic QuickSave to
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
keeps the native 2560x1600 frame. The automated result fails if the three exact
locale assets are absent from the log or if Content Patcher logged an error. A successful capture remains
`capture-pass-review-pending` until a person reviews the five images; image
recognition proves that the expected screens opened, not that every glyph and
line break rendered correctly.

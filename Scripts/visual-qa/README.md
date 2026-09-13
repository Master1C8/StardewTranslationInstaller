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
after reviewing the existing evidence. In `--all` mode, only directories with
an evidence file and all five screenshots are skipped; empty or incomplete
directories are not accepted as completed work. The batch stops on its first
failed locale. A mismatch saves a failure screenshot at the project root and
exits nonzero instead of continuing with blind clicks. Interrupting `--all`
forwards the signal to the active locale and gives its cleanup handler time to
restore the original language and remove the temporary SMAPI driver.

Successful output is written to `Documentation/<locale>/visual-qa/`. Each PNG
keeps the native 2560x1600 frame and starts with the exact locale code. The
runner also writes a contact sheet, the fresh SMAPI log, hashes, and an evidence
record. Its automated result fails if the three exact locale assets are absent
from the log or if Content Patcher logged an error. A successful capture remains
`capture-pass-review-pending` until a person reviews the five images; image
recognition proves that the expected screens opened, not that every glyph and
line break rendered correctly.

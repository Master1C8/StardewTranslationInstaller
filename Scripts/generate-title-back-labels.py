#!/usr/bin/env python3
"""Render native-resolution back-button labels for every retained locale."""

from __future__ import annotations

import argparse
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path

from PIL import Image


@dataclass(frozen=True)
class BackLabel:
    slug: str
    text: str
    use_cjk_font: bool = False


LABELS = (
    BackLabel("russian", "НАЗАД"),
    BackLabel("serbian", "НАЗАД"),
    BackLabel("polish", "WSTECZ"),
    BackLabel("ukrainian", "НАЗАД"),
    BackLabel("vietnamese", "QUAY LẠI"),
    BackLabel("swahili", "RUDI"),
    BackLabel("persian", "بازگشت"),
    BackLabel("arabic", "رجوع"),
    BackLabel("indonesian", "KEMBALI"),
    BackLabel("filipino", "BUMALIK"),
    BackLabel("dutch", "TERUG"),
    BackLabel("hindi", "वापस"),
    BackLabel("traditional-chinese", "返回", True),
    BackLabel("romanian", "ÎNAPOI"),
    BackLabel("hebrew", "חזרה"),
    BackLabel("bulgarian", "НАЗАД"),
    BackLabel("thai", "กลับ"),
    BackLabel("greek", "ΠΙΣΩ"),
    BackLabel("czech", "ZPĚT"),
)

OVERLAY_SIZE = (264, 108)
LABEL_AREA_LEFT = 24
LABEL_AREA_RIGHT = 216
LABEL_AREA_WIDTH = LABEL_AREA_RIGHT - LABEL_AREA_LEFT
MARGIN_X = 16
MARGIN_Y = 12


def render_mask(renderer: Path, font: Path, text: str, size: int, output: Path) -> Image.Image:
    subprocess.run(
        [str(renderer), str(font), text, str(size), str(output)],
        check=True,
    )
    return Image.open(output).convert("RGBA").getchannel("A")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("output", type=Path)
    parser.add_argument("--renderer", type=Path, required=True)
    parser.add_argument("--font", type=Path, required=True)
    parser.add_argument("--cjk-font", type=Path, required=True)
    args = parser.parse_args()

    rows: list[Image.Image] = []
    with tempfile.TemporaryDirectory(prefix="vn-title-back-") as temp_directory:
        temp = Path(temp_directory)
        for label in LABELS:
            font = args.cjk_font if label.use_cjk_font else args.font
            mask = None
            for size in range(44, 23, -1):
                candidate = render_mask(
                    args.renderer,
                    font,
                    label.text,
                    size,
                    temp / f"{label.slug}.png",
                )
                if (
                    candidate.width <= LABEL_AREA_WIDTH - MARGIN_X * 2
                    and candidate.height <= OVERLAY_SIZE[1] - MARGIN_Y * 2
                ):
                    mask = candidate
                    break
            if mask is None:
                raise ValueError(f"Back label does not fit for {label.slug}")

            overlay = Image.new("RGBA", OVERLAY_SIZE, (255, 255, 255, 0))
            glyph = Image.new("RGBA", mask.size, (255, 255, 255, 255))
            glyph.putalpha(mask)
            overlay.alpha_composite(
                glyph,
                (
                    LABEL_AREA_LEFT + (LABEL_AREA_WIDTH - mask.width) // 2,
                    (OVERLAY_SIZE[1] - mask.height) // 2,
                ),
            )
            rows.append(overlay)

    sheet = Image.new(
        "RGBA",
        (OVERLAY_SIZE[0], OVERLAY_SIZE[1] * len(rows)),
        (255, 255, 255, 0),
    )
    for index, row in enumerate(rows):
        sheet.alpha_composite(row, (0, index * OVERLAY_SIZE[1]))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(args.output, format="PNG", optimize=False)
    print(f"Rendered {len(rows)} native-resolution back-button labels.")


if __name__ == "__main__":
    main()

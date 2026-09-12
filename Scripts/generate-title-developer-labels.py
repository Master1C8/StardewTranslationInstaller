#!/usr/bin/env python3
"""Render readable screen-resolution developer-card labels for retained locales."""

from __future__ import annotations

import argparse
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path

from PIL import Image


@dataclass(frozen=True)
class DeveloperLabel:
    slug: str
    text: str
    use_cjk_font: bool = False


LABELS = (
    DeveloperLabel("russian", "РАЗРАБОТЧИК"),
    DeveloperLabel("serbian", "АУТОР"),
    DeveloperLabel("polish", "TWÓRCA"),
    DeveloperLabel("ukrainian", "РОЗРОБНИК"),
    DeveloperLabel("vietnamese", "ĐƯỢC TẠO BỞI"),
    DeveloperLabel("swahili", "IMEUNDWA NA"),
    DeveloperLabel("persian", "سازنده"),
    DeveloperLabel("arabic", "تطوير"),
    DeveloperLabel("indonesian", "DIKEMBANGKAN OLEH"),
    DeveloperLabel("filipino", "BINUO NI"),
    DeveloperLabel("dutch", "GEMAAKT DOOR"),
    DeveloperLabel("hindi", "निर्माता"),
    DeveloperLabel("traditional-chinese", "製作人", True),
    DeveloperLabel("romanian", "DEZVOLTAT DE"),
    DeveloperLabel("hebrew", "נוצר על ידי"),
    DeveloperLabel("bulgarian", "СЪЗДАДЕНО ОТ"),
    DeveloperLabel("thai", "ผู้พัฒนา"),
    DeveloperLabel("greek", "ΔΗΜΙΟΥΡΓΙΑ"),
    DeveloperLabel("czech", "VYTVOŘIL"),
)

OVERLAY_SIZE = (333, 180)
LABEL_FOREGROUND = (254, 254, 255, 255)
LABEL_SHADOW = (159, 182, 255, 255)
LABEL_AREA = (30, 12, 303, 54)
SHADOW_OFFSET = (3, 3)


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

    area_width = LABEL_AREA[2] - LABEL_AREA[0]
    area_height = LABEL_AREA[3] - LABEL_AREA[1]
    rows: list[Image.Image] = []
    with tempfile.TemporaryDirectory(prefix="vn-title-developer-") as temp_directory:
        temp = Path(temp_directory)
        for label in LABELS:
            font = args.cjk_font if label.use_cjk_font else args.font
            mask = None
            for size in range(36, 19, -1):
                candidate = render_mask(
                    args.renderer,
                    font,
                    label.text,
                    size,
                    temp / f"{label.slug}.png",
                )
                if (
                    candidate.width + SHADOW_OFFSET[0] <= area_width
                    and candidate.height + SHADOW_OFFSET[1] <= area_height
                ):
                    mask = candidate
                    break
            if mask is None:
                raise ValueError(f"Developer label does not fit for {label.slug}")

            overlay = Image.new("RGBA", OVERLAY_SIZE, (0, 0, 0, 0))
            x = LABEL_AREA[0] + (area_width - mask.width) // 2
            y = LABEL_AREA[1] + (area_height - mask.height) // 2

            shadow = Image.new("RGBA", mask.size, LABEL_SHADOW)
            shadow.putalpha(mask)
            overlay.alpha_composite(shadow, (x + SHADOW_OFFSET[0], y + SHADOW_OFFSET[1]))

            glyph = Image.new("RGBA", mask.size, LABEL_FOREGROUND)
            glyph.putalpha(mask)
            overlay.alpha_composite(glyph, (x, y))
            rows.append(overlay)

    sheet = Image.new(
        "RGBA",
        (OVERLAY_SIZE[0], OVERLAY_SIZE[1] * len(rows)),
        (0, 0, 0, 0),
    )
    for index, row in enumerate(rows):
        sheet.alpha_composite(row, (0, index * OVERLAY_SIZE[1]))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(args.output, format="PNG", optimize=False)
    print(f"Rendered {len(rows)} screen-resolution developer-card labels.")


if __name__ == "__main__":
    main()

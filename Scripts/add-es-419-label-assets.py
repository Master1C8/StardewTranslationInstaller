#!/usr/bin/env python3
"""Append deterministic Latin American Spanish rows to the retained label sheets."""

from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_ASSETS = ROOT / "Scripts/assets"
PAYLOAD_ASSETS = (
    ROOT / "Sources/StardewTranslationInstaller/Resources/ModPayload/assets"
)
FONT = Path("/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf")
FALLBACK_FONT = Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")
NARROW_FONT = Path("/System/Library/Fonts/Supplemental/Arial Narrow Bold.ttf")
OLD_ROWS = 19


def fitted_font(
    text: str,
    max_width: int,
    max_height: int,
    start: int,
    *,
    font_path: Path | None = None,
) -> ImageFont.FreeTypeFont:
    font_path = font_path or (FONT if FONT.exists() else FALLBACK_FONT)
    probe = Image.new("L", (1, 1))
    draw = ImageDraw.Draw(probe)
    for size in range(start, 9, -1):
        font = ImageFont.truetype(str(font_path), size)
        box = draw.multiline_textbbox(
            (0, 0), text, font=font, spacing=-4, align="center", stroke_width=0
        )
        if box[2] - box[0] <= max_width and box[3] - box[1] <= max_height:
            return font
    raise ValueError(f"Unable to fit label: {text}")


def centered_text(
    image: Image.Image,
    box: tuple[int, int, int, int],
    text: str,
    *,
    start_size: int,
    fill: int | tuple[int, int, int, int],
    font_path: Path | None = None,
) -> None:
    left, top, right, bottom = box
    font = fitted_font(
        text, right - left, bottom - top, start_size, font_path=font_path
    )
    draw = ImageDraw.Draw(image)
    bounds = draw.multiline_textbbox(
        (0, 0), text, font=font, spacing=-4, align="center"
    )
    width = bounds[2] - bounds[0]
    height = bounds[3] - bounds[1]
    x = left + (right - left - width) / 2 - bounds[0]
    y = top + (bottom - top - height) / 2 - bounds[1]
    draw.multiline_text(
        (x, y), text, font=font, fill=fill, spacing=-4, align="center"
    )


def replace_last_row(path: Path, row: Image.Image, row_height: int) -> None:
    source = Image.open(path).convert(row.mode)
    expected_width = row.width
    if source.width != expected_width:
        raise ValueError(f"Unexpected width for {path}: {source.size}")
    if source.height not in (OLD_ROWS * row_height, (OLD_ROWS + 1) * row_height):
        raise ValueError(f"Unexpected height for {path}: {source.size}")
    retained = source.crop((0, 0, expected_width, OLD_ROWS * row_height))
    output = Image.new(row.mode, (expected_width, (OLD_ROWS + 1) * row_height))
    output.paste(retained, (0, 0))
    output.paste(row, (0, OLD_ROWS * row_height))
    output.save(path, format="PNG", optimize=False)


def language_button_row() -> Image.Image:
    row = Image.new("L", (174, 39), 0)
    centered_text(row, (7, 7, 167, 32), "ESPAÑOL LATAM", start_size=17, fill=255)
    return row.point(lambda value: 255 if value >= 128 else 0)


def title_button_row() -> Image.Image:
    row = Image.new("RGBA", (888, 174), (255, 255, 255, 0))
    labels = ("NUEVA\nPARTIDA", "CARGAR", "COOPERATIVO", "SALIR")
    for index, label in enumerate(labels):
        left = index * 222 + 10
        centered_text(
            row,
            (left, 28, left + 202, 120),
            label,
            start_size=42,
            fill=(255, 255, 255, 255),
            font_path=NARROW_FONT,
        )
    return row


def back_row() -> Image.Image:
    row = Image.new("RGBA", (264, 108), (255, 255, 255, 0))
    centered_text(row, (40, 18, 200, 90), "ATRÁS", start_size=44, fill=(255, 255, 255, 255))
    return row


def developer_row() -> Image.Image:
    row = Image.new("RGBA", (333, 180), (255, 255, 255, 0))
    text = "CREADO POR"
    font = fitted_font(text, 267, 36, 36)
    draw = ImageDraw.Draw(row)
    bounds = draw.textbbox((0, 0), text, font=font)
    width = bounds[2] - bounds[0]
    height = bounds[3] - bounds[1]
    x = 30 + (273 - width) / 2 - bounds[0]
    y = 12 + (42 - height) / 2 - bounds[1]
    draw.text((x + 3, y + 3), text, font=font, fill=(159, 182, 255, 255))
    draw.text((x, y), text, font=font, fill=(254, 254, 255, 255))
    return row


def main() -> None:
    replace_last_row(
        SCRIPT_ASSETS / "language-button-labels.png", language_button_row(), 39
    )
    replace_last_row(SCRIPT_ASSETS / "title-button-labels.png", title_button_row(), 174)
    replace_last_row(SCRIPT_ASSETS / "title-back-labels.png", back_row(), 108)
    replace_last_row(
        SCRIPT_ASSETS / "title-developer-labels.png", developer_row(), 180
    )

    source_atlas = PAYLOAD_ASSETS / "title/TitleButtons-czech.png"
    target_atlas = PAYLOAD_ASSETS / "title/TitleButtons-latin-american-spanish.png"
    if not target_atlas.exists():
        shutil.copyfile(source_atlas, target_atlas)

    print("Added Latin American Spanish label rows and clean title atlas.")


if __name__ == "__main__":
    main()

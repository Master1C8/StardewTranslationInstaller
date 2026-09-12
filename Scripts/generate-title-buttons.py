#!/usr/bin/env python3
"""Build clean title atlases and matching full-resolution button overlays."""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont


@dataclass(frozen=True)
class TitleButtons:
    filename: str
    slug: str
    locale: str
    display_name: str


BUTTONS = (
    TitleButtons("TitleButtons-russian.png", "russian", "Russian", "Русская"),
    TitleButtons("TitleButtons-serbian.png", "serbian", "Serbian", "Сербская"),
    TitleButtons("TitleButtons.png", "polish", "Polish", "Польская"),
    TitleButtons("TitleButtons-ukrainian.png", "ukrainian", "Ukrainian", "Украинская"),
    TitleButtons("TitleButtons-vietnamese.png", "vietnamese", "Vietnamese", "Вьетнамская"),
    TitleButtons("TitleButtons-swahili.png", "swahili", "Swahili", "Суахили"),
    TitleButtons("TitleButtons-persian.png", "persian", "Persian", "Персидская"),
    TitleButtons("TitleButtons-arabic.png", "arabic", "Arabic", "Арабская"),
    TitleButtons("TitleButtons-indonesian.png", "indonesian", "Indonesian", "Индонезийская"),
    TitleButtons("TitleButtons-filipino.png", "filipino", "Filipino", "Филиппинская"),
    TitleButtons("TitleButtons-dutch.png", "dutch", "Dutch", "Нидерландская"),
    TitleButtons("TitleButtons-hindi.png", "hindi", "Hindi", "Хинди"),
    TitleButtons("TitleButtons-traditional-chinese.png", "traditional-chinese", "Traditional Chinese", "Традиционная китайская"),
    TitleButtons("TitleButtons-romanian.png", "romanian", "Romanian", "Румынская"),
    TitleButtons("TitleButtons-hebrew.png", "hebrew", "Hebrew", "Иврит"),
    TitleButtons("TitleButtons-bulgarian.png", "bulgarian", "Bulgarian", "Болгарская"),
    TitleButtons("TitleButtons-thai.png", "thai", "Thai", "Тайская"),
    TitleButtons("TitleButtons-greek.png", "greek", "Greek", "Греческая"),
    TitleButtons("TitleButtons-czech.png", "czech", "Czech", "Чешская"),
)

ATLAS_SIZE = (400, 655)
STRIP_POSITION = (0, 184)
STRIP_SIZE = (296, 116)
RUNTIME_FRAME_SIZE = (888, 174)
RUNTIME_BUTTON_WIDTH = 222


def validate_overlay(overlay: Image.Image, spec: TitleButtons) -> None:
    if overlay.size != RUNTIME_FRAME_SIZE:
        raise ValueError(f"Invalid overlay dimensions for {spec.locale}: {overlay.size}")
    if overlay.mode not in ("RGB", "RGBA"):
        raise ValueError(f"Invalid overlay colour mode for {spec.locale}: {overlay.mode}")
    for column in range(4):
        cell = overlay.crop((column * RUNTIME_BUTTON_WIDTH, 0, (column + 1) * RUNTIME_BUTTON_WIDTH, RUNTIME_FRAME_SIZE[1]))
        if cell.getbbox() is None:
            raise ValueError(f"Missing title button {column + 1} for {spec.locale}")


def validate_atlas(atlas: Image.Image, template: Image.Image, spec: TitleButtons) -> None:
    if atlas.size != ATLAS_SIZE:
        raise ValueError(f"Invalid atlas dimensions for {spec.filename}: {atlas.size}")
    strip = atlas.crop((STRIP_POSITION[0], STRIP_POSITION[1], STRIP_POSITION[0] + STRIP_SIZE[0], STRIP_POSITION[1] + STRIP_SIZE[1]))
    if ImageChops.difference(strip, template).getbbox() is not None:
        raise ValueError(f"Title strip is not the clean template in {spec.filename}")


def write_preview(overlays: list[Image.Image], output: Path) -> None:
    gap = 8
    width = RUNTIME_FRAME_SIZE[0] * 2 + gap * 3
    height = len(overlays) * RUNTIME_FRAME_SIZE[1] + (len(overlays) + 1) * gap
    sheet = Image.new("RGB", (width, height), (0, 16, 23))
    for index, overlay in enumerate(overlays):
        for state in range(2):
            sheet.paste(overlay.convert("RGB"), (gap + state * (RUNTIME_FRAME_SIZE[0] + gap), gap + index * (RUNTIME_FRAME_SIZE[1] + gap)))
    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output, format="PNG", optimize=False)


def write_labeled_preview(overlays: list[Image.Image], output: Path) -> None:
    width, height = 977, 1610
    strip_width, row_height = 560, 84
    sheet = Image.new("RGB", (width, height), (2, 18, 30))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 27)
    for index, (overlay, spec) in enumerate(zip(overlays, BUTTONS)):
        top = 4 + index * row_height
        bottom = min(height, top + 78)
        rendered = overlay.resize((strip_width, bottom - top), Image.Resampling.LANCZOS)
        sheet.paste(rendered.convert("RGB"), (0, top))
        text_box = draw.textbbox((0, 0), spec.display_name, font=font)
        text_height = text_box[3] - text_box[1]
        draw.text((584, top + (bottom - top - text_height) / 2 - text_box[1]), spec.display_name, font=font, fill=(222, 226, 233))
    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output, format="PNG", optimize=False)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("assets", type=Path)
    parser.add_argument("--overlays", type=Path, required=True)
    parser.add_argument("--template", type=Path, required=True)
    parser.add_argument("--buttons", type=Path, required=True)
    parser.add_argument("--preview", type=Path)
    parser.add_argument("--labeled-preview", type=Path)
    args = parser.parse_args()

    template = Image.open(args.template).convert("RGBA")
    if template.size != STRIP_SIZE:
        raise ValueError(f"Unexpected title-button template size: {template.size}")
    button_sheet = Image.open(args.buttons)
    expected_size = (RUNTIME_FRAME_SIZE[0], RUNTIME_FRAME_SIZE[1] * len(BUTTONS))
    if button_sheet.size != expected_size:
        raise ValueError(f"Unexpected title-button sheet size: {button_sheet.size}; expected {expected_size}")
    if button_sheet.mode not in ("RGB", "RGBA"):
        raise ValueError(f"Unexpected title-button colour mode: {button_sheet.mode}")

    args.overlays.mkdir(parents=True, exist_ok=True)
    atlases: list[Image.Image] = []
    overlays: list[Image.Image] = []
    for index, spec in enumerate(BUTTONS):
        overlay = button_sheet.crop((0, index * RUNTIME_FRAME_SIZE[1], RUNTIME_FRAME_SIZE[0], (index + 1) * RUNTIME_FRAME_SIZE[1]))
        validate_overlay(overlay, spec)
        overlay_path = args.overlays / f"TitleButtons-{spec.slug}.png"
        overlay.save(overlay_path, format="PNG", optimize=False)
        saved_overlay = Image.open(overlay_path)
        if saved_overlay.mode != overlay.mode or ImageChops.difference(saved_overlay, overlay).getbbox() is not None:
            raise ValueError(f"Runtime overlay pixels changed for {spec.locale}")

        path = args.assets / spec.filename
        source = Image.open(path).convert("RGBA")
        atlas = source.copy()
        atlas.paste(template, STRIP_POSITION)
        validate_atlas(atlas, template, spec)
        atlas.save(path, format="PNG", optimize=False)
        atlases.append(atlas)
        overlays.append(overlay)

    if args.preview:
        write_preview(overlays, args.preview)
    if args.labeled_preview:
        write_labeled_preview(overlays, args.labeled_preview)
    print(f"Built {len(atlases)} clean title atlases and full-resolution button overlays.")


if __name__ == "__main__":
    main()

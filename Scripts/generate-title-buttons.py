#!/usr/bin/env python3
"""Build clean title atlases and matching high-resolution text overlays."""

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
FRAME_WIDTH = 296
FRAME_HEIGHT = 58
RUNTIME_FRAME_SIZE = (888, 174)
RUNTIME_BUTTON_WIDTH = 222
INK_COLORS = ((210, 34, 69, 255), (239, 72, 101, 255))


def tint_overlay(overlay: Image.Image, color: tuple[int, int, int, int]) -> Image.Image:
    tinted = Image.new("RGBA", overlay.size, color)
    tinted.putalpha(overlay.getchannel("A"))
    return tinted


def compose_state(atlas: Image.Image, overlay: Image.Image, state: int) -> Image.Image:
    state_top = STRIP_POSITION[1] + state * FRAME_HEIGHT
    strip = atlas.crop((0, state_top, FRAME_WIDTH, state_top + FRAME_HEIGHT))
    strip = strip.resize(RUNTIME_FRAME_SIZE, Image.Resampling.NEAREST)
    strip.alpha_composite(tint_overlay(overlay, INK_COLORS[state]))
    return strip


def validate_overlay(overlay: Image.Image, spec: TitleButtons) -> None:
    if overlay.size != RUNTIME_FRAME_SIZE:
        raise ValueError(f"Invalid overlay dimensions for {spec.locale}: {overlay.size}")
    alpha = overlay.getchannel("A")
    for column in range(4):
        cell = alpha.crop((column * RUNTIME_BUTTON_WIDTH, 0, (column + 1) * RUNTIME_BUTTON_WIDTH, RUNTIME_FRAME_SIZE[1]))
        bounds = cell.getbbox()
        if bounds is None or sum(1 for value in cell.getdata() if value >= 24) < 100:
            raise ValueError(f"Missing title label {column + 1} for {spec.locale}")
        if bounds[0] < 5 or bounds[2] > RUNTIME_BUTTON_WIDTH - 5:
            raise ValueError(f"Title label {column + 1} touches its frame for {spec.locale}: {bounds}")


def validate_atlas(atlas: Image.Image, template: Image.Image, spec: TitleButtons) -> None:
    if atlas.size != ATLAS_SIZE:
        raise ValueError(f"Invalid atlas dimensions for {spec.filename}: {atlas.size}")
    strip = atlas.crop((STRIP_POSITION[0], STRIP_POSITION[1], STRIP_POSITION[0] + STRIP_SIZE[0], STRIP_POSITION[1] + STRIP_SIZE[1]))
    if ImageChops.difference(strip, template).getbbox() is not None:
        raise ValueError(f"Title strip is not the clean template in {spec.filename}")


def write_preview(atlases: list[Image.Image], overlays: list[Image.Image], output: Path) -> None:
    gap = 8
    width = RUNTIME_FRAME_SIZE[0] * 2 + gap * 3
    height = len(atlases) * RUNTIME_FRAME_SIZE[1] + (len(atlases) + 1) * gap
    sheet = Image.new("RGB", (width, height), (0, 16, 23))
    for index, (atlas, overlay) in enumerate(zip(atlases, overlays)):
        for state in range(2):
            rendered = compose_state(atlas, overlay, state)
            sheet.paste(rendered.convert("RGB"), (gap + state * (RUNTIME_FRAME_SIZE[0] + gap), gap + index * (RUNTIME_FRAME_SIZE[1] + gap)))
    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output, format="PNG", optimize=False)


def write_labeled_preview(atlases: list[Image.Image], overlays: list[Image.Image], output: Path) -> None:
    width, height = 977, 1610
    strip_width, row_height = 560, 84
    sheet = Image.new("RGB", (width, height), (2, 18, 30))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 27)
    for index, (atlas, overlay, spec) in enumerate(zip(atlases, overlays, BUTTONS)):
        top = 4 + index * row_height
        bottom = min(height, top + 78)
        rendered = compose_state(atlas, overlay, 0).resize((strip_width, bottom - top), Image.Resampling.LANCZOS)
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
    parser.add_argument("--labels", type=Path, required=True)
    parser.add_argument("--preview", type=Path)
    parser.add_argument("--labeled-preview", type=Path)
    args = parser.parse_args()

    template = Image.open(args.template).convert("RGBA")
    if template.size != STRIP_SIZE:
        raise ValueError(f"Unexpected title-button template size: {template.size}")
    label_sheet = Image.open(args.labels).convert("RGBA")
    expected_size = (RUNTIME_FRAME_SIZE[0], RUNTIME_FRAME_SIZE[1] * len(BUTTONS))
    if label_sheet.size != expected_size:
        raise ValueError(f"Unexpected title-label sheet size: {label_sheet.size}; expected {expected_size}")

    args.overlays.mkdir(parents=True, exist_ok=True)
    atlases: list[Image.Image] = []
    overlays: list[Image.Image] = []
    for index, spec in enumerate(BUTTONS):
        overlay = label_sheet.crop((0, index * RUNTIME_FRAME_SIZE[1], RUNTIME_FRAME_SIZE[0], (index + 1) * RUNTIME_FRAME_SIZE[1]))
        validate_overlay(overlay, spec)
        overlay.save(args.overlays / f"TitleLabels-{spec.slug}.png", format="PNG", optimize=False)

        path = args.assets / spec.filename
        source = Image.open(path).convert("RGBA")
        atlas = source.copy()
        atlas.paste(template, STRIP_POSITION)
        validate_atlas(atlas, template, spec)
        atlas.save(path, format="PNG", optimize=False)
        atlases.append(atlas)
        overlays.append(overlay)

    if args.preview:
        write_preview(atlases, overlays, args.preview)
    if args.labeled_preview:
        write_labeled_preview(atlases, overlays, args.labeled_preview)
    print(f"Built {len(atlases)} clean title atlases and high-resolution overlays.")


if __name__ == "__main__":
    main()

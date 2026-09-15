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
    TitleButtons("TitleButtons-latin-american-spanish.png", "latin-american-spanish", "Latin American Spanish", "Латиноамериканская испанская"),
)

ATLAS_SIZE = (400, 655)
STRIP_POSITION = (0, 184)
STRIP_SIZE = (296, 116)
FRAME_WIDTH = 296
FRAME_HEIGHT = 58
RUNTIME_FRAME_SIZE = (888, 174)
RUNTIME_BUTTON_WIDTH = 222
BACK_SELECTED_POSITION = (300, 259)
BACK_HOVER_POSITION = (300, 287)
BACK_TEMPLATE_SIZE = (45, 28)
BACK_TEMPLATE_FRAME_SIZE = (45, 14)
RUNTIME_BACK_SIZE = (264, 108)
RUNTIME_BACK_LABEL_LEFT = 24
RUNTIME_BACK_LABEL_RIGHT = 216
RUNTIME_DEVELOPER_SIZE = (333, 180)
DEVELOPER_CARD_POSITIONS = ((171, 311), (282, 311))
DEVELOPER_LABEL_BOX = (10, 1, 102, 19)
DEVELOPER_BACKGROUND = (74, 140, 239, 255)
DEVELOPER_TEXT_COLORS = {
    (254, 254, 255, 255),
    (159, 182, 255, 255),
}
INK_COLORS = ((210, 34, 69, 255), (239, 72, 101, 255))
TITLE_VERTICAL_OFFSETS = {
    "traditional-chinese": -24,
}


def offset_overlay(overlay: Image.Image, y_offset: int) -> Image.Image:
    if y_offset == 0:
        return overlay
    shifted = Image.new("RGBA", overlay.size, (0, 0, 0, 0))
    if y_offset < 0:
        shifted.alpha_composite(
            overlay.crop((0, -y_offset, overlay.width, overlay.height)),
            (0, 0),
        )
    else:
        shifted.alpha_composite(
            overlay.crop((0, 0, overlay.width, overlay.height - y_offset)),
            (0, y_offset),
        )
    return shifted


def tint_overlay(overlay: Image.Image, color: tuple[int, int, int, int]) -> Image.Image:
    tinted = Image.new("RGBA", overlay.size, color)
    tinted.putalpha(overlay.getchannel("A"))
    return tinted


def save_if_pixels_changed(image: Image.Image, output: Path, check: bool = False) -> None:
    """Preserve canonical PNG bytes when a newer Pillow encoder changes only compression."""
    if output.exists():
        with Image.open(output) as source:
            existing = source.convert(image.mode)
        if existing.size == image.size and ImageChops.difference(existing, image).getbbox() is None:
            return
    if check:
        raise ValueError(f"Generated image differs from the canonical asset: {output}")
    image.save(output, format="PNG", optimize=False)


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
        pixels = cell.get_flattened_data() if hasattr(cell, "get_flattened_data") else cell.getdata()
        if bounds is None or sum(1 for value in pixels if value >= 24) < 100:
            raise ValueError(f"Missing title label {column + 1} for {spec.locale}")
        if bounds[0] < 5 or bounds[2] > RUNTIME_BUTTON_WIDTH - 5:
            raise ValueError(f"Title label {column + 1} touches its frame for {spec.locale}: {bounds}")


def validate_atlas(atlas: Image.Image, template: Image.Image, spec: TitleButtons) -> None:
    if atlas.size != ATLAS_SIZE:
        raise ValueError(f"Invalid atlas dimensions for {spec.filename}: {atlas.size}")
    strip = atlas.crop((STRIP_POSITION[0], STRIP_POSITION[1], STRIP_POSITION[0] + STRIP_SIZE[0], STRIP_POSITION[1] + STRIP_SIZE[1]))
    if ImageChops.difference(strip, template).getbbox() is not None:
        raise ValueError(f"Title strip is not the clean template in {spec.filename}")


def validate_back_overlay(overlay: Image.Image, spec: TitleButtons) -> None:
    if overlay.size != RUNTIME_BACK_SIZE:
        raise ValueError(f"Invalid back-overlay dimensions for {spec.locale}: {overlay.size}")
    bounds = overlay.getchannel("A").getbbox()
    if bounds is None:
        raise ValueError(f"Missing back label for {spec.locale}")
    if bounds[0] < RUNTIME_BACK_LABEL_LEFT or bounds[2] > RUNTIME_BACK_LABEL_RIGHT:
        raise ValueError(f"Back label touches its frame for {spec.locale}: {bounds}")


def validate_developer_overlay(overlay: Image.Image, spec: TitleButtons) -> None:
    if overlay.size != RUNTIME_DEVELOPER_SIZE:
        raise ValueError(f"Invalid developer-overlay dimensions for {spec.locale}: {overlay.size}")
    bounds = overlay.getchannel("A").getbbox()
    if bounds is None:
        raise ValueError(f"Missing developer label for {spec.locale}")
    if bounds[0] < 20 or bounds[2] > RUNTIME_DEVELOPER_SIZE[0] - 20:
        raise ValueError(f"Developer label touches its card for {spec.locale}: {bounds}")


def clear_back_label(atlas: Image.Image, template: Image.Image) -> None:
    width, height = BACK_TEMPLATE_FRAME_SIZE
    atlas.paste(template.crop((0, 0, width, height)), BACK_SELECTED_POSITION)
    atlas.paste(template.crop((0, height, width, height * 2)), BACK_HOVER_POSITION)


def clear_developer_labels(
    atlas: Image.Image,
    alpha_templates: tuple[Image.Image, Image.Image],
) -> None:
    left, top, right, bottom = DEVELOPER_LABEL_BOX
    pixels = atlas.load()
    for (card_x, card_y), alpha_template in zip(DEVELOPER_CARD_POSITIONS, alpha_templates):
        alpha = alpha_template.load()
        for relative_y in range(top, bottom):
            for relative_x in range(left, right):
                x = card_x + relative_x
                y = card_y + relative_y
                if alpha[relative_x, relative_y] == 0:
                    pixels[x, y] = (0, 0, 0, 0)
                elif pixels[x, y] in DEVELOPER_TEXT_COLORS:
                    pixels[x, y] = DEVELOPER_BACKGROUND


def validate_back_template(atlas: Image.Image, template: Image.Image, spec: TitleButtons) -> None:
    width, height = BACK_TEMPLATE_FRAME_SIZE
    selected = atlas.crop(
        (*BACK_SELECTED_POSITION, BACK_SELECTED_POSITION[0] + width, BACK_SELECTED_POSITION[1] + height)
    )
    hover = atlas.crop(
        (*BACK_HOVER_POSITION, BACK_HOVER_POSITION[0] + width, BACK_HOVER_POSITION[1] + height)
    )
    if ImageChops.difference(selected, template.crop((0, 0, width, height))).getbbox() is not None:
        raise ValueError(f"Selected back label was not cleared in {spec.filename}")
    if ImageChops.difference(hover, template.crop((0, height, width, height * 2))).getbbox() is not None:
        raise ValueError(f"Hover back label was not cleared in {spec.filename}")


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
    parser.add_argument("--back-template", type=Path, required=True)
    parser.add_argument("--back-labels", type=Path, required=True)
    parser.add_argument("--developer-labels", type=Path, required=True)
    parser.add_argument("--preview", type=Path)
    parser.add_argument("--labeled-preview", type=Path)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    template = Image.open(args.template).convert("RGBA")
    if template.size != STRIP_SIZE:
        raise ValueError(f"Unexpected title-button template size: {template.size}")
    label_sheet = Image.open(args.labels).convert("RGBA")
    expected_size = (RUNTIME_FRAME_SIZE[0], RUNTIME_FRAME_SIZE[1] * len(BUTTONS))
    if label_sheet.size != expected_size:
        raise ValueError(f"Unexpected title-label sheet size: {label_sheet.size}; expected {expected_size}")
    back_template = Image.open(args.back_template).convert("RGBA")
    if back_template.size != BACK_TEMPLATE_SIZE:
        raise ValueError(f"Unexpected back-button template size: {back_template.size}")
    back_label_sheet = Image.open(args.back_labels).convert("RGBA")
    expected_back_size = (RUNTIME_BACK_SIZE[0], RUNTIME_BACK_SIZE[1] * len(BUTTONS))
    if back_label_sheet.size != expected_back_size:
        raise ValueError(
            f"Unexpected back-label sheet size: {back_label_sheet.size}; expected {expected_back_size}"
        )
    developer_label_sheet = Image.open(args.developer_labels).convert("RGBA")
    expected_developer_size = (
        RUNTIME_DEVELOPER_SIZE[0],
        RUNTIME_DEVELOPER_SIZE[1] * len(BUTTONS),
    )
    if developer_label_sheet.size != expected_developer_size:
        raise ValueError(
            f"Unexpected developer-label sheet size: {developer_label_sheet.size}; "
            f"expected {expected_developer_size}"
        )

    args.overlays.mkdir(parents=True, exist_ok=True)
    developer_shape_source = Image.open(
        args.assets / "TitleButtons-romanian.png"
    ).convert("RGBA")
    developer_alpha_templates = tuple(
        developer_shape_source.crop((x, y, x + 111, y + 60)).getchannel("A")
        for x, y in DEVELOPER_CARD_POSITIONS
    )
    atlases: list[Image.Image] = []
    overlays: list[Image.Image] = []
    for index, spec in enumerate(BUTTONS):
        overlay = label_sheet.crop((0, index * RUNTIME_FRAME_SIZE[1], RUNTIME_FRAME_SIZE[0], (index + 1) * RUNTIME_FRAME_SIZE[1]))
        overlay = offset_overlay(overlay, TITLE_VERTICAL_OFFSETS.get(spec.slug, 0))
        validate_overlay(overlay, spec)
        save_if_pixels_changed(overlay, args.overlays / f"TitleLabels-{spec.slug}.png", args.check)

        back_overlay = back_label_sheet.crop(
            (
                0,
                index * RUNTIME_BACK_SIZE[1],
                RUNTIME_BACK_SIZE[0],
                (index + 1) * RUNTIME_BACK_SIZE[1],
            )
        )
        validate_back_overlay(back_overlay, spec)
        save_if_pixels_changed(back_overlay, args.overlays / f"TitleBack-{spec.slug}.png", args.check)

        developer_overlay = developer_label_sheet.crop(
            (
                0,
                index * RUNTIME_DEVELOPER_SIZE[1],
                RUNTIME_DEVELOPER_SIZE[0],
                (index + 1) * RUNTIME_DEVELOPER_SIZE[1],
            )
        )
        validate_developer_overlay(developer_overlay, spec)
        save_if_pixels_changed(
            developer_overlay,
            args.overlays / f"TitleDeveloper-{spec.slug}.png",
            args.check,
        )

        path = args.assets / spec.filename
        source = Image.open(path).convert("RGBA")
        atlas = source.copy()
        atlas.paste(template, STRIP_POSITION)
        clear_back_label(atlas, back_template)
        clear_developer_labels(atlas, developer_alpha_templates)
        validate_atlas(atlas, template, spec)
        validate_back_template(atlas, back_template, spec)
        save_if_pixels_changed(atlas, path, args.check)
        atlases.append(atlas)
        overlays.append(overlay)

    if args.preview:
        write_preview(atlases, overlays, args.preview)
    if args.labeled_preview:
        write_labeled_preview(atlases, overlays, args.labeled_preview)
    print(f"Built {len(atlases)} clean title atlases and high-resolution overlays.")


if __name__ == "__main__":
    main()

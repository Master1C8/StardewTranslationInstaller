#!/usr/bin/env python3
"""Generate every retained language button from approved pixel lettering."""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

from PIL import Image


@dataclass(frozen=True)
class LanguageButton:
    filename: str
    label: str

BUTTONS = (
    LanguageButton("button-russian.png", "РУССКИЙ VN"),
    LanguageButton("button-serbian.png", "СРПСКИ"),
    LanguageButton("button.png", "POLSKI"),
    LanguageButton("button-ukrainian.png", "УКРАЇНСЬКА"),
    LanguageButton("button-vietnamese.png", "TIẾNG VIỆT"),
    LanguageButton("button-swahili.png", "KISWAHILI"),
    LanguageButton("button-persian.png", "فارسی"),
    LanguageButton("button-arabic.png", "العربية"),
    LanguageButton("button-indonesian.png", "BAHASA INDONESIA"),
    LanguageButton("button-filipino.png", "FILIPINO"),
    LanguageButton("button-dutch.png", "NEDERLANDS"),
    LanguageButton("button-hindi.png", "हिन्दी"),
    LanguageButton("button-traditional-chinese.png", "繁體中文"),
    LanguageButton("button-romanian.png", "ROMÂNĂ"),
    LanguageButton("button-hebrew.png", "עברית"),
    LanguageButton("button-bulgarian.png", "БЪЛГАРСКИ"),
    LanguageButton("button-thai.png", "ภาษาไทย"),
    LanguageButton("button-greek.png", "ΕΛΛΗΝΙΚΑ"),
    LanguageButton("button-czech.png", "ČEŠTINA"),
)

FRAME_WIDTH = 174
FRAME_HEIGHT = 39
ATLAS_HEIGHT = FRAME_HEIGHT * 2
INK_COLORS = ((206, 82, 82, 255), (238, 116, 116, 255))


def build_button(template: Image.Image, label: Image.Image) -> Image.Image:
    result = template.copy()
    for frame, color in enumerate(INK_COLORS):
        result.paste(
            Image.new("RGBA", label.size, color),
            (0, frame * FRAME_HEIGHT),
            label,
        )
    return result


def validate_button(
    button: Image.Image, template: Image.Image, spec: LanguageButton
) -> None:
    if button.size != (FRAME_WIDTH, ATLAS_HEIGHT):
        raise ValueError(f"Invalid dimensions for {spec.filename}: {button.size}")
    for frame, color in enumerate(INK_COLORS):
        spans = []
        ink_count = 0
        for y in range(frame * FRAME_HEIGHT, (frame + 1) * FRAME_HEIGHT):
            xs = [x for x in range(FRAME_WIDTH) if button.getpixel((x, y)) == color]
            if xs:
                spans.append(max(xs) - min(xs) + 1)
                ink_count += len(xs)
        if ink_count < 10:
            raise ValueError(f"Missing label ink in {spec.filename}, frame {frame}")
        if max(spans) >= 164:
            raise ValueError(f"Solid ink band in {spec.filename}, frame {frame}")
        for y in range(frame * FRAME_HEIGHT, (frame + 1) * FRAME_HEIGHT):
            for x in range(FRAME_WIDTH):
                pixel = button.getpixel((x, y))
                if pixel != color and pixel != template.getpixel((x, y)):
                    raise ValueError(
                        f"Button art differs outside label ink in "
                        f"{spec.filename} at {x},{y}"
                    )


def write_preview(buttons: list[Image.Image], output: Path) -> None:
    scale = 3
    columns = 3
    gap = 8
    rows = (len(buttons) + columns - 1) // columns
    atlas_height = ATLAS_HEIGHT * scale
    sheet = Image.new(
        "RGB",
        (
            columns * FRAME_WIDTH * scale + (columns + 1) * gap,
            rows * atlas_height + (rows + 1) * gap,
        ),
        (0, 16, 23),
    )
    for index, button in enumerate(buttons):
        atlas = button.resize(
            (FRAME_WIDTH * scale, atlas_height), Image.Resampling.NEAREST
        )
        x = gap + (index % columns) * (FRAME_WIDTH * scale + gap)
        y = gap + (index // columns) * (atlas_height + gap)
        sheet.paste(atlas.convert("RGB"), (x, y))
    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output, format="PNG", optimize=False)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("assets", type=Path)
    parser.add_argument("--template", type=Path, required=True)
    parser.add_argument("--labels", type=Path, required=True)
    parser.add_argument("--preview", type=Path)
    args = parser.parse_args()

    template = Image.open(args.template).convert("RGBA")
    if template.size != (FRAME_WIDTH, ATLAS_HEIGHT):
        raise ValueError(f"Unexpected language-button template size: {template.size}")
    labels = Image.open(args.labels).convert("L")
    expected_label_size = (FRAME_WIDTH, FRAME_HEIGHT * len(BUTTONS))
    if labels.size != expected_label_size:
        raise ValueError(
            f"Unexpected language-button label atlas size: {labels.size}; "
            f"expected {expected_label_size}"
        )
    label_frames = [
        labels.crop((0, index * FRAME_HEIGHT, FRAME_WIDTH, (index + 1) * FRAME_HEIGHT))
        for index in range(len(BUTTONS))
    ]
    rendered = [build_button(template, label) for label in label_frames]
    for spec, button in zip(BUTTONS, rendered):
        validate_button(button, template, spec)
        button.save(args.assets / spec.filename, format="PNG", optimize=False)
    # Keep the historical alias byte-identical even though content.json uses button.png.
    rendered[2].save(args.assets / "button-polish.png", format="PNG", optimize=False)
    if args.preview:
        write_preview(rendered, args.preview)


if __name__ == "__main__":
    main()

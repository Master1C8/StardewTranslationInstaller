#!/usr/bin/env python3
"""Generate retained title menus from owner-approved pixel lettering."""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

from PIL import Image


@dataclass(frozen=True)
class TitleButtons:
    filename: str
    locale: str


BUTTONS = (
    TitleButtons("TitleButtons-russian.png", "Russian"),
    TitleButtons("TitleButtons-serbian.png", "Serbian"),
    TitleButtons("TitleButtons.png", "Polish"),
    TitleButtons("TitleButtons-ukrainian.png", "Ukrainian"),
    TitleButtons("TitleButtons-vietnamese.png", "Vietnamese"),
    TitleButtons("TitleButtons-swahili.png", "Swahili"),
    TitleButtons("TitleButtons-persian.png", "Persian"),
    TitleButtons("TitleButtons-arabic.png", "Arabic"),
    TitleButtons("TitleButtons-indonesian.png", "Indonesian"),
    TitleButtons("TitleButtons-filipino.png", "Filipino"),
    TitleButtons("TitleButtons-dutch.png", "Dutch"),
    TitleButtons("TitleButtons-hindi.png", "Hindi"),
    TitleButtons("TitleButtons-traditional-chinese.png", "Traditional Chinese"),
    TitleButtons("TitleButtons-romanian.png", "Romanian"),
    TitleButtons("TitleButtons-hebrew.png", "Hebrew"),
    TitleButtons("TitleButtons-bulgarian.png", "Bulgarian"),
    TitleButtons("TitleButtons-thai.png", "Thai"),
    TitleButtons("TitleButtons-greek.png", "Greek"),
    TitleButtons("TitleButtons-czech.png", "Czech"),
)

ATLAS_SIZE = (400, 655)
STRIP_POSITION = (0, 184)
STRIP_SIZE = (296, 116)
FRAME_WIDTH = 296
FRAME_HEIGHT = 58
BUTTON_WIDTH = 74
INK_COLORS = ((206, 82, 82, 255), (239, 115, 115, 255))


def build_atlas(source: Image.Image, template: Image.Image, labels: Image.Image) -> Image.Image:
    result = source.copy()
    result.paste(template, STRIP_POSITION)
    for state, color in enumerate(INK_COLORS):
        result.paste(
            Image.new("RGBA", labels.size, color),
            (STRIP_POSITION[0], STRIP_POSITION[1] + state * FRAME_HEIGHT),
            labels,
        )
    return result


def validate_labels(labels: Image.Image, spec: TitleButtons) -> None:
    if labels.size != (FRAME_WIDTH, FRAME_HEIGHT):
        raise ValueError(f"Invalid label strip dimensions for {spec.locale}: {labels.size}")
    if any(value not in (0, 255) for value in labels.getdata()):
        raise ValueError(f"Antialiased source mask for {spec.locale}")
    for column in range(4):
        cell = labels.crop(
            (column * BUTTON_WIDTH, 0, (column + 1) * BUTTON_WIDTH, FRAME_HEIGHT)
        )
        bounds = cell.getbbox()
        if bounds is None or sum(1 for value in cell.getdata() if value) < 12:
            raise ValueError(f"Missing title label {column + 1} for {spec.locale}")
        if bounds[0] < 2 or bounds[2] > BUTTON_WIDTH - 2:
            raise ValueError(
                f"Title label {column + 1} touches its frame for {spec.locale}: {bounds}"
            )


def validate_atlas(
    atlas: Image.Image,
    template: Image.Image,
    labels: Image.Image,
    spec: TitleButtons,
) -> None:
    if atlas.size != ATLAS_SIZE:
        raise ValueError(f"Invalid atlas dimensions for {spec.filename}: {atlas.size}")
    strip = atlas.crop(
        (
            STRIP_POSITION[0],
            STRIP_POSITION[1],
            STRIP_POSITION[0] + STRIP_SIZE[0],
            STRIP_POSITION[1] + STRIP_SIZE[1],
        )
    )
    for state, color in enumerate(INK_COLORS):
        for y in range(FRAME_HEIGHT):
            for x in range(FRAME_WIDTH):
                actual = strip.getpixel((x, y + state * FRAME_HEIGHT))
                original = template.getpixel((x, y + state * FRAME_HEIGHT))
                if labels.getpixel((x, y)):
                    if actual != color:
                        raise ValueError(
                            f"Wrong label color in {spec.filename} at {x},{y}"
                        )
                elif actual != original:
                    raise ValueError(
                        f"Frame art changed in {spec.filename} at {x},{y}"
                    )


def write_preview(atlases: list[Image.Image], output: Path) -> None:
    scale = 3
    gap = 8
    state_width = STRIP_SIZE[0] * scale
    height = FRAME_HEIGHT * scale
    sheet = Image.new(
        "RGB",
        (
            state_width * 2 + gap * 3,
            len(atlases) * height + (len(atlases) + 1) * gap,
        ),
        (0, 16, 23),
    )
    for index, atlas in enumerate(atlases):
        for state in range(2):
            state_top = STRIP_POSITION[1] + state * FRAME_HEIGHT
            strip = atlas.crop((0, state_top, FRAME_WIDTH, state_top + FRAME_HEIGHT))
            strip = strip.resize((state_width, height), Image.Resampling.NEAREST)
            sheet.paste(
                strip.convert("RGB"),
                (gap + state * (state_width + gap), gap + index * (height + gap)),
            )
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
    if template.size != STRIP_SIZE:
        raise ValueError(f"Unexpected title-button template size: {template.size}")
    label_sheet = Image.open(args.labels).convert("L")
    expected_size = (FRAME_WIDTH, FRAME_HEIGHT * len(BUTTONS))
    if label_sheet.size != expected_size:
        raise ValueError(
            f"Unexpected title-label sheet size: {label_sheet.size}; expected {expected_size}"
        )

    atlases = []
    for index, spec in enumerate(BUTTONS):
        labels = label_sheet.crop(
            (0, index * FRAME_HEIGHT, FRAME_WIDTH, (index + 1) * FRAME_HEIGHT)
        )
        validate_labels(labels, spec)
        path = args.assets / spec.filename
        source = Image.open(path).convert("RGBA")
        atlas = build_atlas(source, template, labels)
        validate_atlas(atlas, template, labels, spec)
        atlas.save(path, format="PNG", optimize=False)
        atlases.append(atlas)

    if args.preview:
        write_preview(atlases, args.preview)
    print(f"Built and validated {len(atlases)} localized title-button atlases.")


if __name__ == "__main__":
    main()

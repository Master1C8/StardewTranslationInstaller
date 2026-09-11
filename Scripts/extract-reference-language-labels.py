#!/usr/bin/env python3
"""Extract the exact language-selector lettering from the approved references.

The two source screenshots are design references supplied by the project owner.
This script reduces their lettering to native 174x39 monochrome masks. The
resulting atlas is committed so normal builds don't depend on external files.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

from PIL import Image


@dataclass(frozen=True)
class LabelCrop:
    filename: str
    page: int
    box: tuple[int, int, int, int]


# Tight crops intentionally exclude the decorative parchment pixels around the
# labels. Coordinates refer to the owner's 1774x887 reference PNGs.
LABELS = (
    LabelCrop("button-russian.png", 1, (140, 220, 525, 306)),
    LabelCrop("button-serbian.png", 1, (750, 220, 1060, 306)),
    LabelCrop("button.png", 1, (1335, 220, 1605, 306)),
    LabelCrop("button-ukrainian.png", 1, (130, 354, 535, 445)),
    LabelCrop("button-vietnamese.png", 1, (705, 354, 1090, 445)),
    LabelCrop("button-swahili.png", 1, (1280, 354, 1640, 445)),
    LabelCrop("button-persian.png", 1, (205, 490, 470, 590)),
    LabelCrop("button-arabic.png", 1, (770, 490, 1040, 590)),
    LabelCrop("button-indonesian.png", 1, (1210, 490, 1710, 590)),
    LabelCrop("button-filipino.png", 1, (160, 625, 500, 715)),
    LabelCrop("button-dutch.png", 1, (675, 625, 1115, 715)),
    LabelCrop("button-hindi.png", 1, (1330, 625, 1625, 715)),
    LabelCrop("button-traditional-chinese.png", 2, (195, 230, 480, 322)),
    LabelCrop("button-romanian.png", 2, (745, 230, 1060, 322)),
    LabelCrop("button-hebrew.png", 2, (1360, 230, 1620, 322)),
    LabelCrop("button-bulgarian.png", 2, (130, 372, 535, 458)),
    LabelCrop("button-thai.png", 2, (735, 372, 1080, 458)),
    LabelCrop("button-greek.png", 2, (1285, 372, 1660, 458)),
    LabelCrop("button-czech.png", 2, (195, 507, 500, 598)),
)

NATIVE_WIDTH = 174
NATIVE_HEIGHT = 39
REFERENCE_SCALE = 3.1
REDUCTION_THRESHOLD = 224


def red_ink_mask(crop: Image.Image) -> Image.Image:
    """Select the rose-red lettering while rejecting parchment and wood."""
    source = crop.convert("RGB")
    mask = Image.new("L", source.size, 0)
    source_pixels = source.load()
    mask_pixels = mask.load()
    for y in range(source.height):
        for x in range(source.width):
            red, green, blue = source_pixels[x, y]
            if red >= 150 and green <= 150 and blue <= 150 and red - green >= 35:
                mask_pixels[x, y] = 255
    return mask


def component_boxes(mask: Image.Image) -> list[tuple[int, tuple[int, int, int, int]]]:
    pixels = mask.load()
    seen: set[tuple[int, int]] = set()
    components: list[tuple[int, tuple[int, int, int, int]]] = []
    for start_y in range(mask.height):
        for start_x in range(mask.width):
            if pixels[start_x, start_y] == 0 or (start_x, start_y) in seen:
                continue
            stack = [(start_x, start_y)]
            seen.add((start_x, start_y))
            count = 0
            min_x = max_x = start_x
            min_y = max_y = start_y
            while stack:
                x, y = stack.pop()
                count += 1
                min_x = min(min_x, x)
                max_x = max(max_x, x)
                min_y = min(min_y, y)
                max_y = max(max_y, y)
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if (
                        0 <= nx < mask.width
                        and 0 <= ny < mask.height
                        and pixels[nx, ny] != 0
                        and (nx, ny) not in seen
                    ):
                        seen.add((nx, ny))
                        stack.append((nx, ny))
            components.append((count, (min_x, min_y, max_x + 1, max_y + 1)))
    return components


def clean_mask(mask: Image.Image) -> Image.Image:
    """Remove isolated parchment speckles without losing accents or dots."""
    cleaned = Image.new("L", mask.size, 0)
    for area, box in component_boxes(mask):
        width = box[2] - box[0]
        height = box[3] - box[1]
        touches_crop_edge = (
            box[0] == 0
            or box[1] == 0
            or box[2] == mask.width
            or box[3] == mask.height
        )
        if area >= 70 and not touches_crop_edge and (width >= 3 or height >= 3):
            cleaned.paste(mask.crop(box), box)
    return cleaned


def native_mask(source: Image.Image, spec: LabelCrop) -> Image.Image:
    mask = clean_mask(red_ink_mask(source.crop(spec.box)))
    bounds = mask.getbbox()
    if bounds is None:
        raise ValueError(f"No lettering found for {spec.filename}")
    mask = mask.crop(bounds)
    target_size = (
        max(1, round(mask.width / REFERENCE_SCALE)),
        max(1, round(mask.height / REFERENCE_SCALE)),
    )
    # Area reduction preserves the amount of ink in each native pixel. A high
    # coverage threshold keeps the small counters and stroke gaps visible once
    # Stardew scales the atlas with nearest-neighbour sampling.
    reduced = mask.resize(target_size, Image.Resampling.BOX)
    reduced = reduced.point(
        lambda value: 255 if value >= REDUCTION_THRESHOLD else 0
    )
    if reduced.width > 155 or reduced.height > 28:
        raise ValueError(
            f"Extracted label is too large for {spec.filename}: {reduced.size}"
        )
    frame = Image.new("L", (NATIVE_WIDTH, NATIVE_HEIGHT), 0)
    frame.paste(
        reduced,
        ((NATIVE_WIDTH - reduced.width) // 2, (NATIVE_HEIGHT - reduced.height) // 2),
    )
    return frame


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("page_one", type=Path)
    parser.add_argument("page_two", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    pages = {
        1: Image.open(args.page_one).convert("RGB"),
        2: Image.open(args.page_two).convert("RGB"),
    }
    for page, image in pages.items():
        if image.size != (1774, 887):
            raise ValueError(f"Unexpected page {page} reference size: {image.size}")

    atlas = Image.new("L", (NATIVE_WIDTH, NATIVE_HEIGHT * len(LABELS)), 0)
    for index, spec in enumerate(LABELS):
        atlas.paste(native_mask(pages[spec.page], spec), (0, index * NATIVE_HEIGHT))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(args.output, format="PNG", optimize=False)


if __name__ == "__main__":
    main()

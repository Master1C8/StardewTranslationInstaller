#!/usr/bin/env python3
"""Extract main-menu lettering from the owner's approved visual reference.

The source image is a presentation sheet, not a game asset.  This script keeps
only its rose-red lettering, normalizes each of the 19 rows back to Stardew's
native four-button strip, and writes monochrome masks.  Frame art and icons are
always supplied separately from the original game-derived template.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


REFERENCE_SIZE = (977, 1610)
CELL_SIZE = (74, 58)
COLUMN_BOUNDS = ((5, 138), (142, 280), (284, 420), (425, 559))
ROW_BOUNDS = (
    (5, 82),
    (86, 161),
    (164, 241),
    (246, 324),
    (328, 406),
    (411, 488),
    (493, 571),
    (575, 653),
    (657, 737),
    (742, 820),
    (825, 902),
    (906, 984),
    (989, 1067),
    (1072, 1150),
    (1154, 1233),
    (1237, 1316),
    (1320, 1399),
    (1404, 1485),
    (1489, 1572),
)
TRADITIONAL_CHINESE_INDEX = 12
REDUCTION_THRESHOLD = 96


def is_label_ink(pixel: tuple[int, int, int]) -> bool:
    red, green, blue = pixel
    return (
        red >= 160
        and green <= 135
        and red - green >= 70
        and blue - green >= 8
    )


def component_boxes(mask: Image.Image) -> list[tuple[int, tuple[int, int, int, int]]]:
    pixels = mask.load()
    remaining = {
        (x, y)
        for y in range(mask.height)
        for x in range(mask.width)
        if pixels[x, y]
    }
    components: list[tuple[int, tuple[int, int, int, int]]] = []
    while remaining:
        start = remaining.pop()
        stack = [start]
        points = [start]
        while stack:
            x, y = stack.pop()
            for neighbor in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if neighbor in remaining:
                    remaining.remove(neighbor)
                    stack.append(neighbor)
                    points.append(neighbor)
        xs = [point[0] for point in points]
        ys = [point[1] for point in points]
        components.append(
            (len(points), (min(xs), min(ys), max(xs) + 1, max(ys) + 1))
        )
    return components


def extract_cell(
    reference: Image.Image,
    row_index: int,
    row_box: tuple[int, int],
    column_box: tuple[int, int],
) -> Image.Image:
    left, right = column_box
    top, bottom = row_box
    source = reference.crop((left, top, right, bottom))
    mask = Image.new("L", source.size, 0)
    source_pixels = source.load()
    mask_pixels = mask.load()
    for y in range(6, source.height - 5):
        for x in range(5, source.width - 5):
            if is_label_ink(source_pixels[x, y]):
                mask_pixels[x, y] = 255

    cleaned = Image.new("L", source.size, 0)
    for area, box in component_boxes(mask):
        # Tiny isolated pixels belong to the generated parchment texture.
        if area < 4:
            continue
        # The radish icon uses the same rose hue as the labels.  It is always a
        # separate component below the lettering; the oversized Chinese glyphs
        # intentionally extend farther down and therefore keep this exception.
        if row_index != TRADITIONAL_CHINESE_INDEX and box[1] >= 54:
            continue
        cleaned.paste(mask.crop(box), box)

    normalized = cleaned.resize(CELL_SIZE, Image.Resampling.BOX)
    normalized = normalized.point(
        lambda value: 255 if value >= REDUCTION_THRESHOLD else 0
    )
    bounds = normalized.getbbox()
    if bounds is None:
        raise ValueError(
            f"No label pixels found in row {row_index + 1}, "
            f"column {COLUMN_BOUNDS.index(column_box) + 1}"
        )
    if bounds[0] < 2 or bounds[2] > CELL_SIZE[0] - 2:
        raise ValueError(
            f"Label touches horizontal frame in row {row_index + 1}: {bounds}"
        )
    return normalized


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("reference", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    reference = Image.open(args.reference).convert("RGB")
    if reference.size != REFERENCE_SIZE:
        raise ValueError(
            f"Unexpected reference size: {reference.size}; expected {REFERENCE_SIZE}"
        )

    output = Image.new("L", (CELL_SIZE[0] * 4, CELL_SIZE[1] * len(ROW_BOUNDS)), 0)
    for row_index, row_box in enumerate(ROW_BOUNDS):
        for column_index, column_box in enumerate(COLUMN_BOUNDS):
            cell = extract_cell(reference, row_index, row_box, column_box)
            output.paste(
                cell,
                (column_index * CELL_SIZE[0], row_index * CELL_SIZE[1]),
            )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    output.save(args.output, format="PNG", optimize=False)
    print(f"Extracted {len(ROW_BOUNDS) * len(COLUMN_BOUNDS)} title labels.")


if __name__ == "__main__":
    main()

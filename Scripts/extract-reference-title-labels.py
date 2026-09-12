#!/usr/bin/env python3
"""Extract high-resolution main-menu lettering from the approved reference.

Stardew's TitleButtons atlas stores each button in only 74x58 pixels and scales
it with point sampling. Baking text into that atlas therefore turns every
letter edge into a large square. The generated sheet here is three times the
native size and is drawn by the shared SMAPI helper directly at screen scale.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageFilter


REFERENCE_SIZE = (977, 1610)
CELL_SIZE = (222, 174)
COLUMN_BOUNDS = ((5, 138), (142, 280), (284, 420), (425, 559))
ROW_BOUNDS = (
    (5, 82), (86, 161), (164, 241), (246, 324), (328, 406),
    (411, 488), (493, 571), (575, 653), (657, 737), (742, 820),
    (825, 902), (906, 984), (989, 1067), (1072, 1150), (1154, 1233),
    (1237, 1316), (1320, 1399), (1404, 1485), (1489, 1572),
)
TRADITIONAL_CHINESE_INDEX = 12


def is_label_ink(pixel: tuple[int, int, int]) -> bool:
    red, green, blue = pixel
    return red >= 160 and green <= 135 and red - green >= 70 and blue - green >= 8


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
        components.append((len(points), (min(xs), min(ys), max(xs) + 1, max(ys) + 1)))
    return components


def extract_cell(reference: Image.Image, row_index: int, row_box: tuple[int, int], column_box: tuple[int, int]) -> Image.Image:
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
    cleaned_pixels = cleaned.load()
    for area, box in component_boxes(mask):
        if area < 4:
            continue
        if row_index != TRADITIONAL_CHINESE_INDEX and box[1] >= 54:
            continue
        # The hard mask identifies the intended glyph component. Recover its
        # original antialiasing from red/green colour separation inside a tiny
        # padded box instead of turning the whole component into square pixels.
        box_left = max(0, box[0] - 2)
        box_top = max(0, box[1] - 2)
        box_right = min(source.width, box[2] + 2)
        box_bottom = min(source.height, box[3] + 2)
        for y in range(box_top, box_bottom):
            for x in range(box_left, box_right):
                red, green, _ = source_pixels[x, y]
                value = max(0, min(255, round((red - green - 52) * 2.5)))
                cleaned_pixels[x, y] = max(cleaned_pixels[x, y], value)

    scale = CELL_SIZE[0] / source.width
    rendered_height = max(1, round(source.height * scale))
    cleaned = cleaned.filter(ImageFilter.GaussianBlur(0.18))
    rendered = cleaned.resize((CELL_SIZE[0], rendered_height), Image.Resampling.LANCZOS)
    rendered = rendered.point(lambda value: min(255, round(value * 1.18)))
    # LANCZOS creates a few nearly transparent ringing pixels around isolated
    # strokes. They become visible as red dust over the parchment, so discard
    # only that sub-visible fringe while preserving the antialiased edge.
    rendered = rendered.point(lambda value: 0 if value < 18 else value)

    alpha = Image.new("L", CELL_SIZE, 0)
    alpha.paste(rendered, (0, (CELL_SIZE[1] - rendered_height) // 2))
    bounds = alpha.getbbox()
    if bounds is None:
        raise ValueError(f"No label pixels found in row {row_index + 1}")
    if bounds[0] < 5 or bounds[2] > CELL_SIZE[0] - 5:
        raise ValueError(f"Label touches horizontal frame in row {row_index + 1}: {bounds}")

    cell = Image.new("RGBA", CELL_SIZE, (255, 255, 255, 0))
    cell.putalpha(alpha)
    return cell


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("reference", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    reference = Image.open(args.reference).convert("RGB")
    if reference.size != REFERENCE_SIZE:
        raise ValueError(f"Unexpected reference size: {reference.size}; expected {REFERENCE_SIZE}")

    output = Image.new("RGBA", (CELL_SIZE[0] * 4, CELL_SIZE[1] * len(ROW_BOUNDS)), (255, 255, 255, 0))
    for row_index, row_box in enumerate(ROW_BOUNDS):
        for column_index, column_box in enumerate(COLUMN_BOUNDS):
            cell = extract_cell(reference, row_index, row_box, column_box)
            output.alpha_composite(cell, (column_index * CELL_SIZE[0], row_index * CELL_SIZE[1]))

    args.output.parent.mkdir(parents=True, exist_ok=True)
    output.save(args.output, format="PNG", optimize=False)
    print(f"Extracted {len(ROW_BOUNDS) * len(COLUMN_BOUNDS)} high-resolution title labels.")


if __name__ == "__main__":
    main()

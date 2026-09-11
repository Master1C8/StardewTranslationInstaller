#!/usr/bin/python3
"""Recover the text-free main-menu button strip from official title atlases."""

from __future__ import annotations

import argparse
from collections import Counter
from pathlib import Path

from PIL import Image


ATLAS_SIZE = (400, 655)
STRIP_BOX = (0, 184, 296, 300)
LABEL_BOXES = (
    (6, 14, 65, 38),
    (80, 14, 139, 38),
    (154, 14, 213, 38),
    (228, 14, 287, 38),
)
INK_COLORS = ((206, 82, 82, 255), (239, 115, 115, 255))
BACKGROUND_COLORS = ((255, 215, 137, 255), (255, 255, 192, 255))
STATE_OFFSET = 58


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("output", type=Path)
    parser.add_argument("atlases", type=Path, nargs="+")
    args = parser.parse_args()

    atlases = [Image.open(path).convert("RGBA") for path in args.atlases]
    if len(atlases) < 2:
        raise ValueError("At least two official localized atlases are required")
    for path, atlas in zip(args.atlases, atlases):
        if atlas.size != ATLAS_SIZE:
            raise ValueError(f"Unexpected TitleButtons atlas size for {path}: {atlas.size}")

    strips = [atlas.crop(STRIP_BOX) for atlas in atlases]
    result = strips[0].copy()
    missing = 0
    for state, (ink, background) in enumerate(zip(INK_COLORS, BACKGROUND_COLORS)):
        offset_y = state * STATE_OFFSET
        for left, top, right, bottom in LABEL_BOXES:
            for y in range(top + offset_y, bottom + offset_y):
                for x in range(left, right):
                    candidates = [strip.getpixel((x, y)) for strip in strips]
                    candidates = [color for color in candidates if color != ink]
                    if candidates:
                        color = Counter(candidates).most_common(1)[0][0]
                    else:
                        color = background
                        missing += 1
                    result.putpixel((x, y), color)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    result.save(args.output, format="PNG", optimize=False)
    print(f"Recovered title-button strip from {len(atlases)} atlases; fallback pixels: {missing}")


if __name__ == "__main__":
    main()

#!/usr/bin/python3
"""Recover text-free normal/hover buttons from Stardew's LanguageButtons atlas."""

from __future__ import annotations

import argparse
from collections import Counter
from pathlib import Path

from PIL import Image


FRAME_WIDTH = 174
FRAME_HEIGHT = 39
NORMAL_ROWS = (0, 78, 156, 234, 312, 390, 468)
HOVER_ROWS = (39, 117, 195, 273, 351, 429, 507)
INK_COLORS = ((206, 82, 82, 255), (238, 116, 116, 255))


def frames(atlas: Image.Image, rows: tuple[int, ...]) -> list[Image.Image]:
    result = []
    for y in rows:
        result.append(atlas.crop((0, y, FRAME_WIDTH, y + FRAME_HEIGHT)))
        if y < 390:
            result.append(
                atlas.crop((FRAME_WIDTH, y, FRAME_WIDTH * 2, y + FRAME_HEIGHT))
            )
    return result


def recover_background(samples: list[Image.Image], ink: tuple[int, ...]) -> Image.Image:
    result = Image.new("RGBA", (FRAME_WIDTH, FRAME_HEIGHT))
    for y in range(FRAME_HEIGHT):
        for x in range(FRAME_WIDTH):
            candidates = [sample.getpixel((x, y)) for sample in samples]
            candidates = [color for color in candidates if color != ink]
            if not candidates:
                raise ValueError(f"No clean source pixel at {x},{y}")
            result.putpixel((x, y), Counter(candidates).most_common(1)[0][0])
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("atlas", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    atlas = Image.open(args.atlas).convert("RGBA")
    if atlas.size != (348, 546):
        raise ValueError(f"Unexpected original LanguageButtons atlas: {atlas.size}")
    normal = recover_background(frames(atlas, NORMAL_ROWS), INK_COLORS[0])
    hover = recover_background(frames(atlas, HOVER_ROWS), INK_COLORS[1])
    result = Image.new("RGBA", (FRAME_WIDTH, FRAME_HEIGHT * 2))
    result.paste(normal, (0, 0))
    result.paste(hover, (0, FRAME_HEIGHT))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    result.save(args.output, format="PNG", optimize=False)


if __name__ == "__main__":
    main()

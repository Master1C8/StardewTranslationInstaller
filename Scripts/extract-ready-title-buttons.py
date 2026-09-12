#!/usr/bin/env python3
"""Extract the 19 ready 888x174 title-menu rows without resampling them."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageChops


SOURCE_SIZE = (1394, 3306)
BUTTON_SHEET_SIZE = (888, 3306)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    source = Image.open(args.source)
    if source.size != SOURCE_SIZE:
        raise ValueError(f"Unexpected source size: {source.size}; expected {SOURCE_SIZE}")
    if source.mode not in ("RGB", "RGBA"):
        raise ValueError(f"Unexpected source colour mode: {source.mode}")

    buttons = source.crop((0, 0, BUTTON_SHEET_SIZE[0], BUTTON_SHEET_SIZE[1]))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    buttons.save(args.output, format="PNG", optimize=False)

    saved = Image.open(args.output)
    if saved.size != BUTTON_SHEET_SIZE or saved.mode != buttons.mode:
        raise ValueError("Saved title-button sheet changed dimensions or colour mode")
    if ImageChops.difference(saved, buttons).getbbox() is not None:
        raise ValueError("Saved title-button sheet changed source pixels")

    print("Extracted 19 ready 888x174 title-menu rows without resampling.")


if __name__ == "__main__":
    main()

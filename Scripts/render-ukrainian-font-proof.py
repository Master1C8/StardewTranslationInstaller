#!/usr/bin/env python3
"""Render a visual proof directly from unpacked Stardew SpriteFont resources."""

import json
from pathlib import Path
import sys

from PIL import Image


if len(sys.argv) != 3:
    raise SystemExit("Usage: render-ukrainian-font-proof.py <unpacked-fonts> <output.png>")

source = Path(sys.argv[1])
output = Path(sys.argv[2])
lines = [
    "АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ",
    "абвгґдеєжзиіїйклмнопрстуфхцчшщьюя",
    "Їжак ґречно їсть цю юшку. Єнот п’є чай.",
    "’ʼ «» – — … № 0123456789",
]


def render_font(name: str) -> Image.Image:
    document = json.loads((source / f"{name}.json").read_text())
    content = document["content"]
    atlas = Image.open(source / content["texture"]["export"]).convert("RGBA")
    index = {character: position for position, character in enumerate(content["characterMap"])}
    line_spacing = content["verticalLineSpacing"]
    spacing = content["horizontalSpacing"]
    width = 20
    for text in lines:
        width = max(width, 20 + sum(
            sum(content["kerning"][index[character]].values()) + spacing
            for character in text
        ))
    image = Image.new("RGBA", (width, 20 + line_spacing * len(lines)), (31, 37, 48, 255))
    for row, text in enumerate(lines):
        pen_x = 10
        line_y = 10 + row * line_spacing
        for character in text:
            position = index[character]
            glyph = content["glyphs"][position]
            crop = content["cropping"][position]
            kerning = content["kerning"][position]
            tile = atlas.crop((glyph["x"], glyph["y"], glyph["x"] + glyph["width"], glyph["y"] + glyph["height"]))
            image.alpha_composite(tile, (round(pen_x + crop["x"]), round(line_y + crop["y"])))
            pen_x += kerning["x"] + kerning["y"] + kerning["z"] + spacing
    return image


panels = [render_font("SpriteFont1"), render_font("SmallFont")]
width = max(panel.width for panel in panels)
height = sum(panel.height for panel in panels) + 12
proof = Image.new("RGBA", (width, height), (18, 22, 30, 255))
y = 0
for panel in panels:
    proof.alpha_composite(panel, (0, y))
    y += panel.height + 12
proof = proof.resize((proof.width * 2, proof.height * 2), Image.Resampling.NEAREST)
output.parent.mkdir(parents=True, exist_ok=True)
proof.save(output, format="PNG", optimize=False)

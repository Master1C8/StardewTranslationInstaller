#!/usr/bin/env python3
"""Build the Dutch language-button atlas from an existing VN button atlas."""

from pathlib import Path
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont


if len(sys.argv) != 3:
    raise SystemExit("Usage: generate-dutch-button.py <source-button.png> <output.png>")

source_path = Path(sys.argv[1])
output_path = Path(sys.argv[2])
font_path = Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")
button = Image.open(source_path).convert("RGBA")
if button.size != (174, 78):
    raise SystemExit(f"Unexpected language-button atlas size: {button.size}")
pixels = button.load()


def clear_label(y0: int, y1: int) -> None:
    mask = Image.new("L", button.size, 0)
    mask_pixels = mask.load()
    for y in range(y0, y1):
        for x in range(24, 150):
            red, green, blue, alpha = pixels[x, y]
            if alpha and red >= 150 and red - green >= 35 and red - blue >= 30:
                mask_pixels[x, y] = 255
    mask = mask.filter(ImageFilter.MaxFilter(3))
    mask_pixels = mask.load()
    for y in range(y0, y1):
        left = tuple(sum(button.getpixel((x, y))[c] for x in range(24, 32)) // 8 for c in range(4))
        right = tuple(sum(button.getpixel((x, y))[c] for x in range(142, 150)) // 8 for c in range(4))
        for x in range(24, 150):
            if mask_pixels[x, y]:
                amount = (x - 24) / 125
                pixels[x, y] = tuple(round(left[c] * (1 - amount) + right[c] * amount) for c in range(4))


clear_label(5, 33)
clear_label(44, 72)
font = ImageFont.truetype(str(font_path), 15)
bounds = ImageDraw.Draw(Image.new("L", (256, 48))).textbbox((0, 0), "NEDERLANDS VN", font=font)
label = Image.new("L", (bounds[2] - bounds[0], bounds[3] - bounds[1]), 0)
ImageDraw.Draw(label).text((-bounds[0], -bounds[1]), "NEDERLANDS VN", font=font, fill=255)
label = label.point(lambda value: 255 if value >= 96 else 0)
for center_y, color in ((19, (206, 82, 82, 255)), (58, (239, 115, 115, 255))):
    x = (button.width - label.width) // 2
    y = center_y - label.height // 2
    button.paste(Image.new("RGBA", label.size, color), (x, y), label)

output_path.parent.mkdir(parents=True, exist_ok=True)
button.save(output_path, format="PNG", optimize=False)

#!/usr/bin/env python3
"""Build the Ukrainian language button from an existing VN Revival atlas."""

from pathlib import Path
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont


if len(sys.argv) != 3:
    raise SystemExit(
        "Usage: generate-ukrainian-button.py <source-LanguageButtons.png> <output.png>"
    )

source_path = Path(sys.argv[1])
output_path = Path(sys.argv[2])
font_path = Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")
source = Image.open(source_path).convert("RGBA")
if source.width < 174 or source.height < 78:
    raise SystemExit(f"Unexpected LanguageButtons atlas size: {source.size}")

button = source.crop((0, 0, 174, 78))
pixels = button.load()


def clear_label(y0: int, y1: int) -> None:
    mask = Image.new("L", button.size, 0)
    mask_pixels = mask.load()
    for y in range(y0, y1):
        for x in range(20, 154):
            red, green, blue, alpha = pixels[x, y]
            if alpha and red >= 150 and red - green >= 35 and red - blue >= 30:
                mask_pixels[x, y] = 255
    mask = mask.filter(ImageFilter.MaxFilter(3))
    mask_pixels = mask.load()

    for y in range(y0, y1):
        left = tuple(
            sum(button.getpixel((x, y))[channel] for x in range(20, 28)) // 8
            for channel in range(4)
        )
        right = tuple(
            sum(button.getpixel((x, y))[channel] for x in range(146, 154)) // 8
            for channel in range(4)
        )
        for x in range(20, 154):
            if mask_pixels[x, y]:
                amount = (x - 20) / 133
                pixels[x, y] = tuple(
                    round(left[channel] * (1 - amount) + right[channel] * amount)
                    for channel in range(4)
                )


clear_label(5, 33)
clear_label(44, 72)


def render_label(max_width: int = 138, max_height: int = 18) -> Image.Image:
    text = "УКРАЇНСЬКА VN"
    size = 18
    while True:
        font = ImageFont.truetype(str(font_path), size)
        probe = Image.new("L", (256, 48), 0)
        draw = ImageDraw.Draw(probe)
        bounds = draw.textbbox((0, 0), text, font=font)
        width = bounds[2] - bounds[0]
        height = bounds[3] - bounds[1]
        if (width <= max_width and height <= max_height) or size == 8:
            mask = Image.new("L", (width, height), 0)
            ImageDraw.Draw(mask).text((-bounds[0], -bounds[1]), text, font=font, fill=255)
            return mask.point(lambda value: 255 if value >= 96 else 0)
        size -= 1


label = render_label()
for center_y, color in ((19, (206, 82, 82, 255)), (58, (239, 115, 115, 255))):
    x = (button.width - label.width) // 2
    y = center_y - label.height // 2
    layer = Image.new("RGBA", label.size, color)
    button.paste(layer, (x, y), label)

output_path.parent.mkdir(parents=True, exist_ok=True)
button.save(output_path, format="PNG", optimize=False)

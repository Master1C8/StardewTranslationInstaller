#!/usr/bin/env python3
"""Build the Amharic language button from the current English game atlas."""

from pathlib import Path
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont


if len(sys.argv) != 4:
    raise SystemExit(
        "Usage: generate-amharic-button.py <english-LanguageButtons.png> "
        "<NotoSansEthiopic-Bold.ttf> <output.png>"
    )

source_path = Path(sys.argv[1])
font_path = Path(sys.argv[2])
output_path = Path(sys.argv[3])

source = Image.open(source_path).convert("RGBA")
if source.width < 174 or source.height < 78:
    raise SystemExit(f"Unexpected LanguageButtons atlas size: {source.size}")

# The first two English frames are the normal and hover versions of the same
# 174x39 button used by custom-language textures. Keep their frame, parchment,
# shading, and wood noise directly from the English asset.
button = source.crop((0, 0, 174, 78))
pixels = button.load()


def clear_english_label(y0: int, y1: int) -> None:
    mask = Image.new("L", button.size, 0)
    mask_pixels = mask.load()
    for y in range(y0, y1):
        for x in range(24, 150):
            red, green, blue, alpha = pixels[x, y]
            if alpha and red >= 150 and red - green >= 35 and red - blue >= 30:
                mask_pixels[x, y] = 255
    mask = mask.filter(ImageFilter.MaxFilter(3))
    mask_pixels = mask.load()

    # Fill only the old lettering with a row-wise interpolation between clean
    # parchment samples. This preserves every pixel outside the text band.
    for y in range(y0, y1):
        left = tuple(
            sum(button.getpixel((x, y))[channel] for x in range(24, 32)) // 8
            for channel in range(4)
        )
        right = tuple(
            sum(button.getpixel((x, y))[channel] for x in range(142, 150)) // 8
            for channel in range(4)
        )
        for x in range(24, 150):
            if mask_pixels[x, y]:
                amount = (x - 24) / 125
                pixels[x, y] = tuple(
                    round(left[channel] * (1 - amount) + right[channel] * amount)
                    for channel in range(4)
                )


clear_english_label(5, 33)
clear_english_label(44, 72)


def render_text(text: str, font: ImageFont.FreeTypeFont) -> Image.Image:
    probe = Image.new("L", (256, 48), 0)
    draw = ImageDraw.Draw(probe)
    bounds = draw.textbbox((0, 0), text, font=font)
    mask = Image.new("L", (bounds[2] - bounds[0], bounds[3] - bounds[1]), 0)
    ImageDraw.Draw(mask).text(
        (-bounds[0], -bounds[1]), text, font=font, fill=255, stroke_width=0
    )
    return mask.point(lambda value: 255 if value >= 96 else 0)


def render_label(max_width: int = 132, max_height: int = 17) -> Image.Image:
    latin_font_path = Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")
    font_size = 18
    while True:
        amharic = render_text("አማርኛ", ImageFont.truetype(str(font_path), font_size))
        latin = render_text("VN", ImageFont.truetype(str(latin_font_path), font_size - 2))
        width = amharic.width + 7 + latin.width
        height = max(amharic.height, latin.height)
        if (width <= max_width and height <= max_height) or font_size == 8:
            break
        font_size -= 1

    mask = Image.new("L", (width, height), 0)
    mask.paste(amharic, (0, (height - amharic.height) // 2), amharic)
    mask.paste(latin, (amharic.width + 7, (height - latin.height) // 2), latin)
    return mask


label = render_label()
for center_y, color in ((19, (206, 82, 82, 255)), (58, (239, 115, 115, 255))):
    x = (button.width - label.width) // 2
    y = center_y - label.height // 2
    layer = Image.new("RGBA", label.size, color)
    button.paste(layer, (x, y), label)

output_path.parent.mkdir(parents=True, exist_ok=True)
button.save(output_path, format="PNG", optimize=False)

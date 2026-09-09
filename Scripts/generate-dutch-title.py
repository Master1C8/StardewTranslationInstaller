#!/usr/bin/env python3
"""Build the Dutch title-button atlas from the canonical Latin VN atlas."""

from pathlib import Path
import sys

from PIL import Image, ImageDraw, ImageFont


if len(sys.argv) != 3:
    raise SystemExit("Usage: generate-dutch-title.py <source-TitleButtons.png> <output.png>")


def draw_label(image, box, label, font_path, font_size, foreground, shadow, threshold=90):
    width, height = box[2] - box[0], box[3] - box[1]
    font = ImageFont.truetype(str(font_path), font_size)
    mask = Image.new("L", (width, height), 0)
    canvas = ImageDraw.Draw(mask)
    lines = label.split("\n")
    line_height = font_size + 1
    y = (height - len(lines) * line_height) // 2
    for line in lines:
        bounds = canvas.textbbox((0, 0), line, font=font)
        x = (width - (bounds[2] - bounds[0])) // 2 - bounds[0]
        canvas.text((x, y - bounds[1]), line, font=font, fill=255)
        y += line_height
    mask = mask.point(lambda value: 255 if value >= threshold else 0)
    for offset, color in (((1, 1), shadow), ((0, 0), foreground)):
        full_mask = Image.new("L", image.size, 0)
        full_mask.paste(mask, (box[0] + offset[0], box[1] + offset[1]))
        image.paste(color, (0, 0, image.width, image.height), full_mask)


def erase_label(image, box, text_colors, background):
    pixels = image.load()
    for y in range(box[1], box[3]):
        for x in range(box[0], box[2]):
            if pixels[x, y] in text_colors:
                pixels[x, y] = background


source_path, output_path = Path(sys.argv[1]), Path(sys.argv[2])
font_path = Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")
image = Image.open(source_path).convert("RGBA")
if image.size != (400, 655):
    raise SystemExit(f"Unexpected TitleButtons atlas size: {image.size}")

selected_background = (255, 215, 137, 255)
selected_foreground = (206, 82, 82, 255)
selected_shadow = (150, 71, 58, 255)
hover_background = (255, 255, 192, 255)
hover_foreground = (239, 115, 115, 255)
hover_shadow = (178, 99, 86, 255)

buttons = [
    ((6, 198, 65, 222), "NIEUW\nSPEL", 9),
    ((80, 198, 139, 222), "LADEN", 11),
    ((154, 198, 213, 222), "COÖP", 11),
    ((228, 198, 287, 222), "AFSLUITEN", 8),
]
for box, label, size in buttons:
    erase_label(image, box, {selected_foreground, selected_shadow}, selected_background)
    draw_label(image, box, label, font_path, size, selected_foreground, selected_shadow)
    hover_box = (box[0], box[1] + 58, box[2], box[3] + 58)
    erase_label(image, hover_box, {hover_foreground, hover_shadow}, hover_background)
    draw_label(image, hover_box, label, font_path, size, hover_foreground, hover_shadow)

back_selected, back_hover = (300, 259, 345, 273), (300, 287, 345, 301)
erase_label(image, back_selected, {selected_foreground, selected_shadow}, selected_background)
draw_label(image, back_selected, "TERUG", font_path, 9, selected_foreground, selected_shadow)
back_hover_background = (255, 255, 191, 255)
back_hover_foreground = (235, 111, 111, 255)
back_hover_shadow = (173, 94, 81, 255)
erase_label(image, back_hover, {back_hover_foreground, back_hover_shadow}, back_hover_background)
draw_label(image, back_hover, "TERUG", font_path, 9, back_hover_foreground, back_hover_shadow)

for developer_box in [(181, 312, 273, 330), (292, 312, 384, 330)]:
    erase_label(image, developer_box, {(254, 254, 255, 255), (159, 182, 255, 255)}, (74, 140, 239, 255))
    draw_label(image, developer_box, "GEMAAKT DOOR", font_path, 7, (254, 254, 255, 255), (159, 182, 255, 255))

output_path.parent.mkdir(parents=True, exist_ok=True)
image.save(output_path, format="PNG", optimize=False)

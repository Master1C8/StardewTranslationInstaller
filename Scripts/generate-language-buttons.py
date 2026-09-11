#!/usr/bin/env python3
"""Generate every retained language button from one canonical wood atlas."""

from __future__ import annotations

import argparse
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


@dataclass(frozen=True)
class LanguageButton:
    filename: str
    label: str
    font: str
    font_index: int = 0
    shaped: bool = False
    show_vn: bool = False
    max_size: int = 16
    max_width: int = 132
    max_height: int = 17
    threshold: int = 96


ARIAL_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

BUTTONS = (
    LanguageButton("button-russian.png", "РУССКИЙ", ARIAL_BOLD, show_vn=True),
    LanguageButton("button-serbian.png", "СРПСКИ", ARIAL_BOLD),
    LanguageButton("button.png", "POLSKI", ARIAL_BOLD),
    LanguageButton("button-ukrainian.png", "УКРАЇНСЬКА", ARIAL_BOLD),
    LanguageButton("button-vietnamese.png", "TIẾNG VIỆT", ARIAL_BOLD),
    LanguageButton("button-swahili.png", "KISWAHILI", ARIAL_BOLD),
    LanguageButton(
        "button-persian.png", "فارسی", "/System/Library/Fonts/GeezaPro.ttc",
        font_index=0, shaped=True, max_size=22, max_width=140, max_height=22,
        threshold=160,
    ),
    LanguageButton(
        "button-arabic.png", "العربية", "/System/Library/Fonts/GeezaPro.ttc",
        font_index=0, shaped=True, max_size=22, max_width=140, max_height=22,
        threshold=160,
    ),
    LanguageButton("button-indonesian.png", "BAHASA INDONESIA", ARIAL_BOLD),
    LanguageButton("button-filipino.png", "FILIPINO", ARIAL_BOLD),
    LanguageButton("button-dutch.png", "NEDERLANDS", ARIAL_BOLD),
    LanguageButton(
        "button-hindi.png",
        "हिन्दी",
        "/System/Library/Fonts/Supplemental/Devanagari Sangam MN.ttc",
        font_index=0,
        shaped=True,
        max_size=22,
        max_width=140,
        max_height=22,
        threshold=160,
    ),
    LanguageButton(
        "button-traditional-chinese.png",
        "繁體中文",
        "/System/Library/Fonts/Supplemental/Songti.ttc",
        font_index=2,
    ),
    LanguageButton("button-romanian.png", "ROMÂNĂ", ARIAL_BOLD),
    LanguageButton(
        "button-hebrew.png", "עברית",
        "/System/Library/Fonts/Supplemental/NewPeninimMT.ttc",
        font_index=0, shaped=True, max_size=21, max_width=140, max_height=21,
        threshold=160,
    ),
    LanguageButton("button-bulgarian.png", "БЪЛГАРСКИ", ARIAL_BOLD),
    LanguageButton(
        "button-thai.png",
        "ภาษาไทย",
        "/System/Library/Fonts/Supplemental/Thonburi.ttc",
        font_index=0,
        shaped=True,
        max_size=22,
        max_width=140,
        max_height=22,
        threshold=160,
    ),
    LanguageButton("button-greek.png", "ΕΛΛΗΝΙΚΑ", ARIAL_BOLD),
    LanguageButton("button-czech.png", "ČEŠTINA", ARIAL_BOLD),
)

FRAME_WIDTH = 174
FRAME_HEIGHT = 39
ATLAS_HEIGHT = FRAME_HEIGHT * 2
INK_COLORS = ((206, 82, 82, 255), (238, 116, 116, 255))


def render_with_pillow(text: str, font_path: Path, size: int, index: int) -> Image.Image:
    font = ImageFont.truetype(str(font_path), size, index=index)
    probe = Image.new("L", (320, 64), 0)
    bounds = ImageDraw.Draw(probe).textbbox((0, 0), text, font=font)
    mask = Image.new("L", (bounds[2] - bounds[0], bounds[3] - bounds[1]), 0)
    ImageDraw.Draw(mask).text((-bounds[0], -bounds[1]), text, font=font, fill=255)
    return mask.point(lambda value: 255 if value >= 96 else 0)


def render_shaped(
    text: str, font_path: Path, size: int, renderer: Path, index: int, threshold: int
) -> Image.Image:
    with tempfile.NamedTemporaryFile(suffix=".png") as output:
        subprocess.run(
            [
                str(renderer), str(font_path), text, str(size), output.name,
                str(index), str(threshold),
            ],
            check=True,
        )
        return Image.open(output.name).convert("RGBA").getchannel("A").copy()


def render_text(spec: LanguageButton, text: str, size: int, renderer: Path) -> Image.Image:
    if spec.shaped:
        return render_shaped(
            text, Path(spec.font), size, renderer, spec.font_index, spec.threshold
        )
    return render_with_pillow(text, Path(spec.font), size, spec.font_index)


def render_label(spec: LanguageButton, renderer: Path) -> Image.Image:
    for size in range(spec.max_size, 7, -1):
        native = render_text(spec, spec.label, size, renderer)
        vn = (
            render_with_pillow("VN", Path(ARIAL_BOLD), max(8, size - 2), 0)
            if spec.show_vn
            else None
        )
        width = native.width + (7 + vn.width if vn else 0)
        height = max(native.height, vn.height if vn else 0)
        if width <= spec.max_width and height <= spec.max_height:
            label = Image.new("L", (width, height), 0)
            label.paste(native, (0, (height - native.height) // 2), native)
            if vn:
                label.paste(vn, (native.width + 7, (height - vn.height) // 2), vn)
            return label
    raise ValueError(f"Cannot fit label for {spec.filename}: {spec.label}")


def build_button(template: Image.Image, spec: LanguageButton, renderer: Path) -> Image.Image:
    result = template.copy()
    label = render_label(spec, renderer)
    for frame, color in enumerate(INK_COLORS):
        x = (FRAME_WIDTH - label.width) // 2
        y = frame * FRAME_HEIGHT + 19 - label.height // 2
        result.paste(Image.new("RGBA", label.size, color), (x, y), label)
    return result


def validate_button(
    button: Image.Image, template: Image.Image, spec: LanguageButton
) -> None:
    if button.size != (FRAME_WIDTH, ATLAS_HEIGHT):
        raise ValueError(f"Invalid dimensions for {spec.filename}: {button.size}")
    for frame, color in enumerate(INK_COLORS):
        spans = []
        ink_count = 0
        for y in range(frame * FRAME_HEIGHT, (frame + 1) * FRAME_HEIGHT):
            xs = [x for x in range(FRAME_WIDTH) if button.getpixel((x, y)) == color]
            if xs:
                spans.append(max(xs) - min(xs) + 1)
                ink_count += len(xs)
        if ink_count < 10:
            raise ValueError(f"Missing label ink in {spec.filename}, frame {frame}")
        if max(spans) >= spec.max_width:
            raise ValueError(f"Solid ink band in {spec.filename}, frame {frame}")
        for y in range(frame * FRAME_HEIGHT, (frame + 1) * FRAME_HEIGHT):
            for x in range(FRAME_WIDTH):
                pixel = button.getpixel((x, y))
                if pixel != color and pixel != template.getpixel((x, y)):
                    raise ValueError(
                        f"Button art differs outside label ink in "
                        f"{spec.filename} at {x},{y}"
                    )


def write_preview(buttons: list[Image.Image], output: Path) -> None:
    scale = 3
    columns = 3
    gap = 8
    rows = (len(buttons) + columns - 1) // columns
    atlas_height = ATLAS_HEIGHT * scale
    sheet = Image.new(
        "RGB",
        (
            columns * FRAME_WIDTH * scale + (columns + 1) * gap,
            rows * atlas_height + (rows + 1) * gap,
        ),
        (0, 16, 23),
    )
    for index, button in enumerate(buttons):
        atlas = button.resize(
            (FRAME_WIDTH * scale, atlas_height), Image.Resampling.NEAREST
        )
        x = gap + (index % columns) * (FRAME_WIDTH * scale + gap)
        y = gap + (index // columns) * (atlas_height + gap)
        sheet.paste(atlas.convert("RGB"), (x, y))
    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output, format="PNG", optimize=False)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("assets", type=Path)
    parser.add_argument("renderer", type=Path)
    parser.add_argument("--template", type=Path, required=True)
    parser.add_argument("--preview", type=Path)
    args = parser.parse_args()

    template = Image.open(args.template).convert("RGBA")
    if template.size != (FRAME_WIDTH, ATLAS_HEIGHT):
        raise ValueError(f"Unexpected language-button template size: {template.size}")
    rendered = [build_button(template, spec, args.renderer) for spec in BUTTONS]
    for spec, button in zip(BUTTONS, rendered):
        validate_button(button, template, spec)
        button.save(args.assets / spec.filename, format="PNG", optimize=False)
    # Keep the historical alias byte-identical even though content.json uses button.png.
    rendered[2].save(args.assets / "button-polish.png", format="PNG", optimize=False)
    if args.preview:
        write_preview(rendered, args.preview)


if __name__ == "__main__":
    main()

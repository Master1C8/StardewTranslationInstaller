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


ARIAL_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
ARIAL_UNICODE = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"

BUTTONS = (
    LanguageButton("button-russian.png", "РУССКИЙ", ARIAL_BOLD, show_vn=True),
    LanguageButton("button-serbian.png", "СРПСКИ", ARIAL_BOLD),
    LanguageButton("button.png", "POLSKI", ARIAL_BOLD),
    LanguageButton("button-ukrainian.png", "УКРАЇНСЬКА", ARIAL_BOLD),
    LanguageButton("button-vietnamese.png", "TIẾNG VIỆT", ARIAL_BOLD),
    LanguageButton("button-swahili.png", "KISWAHILI", ARIAL_BOLD),
    LanguageButton("button-persian.png", "فارسی", ARIAL_UNICODE, shaped=True),
    LanguageButton("button-arabic.png", "العربية", ARIAL_UNICODE, shaped=True),
    LanguageButton("button-indonesian.png", "BAHASA INDONESIA", ARIAL_BOLD),
    LanguageButton("button-filipino.png", "FILIPINO", ARIAL_BOLD),
    LanguageButton("button-dutch.png", "NEDERLANDS", ARIAL_BOLD),
    LanguageButton(
        "button-hindi.png",
        "हिन्दी",
        "/System/Library/Fonts/Supplemental/Devanagari Sangam MN.ttc",
        shaped=True,
    ),
    LanguageButton(
        "button-traditional-chinese.png",
        "繁體中文",
        "/System/Library/Fonts/Supplemental/Songti.ttc",
        font_index=2,
    ),
    LanguageButton("button-romanian.png", "ROMÂNĂ", ARIAL_BOLD),
    LanguageButton("button-hebrew.png", "עברית", ARIAL_UNICODE, shaped=True),
    LanguageButton("button-bulgarian.png", "БЪЛГАРСКИ", ARIAL_BOLD),
    LanguageButton(
        "button-thai.png",
        "ภาษาไทย",
        "/System/Library/Fonts/Supplemental/Thonburi.ttc",
        shaped=True,
    ),
    LanguageButton("button-greek.png", "ΕΛΛΗΝΙΚΑ", ARIAL_BOLD),
    LanguageButton("button-czech.png", "ČEŠTINA", ARIAL_BOLD),
)

FRAME_WIDTH = 174
FRAME_HEIGHT = 39
ATLAS_HEIGHT = FRAME_HEIGHT * 2
MAX_LABEL_WIDTH = 132
MAX_LABEL_HEIGHT = 17
INK_COLORS = ((206, 82, 82, 255), (239, 115, 115, 255))


def clean_template(source: Image.Image) -> Image.Image:
    """Remove the old label without sampling pixels that may contain text."""
    if source.size != (FRAME_WIDTH, ATLAS_HEIGHT):
        raise ValueError(f"Unexpected language-button atlas size: {source.size}")

    button = source.copy().convert("RGBA")
    pixels = button.load()
    for y0 in (5, 44):
        for y in range(y0, y0 + 28):
            left = tuple(
                sum(button.getpixel((x, y))[channel] for x in range(12, 20)) // 8
                for channel in range(4)
            )
            right = tuple(
                sum(button.getpixel((x, y))[channel] for x in range(155, 163)) // 8
                for channel in range(4)
            )
            for x in range(20, 155):
                amount = (x - 20) / 134
                pixels[x, y] = tuple(
                    round(left[channel] * (1 - amount) + right[channel] * amount)
                    for channel in range(4)
                )
    return button


def render_with_pillow(text: str, font_path: Path, size: int, index: int) -> Image.Image:
    font = ImageFont.truetype(str(font_path), size, index=index)
    probe = Image.new("L", (320, 64), 0)
    bounds = ImageDraw.Draw(probe).textbbox((0, 0), text, font=font)
    mask = Image.new("L", (bounds[2] - bounds[0], bounds[3] - bounds[1]), 0)
    ImageDraw.Draw(mask).text((-bounds[0], -bounds[1]), text, font=font, fill=255)
    return mask.point(lambda value: 255 if value >= 96 else 0)


def render_shaped(text: str, font_path: Path, size: int, renderer: Path) -> Image.Image:
    with tempfile.NamedTemporaryFile(suffix=".png") as output:
        subprocess.run(
            [str(renderer), str(font_path), text, str(size), output.name],
            check=True,
        )
        return Image.open(output.name).convert("RGBA").getchannel("A").copy()


def render_text(spec: LanguageButton, text: str, size: int, renderer: Path) -> Image.Image:
    if spec.shaped:
        return render_shaped(text, Path(spec.font), size, renderer)
    return render_with_pillow(text, Path(spec.font), size, spec.font_index)


def render_label(spec: LanguageButton, renderer: Path) -> Image.Image:
    for size in range(16, 7, -1):
        native = render_text(spec, spec.label, size, renderer)
        vn = (
            render_with_pillow("VN", Path(ARIAL_BOLD), max(8, size - 2), 0)
            if spec.show_vn
            else None
        )
        width = native.width + (7 + vn.width if vn else 0)
        height = max(native.height, vn.height if vn else 0)
        if width <= MAX_LABEL_WIDTH and height <= MAX_LABEL_HEIGHT:
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


def validate_button(button: Image.Image, spec: LanguageButton) -> None:
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
        if max(spans) >= MAX_LABEL_WIDTH:
            raise ValueError(f"Solid ink band in {spec.filename}, frame {frame}")


def write_preview(buttons: list[Image.Image], output: Path) -> None:
    scale = 3
    columns = 3
    gap = 8
    rows = (len(buttons) + columns - 1) // columns
    sheet = Image.new(
        "RGB",
        (
            columns * FRAME_WIDTH * scale + (columns + 1) * gap,
            rows * FRAME_HEIGHT * scale + (rows + 1) * gap,
        ),
        (0, 16, 23),
    )
    for index, button in enumerate(buttons):
        frame = button.crop((0, 0, FRAME_WIDTH, FRAME_HEIGHT)).resize(
            (FRAME_WIDTH * scale, FRAME_HEIGHT * scale), Image.Resampling.NEAREST
        )
        x = gap + (index % columns) * (FRAME_WIDTH * scale + gap)
        y = gap + (index // columns) * (FRAME_HEIGHT * scale + gap)
        sheet.paste(frame.convert("RGB"), (x, y))
    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output, format="PNG", optimize=False)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("assets", type=Path)
    parser.add_argument("renderer", type=Path)
    parser.add_argument("--preview", type=Path)
    args = parser.parse_args()

    source_path = args.assets / "button.png"
    template = clean_template(Image.open(source_path).convert("RGBA"))
    rendered = [build_button(template, spec, args.renderer) for spec in BUTTONS]
    for spec, button in zip(BUTTONS, rendered):
        validate_button(button, spec)
        button.save(args.assets / spec.filename, format="PNG", optimize=False)
    # Keep the historical alias byte-identical even though content.json uses button.png.
    rendered[2].save(args.assets / "button-polish.png", format="PNG", optimize=False)
    if args.preview:
        write_preview(rendered, args.preview)


if __name__ == "__main__":
    main()

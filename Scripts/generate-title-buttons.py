#!/usr/bin/python3
"""Generate readable main-menu buttons for every retained localization."""

from __future__ import annotations

import argparse
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


@dataclass(frozen=True)
class TitleButtons:
    filename: str
    labels: tuple[tuple[str, ...], ...]
    font: str
    font_index: int = 0
    shaped: bool = False
    max_size: int = 13
    threshold: int = 96


ARIAL_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
GEEZA = "/System/Library/Fonts/GeezaPro.ttc"
SONGTI = "/System/Library/Fonts/Supplemental/Songti.ttc"
ARIAL_HEBREW = "/System/Library/Fonts/ArialHB.ttc"
KOHINOOR = "/System/Library/Fonts/Kohinoor.ttc"
THONBURI = "/System/Library/Fonts/Supplemental/Thonburi.ttc"

BUTTONS = (
    TitleButtons("TitleButtons-russian.png", (("НОВАЯ", "ИГРА"), ("ЗАГРУЗИТЬ",), ("ВМЕСТЕ",), ("ВЫЙТИ", "ИЗ ИГРЫ")), ARIAL_BOLD),
    TitleButtons("TitleButtons-serbian.png", (("НОВА", "ИГРА"), ("УЧИТАЈ",), ("ЗАЈЕДНО",), ("ИЗАЂИ",)), ARIAL_BOLD),
    TitleButtons("TitleButtons.png", (("NOWA", "GRA"), ("WCZYTAJ",), ("KO-OP",), ("WYJDŹ",)), ARIAL_BOLD),
    TitleButtons("TitleButtons-ukrainian.png", (("НОВА", "ГРА"), ("ЗАВАН-", "ТАЖИТИ"), ("СПІЛЬНА", "ГРА"), ("ВИЙТИ", "З ГРИ")), ARIAL_BOLD),
    TitleButtons("TitleButtons-vietnamese.png", (("CHƠI MỚI",), ("TẢI", "TRÒ CHƠI"), ("CHƠI", "CHUNG"), ("THOÁT",)), ARIAL_BOLD),
    TitleButtons("TitleButtons-swahili.png", (("MCHEZO", "MPYA"), ("PAKIA",), ("PAMOJA",), ("TOKA",)), ARIAL_BOLD),
    TitleButtons("TitleButtons-persian.png", (("بازی", "جدید"), ("بارگیری",), ("چندنفره",), ("خروج",)), GEEZA, font_index=1, shaped=True, max_size=14, threshold=128),
    TitleButtons("TitleButtons-arabic.png", (("لعبة", "جديدة"), ("تحميل",), ("تعاوني",), ("خروج",)), GEEZA, font_index=1, shaped=True, max_size=14, threshold=128),
    TitleButtons("TitleButtons-indonesian.png", (("PERMAINAN", "BARU"), ("MUAT",), ("MAIN", "BERSAMA"), ("KELUAR",)), ARIAL_BOLD),
    TitleButtons("TitleButtons-filipino.png", (("BAGONG", "LARO"), ("I-LOAD",), ("CO-OP",), ("LUMABAS",)), ARIAL_BOLD),
    TitleButtons("TitleButtons-dutch.png", (("NIEUW", "SPEL"), ("LADEN",), ("COÖP",), ("AFSLUITEN",)), ARIAL_BOLD),
    TitleButtons("TitleButtons-hindi.png", (("नया", "खेल"), ("लोड",), ("सहकारी",), ("बाहर", "निकलें")), KOHINOOR, font_index=1, shaped=True, max_size=14, threshold=112),
    TitleButtons("TitleButtons-traditional-chinese.png", (("新遊戲",), ("載入",), ("合作",), ("離開",)), SONGTI, font_index=2, max_size=14),
    TitleButtons("TitleButtons-romanian.png", (("JOC", "NOU"), ("ÎNCARCĂ",), ("CO-OP",), ("IEȘIRE",)), ARIAL_BOLD),
    TitleButtons("TitleButtons-hebrew.png", (("משחק חדש",), ("טעינה",), ("משותף",), ("יציאה",)), ARIAL_HEBREW, font_index=1, shaped=True, max_size=14, threshold=112),
    TitleButtons("TitleButtons-bulgarian.png", (("НОВА", "ИГРА"), ("ЗАРЕДИ",), ("ЗАЕДНО",), ("ИЗХОД",)), ARIAL_BOLD),
    TitleButtons("TitleButtons-thai.png", (("เกมใหม่",), ("โหลด",), ("ร่วมกัน",), ("ออก",)), THONBURI, font_index=1, shaped=True, max_size=14, threshold=112),
    TitleButtons("TitleButtons-greek.png", (("ΝΕΟ", "ΠΑΙΧΝΙΔΙ"), ("ΦΟΡΤΩΣΗ",), ("ΜΑΖΙ",), ("ΕΞΟΔΟΣ",)), ARIAL_BOLD),
    TitleButtons("TitleButtons-czech.png", (("NOVÁ HRA",), ("NAČÍST",), ("KO-OP",), ("UKONČIT",)), ARIAL_BOLD),
)

ATLAS_SIZE = (400, 655)
STRIP_POSITION = (0, 184)
STRIP_SIZE = (296, 116)
LABEL_BOXES = (
    (6, 14, 65, 38),
    (80, 14, 139, 38),
    (154, 14, 213, 38),
    (228, 14, 287, 38),
)
INK_COLORS = ((206, 82, 82, 255), (239, 115, 115, 255))
STATE_OFFSET = 58
MAX_TEXT_WIDTH = 53
MAX_TEXT_HEIGHT = 20


def render_pillow(text: str, font_path: Path, size: int, index: int, threshold: int) -> Image.Image:
    font = ImageFont.truetype(str(font_path), size, index=index)
    probe = Image.new("L", (256, 64), 0)
    bounds = ImageDraw.Draw(probe).textbbox((0, 0), text, font=font)
    mask = Image.new("L", (bounds[2] - bounds[0], bounds[3] - bounds[1]), 0)
    ImageDraw.Draw(mask).text((-bounds[0], -bounds[1]), text, font=font, fill=255)
    return mask.point(lambda value: 255 if value >= threshold else 0)


def render_shaped(text: str, spec: TitleButtons, size: int, renderer: Path) -> Image.Image:
    with tempfile.NamedTemporaryFile(suffix=".png") as output:
        subprocess.run(
            [str(renderer), spec.font, text, str(size), output.name, str(spec.font_index), str(spec.threshold)],
            check=True,
        )
        return Image.open(output.name).convert("RGBA").getchannel("A").copy()


def render_line(text: str, spec: TitleButtons, size: int, renderer: Path) -> Image.Image:
    if spec.shaped:
        return render_shaped(text, spec, size, renderer)
    return render_pillow(text, Path(spec.font), size, spec.font_index, spec.threshold)


def render_label(lines: tuple[str, ...], spec: TitleButtons, renderer: Path) -> Image.Image:
    for size in range(spec.max_size, 6, -1):
        masks = [render_line(line, spec, size, renderer) for line in lines]
        gap = 1 if len(masks) > 1 else 0
        width = max(mask.width for mask in masks)
        height = sum(mask.height for mask in masks) + gap * (len(masks) - 1)
        if width <= MAX_TEXT_WIDTH and height <= MAX_TEXT_HEIGHT:
            label = Image.new("L", (width, height), 0)
            y = 0
            for mask in masks:
                label.paste(mask, ((width - mask.width) // 2, y), mask)
                y += mask.height + gap
            return label
    raise ValueError(f"Cannot fit title label: {' / '.join(lines)}")


def build_atlas(
    source: Image.Image, template: Image.Image, spec: TitleButtons, renderer: Path
) -> tuple[Image.Image, list[Image.Image]]:
    result = source.copy()
    result.paste(template, STRIP_POSITION)
    masks = []
    for box, lines in zip(LABEL_BOXES, spec.labels):
        label = render_label(lines, spec, renderer)
        masks.append(label)
        for state, color in enumerate(INK_COLORS):
            left, top, right, bottom = box
            x = left + ((right - left) - label.width) // 2
            y = top + state * STATE_OFFSET + ((bottom - top) - label.height) // 2
            result.paste(Image.new("RGBA", label.size, color), (x, y + STRIP_POSITION[1]), label)
    return result, masks


def validate_atlas(
    atlas: Image.Image,
    template: Image.Image,
    masks: list[Image.Image],
    spec: TitleButtons,
) -> None:
    if atlas.size != ATLAS_SIZE:
        raise ValueError(f"Invalid atlas dimensions for {spec.filename}: {atlas.size}")
    strip = atlas.crop((0, 184, 296, 300))
    for index, (box, mask) in enumerate(zip(LABEL_BOXES, masks)):
        if any(value not in (0, 255) for value in mask.getdata()):
            raise ValueError(f"Antialiased pixels in label {index} of {spec.filename}")
        bounds = mask.getbbox()
        if bounds is None or sum(1 for value in mask.getdata() if value >= 64) < 12:
            raise ValueError(f"Unreadable or missing label {index} in {spec.filename}")
        left, top, right, bottom = box
        x = left + ((right - left) - mask.width) // 2
        y = top + ((bottom - top) - mask.height) // 2
        if x <= left or x + mask.width >= right or y <= top or y + mask.height >= bottom:
            raise ValueError(f"Label {index} touches its safe boundary in {spec.filename}")
    allowed = set()
    for state in range(2):
        for left, top, right, bottom in LABEL_BOXES:
            allowed.update(
                (x, y)
                for y in range(top + state * STATE_OFFSET, bottom + state * STATE_OFFSET)
                for x in range(left, right)
            )
    for y in range(STRIP_SIZE[1]):
        for x in range(STRIP_SIZE[0]):
            if (x, y) not in allowed and strip.getpixel((x, y)) != template.getpixel((x, y)):
                raise ValueError(f"Frame art changed in {spec.filename} at {x},{y}")
    for state, color in enumerate(INK_COLORS):
        offset_y = state * STATE_OFFSET
        changed = []
        for left, top, right, bottom in LABEL_BOXES:
            points = set()
            for y in range(top + offset_y, bottom + offset_y):
                for x in range(left, right):
                    pixel = strip.getpixel((x, y))
                    original = template.getpixel((x, y))
                    if pixel != original:
                        if pixel != color:
                            raise ValueError(
                                f"Non-pixel text color in {spec.filename} at {x},{y}"
                            )
                        points.add((x, y - offset_y))
            changed.append(points)
        if state == 0:
            normal_geometry = changed
        elif changed != normal_geometry:
            raise ValueError(f"Normal/hover geometry differs in {spec.filename}")


def write_preview(atlases: list[Image.Image], output: Path) -> None:
    scale = 3
    columns = 2
    gap = 8
    strip_width = STRIP_SIZE[0] * scale
    strip_height = STRIP_SIZE[1] * scale
    rows = (len(atlases) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * strip_width + (columns + 1) * gap, rows * strip_height + (rows + 1) * gap), (0, 16, 23))
    for index, atlas in enumerate(atlases):
        strip = atlas.crop((0, 184, 296, 300)).resize((strip_width, strip_height), Image.Resampling.NEAREST)
        x = gap + (index % columns) * (strip_width + gap)
        y = gap + (index // columns) * (strip_height + gap)
        sheet.paste(strip.convert("RGB"), (x, y))
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
    if template.size != STRIP_SIZE:
        raise ValueError(f"Unexpected title-button template size: {template.size}")
    atlases = []
    for spec in BUTTONS:
        path = args.assets / spec.filename
        source = Image.open(path).convert("RGBA")
        atlas, masks = build_atlas(source, template, spec, args.renderer)
        validate_atlas(atlas, template, masks, spec)
        atlas.save(path, format="PNG", optimize=False)
        atlases.append(atlas)
    if args.preview:
        write_preview(atlases, args.preview)
    print(f"Built and validated {len(atlases)} localized title-button atlases.")


if __name__ == "__main__":
    main()

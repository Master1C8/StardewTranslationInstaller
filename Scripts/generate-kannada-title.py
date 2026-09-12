#!/usr/bin/env python3
from pathlib import Path
import os
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFont


def shaped_mask(text: str, font_path: Path, font_size: int):
    renderer = os.environ.get("VN_SHAPED_TEXT_RENDERER")
    if not renderer:
        return None
    with tempfile.NamedTemporaryFile(suffix=".png") as temporary:
        subprocess.run(
            [renderer, str(font_path), text, str(font_size), temporary.name],
            check=True,
        )
        return Image.open(temporary.name).convert("RGBA").getchannel("A").copy()


def usage() -> None:
    raise SystemExit(
        "Usage: generate-kannada-title.py <english-TitleButtons.png> "
        "<NotoSansKannada-Bold.ttf> <output.png>"
    )


def draw_label(
    image: Image.Image,
    box: tuple[int, int, int, int],
    lines: list[str],
    font_path: Path,
    font_size: int,
    foreground: tuple[int, int, int, int],
    shadow: tuple[int, int, int, int],
    threshold: int = 90,
) -> None:
    width = box[2] - box[0]
    height = box[3] - box[1]
    font = ImageFont.truetype(
        str(font_path), font_size, index=int(os.environ.get("VN_FONT_INDEX", "0"))
    )
    line_height = font_size + 1
    mask = Image.new("L", (width, height), 0)
    canvas = ImageDraw.Draw(mask)
    total_height = len(lines) * line_height
    y = (height - total_height) // 2 - 1
    for line in lines:
        rendered = shaped_mask(line, font_path, font_size)
        if rendered is not None:
            x = (width - rendered.width) // 2
            line_y = y + (line_height - rendered.height) // 2
            mask.paste(rendered, (x, line_y), rendered)
        else:
            bounds = canvas.textbbox((0, 0), line, font=font)
            text_width = bounds[2] - bounds[0]
            x = (width - text_width) // 2 - bounds[0]
            canvas.text((x, y - bounds[1]), line, font=font, fill=255)
        y += line_height
    mask = mask.point(lambda value: 255 if value >= threshold else 0)

    shadow_mask = Image.new("L", image.size, 0)
    shadow_mask.paste(mask, (box[0] + 1, box[1] + 1))
    image.paste(shadow, (0, 0, image.width, image.height), shadow_mask)
    foreground_mask = Image.new("L", image.size, 0)
    foreground_mask.paste(mask, (box[0], box[1]))
    image.paste(foreground, (0, 0, image.width, image.height), foreground_mask)


def erase_label(
    image: Image.Image,
    box: tuple[int, int, int, int],
    text_colors: set[tuple[int, int, int, int]],
    background: tuple[int, int, int, int],
) -> None:
    """Remove only the stock English letter pixels, preserving every frame pixel."""
    pixels = image.load()
    for y in range(box[1], box[3]):
        for x in range(box[0], box[2]):
            if pixels[x, y] in text_colors:
                pixels[x, y] = background


def write_back_overlay(
    output_path: Path,
    text: str,
    font_path: Path,
) -> None:
    """Render the back label at its native on-screen size instead of atlas scale."""
    overlay_size = (264, 108)
    label_area_width = 200
    rendered = shaped_mask(text, font_path, 44)
    if rendered is None:
        raise RuntimeError("VN_SHAPED_TEXT_RENDERER is required for a title back overlay")
    if rendered.width > label_area_width - 24 or rendered.height > overlay_size[1] - 24:
        raise ValueError(f"Back label is too large for its button: {rendered.size}")

    overlay = Image.new("RGBA", overlay_size, (255, 255, 255, 0))
    glyph = Image.new("RGBA", rendered.size, (255, 255, 255, 255))
    glyph.putalpha(rendered)
    position = (
        (label_area_width - rendered.width) // 2,
        (overlay_size[1] - rendered.height) // 2,
    )
    overlay.alpha_composite(glyph, position)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    overlay.save(output_path, format="PNG", optimize=False)


if len(sys.argv) != 4:
    usage()

source_path = Path(sys.argv[1])
font_path = Path(sys.argv[2])
output_path = Path(sys.argv[3])
image = Image.open(source_path).convert("RGBA")

selected_background = (255, 215, 137, 255)
selected_foreground = (206, 82, 82, 255)
selected_shadow = (150, 71, 58, 255)
hover_background = (255, 255, 192, 255)
hover_foreground = (239, 115, 115, 255)
hover_shadow = (178, 99, 86, 255)

if os.environ.get("VN_TITLE_LOCALE") == "th":
    buttons = [
        ((6, 198, 65, 222), ["เกม", "ใหม่"], 11),
        ((80, 198, 139, 222), ["โหลด"], 12),
        ((154, 198, 213, 222), ["เล่น", "ร่วมกัน"], 9),
        ((228, 198, 287, 222), ["ออก"], 12),
    ]
    back_label = "กลับ"
    developer_label = "ผู้พัฒนา"
elif os.environ.get("VN_TITLE_LOCALE") == "bn":
    buttons = [
        ((6, 198, 65, 222), ["নতুন", "খেলা"], 9),
        ((80, 198, 139, 222), ["লোড"], 11),
        ((154, 198, 213, 222), ["সহযোগী", "খেলা"], 8),
        ((228, 198, 287, 222), ["বেরিয়ে", "যান"], 9),
    ]
    back_label = "পেছনে"
    developer_label = "নির্মাতা"
elif os.environ.get("VN_TITLE_LOCALE") == "zh-TW":
    buttons = [
        ((6, 198, 65, 222), ["新遊戲"], 11),
        ((80, 198, 139, 222), ["載入"], 12),
        ((154, 198, 213, 222), ["合作"], 12),
        ((228, 198, 287, 222), ["離開"], 12),
    ]
    back_label = "返回"
    developer_label = "製作人"
elif os.environ.get("VN_TITLE_LOCALE") == "fa":
    buttons = [
        ((6, 198, 65, 222), ["بازی", "جدید"], 10),
        ((80, 198, 139, 222), ["بارگیری"], 10),
        ((154, 198, 213, 222), ["بازی", "چندنفره"], 8),
        ((228, 198, 287, 222), ["خروج"], 11),
    ]
    back_label = "بازگشت"
    developer_label = "سازنده"
elif os.environ.get("VN_TITLE_LOCALE") == "ar":
    buttons = [
        ((6, 198, 65, 222), ["لعبة", "جديدة"], 10),
        ((80, 198, 139, 222), ["تحميل"], 11),
        ((154, 198, 213, 222), ["لعب", "تعاوني"], 9),
        ((228, 198, 287, 222), ["خروج"], 11),
    ]
    back_label = "رجوع"
    developer_label = "تطوير"
elif os.environ.get("VN_TITLE_LOCALE") == "ur":
    buttons = [
        ((6, 198, 65, 222), ["نیا", "کھیل"], 11),
        ((80, 198, 139, 222), ["لوڈ"], 12),
        ((154, 198, 213, 222), ["تعاونی", "کھیل"], 9),
        ((228, 198, 287, 222), ["باہر", "نکلیں"], 9),
    ]
    back_label = "واپس"
    developer_label = "تخلیق کار"
elif os.environ.get("VN_TITLE_LOCALE") == "te":
    buttons = [
        ((6, 198, 65, 222), ["కొత్త", "ఆట"], 9),
        ((80, 198, 139, 222), ["లోడ్"], 11),
        ((154, 198, 213, 222), ["సహకార", "ఆట"], 8),
        ((228, 198, 287, 222), ["ఆట నుంచి", "నిష్క్రమించు"], 7),
    ]
    back_label = "వెనక్కి"
    developer_label = "రూపకర్త"
elif os.environ.get("VN_TITLE_LOCALE") == "my":
    buttons = [
        ((6, 198, 65, 222), ["ဂိမ်း", "အသစ်"], 9),
        ((80, 198, 139, 222), ["ဖွင့်ရန်"], 10),
        ((154, 198, 213, 222), ["အတူ", "ကစား"], 9),
        ((228, 198, 287, 222), ["ထွက်ရန်"], 10),
    ]
    back_label = "နောက်သို့"
    developer_label = "ဖန်တီးသူ"
elif os.environ.get("VN_TITLE_LOCALE") == "ml":
    buttons = [
        ((6, 198, 65, 222), ["പുതിയ", "കളി"], 9),
        ((80, 198, 139, 222), ["ലോഡ്"], 11),
        ((154, 198, 213, 222), ["സഹകരണം"], 8),
        ((228, 198, 287, 222), ["പുറത്ത്"], 9),
    ]
    back_label = "തിരികെ"
    developer_label = "നിർമ്മിച്ചത്"
elif os.environ.get("VN_TITLE_LOCALE") == "mr":
    buttons = [
        ((6, 198, 65, 222), ["नवीन", "खेळ"], 9),
        ((80, 198, 139, 222), ["खेळ", "उघडा"], 9),
        ((154, 198, 213, 222), ["सहकारी", "खेळ"], 8),
        ((228, 198, 287, 222), ["बाहेर", "पडा"], 9),
    ]
    back_label = "मागे"
    developer_label = "निर्माता"
else:
    buttons = [
        ((6, 198, 65, 222), ["ಹೊಸ", "ಆಟ"], 12),
        ((80, 198, 139, 222), ["ಲೋಡ್"], 13),
        ((154, 198, 213, 222), ["ಸಹಕಾರಿ", "ಆಟ"], 9),
        ((228, 198, 287, 222), ["ಆಟದಿಂದ", "ಹೊರಗೆ"], 9),
    ]
    back_label = "ಹಿಂದೆ"
    developer_label = "ನಿರ್ಮಿಸಿದ್ದು"

for box, lines, size in buttons:
    erase_label(image, box, {selected_foreground, selected_shadow}, selected_background)
    draw_label(image, box, lines, font_path, size, selected_foreground, selected_shadow)

for box, lines, size in buttons:
    hover_box = (box[0], box[1] + 58, box[2], box[3] + 58)
    erase_label(image, hover_box, {hover_foreground, hover_shadow}, hover_background)
    draw_label(image, hover_box, lines, font_path, size, hover_foreground, hover_shadow)

back_selected = (300, 259, 345, 273)
back_hover = (300, 287, 345, 301)
erase_label(image, back_selected, {selected_foreground, selected_shadow}, selected_background)
back_hover_background = (255, 255, 191, 255)
back_hover_foreground = (235, 111, 111, 255)
back_hover_shadow = (173, 94, 81, 255)
erase_label(
    image,
    back_hover,
    {back_hover_foreground, back_hover_shadow},
    back_hover_background,
)
back_overlay_output = os.environ.get("VN_TITLE_BACK_OVERLAY")
if back_overlay_output:
    write_back_overlay(Path(back_overlay_output), back_label, font_path)
else:
    draw_label(image, back_selected, [back_label], font_path, 9, selected_foreground, selected_shadow)
    draw_label(
        image,
        back_hover,
        [back_label],
        font_path,
        9,
        back_hover_foreground,
        back_hover_shadow,
    )

developer_background = (74, 140, 239, 255)
developer_foreground = (254, 254, 255, 255)
developer_shadow = (159, 182, 255, 255)
for developer_box in [(181, 312, 273, 330), (292, 312, 384, 330)]:
    erase_label(
        image,
        developer_box,
        {developer_foreground, developer_shadow},
        developer_background,
    )
    draw_label(
        image,
        developer_box,
        [developer_label],
        font_path,
        12,
        developer_foreground,
        developer_shadow,
    )

output_path.parent.mkdir(parents=True, exist_ok=True)
image.save(output_path, format="PNG")

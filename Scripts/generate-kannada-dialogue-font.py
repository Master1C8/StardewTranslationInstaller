#!/usr/bin/env python3

import json
import math
import os
import sys
import unicodedata
from pathlib import Path
from xml.etree import ElementTree as ET

from PIL import Image, ImageDraw, ImageFont


def collect_characters(value, result: set[str]) -> None:
    if isinstance(value, str):
        result.update(value)
    elif isinstance(value, list):
        for item in value:
            collect_characters(item, result)
    elif isinstance(value, dict):
        for item in value.values():
            collect_characters(item, result)


script_start = int(os.environ.get("VN_SCRIPT_START", "0C80"), 16)
script_end = int(os.environ.get("VN_SCRIPT_END", "0CFF"), 16)
font_basename = os.environ.get("VN_FONT_BASENAME", "Kannada")


def font_for(character: str, kannada, fallback):
    codepoint = ord(character)
    if script_start <= codepoint <= script_end:
        return kannada
    return fallback


def render_glyph(character: str, kannada, fallback, base: int, line_height: int):
    if unicodedata.category(character) == "Cf":
        return {
            "image": Image.new("L", (1, 1), 0),
            "width": 1,
            "height": 1,
            "xoffset": 0,
            "yoffset": 0,
            "xadvance": 0,
            "line_height": line_height,
        }
    font = font_for(character, kannada, fallback)
    advance = max(1, math.ceil(font.getlength(character)))
    probe = Image.new("L", (64, 64), 0)
    draw = ImageDraw.Draw(probe)
    bounds = draw.textbbox((0, 0), character, font=font, anchor="ls")
    x0, y0, x1, y1 = bounds
    width = max(1, x1 - x0)
    height = max(1, y1 - y0)
    image = Image.new("L", (width, height), 0)
    if x1 > x0 and y1 > y0:
        ImageDraw.Draw(image).text((-x0, -y0), character, font=font, fill=255, anchor="ls")
    # Stardew's stock bitmap fonts use binary alpha. Keeping the same format
    # prevents colour fringes when the game magnifies the atlas with nearest filtering.
    image = image.point(lambda alpha: 255 if alpha >= 96 else 0)
    return {
        "image": image,
        "width": width,
        "height": height,
        "xoffset": x0,
        "yoffset": max(0, base + y0),
        "xadvance": advance,
        "line_height": line_height,
    }


def pack_glyphs(glyphs, atlas_size: int, padding: int = 1):
    x = padding
    y = padding
    row_height = 0
    for glyph in sorted(glyphs, key=lambda item: (-item["height"], item["id"])):
        if x + glyph["width"] + padding > atlas_size:
            x = padding
            y += row_height + padding
            row_height = 0
        if y + glyph["height"] + padding > atlas_size:
            raise RuntimeError(f"Glyphs do not fit in a {atlas_size}x{atlas_size} atlas")
        glyph["x"] = x
        glyph["y"] = y
        x += glyph["width"] + padding
        row_height = max(row_height, glyph["height"])


def write_json(path: Path, value) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=4) + "\n", encoding="utf-8")


def main() -> None:
    if len(sys.argv) not in (4, 5):
        raise SystemExit(
            "Usage: generate-kannada-dialogue-font <translations-dir> <output-dir> "
            "<kannada-font-file> [latin-fallback-font-file]"
        )

    translations = Path(sys.argv[1])
    output = Path(sys.argv[2])
    kannada_path = Path(sys.argv[3])
    fallback_path = Path(sys.argv[4]) if len(sys.argv) == 5 else Path(
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
    )

    characters = set(chr(codepoint) for codepoint in range(32, 127))
    # Player and farm names survive language switches. Always support the
    # modern Russian alphabet used by existing saves in the unified installer.
    characters.update(chr(codepoint) for codepoint in range(0x0410, 0x0450))
    characters.update({"Ё", "ё"})
    for source in translations.rglob("*.json"):
        collect_characters(json.loads(source.read_text(encoding="utf-8")), characters)
    characters.discard("\n")
    characters.discard("\r")
    characters.discard("\t")

    font_size = 12
    kannada = ImageFont.truetype(str(kannada_path), font_size)
    fallback = ImageFont.truetype(str(fallback_path), font_size)
    ascents_and_descents = [kannada.getmetrics(), fallback.getmetrics()]
    base = max(ascent for ascent, _ in ascents_and_descents)
    line_height = max(ascent + descent for ascent, descent in ascents_and_descents)

    glyphs = []
    fallback_glyph = render_glyph("?", kannada, fallback, base, line_height)
    fallback_glyph["id"] = -1
    glyphs.append(fallback_glyph)
    for character in sorted(characters, key=ord):
        glyph = render_glyph(character, kannada, fallback, base, line_height)
        glyph["id"] = ord(character)
        glyphs.append(glyph)

    atlas_size = 512
    while True:
        try:
            pack_glyphs(glyphs, atlas_size)
            break
        except RuntimeError:
            atlas_size *= 2
            if atlas_size > 2048:
                raise

    atlas = Image.new("RGBA", (atlas_size, atlas_size), (0, 0, 0, 0))
    for glyph in glyphs:
        white = Image.new("RGBA", glyph["image"].size, (255, 255, 255, 255))
        atlas.paste(white, (glyph["x"], glyph["y"]), glyph["image"])

    output.mkdir(parents=True, exist_ok=True)
    atlas.save(output / f"{font_basename}_0.png")

    font = ET.Element("font")
    ET.SubElement(font, "info", {
        "face": kannada.getname()[0],
        "size": str(font_size),
        "bold": "0", "italic": "0", "charset": "", "unicode": "1",
        "stretchH": "100", "smooth": "0", "aa": "1",
        "padding": "0,0,0,0", "spacing": "1,1", "outline": "0",
    })
    ET.SubElement(font, "common", {
        "lineHeight": str(line_height), "base": str(base),
        "scaleW": str(atlas_size), "scaleH": str(atlas_size),
        "pages": "1", "packed": "0", "alphaChnl": "0",
        "redChnl": "4", "greenChnl": "4", "blueChnl": "4",
    })
    pages = ET.SubElement(font, "pages")
    ET.SubElement(pages, "page", {"id": "0", "file": f"{font_basename}_0"})
    chars = ET.SubElement(font, "chars", {"count": str(len(glyphs))})
    for glyph in sorted(glyphs, key=lambda item: item["id"]):
        ET.SubElement(chars, "char", {
            "id": str(glyph["id"]), "x": str(glyph["x"]), "y": str(glyph["y"]),
            "width": str(glyph["width"]), "height": str(glyph["height"]),
            "xoffset": str(glyph["xoffset"]), "yoffset": str(glyph["yoffset"]),
            "xadvance": str(glyph["xadvance"]), "page": "0", "chnl": "15",
        })
    ET.indent(font, space="  ")
    ET.ElementTree(font).write(output / f"{font_basename}.xml", encoding="utf-8", xml_declaration=True)

    write_json(output / f"{font_basename}.json", {
        "header": {"target": "w", "formatVersion": 5, "hidef": True, "compressed": 128},
        "readers": [{
            "type": "BmFont.XmlSourceReader, BmFont, Version=2012.1.7.0, Culture=neutral, PublicKeyToken=null",
            "version": 0,
        }],
        "content": {"export": f"{font_basename}.xml"},
    })
    write_json(output / f"{font_basename}_0.json", {
        "header": {"target": "w", "formatVersion": 5, "hidef": True, "compressed": 128},
        "readers": [{
            "type": "Microsoft.Xna.Framework.Content.Texture2DReader, Microsoft.Xna.Framework.Graphics, "
                    "Version=4.0.0.0, Culture=neutral, PublicKeyToken=842cf8be1de50553",
            "version": 0,
        }],
        "content": {"format": 0, "export": f"{font_basename}_0.png"},
    })
    print(f"Generated {len(glyphs)} glyphs in a {atlas_size}x{atlas_size} atlas")


if __name__ == "__main__":
    main()

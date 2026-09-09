#!/usr/bin/env python3
"""Add Bulgarian grave-accented I glyphs to the reviewed Russian SpriteFonts."""

import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PAYLOAD = ROOT / "Sources/StardewTranslationInstaller/Resources/ModPayload"
BASE = PAYLOAD / "assets/fonts/russian"
OUTPUT = PAYLOAD / "assets/fonts/bulgarian"
XNBCLI = Path(os.environ.get("XNBCLI", "/Users/antonkrutov/Developer/tools/xnbcli/xnbcli"))


def add_glyphs(json_path: Path) -> None:
    document = json.loads(json_path.read_text())
    content = document["content"]
    image_path = json_path.with_suffix(".png")
    atlas = Image.open(image_path).convert("RGBA")
    width, height = atlas.size
    enlarged = Image.new("RGBA", (width, height + 32), (0, 0, 0, 0))
    enlarged.alpha_composite(atlas, (0, 0))

    def metadata(character: str):
        index = content["characterMap"].index(character)
        return (content["glyphs"][index], content["cropping"][index],
                content["kerning"][index])

    upper_base, upper_crop, upper_kern = metadata("И")
    lower_base, lower_crop, lower_kern = metadata("и")
    grave_source, grave_crop, grave_kern = metadata("`")
    comma_source, comma_crop, comma_kern = metadata(",")
    grave = atlas.crop((grave_source["x"], grave_source["y"],
                        grave_source["x"] + grave_source["width"],
                        grave_source["y"] + grave_source["height"]))
    comma = atlas.crop((comma_source["x"], comma_source["y"],
                        comma_source["x"] + comma_source["width"],
                        comma_source["y"] + comma_source["height"]))

    upper = Image.new("RGBA", (upper_base["width"], 24), (0, 0, 0, 0))
    upper.alpha_composite(atlas.crop((upper_base["x"], upper_base["y"],
                                      upper_base["x"] + upper_base["width"],
                                      upper_base["y"] + upper_base["height"])), (0, 6))
    upper.alpha_composite(grave, (5, 0))

    lower = Image.new("RGBA", (lower_base["width"], 18), (0, 0, 0, 0))
    lower.alpha_composite(atlas.crop((lower_base["x"], lower_base["y"],
                                      lower_base["x"] + lower_base["width"],
                                      lower_base["y"] + lower_base["height"])), (0, 6))
    lower.alpha_composite(grave, (3, 0))

    opening_quotes = Image.new("RGBA", (grave.width * 2 + 2, grave.height), (0, 0, 0, 0))
    opening_quotes.alpha_composite(grave, (0, 0))
    opening_quotes.alpha_composite(grave, (grave.width + 2, 0))
    low_quotes = Image.new("RGBA", (comma.width * 2 + 2, comma.height), (0, 0, 0, 0))
    low_quotes.alpha_composite(comma, (0, 0))
    low_quotes.alpha_composite(comma, (comma.width + 2, 0))
    right_quote = grave.transpose(Image.Transpose.FLIP_LEFT_RIGHT)

    additions = [
        ("Ѝ", {"x": 0, "y": height, "width": upper.width, "height": upper.height},
         {**upper_crop, "y": 0, "height": upper_crop["height"]}, upper_kern, upper),
        ("ѝ", {"x": 18, "y": height, "width": lower.width, "height": lower.height},
         {**lower_crop, "y": 6, "height": lower_crop["height"]}, lower_kern, lower),
        ("„", {"x": 36, "y": height, "width": low_quotes.width, "height": low_quotes.height},
         {**comma_crop, "width": low_quotes.width},
         {**comma_kern, "y": low_quotes.width}, low_quotes),
        ("“", {"x": 50, "y": height, "width": opening_quotes.width, "height": opening_quotes.height},
         {**grave_crop, "width": opening_quotes.width},
         {**grave_kern, "y": opening_quotes.width}, opening_quotes),
        ("’", {"x": 64, "y": height, "width": right_quote.width, "height": right_quote.height},
         {**grave_crop, "width": right_quote.width}, grave_kern, right_quote),
    ]
    for _, glyph, _, _, image in additions:
        enlarged.alpha_composite(image, (glyph["x"], glyph["y"]))

    rows = list(zip(content["characterMap"], content["glyphs"],
                    content["cropping"], content["kerning"]))
    rows.extend((character, glyph, cropping, kerning)
                for character, glyph, cropping, kerning, _ in additions)
    rows.sort(key=lambda row: ord(row[0]))
    content["characterMap"] = [row[0] for row in rows]
    content["glyphs"] = [row[1] for row in rows]
    content["cropping"] = [row[2] for row in rows]
    content["kerning"] = [row[3] for row in rows]

    enlarged.save(image_path, format="PNG", optimize=False)
    json_path.write_text(json.dumps(document, ensure_ascii=False, separators=(",", ":")))


def main() -> None:
    if not XNBCLI.is_file():
        raise RuntimeError(f"Missing pinned xnbcli: {XNBCLI}")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="stardew-bg-fonts-") as temp_name:
        temp = Path(temp_name)
        packed_base = temp / "base"
        unpacked = temp / "unpacked"
        packed = temp / "packed"
        verify = temp / "verify"
        packed_base.mkdir()
        packed.mkdir()
        verify.mkdir()
        for name in ("SpriteFont1.xnb", "SmallFont.xnb"):
            shutil.copy2(BASE / name, packed_base / name)
        subprocess.run([str(XNBCLI), "unpack", str(packed_base), str(unpacked)], check=True)
        for name in ("SpriteFont1", "SmallFont"):
            add_glyphs(unpacked / f"{name}.json")
        subprocess.run([str(XNBCLI), "pack", str(unpacked), str(packed)], check=True)
        subprocess.run([str(XNBCLI), "unpack", str(packed), str(verify)], check=True)
        verifier = ROOT / "Scripts/verify-bulgarian-fonts.mjs"
        subprocess.run(["node", str(verifier), str(verify)], check=True)
        for name in ("SpriteFont1.xnb", "SmallFont.xnb"):
            shutil.copy2(packed / name, OUTPUT / name)
    print("Built and round-trip verified Bulgarian SpriteFonts.")


if __name__ == "__main__":
    main()

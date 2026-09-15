#!/usr/bin/env python3
"""Prepare Latin American Spanish selector assets and import the native title atlas."""

from __future__ import annotations

import argparse
import hashlib
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_ASSETS = ROOT / "Scripts/assets"
PAYLOAD_ASSETS = (
    ROOT / "Sources/StardewTranslationInstaller/Resources/ModPayload/assets"
)
FONT = Path("/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf")
FALLBACK_FONT = Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")
NARROW_FONT = Path("/System/Library/Fonts/Supplemental/Arial Narrow Bold.ttf")
OLD_ROWS = 19
EXPECTED_TITLE_SHA256 = "36e7d299c0bc4eb0720953fad06dc5a152e7b8c918618e190400883928535170"
EXPECTED_TEXTURE_HASHES = {
    "LooseSprites/Billboard.es-ES.xnb": "08e8826a56c679c60837b2c22d7a81b6459d8155967e099f95ecbc9d6315579a",
    "LooseSprites/ControllerMaps.es-ES.xnb": "b430bb1c5dab47e4cf088896a13fa9d6ee87f72ff359e4016f7679bbfa670141",
    "LooseSprites/Cursors.es-ES.xnb": "2d6d9938a7ba7a512aa10d5001ca2b03b82e36c9947b2570c411338761352b96",
    "LooseSprites/JojaCDForm.es-ES.xnb": "4b16ca3c7fe5328528001fd0eabe9e2fab9b52d39ba08c036e6ef75cb9f17e92",
    "LooseSprites/JunimoNote.es-ES.xnb": "3ab37844ea0d56e2cd78b72f2cb23d50af7c2c0a71d464ee588e3fcd766fa8bf",
    "LooseSprites/MobileAtlas_manually_made.es-ES.xnb": "d52eeda5901e4d47fd3601e900034dda3399ea7e95d854820d8193506020e0a0",
    "Maps/DesertTiles.es-ES.xnb": "845db3343e006dcb8419807ca5f3e6642bc21410b4af6913c43e525d2ed9f51e",
    "Maps/Festivals.es-ES.xnb": "331b9914e128ce01023a624028f51a5982fca3087753ef623a64542985cea954",
    "Maps/bathhouse_tiles.es-ES.xnb": "a32360999e1cb2439669f2da179883ba57a18d74861a044c4fb464cabe3c4e23",
    "Maps/coopTiles.es-ES.xnb": "119ead14adb8f6d96de50ba8a6b21a21306c58e47c9e637436d822bf67b51ee7",
    "Maps/fall_beach.es-ES.xnb": "0d84c26c1579e58ee3e87f60d5e7c3c431a4fa16a832342d87bcac11a45acb78",
    "Maps/fall_outdoorsTileSheet.es-ES.xnb": "e28a9570d6b835d6eaa72745c945600fe78f114359d61530207fdfe3c731c648",
    "Maps/fall_town.es-ES.xnb": "9fa60d8b7ff4ab43565d1c53467ae740c1bcf176d72ad889f46c9f4a90f24acd",
    "Maps/samshowtiles.es-ES.xnb": "c7ddc71963e7c019a0fb49bfd42d592ab55ccf6a96af3fcf34c80430b16377fa",
    "Maps/spring_beach.es-ES.xnb": "d48e2e5ec0d570052bd3d646b31a6eb68011dcdb115e571903f5f32bb64d1b92",
    "Maps/spring_outdoorsTileSheet.es-ES.xnb": "44690eada4950238947a702345f6be2589bb1626d5f6da069397d192f52dd472",
    "Maps/spring_town.es-ES.xnb": "2abaee4d97099168c614383f149d76176010782f90b18b2bb8e88c045ababe4e",
    "Maps/springobjects.es-ES.xnb": "2b2830e64e1abb58e67c687313453e94a8258d6b62147870c65e87948ab7e049",
    "Maps/summer_beach.es-ES.xnb": "724b7d4a3670a2cb11d527bd47f3b02b91c2f78158a6371e927f019d33b1efa3",
    "Maps/summer_outdoorsTileSheet.es-ES.xnb": "36e27a8d64c0a80ad0ceb0d5008b190732d28c82bb3f560a844a7fdd730eaa9e",
    "Maps/summer_town.es-ES.xnb": "1a5b07a80e17fabdebd22bdc596e99f2a2b4375210cbc4983f13508562d7f3cc",
    "Maps/townInterior.es-ES.xnb": "c4d6684153810df27aba5cd8848bae8640c9b49bd8fc5c2f6ccca62a0c9e3663",
    "Maps/winter_beach.es-ES.xnb": "32b1ac90db4843c8f3f5f938993ab72554041d09d6611fd3d97781d184626867",
    "Maps/winter_outdoorsTileSheet.es-ES.xnb": "d40fe0d24fd4eb7d2213cc3f790f157985013596e7734519d707e62bb0b5b410",
    "Maps/winter_town.es-ES.xnb": "1b766313fdf7b13189e6fd3b9f779eafd28527f9564b34f3e0bf3ba8ab099183",
    "Minigames/Intro.es-ES.xnb": "2a13f91025f3be4206fa89d22b2170c8e694472882b269c1e376367f84f949ad",
    "Minigames/Xb1ProfileButton.es-ES.xnb": "10f93c197b9574fdb50e57c54a8b088fe048a857e0fbee24ec385312ff8651cc",
    "Minigames/jojacorps.es-ES.xnb": "8e2c358b80acba2d6f618554e847ade2b1a0d501bc3ae489f22838e3a1af8a8a",
}


def fitted_font(
    text: str,
    max_width: int,
    max_height: int,
    start: int,
    *,
    font_path: Path | None = None,
) -> ImageFont.FreeTypeFont:
    font_path = font_path or (FONT if FONT.exists() else FALLBACK_FONT)
    probe = Image.new("L", (1, 1))
    draw = ImageDraw.Draw(probe)
    for size in range(start, 9, -1):
        font = ImageFont.truetype(str(font_path), size)
        box = draw.multiline_textbbox(
            (0, 0), text, font=font, spacing=-4, align="center", stroke_width=0
        )
        if box[2] - box[0] <= max_width and box[3] - box[1] <= max_height:
            return font
    raise ValueError(f"Unable to fit label: {text}")


def centered_text(
    image: Image.Image,
    box: tuple[int, int, int, int],
    text: str,
    *,
    start_size: int,
    fill: int | tuple[int, int, int, int],
    font_path: Path | None = None,
) -> None:
    left, top, right, bottom = box
    font = fitted_font(
        text, right - left, bottom - top, start_size, font_path=font_path
    )
    draw = ImageDraw.Draw(image)
    bounds = draw.multiline_textbbox(
        (0, 0), text, font=font, spacing=-4, align="center"
    )
    width = bounds[2] - bounds[0]
    height = bounds[3] - bounds[1]
    x = left + (right - left - width) / 2 - bounds[0]
    y = top + (bottom - top - height) / 2 - bounds[1]
    draw.multiline_text(
        (x, y), text, font=font, fill=fill, spacing=-4, align="center"
    )


def replace_last_row(path: Path, row: Image.Image, row_height: int) -> None:
    source = Image.open(path).convert(row.mode)
    expected_width = row.width
    if source.width != expected_width:
        raise ValueError(f"Unexpected width for {path}: {source.size}")
    if source.height not in (OLD_ROWS * row_height, (OLD_ROWS + 1) * row_height):
        raise ValueError(f"Unexpected height for {path}: {source.size}")
    retained = source.crop((0, 0, expected_width, OLD_ROWS * row_height))
    output = Image.new(row.mode, (expected_width, (OLD_ROWS + 1) * row_height))
    output.paste(retained, (0, 0))
    output.paste(row, (0, OLD_ROWS * row_height))
    output.save(path, format="PNG", optimize=False)


def language_button_row() -> Image.Image:
    row = Image.new("L", (174, 39), 0)
    centered_text(row, (7, 7, 167, 32), "ESPAÑOL LATAM", start_size=17, fill=255)
    return row.point(lambda value: 255 if value >= 128 else 0)


def title_button_row() -> Image.Image:
    row = Image.new("RGBA", (888, 174), (255, 255, 255, 0))
    labels = ("NUEVA\nPARTIDA", "CARGAR", "COOPERATIVO", "SALIR")
    for index, label in enumerate(labels):
        left = index * 222 + 10
        centered_text(
            row,
            (left, 28, left + 202, 120),
            label,
            start_size=42,
            fill=(255, 255, 255, 255),
            font_path=NARROW_FONT,
        )
    return row


def back_row() -> Image.Image:
    row = Image.new("RGBA", (264, 108), (255, 255, 255, 0))
    centered_text(row, (40, 18, 200, 90), "ATRÁS", start_size=44, fill=(255, 255, 255, 255))
    return row


def developer_row() -> Image.Image:
    row = Image.new("RGBA", (333, 180), (255, 255, 255, 0))
    text = "CREADO POR"
    font = fitted_font(text, 267, 36, 36)
    draw = ImageDraw.Draw(row)
    bounds = draw.textbbox((0, 0), text, font=font)
    width = bounds[2] - bounds[0]
    height = bounds[3] - bounds[1]
    x = 30 + (273 - width) / 2 - bounds[0]
    y = 12 + (42 - height) / 2 - bounds[1]
    draw.text((x + 3, y + 3), text, font=font, fill=(159, 182, 255, 255))
    draw.text((x, y), text, font=font, fill=(254, 254, 255, 255))
    return row


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--spanish-title-atlas",
        type=Path,
        help="unpacked Stardew Valley 1.6.15 TitleButtons.es-ES.png",
    )
    parser.add_argument(
        "--spanish-content-root",
        type=Path,
        help="Stardew Valley 1.6.15 Content directory containing es-ES XNBs",
    )
    args = parser.parse_args()

    replace_last_row(
        SCRIPT_ASSETS / "language-button-labels.png", language_button_row(), 39
    )
    replace_last_row(SCRIPT_ASSETS / "title-button-labels.png", title_button_row(), 174)
    replace_last_row(SCRIPT_ASSETS / "title-back-labels.png", back_row(), 108)
    replace_last_row(
        SCRIPT_ASSETS / "title-developer-labels.png", developer_row(), 180
    )

    target_atlas = PAYLOAD_ASSETS / "title/TitleButtons-latin-american-spanish.png"
    if args.spanish_title_atlas:
        source = Image.open(args.spanish_title_atlas).convert("RGBA")
        if source.size != (400, 655):
            raise ValueError(f"Unexpected Spanish title atlas size: {source.size}")
        if hashlib.sha256(args.spanish_title_atlas.read_bytes()).hexdigest() != EXPECTED_TITLE_SHA256:
            raise ValueError("Spanish title atlas does not match Stardew Valley 1.6.15")
        shutil.copyfile(args.spanish_title_atlas, target_atlas)
    if not target_atlas.exists():
        raise ValueError("Pass --spanish-title-atlas to import the official Spanish texture")
    if hashlib.sha256(target_atlas.read_bytes()).hexdigest() != EXPECTED_TITLE_SHA256:
        raise ValueError("Checked-in Latin American Spanish title atlas is not the approved Spanish texture")

    texture_root = PAYLOAD_ASSETS / "textures/es-419"
    for relative, expected_hash in EXPECTED_TEXTURE_HASHES.items():
        target_relative = relative.replace(".es-ES.xnb", ".xnb")
        target = texture_root / target_relative
        if args.spanish_content_root:
            source = args.spanish_content_root / relative
            if not source.exists():
                raise ValueError(f"Missing Spanish texture: {source}")
            if hashlib.sha256(source.read_bytes()).hexdigest() != expected_hash:
                raise ValueError(f"Spanish texture does not match Stardew Valley 1.6.15: {relative}")
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source, target)
        if not target.exists():
            raise ValueError(
                "Pass --spanish-content-root to import the official Spanish textures"
            )
        if hashlib.sha256(target.read_bytes()).hexdigest() != expected_hash:
            raise ValueError(f"Checked-in Spanish texture has unexpected bytes: {target_relative}")

    print("Prepared Latin American Spanish selector labels and 29 native Spanish textures.")


if __name__ == "__main__":
    main()

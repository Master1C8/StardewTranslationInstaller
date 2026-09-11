#!/usr/bin/env python3
"""Render the two VN Revival language pages from the assets shipped in the pack."""

from pathlib import Path
import json
import sys

from PIL import Image


if len(sys.argv) not in (1, 2):
    raise SystemExit("Usage: render-language-selector-preview.py [output-directory]")

project_root = Path(__file__).resolve().parent.parent
payload = project_root / "Sources/StardewTranslationInstaller/Resources/ModPayload"
package_config = project_root / "Sources/StardewTranslationInstaller/Resources/PackageConfig.json"
output_directory = Path(sys.argv[1]) if len(sys.argv) == 2 else Path("/private/tmp")

codes = json.loads(package_config.read_text(encoding="utf-8"))["languageCodes"]
content = json.loads((payload / "content.json").read_text(encoding="utf-8"))
entries = content["Changes"][0]["Entries"]
language_by_code = {value["LanguageCode"]: value for value in entries.values()}
loads = {
    change["Target"]: change["FromFile"]
    for change in content["Changes"]
    if change.get("Action") == "Load" and change.get("Target", "").startswith("Mods/")
}

expected_pages = [codes[:12], codes[12:]]
if [len(page) for page in expected_pages] != [12, 7]:
    raise SystemExit("The VN language selector must contain pages of 12 and 7 languages.")

scale = 4
button_width = 174 * scale
button_height = 39 * scale
gap_x = 20
gap_y = 12
margin = 16

output_directory.mkdir(parents=True, exist_ok=True)
for page_index, page in enumerate(expected_pages, start=1):
    rows = (len(page) + 2) // 3
    preview = Image.new(
        "RGBA",
        (
            margin * 2 + button_width * 3 + gap_x * 2,
            margin * 2 + button_height * rows + gap_y * (rows - 1),
        ),
        (0, 17, 27, 255),
    )
    for index, code in enumerate(page):
        language = language_by_code[code]
        target = language["ButtonTexture"]
        relative_path = loads[target]
        atlas = Image.open(payload / relative_path).convert("RGBA")
        if atlas.size != (174, 78):
            raise SystemExit(f"Unexpected button dimensions for {code}: {atlas.size}")
        button = atlas.crop((0, 0, 174, 39)).resize(
            (button_width, button_height), Image.Resampling.NEAREST
        )
        column = index % 3
        row = index // 3
        preview.alpha_composite(
            button,
            (
                margin + column * (button_width + gap_x),
                margin + row * (button_height + gap_y),
            ),
        )
    output_path = output_directory / f"language-selector-page-{page_index}.png"
    preview.save(output_path, format="PNG")
    print(output_path)

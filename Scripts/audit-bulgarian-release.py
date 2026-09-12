#!/usr/bin/env python3
"""Audit the complete Bulgarian package and its runtime registration."""

import json
from pathlib import Path
import struct
import sys


ROOT = Path(__file__).resolve().parents[1]
RESOURCES = ROOT / "Sources/StardewTranslationInstaller/Resources"
PAYLOAD = RESOURCES / "ModPayload"
TRANSLATIONS = PAYLOAD / "assets/translations/bulgarian"
LANGUAGE = "bg-vnrevival"


def read(path: Path):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f"duplicate JSON key {key!r} in {path.relative_to(ROOT)}")
            result[key] = value
        return result

    return json.loads(path.read_text(), object_pairs_hook=unique)


def png_size(path: Path):
    data = path.read_bytes()[:24]
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        return None
    return struct.unpack(">II", data[16:24])


def main() -> int:
    errors = []
    files = sorted(TRANSLATIONS.rglob("*.json"))
    expected_includes = [f"assets/translations/bulgarian/{path.relative_to(TRANSLATIONS).as_posix()}"
                         for path in files]

    package = read(RESOURCES / "PackageConfig.json")
    if package.get("languageCodes", []).count(LANGUAGE) != 1:
        errors.append("PackageConfig must contain bg-vnrevival exactly once")
    if "Български" not in package.get("nativeLanguageName", ""):
        errors.append("PackageConfig nativeLanguageName omits Български")

    manifest = read(PAYLOAD / "manifest.json")
    if "Bulgarian" not in manifest.get("Description", ""):
        errors.append("manifest description omits Bulgarian")

    content = read(PAYLOAD / "content.json")
    if content.get("Format") != "2.9.0" or not content.get("Changes"):
        errors.append("root content.json has an invalid Format or empty Changes")
    changes = content.get("Changes", [])
    registrations = [change for change in changes
                     if change.get("Action") == "EditData"
                     and change.get("Target") == "Data/AdditionalLanguages"]
    if len(registrations) != 1:
        errors.append("expected exactly one AdditionalLanguages patch")
        language = {}
    else:
        language = registrations[0].get("Entries", {}).get("{{ModId}}_Bulgarian", {})
    expected_language = {
        "ID": "{{ModId}}_Bulgarian",
        "LanguageCode": LANGUAGE,
        "ButtonTexture": "Mods/{{ModId}}/ButtonBulgarian",
        "UseLatinFont": False,
        "FontFile": "Fonts/Bulgarian",
        "FontPixelZoom": 1,
        "TimeFormat": "[HOURS_24_00]:[MINUTES]",
        "ClockTimeFormat": "[HOURS_24_00]:[MINUTES]",
        "ClockDateFormat": "[DAY_OF_MONTH] [DAY_OF_WEEK]",
        "NumberComma": " ",
    }
    if language != expected_language:
        errors.append("Bulgarian AdditionalLanguages registration is incomplete")

    expected_loads = [
        ("Mods/{{ModId}}/ButtonBulgarian", None, "assets/button-bulgarian.png"),
        ("Minigames/TitleButtons", LANGUAGE, "assets/title/TitleButtons-bulgarian.png"),
        ("Fonts/SpriteFont1", LANGUAGE, "assets/fonts/bulgarian/SpriteFont1.xnb"),
        ("Fonts/SmallFont", LANGUAGE, "assets/fonts/bulgarian/SmallFont.xnb"),
        ("Fonts/Bulgarian", None, "assets/fonts/bulgarian/Bulgarian.xnb"),
        ("Fonts/Bulgarian_0", None, "assets/fonts/bulgarian/Bulgarian_0.xnb"),
    ]
    for target, locale, source in expected_loads:
        matches = [change for change in changes if change.get("Action") == "Load"
                   and change.get("Target") == target
                   and change.get("TargetLocale") == locale
                   and change.get("FromFile") == source]
        if len(matches) != 1:
            errors.append(f"expected one Bulgarian load: {target} <- {source}")

    actual_includes = [change.get("FromFile") for change in changes
                       if change.get("Action") == "Include"
                       and str(change.get("FromFile", "")).startswith("assets/translations/bulgarian/")]
    if actual_includes != expected_includes:
        errors.append("Bulgarian includes are missing, duplicated, or out of order")

    identities = set()
    records = 0
    for path in files:
        document = read(path)
        relative = path.relative_to(ROOT)
        if "Format" in document or not document.get("Changes"):
            errors.append(f"invalid secondary patch: {relative}")
        for change in document.get("Changes", []):
            if change.get("Action") != "EditData" or change.get("When") != {"Language": LANGUAGE}:
                errors.append(f"invalid action or language gate: {relative}")
            if not change.get("Entries") and not change.get("Fields"):
                errors.append(f"empty Changes entry: {relative}")
            target = change.get("Target")
            for key, value in change.get("Entries", {}).items():
                identity = (target, key)
                if identity in identities:
                    errors.append(f"duplicate translated record: {target} :: {key}")
                identities.add(identity)
                records += 1
                if not isinstance(value, str):
                    errors.append(f"non-string translation: {target} :: {key}")
            for key, fields in change.get("Fields", {}).items():
                if not isinstance(fields, dict) or not fields:
                    errors.append(f"invalid Fields patch: {target} :: {key}")
                    continue
                for field, value in fields.items():
                    identity = (target, f"{key}.{field}")
                    if identity in identities:
                        errors.append(f"duplicate translated field: {target} :: {key}.{field}")
                    identities.add(identity)
                    records += 1
                    if not isinstance(value, str):
                        errors.append(f"non-string translation: {target} :: {key}.{field}")
    if len(files) != 609:
        errors.append(f"Bulgarian patch count is {len(files)}, expected 609")
    if records != 14725 or len(identities) != 14725:
        errors.append(f"Bulgarian record count is {records}/{len(identities)}, expected 14725")

    for relative, dimensions in [
        ("assets/button-bulgarian.png", (174, 78)),
        ("assets/title/TitleButtons-bulgarian.png", (400, 655)),
    ]:
        path = PAYLOAD / relative
        if not path.is_file() or png_size(path) != dimensions:
            errors.append(f"invalid Bulgarian PNG: {relative}")
    for relative in [
        "assets/fonts/bulgarian/SpriteFont1.xnb",
        "assets/fonts/bulgarian/SmallFont.xnb",
    ]:
        path = PAYLOAD / relative
        if not path.is_file() or path.read_bytes()[:3] != b"XNB":
            errors.append(f"invalid Bulgarian XNB: {relative}")

    switcher = (ROOT / "Tools/VNRevivalLanguageSwitcher/ModEntry.cs").read_text()
    for marker in ['BulgarianLanguageCode = "bg-vnrevival"', "Utility.AOrAn", "__result = string.Empty"]:
        if marker not in switcher:
            errors.append(f"language switcher omits Bulgarian runtime marker: {marker}")

    if errors:
        print("Bulgarian release audit failed:")
        for error in errors:
            print(f"- {error}")
        return 1
    print(f"Bulgarian release audit passed: {len(files)} patches, {records} records, exact registration/includes/assets.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

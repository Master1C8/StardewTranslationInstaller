#!/usr/bin/env python3
"""Audit the complete Dutch Content Patcher runtime contract."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
PAYLOAD = ROOT / "Sources/StardewTranslationInstaller/Resources/ModPayload"
TRANSLATIONS = PAYLOAD / "assets/translations/dutch"
LANGUAGE = "nl-vnrevival"
errors: list[str] = []


def read(path: Path):
    try:
        return json.loads(path.read_text())
    except Exception as exc:
        errors.append(f"invalid JSON {path.relative_to(ROOT)}: {exc}")
        return {}


config = read(ROOT / "Sources/StardewTranslationInstaller/Resources/PackageConfig.json")
if config.get("languageCodes", []).count(LANGUAGE) != 1:
    errors.append("PackageConfig must contain nl-vnrevival exactly once")

content = read(PAYLOAD / "content.json")
if content.get("Format") != "2.9.0" or not isinstance(content.get("Changes"), list):
    errors.append("root content.json must contain Format 2.9.0 and Changes")
changes = content.get("Changes", [])
language_patches = [c for c in changes if c.get("Action") == "EditData" and c.get("Target") == "Data/AdditionalLanguages"]
entry = language_patches[0].get("Entries", {}).get("{{ModId}}_Dutch", {}) if len(language_patches) == 1 else {}
expected_entry = {
    "ID": "{{ModId}}_Dutch",
    "LanguageCode": LANGUAGE,
    "ButtonTexture": "Mods/{{ModId}}/ButtonDutch",
    "UseLatinFont": True,
    "FontPixelZoom": 1,
    "TimeFormat": "[HOURS_24_00]:[MINUTES]",
    "ClockTimeFormat": "[HOURS_24_00]:[MINUTES]",
    "ClockDateFormat": "[DAY_OF_MONTH] [DAY_OF_WEEK]",
    "NumberComma": " ",
}
if entry != expected_entry:
    errors.append("Dutch AdditionalLanguages entry differs from the runtime contract")


def require_load(target: str, source: str, *, locale: str | None = None) -> None:
    matches = [
        c for c in changes
        if c.get("Action") == "Load"
        and c.get("Target") == target
        and c.get("FromFile") == source
        and c.get("TargetLocale") == locale
    ]
    if len(matches) != 1:
        errors.append(f"expected one Load for {target} from {source} with locale {locale}")
    if not (PAYLOAD / source).is_file():
        errors.append(f"missing runtime asset {source}")


require_load("Mods/{{ModId}}/ButtonDutch", "assets/button-dutch.png")
require_load("Minigames/TitleButtons", "assets/title/TitleButtons-dutch.png", locale=LANGUAGE)
require_load("Fonts/SpriteFont1", "assets/fonts/dutch/SpriteFont1.xnb", locale=LANGUAGE)
require_load("Fonts/SmallFont", "assets/fonts/dutch/SmallFont.xnb", locale=LANGUAGE)

files = sorted(TRANSLATIONS.rglob("*.json"))
expected_includes = {f"assets/translations/dutch/{p.relative_to(TRANSLATIONS).as_posix()}" for p in files}
all_includes = [c.get("FromFile") for c in changes if c.get("Action") == "Include"]
dutch_includes = [p for p in all_includes if isinstance(p, str) and p.startswith("assets/translations/dutch/")]
if len(dutch_includes) != len(expected_includes) or set(dutch_includes) != expected_includes:
    errors.append(f"Dutch Include set differs: actual={len(dutch_includes)} expected={len(expected_includes)}")
if len(dutch_includes) != len(set(dutch_includes)):
    errors.append("duplicate Dutch Include entries")

records = 0
for file in files:
    document = read(file)
    if "Format" in document:
        errors.append(f"secondary Format in {file.relative_to(TRANSLATIONS)}")
    secondary_changes = document.get("Changes")
    if not isinstance(secondary_changes, list) or not secondary_changes:
        errors.append(f"empty Changes in {file.relative_to(TRANSLATIONS)}")
        continue
    expected_target = file.relative_to(TRANSLATIONS).with_suffix("").as_posix()
    if len(secondary_changes) != 1:
        errors.append(f"expected one change in {file.relative_to(TRANSLATIONS)}")
    for change in secondary_changes:
        if change.get("Action") != "EditData" or change.get("Target") != expected_target:
            errors.append(f"invalid action/target in {file.relative_to(TRANSLATIONS)}")
        if change.get("When") != {"Language": LANGUAGE}:
            errors.append(f"invalid language gate in {file.relative_to(TRANSLATIONS)}")
        entries = change.get("Entries")
        if not isinstance(entries, dict) or not entries:
            errors.append(f"empty Entries in {file.relative_to(TRANSLATIONS)}")
        else:
            records += len(entries)

report = {
    "locale": "nl",
    "languageCode": LANGUAGE,
    "translationFiles": len(files),
    "runtimeIncludes": len(dutch_includes),
    "records": records,
    "errors": errors,
    "warnings": [],
    "releaseContractReady": not errors and records == 14720,
}
print(json.dumps(report, ensure_ascii=False, indent=2))
raise SystemExit(1 if errors or records != 14720 else 0)

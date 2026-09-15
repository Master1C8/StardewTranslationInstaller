#!/usr/bin/env python3
"""Deterministic integrity and editorial-lint audit for the es-419 glossary."""

from __future__ import annotations

import hashlib
import json
import re
import unicodedata
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SITE_ROOT = ROOT.parent / "SiteForMods"
SOURCE = SITE_ROOT / "data/games/stardew-valley/glossary.json"
CANONICAL = SITE_ROOT / "data/games/stardew-valley/glossary-translations.json"
WORKING = ROOT / "Documentation/latin-american-spanish/glossary-working.json"
SNAPSHOT = ROOT / "Documentation/glossary/glossary.es-419.json"
BATCH_DIR = ROOT / "Documentation/latin-american-spanish/glossary-batches"
LOCALE = "es-419"
EXPECTED_COUNT = 673
EXPECTED_SOURCE_SHA256 = (
    "b8fe9c8f5aaf9bedc990dabd2ce552d4f334450f03afee9949f75e376ab4bff9"
)

# Proper names, conventional loans, and invariant labels intentionally retained.
UNCHANGED_TERM_IDS = {
    "stardew-valley", "junimo", "yoba", "festival", "krobus", "oasis",
    "casino", "silo", "luau", "abigail", "alex", "birdie", "caroline",
    "clint", "demetrius", "elliott", "emily", "evelyn", "fizz", "george",
    "gil", "gunther", "gus", "haley", "harvey", "jas", "jodi", "kent",
    "leah", "leo", "linus", "marlon", "marnie", "maru", "morris", "pam",
    "penny", "pierre", "robin", "sam", "sandy", "sebastian", "shane",
    "vincent", "welwick", "willy", "social-menu", "pepper-rex", "caviar",
    "grampleton", "gridball", "fector", "junimo-kart", "calicojack", "wumbus",
    "slime-monster",
}

IBERIAN_ONLY = re.compile(
    r"\b(?:vosotros|vosotras|coger|coged|vale|guay|ordenador|móvil|patata|"
    r"judía|melocotón|zumo|betabel(?:es)?)\b",
    re.IGNORECASE,
)
BAD_SPACING = re.compile(r" {2,}|\s+[.,;:!?]|[¿¡]\s")
NUMBER = re.compile(r"\d+(?:\.\d+)?(?:\s*%)?")


def read_json(path: Path):
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def normalized_numbers(text: str) -> set[str]:
    return {value.replace(" ", "") for value in NUMBER.findall(text)}


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def main() -> int:
    errors: list[str] = []
    source_bytes = SOURCE.read_bytes()
    source_sha = hashlib.sha256(source_bytes).hexdigest()
    if source_sha != EXPECTED_SOURCE_SHA256:
        fail(errors, f"source SHA mismatch: {source_sha}")

    source = read_json(SOURCE)
    canonical_all = read_json(CANONICAL)
    working_all = read_json(WORKING)
    snapshot_all = read_json(SNAPSHOT)
    canonical = canonical_all.get(LOCALE, {})
    working = working_all.get(LOCALE, {})
    snapshot = snapshot_all.get(LOCALE, {})
    source_ids = [entry["id"] for entry in source]

    if len(source) != EXPECTED_COUNT:
        fail(errors, f"source count is {len(source)}, expected {EXPECTED_COUNT}")
    for label, layer in (("canonical", canonical), ("working", working), ("snapshot", snapshot)):
        if list(layer) != source_ids:
            fail(errors, f"{label} IDs or order differ from the English source")
        if len(layer) != EXPECTED_COUNT:
            fail(errors, f"{label} count is {len(layer)}, expected {EXPECTED_COUNT}")
    if canonical != working or canonical != snapshot:
        fail(errors, "canonical, working, and snapshot es-419 layers are not identical")

    batch_entries: dict[str, dict[str, str]] = {}
    for path in sorted(BATCH_DIR.glob("*.json")):
        batch = read_json(path)
        if batch.get("locale") != LOCALE:
            fail(errors, f"{path.name}: wrong locale")
        if batch.get("sourceSha256") != EXPECTED_SOURCE_SHA256:
            fail(errors, f"{path.name}: wrong source SHA")
        if batch.get("reviewedAgainstEnglish") is not True:
            fail(errors, f"{path.name}: not marked reviewed against English")
        for entry_id, value in batch.get("entries", {}).items():
            if entry_id in batch_entries:
                fail(errors, f"duplicate batch ID: {entry_id}")
            batch_entries[entry_id] = value
    if set(batch_entries) != set(source_ids):
        fail(errors, "batch ID coverage differs from the English source")
    if any(batch_entries.get(entry_id) != canonical.get(entry_id) for entry_id in source_ids):
        fail(errors, "merged batch content differs from the canonical layer")

    for entry in source:
        entry_id = entry["id"]
        value = canonical.get(entry_id, {})
        term = value.get("term")
        meaning = value.get("meaning")
        if not isinstance(term, str) or not term.strip():
            fail(errors, f"{entry_id}: empty or invalid term")
            continue
        if not isinstance(meaning, str) or not meaning.strip():
            fail(errors, f"{entry_id}: empty or invalid meaning")
            continue
        for field, text in (("term", term), ("meaning", meaning)):
            if text != text.strip():
                fail(errors, f"{entry_id}: surrounding whitespace in {field}")
            if text != unicodedata.normalize("NFC", text):
                fail(errors, f"{entry_id}: non-NFC Unicode in {field}")
            if BAD_SPACING.search(text):
                fail(errors, f"{entry_id}: suspicious spacing in {field}")
            if IBERIAN_ONLY.search(text):
                fail(errors, f"{entry_id}: region-specific term in {field}")
        if not meaning.endswith("."):
            fail(errors, f"{entry_id}: meaning is not a complete sentence")
        if entry["term"] == term and entry_id not in UNCHANGED_TERM_IDS:
            fail(errors, f"{entry_id}: unchanged English term is not allowlisted")
        source_alternatives = entry["term"].count("/")
        target_alternatives = term.count("/")
        if source_alternatives > target_alternatives and entry_id != "fishing-rod-pole":
            fail(errors, f"{entry_id}: a source term alternative may be missing")
        missing_numbers = normalized_numbers(entry["meaning"]) - normalized_numbers(meaning)
        if missing_numbers:
            fail(errors, f"{entry_id}: missing numeric facts {sorted(missing_numbers)}")

    if errors:
        print(f"FAIL: {len(errors)} issue(s)")
        for error in errors:
            print(f"- {error}")
        return 1

    snapshot_sha = hashlib.sha256(SNAPSHOT.read_bytes()).hexdigest()
    print(
        "PASS: 673/673 es-419 entries; source, canonical, working snapshot, "
        "repository snapshot, and 12 batches agree."
    )
    print(f"Source SHA-256: {source_sha}")
    print(f"Snapshot SHA-256: {snapshot_sha}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

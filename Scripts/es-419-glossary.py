#!/usr/bin/env python3
"""Apply directly authored es-419 glossary batches and report structural progress.

This tool never generates translated wording or infers editorial quality.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SITE_ROOT = Path("/Users/antonkrutov/Desktop/SiteForMods")
SOURCE_PATH = SITE_ROOT / "data/games/stardew-valley/glossary.json"
TRANSLATIONS_PATH = SITE_ROOT / "data/games/stardew-valley/glossary-translations.json"
DOC_ROOT = ROOT / "Documentation/latin-american-spanish"
WORKING_PATH = DOC_ROOT / "glossary-working.json"
CHECKPOINT_PATH = DOC_ROOT / "checkpoint.json"
FINAL_SNAPSHOT_PATH = ROOT / "Documentation/glossary/glossary.es-419.json"
LOCALE = "es-419"


def read(path: Path):
    def unique_pairs(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f"Duplicate JSON key in {path}: {key}")
            result[key] = value
        return result

    return json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=unique_pairs)


def write(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(value, ensure_ascii=False, indent=2) + "\n"
    if not path.exists() or path.read_text(encoding="utf-8") != text:
        path.write_text(text, encoding="utf-8")


def source_sha256() -> str:
    return hashlib.sha256(SOURCE_PATH.read_bytes()).hexdigest()


def ordered_layer(source, layer):
    source_ids = [entry["id"] for entry in source]
    unknown = sorted(set(layer) - set(source_ids))
    if unknown:
        raise ValueError("Unknown glossary IDs: " + ", ".join(unknown))
    return {entry_id: layer[entry_id] for entry_id in source_ids if entry_id in layer}


def validate_value(entry_id: str, value) -> None:
    if not isinstance(value, dict) or set(value) != {"term", "meaning"}:
        raise ValueError(f"{entry_id}: expected only term and meaning")
    for field in ("term", "meaning"):
        if not isinstance(value[field], str) or not value[field].strip():
            raise ValueError(f"{entry_id}.{field}: expected non-empty text")
        if "\ufffd" in value[field]:
            raise ValueError(f"{entry_id}.{field}: replacement character")


def structural_report(source, layer):
    source_ids = [entry["id"] for entry in source]
    layer_ids = list(layer)
    missing = [entry_id for entry_id in source_ids if entry_id not in layer]
    extra = [entry_id for entry_id in layer_ids if entry_id not in set(source_ids)]
    empty = []
    for entry_id, value in layer.items():
        try:
            validate_value(entry_id, value)
        except ValueError as error:
            empty.append(str(error))
    return {
        "locale": LOCALE,
        "sourceEntries": len(source_ids),
        "translationEntries": len(layer_ids),
        "idsAndOrderMatch": layer_ids == source_ids,
        "missingEntries": len(missing),
        "extraEntries": len(extra),
        "invalidEntries": empty,
        "firstMissingIds": missing[:10],
        "sourceSha256": source_sha256(),
        "editorialStatus": "not inferred; two consecutive clean full-entry audits are required",
    }


def apply_batch(path: Path) -> None:
    source = read(SOURCE_PATH)
    batch = read(path)
    if batch.get("locale") != LOCALE:
        raise ValueError(f"Batch locale must be {LOCALE}")
    if batch.get("sourceSha256") != source_sha256():
        raise ValueError("Batch was authored against another English glossary revision")
    if batch.get("reviewedAgainstEnglish") is not True:
        raise ValueError("Batch must attest direct source-English review")
    entries = batch.get("entries")
    if not isinstance(entries, dict) or not entries:
        raise ValueError("Batch must contain translated entries")
    source_ids = {entry["id"] for entry in source}
    for entry_id, value in entries.items():
        if entry_id not in source_ids:
            raise ValueError(f"Unknown glossary ID: {entry_id}")
        validate_value(entry_id, value)

    translations = read(TRANSLATIONS_PATH)
    layer = dict(translations.get(LOCALE, {}))
    layer.update(entries)
    layer = ordered_layer(source, layer)
    translations[LOCALE] = layer
    write(TRANSLATIONS_PATH, translations)
    write(WORKING_PATH, {LOCALE: layer})

    report = structural_report(source, layer)
    checkpoint = read(CHECKPOINT_PATH)
    checkpoint["glossary"].update({
        "translatedEntries": report["translationEntries"],
        "remainingEntries": report["missingEntries"],
        "sourceSha256": report["sourceSha256"],
        "structurallyComplete": report["idsAndOrderMatch"] and not report["invalidEntries"],
    })
    checkpoint["nextAction"] = (
        "Translate the next missing glossary batch directly from the canonical English source."
        if report["missingEntries"]
        else "Begin the first complete source-fidelity glossary audit."
    )
    write(CHECKPOINT_PATH, checkpoint)
    print(json.dumps({"applied": len(entries), **report}, ensure_ascii=False, indent=2))


def next_entries(count: int) -> None:
    source = read(SOURCE_PATH)
    translations = read(TRANSLATIONS_PATH)
    layer = translations.get(LOCALE, {})
    pending = [entry for entry in source if entry["id"] not in layer][:count]
    print(json.dumps({
        "locale": LOCALE,
        "sourceSha256": source_sha256(),
        "pendingEnglish": pending,
    }, ensure_ascii=False, indent=2))


def audit() -> int:
    source = read(SOURCE_PATH)
    translations = read(TRANSLATIONS_PATH)
    layer = ordered_layer(source, translations.get(LOCALE, {}))
    report = structural_report(source, layer)
    write(WORKING_PATH, {LOCALE: layer})
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 1 if report["extraEntries"] or report["invalidEntries"] else 0


def snapshot() -> None:
    source = read(SOURCE_PATH)
    translations = read(TRANSLATIONS_PATH)
    layer = ordered_layer(source, translations.get(LOCALE, {}))
    report = structural_report(source, layer)
    if not report["idsAndOrderMatch"] or report["invalidEntries"]:
        raise ValueError("Cannot create the canonical snapshot before structural completion")
    write(FINAL_SNAPSHOT_PATH, {LOCALE: layer})
    print(FINAL_SNAPSHOT_PATH)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)
    next_parser = subparsers.add_parser("next")
    next_parser.add_argument("--count", type=int, default=50)
    apply_parser = subparsers.add_parser("apply")
    apply_parser.add_argument("batch", type=Path)
    subparsers.add_parser("audit")
    subparsers.add_parser("snapshot")
    args = parser.parse_args()
    if args.command == "next":
        next_entries(args.count)
    elif args.command == "apply":
        apply_batch(args.batch.resolve())
    elif args.command == "audit":
        return audit()
    else:
        snapshot()
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (KeyError, ValueError) as error:
        print(error)
        raise SystemExit(1)

#!/usr/bin/env python3
"""Release audit for the complete, reviewed Greek Stardew Valley locale."""

import argparse
from collections import Counter
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import sys
import unicodedata

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / "Documentation/greek"
TRANSLATIONS = ROOT / "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/greek"
PAYLOAD = ROOT / "Sources/StardewTranslationInstaller/Resources/ModPayload"
LOCALE = "el-vnrevival"

def strict_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate JSON key {key!r}")
        result[key] = value
    return result

def read(path):
    return json.loads(path.read_text(), object_pairs_hook=strict_object)

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def json_files(path):
    return sorted(item for item in path.rglob("*.json") if item.is_file())

def load_batch_module():
    spec = importlib.util.spec_from_file_location("greek_batches", ROOT / "Scripts/greek-batches.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def visible_text(row, batch_module):
    if row.get("structure") in ("event", "eventFragment"):
        return batch_module.event_parts(batch_module.full_event(row, row["translation"]))[1]
    return [row["translation"]]

def english_leak(value):
    common = {
        "the", "a", "an", "and", "or", "but", "if", "then", "else", "this", "that",
        "these", "those", "is", "are", "was", "were", "be", "been", "being", "have",
        "has", "had", "do", "does", "did", "can", "could", "would", "should", "will",
        "may", "might", "must", "of", "in", "on", "at", "to", "from", "for", "with",
        "without", "by", "as", "into", "through", "about", "over", "under", "after",
        "before", "between", "during", "your", "you", "yours", "our", "we", "us", "they",
        "them", "their", "he", "him", "his", "she", "her", "it", "its", "not", "no",
        "yes", "all", "any", "some", "one", "two", "how", "what", "why", "where", "when",
        "who", "which", "here", "there", "very", "more", "most", "less", "than", "also",
        "just", "still", "already", "now",
    }
    value = re.sub(r"\$q\s+[^#]*#|\$r\s+[^#]*#|\$query\s+[^#|]*#", " ", value)
    value = re.sub(
        r"https?://\S+|\{\{[^}]+\}\}|\{[A-Za-z0-9_:]+\}|\[[^]]+\]|"
        r"\$[A-Za-z0-9]+|\([A-Z]+\)[A-Za-z0-9_]+|%[A-Za-z][A-Za-z0-9_]*",
        " ", value,
    )
    words = re.findall(r"[A-Za-z]+(?:['’-][A-Za-z]+)?", value)
    return [word for word in words if word.lower() in common]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--idempotence", action="store_true")
    args = parser.parse_args()
    errors = []
    warnings = []
    batch_module = load_batch_module()

    completed = subprocess.run(
        [sys.executable, str(ROOT / "Scripts/greek-batches.py"), "--complete"],
        cwd=ROOT, text=True, capture_output=True,
    )
    if completed.returncode:
        errors.append("greek-batches --complete failed: " + (completed.stderr or completed.stdout).strip())

    all_json = (
        json_files(DOC) + json_files(TRANSLATIONS)
        + [PAYLOAD / "content.json", PAYLOAD / "manifest.json",
           ROOT / "Sources/StardewTranslationInstaller/Resources/PackageConfig.json"]
    )
    for path in all_json:
        try:
            read(path)
        except Exception as error:
            errors.append(f"invalid JSON: {path.relative_to(ROOT)}: {error}")

    rows = []
    identities = set()
    reviewed_batches = 0
    for path in sorted((DOC / "batches").glob("*.json")):
        batch = read(path)
        if batch.get("review", {}).get("status") != "reviewed":
            errors.append(f"unreviewed batch: {path.name}")
            continue
        reviewed_batches += 1
        for row in batch["records"]:
            identity = (row["target"], str(row["key"]), row.get("field"))
            if identity in identities:
                errors.append(f"duplicate reviewed identity: {identity!r}")
            identities.add(identity)
            rows.append(row)
            for field in ("translation", "femaleTranslation"):
                if field not in row:
                    continue
                value = row[field]
                if value != unicodedata.normalize("NFC", value):
                    errors.append(f"non-NFC {field}: {identity!r}")
                if "\ufffd" in value:
                    errors.append(f"replacement character in {field}: {identity!r}")
            if not row.get("preserveReason"):
                for value in visible_text(row, batch_module):
                    hits = english_leak(value)
                    if len(hits) >= 2:
                        errors.append(f"probable English leakage {identity!r}: {hits!r}")

    inventory = read(DOC / "source-inventory.json")
    if len(rows) != inventory["coverageDenominator"] or len(identities) != len(rows):
        errors.append(
            f"coverage mismatch: rows={len(rows)} unique={len(identities)} "
            f"expected={inventory['coverageDenominator']}"
        )
    editorial_review = read(DOC / "editorial-review.json")
    corpus_rows = [
        {
            key: row.get(key)
            for key in (
                "identity", "source", "translation", "femaleTranslation",
                "preserveReason", "glossaryIds",
            )
        }
        for row in rows
    ]
    corpus_hash = hashlib.sha256(json.dumps(
        corpus_rows, ensure_ascii=False, sort_keys=True, separators=(",", ":"),
    ).encode()).hexdigest()
    clean_editorial = editorial_review.get("passes", [])[-2:]
    if (
        editorial_review.get("corpusSHA256") != corpus_hash
        or editorial_review.get("reviewedRecords") != len(rows)
        or editorial_review.get("reviewedBatches") != reviewed_batches
        or editorial_review.get("consecutiveCleanFullPasses") != 2
        or len(clean_editorial) != 2
        or any(
            item.get("result") != "clean"
            or item.get("scope") != [1, len(rows)]
            or item.get("newFindings") != 0
            for item in clean_editorial
        )
    ):
        errors.append("Greek corpus lacks two current clean full editorial passes")
    glossary = read(ROOT / "Documentation/glossary/glossary.el.json")["el"]
    glossary_hash = sha(ROOT / "Documentation/glossary/glossary.el.json")
    glossary_review = read(DOC / "glossary-review.json")
    if glossary_review.get("lockedSHA256") != glossary_hash:
        errors.append("Greek glossary review hash is stale")
    clean_glossary = glossary_review.get("passes", [])[-2:]
    if len(clean_glossary) != 2 or any(
        item.get("result") != "clean"
        or item.get("scope") != [1, len(glossary)]
        or item.get("sha256") != glossary_hash
        for item in clean_glossary
    ):
        errors.append("Greek glossary lacks two current clean full passes")
    for row in rows:
        unknown = set(row.get("glossaryIds", [])) - set(glossary)
        if unknown:
            errors.append(f"unknown glossary IDs in {row['target']} :: {row['key']}: {sorted(unknown)}")

    corpus = "\n".join(row["translation"] for row in rows)
    forbidden = {
        "Καρολάιν": "Κάρολαϊν", "Μάρου": "Μαρού", "Δημήτριος": "Ντιμίτριους",
        "Ζουζού": "Ζούζου", "Τζούνιμο": "Τζουνίμο", "Κρανιοσπηλιά": "Σπήλαιο του Κρανίου",
    }
    for stale, canonical in forbidden.items():
        if stale in corpus:
            errors.append(f"stale Greek glossary spelling {stale!r}; expected {canonical!r}")

    male = {"Alex", "Clint", "Demetrius", "Dwarf", "Elliott", "George", "Gil", "Governor",
            "Grandpa", "Gunther", "Gus", "Harvey", "Henchman", "Kent", "Krobus", "Leo",
            "Lewis", "Linus", "Marlon", "Morris", "MrQi", "Pierre", "Sam", "Sebastian",
            "Shane", "Vincent", "Willy", "Wizard"}
    female = {"Abigail", "Birdie", "Caroline", "Claire", "Emily", "Evelyn", "Haley", "Jas",
              "Jodi", "Leah", "Marnie", "Maru", "Pam", "Penny", "Robin", "Sandy", "Witch"}
    feminine = ("περήφανη|έτοιμη|κουρασμένη|ενθουσιασμένη|χαρούμενη|λυπημένη|σίγουρη|τρελή|μόνη|"
                "παντρεμένη|εξαντλημένη|απασχολημένη|ανήσυχη|άρρωστη|απογοητευμένη|τρομαγμένη|"
                "χαμένη|νευριασμένη|ευτυχισμένη|ικανοποιημένη|εκνευρισμένη|ευχαριστημένη|τυχερή|"
                "δυστυχισμένη|πρόθυμη|βαρεμένη|ελεύθερη|ήρεμη")
    masculine = feminine.replace("περήφανη", "περήφανος").replace("έτοιμη", "έτοιμος")
    substitutions = {
        "κουρασμένη": "κουρασμένος", "ενθουσιασμένη": "ενθουσιασμένος",
        "χαρούμενη": "χαρούμενος", "λυπημένη": "λυπημένος", "σίγουρη": "σίγουρος",
        "τρελή": "τρελός", "μόνη": "μόνος", "παντρεμένη": "παντρεμένος",
        "εξαντλημένη": "εξαντλημένος", "απασχολημένη": "απασχολημένος",
        "ανήσυχη": "ανήσυχος", "άρρωστη": "άρρωστος", "απογοητευμένη": "απογοητευμένος",
        "τρομαγμένη": "τρομαγμένος", "χαμένη": "χαμένος", "νευριασμένη": "νευριασμένος",
        "ευτυχισμένη": "ευτυχισμένος", "ικανοποιημένη": "ικανοποιημένος",
        "εκνευρισμένη": "εκνευρισμένος", "ευχαριστημένη": "ευχαριστημένος",
        "τυχερή": "τυχερός", "δυστυχισμένη": "δυστυχισμένος", "πρόθυμη": "πρόθυμος",
        "βαρεμένη": "βαρεμένος", "ελεύθερη": "ελεύθερος", "ήρεμη": "ήρεμος",
    }
    for source, target in substitutions.items():
        masculine = masculine.replace(source, target)
    self_prefix = r"\b(?:είμαι|ήμουν|νιώθω|αισθάνομαι|έμεινα|μένω|ζω|φαίνομαι)\b[^.!?#$]{0,70}\b"
    feminine_words = set(feminine.split("|"))
    masculine_words = set(masculine.split("|"))
    self_descriptor = re.compile(
        self_prefix.replace("{0,70}", "{0,70}?")
        + "(?P<descriptor>" + feminine + "|" + masculine + r")\b", re.I
    )
    for row in rows:
        speakers = []
        target_prefix = "Characters/Dialogue/"
        if row["target"].startswith(target_prefix):
            actor = row["target"][len(target_prefix):].removeprefix("MarriageDialogue") or None
            speakers.append((actor, row["translation"]))
        else:
            speakers.extend(
                (match.group(1), match.group(2))
                for match in re.finditer(r'(?:^|/)speak\s+([^/\s"]+)\s+"((?:\\.|[^"])*)"', row["translation"])
            )
        for actor, text in speakers:
            descriptions = [match.group("descriptor").lower() for match in self_descriptor.finditer(text)]
            if actor in male and any(word in feminine_words for word in descriptions):
                errors.append(f"probable male-speaker agreement error: {actor}: {row['target']} :: {row['key']}")
            if actor in female and any(word in masculine_words for word in descriptions):
                errors.append(f"probable female-speaker agreement error: {actor}: {row['target']} :: {row['key']}")

    patch_files = [path for path in json_files(TRANSLATIONS) if path.name != "grammar-data.json"]
    for path in patch_files:
        document = read(path)
        relative = path.relative_to(TRANSLATIONS).as_posix()
        if "Format" in document:
            errors.append(f"secondary Format: {relative}")
        changes = document.get("Changes")
        if not isinstance(changes, list) or not changes:
            errors.append(f"missing non-empty Changes: {relative}")
            continue
        for change in changes:
            when = change.get("When")
            if when is None or when.get("Language") != LOCALE:
                errors.append(f"missing exact Greek language gate: {relative}")

    content = read(PAYLOAD / "content.json")
    includes = [change.get("FromFile") for change in content["Changes"] if change.get("Action") == "Include"]
    expected_includes = {
        "assets/translations/greek/" + path.relative_to(TRANSLATIONS).as_posix()
        for path in patch_files
    }
    actual_greek = [item for item in includes if item and item.startswith("assets/translations/greek/")]
    if set(actual_greek) != expected_includes or len(actual_greek) != len(set(actual_greek)):
        errors.append("Greek secondary Include set is incomplete or duplicated")
    if "assets/translations/greek/grammar-data.json" in includes:
        errors.append("raw Greek grammar data is incorrectly included as a patch")
    entries = content["Changes"][0].get("Entries", {})
    greek_language = entries.get("{{ModId}}_Greek")
    if greek_language is None or greek_language.get("LanguageCode") != LOCALE:
        errors.append("Greek AdditionalLanguages registration is missing")
    required_loads = {
        ("Mods/{{ModId}}/ButtonGreek", None, "assets/button-greek.png"),
        ("Minigames/TitleButtons", LOCALE, "assets/title/TitleButtons-greek.png"),
        ("Fonts/SpriteFont1", LOCALE, "assets/fonts/greek/SpriteFont1.xnb"),
        ("Fonts/SmallFont", LOCALE, "assets/fonts/greek/SmallFont.xnb"),
    }
    actual_loads = Counter(
        (change.get("Target"), change.get("TargetLocale"), change.get("FromFile"))
        for change in content["Changes"] if change.get("Action") == "Load"
    )
    for load in required_loads:
        if actual_loads[load] != 1:
            errors.append(f"Greek runtime asset load count is {actual_loads[load]} for {load!r}")

    package = read(ROOT / "Sources/StardewTranslationInstaller/Resources/PackageConfig.json")
    if package.get("languageCodes", []).count(LOCALE) != 1 or "Ελληνικά" not in package.get("nativeLanguageName", ""):
        errors.append("PackageConfig does not register Greek exactly once")
    manifest = read(PAYLOAD / "manifest.json")
    if "Greek" not in manifest.get("Description", ""):
        errors.append("manifest description does not list Greek")
    assets = {
        PAYLOAD / "assets/button-greek.png": (174, 78),
        PAYLOAD / "assets/title/TitleButtons-greek.png": (400, 655),
    }
    try:
        from PIL import Image
        for path, size in assets.items():
            if not path.exists() or Image.open(path).size != size:
                errors.append(f"invalid Greek image asset: {path.relative_to(ROOT)}")
    except ImportError:
        errors.append("Pillow unavailable for Greek image audit")
    for relative in ("assets/fonts/greek/SpriteFont1.xnb", "assets/fonts/greek/SmallFont.xnb"):
        if not (PAYLOAD / relative).is_file():
            errors.append(f"missing Greek font: {relative}")

    if args.idempotence:
        tracked = [ROOT / "Documentation/greek/progress.json", ROOT / "Documentation/greek/checkpoint.json",
                   PAYLOAD / "content.json"] + json_files(TRANSLATIONS)
        before = {str(path): sha(path) for path in tracked}
        commands = [
            [sys.executable, str(ROOT / "Scripts/greek-batches.py"), "--apply", "--complete"],
            ["node", str(ROOT / "Scripts/generate-unified-content.mjs")],
        ]
        for command in commands:
            result = subprocess.run(command, cwd=ROOT, text=True, capture_output=True)
            if result.returncode:
                errors.append(f"idempotence command failed: {' '.join(command)}: {(result.stderr or result.stdout).strip()}")
        after = {str(path): sha(path) for path in tracked}
        changed = [str(Path(path).relative_to(ROOT)) for path in before if before[path] != after[path]]
        if changed:
            errors.append("idempotence drift: " + ", ".join(changed))

    result = {
        "locale": "el", "languageCode": LOCALE, "records": len(rows),
        "reviewedBatches": reviewed_batches, "glossaryEntries": len(glossary),
        "translationFiles": len(patch_files) + 1, "includedPatchFiles": len(actual_greek),
        "errors": errors, "warnings": warnings,
        "status": "passed" if not errors and not warnings else "failed",
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(0 if result["status"] == "passed" else 1)

if __name__ == "__main__":
    main()

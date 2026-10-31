#!/usr/bin/env python3
"""Apply approved Gus-name variants, retaining an immutable bounded review cycle.

Only standalone Гюс/Гъс denote the name; Гъста/Гъстата and гасим are unrelated.
All candidates must belong to the previously reviewed dependency closure.
Preflight precedes writes. Evidence and individual JSON writes are not one transaction;
after interruption inspect the retained before-state instead of blindly reapplying.
"""
import argparse
import copy
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
VARIANT = re.compile(r"\bГ[юъ]с\b")


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--previous", type=Path, required=True)
    parser.add_argument("--cycle", type=Path, required=True)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    previous, cycle = args.previous.resolve(), args.cycle.resolve()
    if not cycle.is_relative_to(ROOT / "Documentation/bulgarian/repairs"):
        raise ValueError("Cycle must be inside the canonical Bulgarian repair directory")
    glossary = ROOT / "Documentation/glossary/glossary.bg.json"
    if read(glossary)["bg"]["gus"]["term"] != "Гас":
        raise ValueError("Approved glossary changed; return to source review")
    closure = read(previous / "closure.json")
    rows = {row["id"]: row for row in closure}
    if len(rows) != len(closure):
        raise ValueError("Duplicate closure identity")
    documents, before, changes = {}, {}, []
    batches = ROOT / "Documentation/bulgarian/batches"
    payload = ROOT / "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/bulgarian"
    for path in sorted(batches.glob("*.json")):
        batch = read(path)
        for key, value in batch.get("entries", {}).items():
            if not isinstance(value, str) or not VARIANT.search(value):
                continue
            identity = batch["target"] + ":" + key
            row = rows.get(identity)
            if row is None or row["batch"] != path.name or row["after"] != value:
                raise ValueError("Candidate lacks matching reviewed closure: " + identity)
            target = payload / path.name
            patch = documents.setdefault(target, read(target))
            matches = [change["Entries"] for change in patch["Changes"]
                       if change.get("Target") == batch["target"] and key in change.get("Entries", {})]
            if len(matches) != 1 or matches[0][key] != value:
                raise ValueError("Ambiguous/different payload value: " + identity)
            before.setdefault(target, target.read_bytes())
            before.setdefault(path, path.read_bytes())
            documents[path] = batch
            replacement = VARIANT.sub("Гас", value)
            matches[0][key] = replacement
            batch["entries"][key] = replacement
            batch["status"] = "needs-review"
            batch["editorialRepair"] = {"cycle": str(cycle.relative_to(ROOT)),
                                        "status": "pending-independent-diff-review"}
            changes.append({**row, "before": value, "after": replacement, "changed": True})
    print(json.dumps({"changedCount": len(changes), "ids": [row["id"] for row in changes]}, ensure_ascii=False))
    if not args.apply or not changes:
        return
    if cycle.exists():
        raise ValueError("Never overwrite an audit cycle")
    for path, data in before.items():
        dest = cycle / "before" / path.relative_to(ROOT)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
    replacements = {row["id"]: row for row in changes}
    current = [replacements.get(row["id"], {**row, "before": row["after"], "changed": False}) for row in closure]
    write(cycle / "closure.json", current)
    write(cycle / "changed-ids.json", [row["id"] for row in current if row["changed"]])
    write(cycle / "closure-ids.json", [row["id"] for row in current])
    write(cycle / "cycle.json", {
        "kind": "Bulgarian approved-Gus-name variant correction",
        "previousCycle": str(previous.relative_to(ROOT)),
        "previousClosureSha256": digest(previous / "closure.json"),
        "glossarySha256": digest(glossary),
        "selector": "Standalone Гюс or Гъс; reject candidates outside previous closure",
        "preservedUnrelatedWords": ["Гъста", "Гъстата", "гасим"],
        "changedCount": len(changes), "closureCount": len(current),
        "newDependencies": [], "invalidatedEvidenceIds": [row["id"] for row in changes],
        "status": "pending-independent-delta-review",
        "writeBoundary": "Retained before-state, then individual JSON writes; no multi-file transaction",
    })
    for path, document in documents.items():
        write(path, document)
    write(cycle / "final-input-hashes.json", {str(p.relative_to(ROOT)): digest(p) for p in sorted(documents)})


if __name__ == "__main__":
    main()

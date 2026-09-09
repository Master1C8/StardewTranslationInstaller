#!/usr/bin/env python3
"""Track honest full-corpus Dutch editorial audits.

This helper only presents records and records explicit human/model review. It does
not infer editorial quality from automated scans. A pass is complete only after
every target has been marked after its English/Dutch pairs were read.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DOC = ROOT / "Documentation/dutch"
SOURCE = Path("/Users/antonkrutov/Developer/data/stardew-english-unpacked")
OUTPUT = ROOT / "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/dutch"
STATE = DOC / "editorial-audit-state.json"
AUDITS = DOC / "full-content-audits.json"


def read(path: Path):
    return json.loads(path.read_text())


def write(path: Path, value) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def targets() -> list[str]:
    return [item["target"] for item in read(DOC / "source-inventory.json")["assets"]]


def source_entries(target: str) -> dict[str, str]:
    content = read(SOURCE / f"{target}.json")["content"]
    if isinstance(content, list):
        return {str(index): value for index, value in enumerate(content)}
    return content


def translated_entries(target: str) -> dict[str, str]:
    return read(OUTPUT / f"{target}.json")["Changes"][0]["Entries"]


def corpus_hash() -> str:
    digest = hashlib.sha256()
    for target in targets():
        source = source_entries(target)
        translated = translated_entries(target)
        for key, english in source.items():
            digest.update(json.dumps([target, key, english, translated[key]], ensure_ascii=False,
                                     separators=(",", ":")).encode())
            digest.update(b"\n")
    return digest.hexdigest()


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def new_state(pass_number: int, clean_streak: int) -> dict:
    return {
        "locale": "nl",
        "pass": pass_number,
        "requiredConsecutiveCleanPasses": 2,
        "consecutiveCleanPassesBeforeCurrent": clean_streak,
        "corpusSha256AtStart": corpus_hash(),
        "startedAt": utc_now(),
        "completedTargets": [],
        "recordsReviewed": 0,
        "issuesFound": 0,
        "issueNotes": [],
    }


def start(args) -> None:
    if STATE.exists() and not args.force:
        raise ValueError(f"Active audit already exists: {STATE.relative_to(ROOT)}")
    audits = read(AUDITS)
    state = new_state(len(audits["audits"]) + 1, audits["consecutiveCleanFullAudits"])
    write(STATE, state)
    print(json.dumps(state, ensure_ascii=False, indent=2))


def show(args) -> None:
    state = read(STATE)
    known = set(targets())
    for target in args.targets:
        if target not in known:
            raise ValueError(f"Unknown target: {target}")
        if target in state["completedTargets"]:
            raise ValueError(f"Target already marked in pass {state['pass']}: {target}")
        source = source_entries(target)
        translated = translated_entries(target)
        selected = list(source.items())[args.offset:args.offset + args.count if args.count else None]
        if args.compact_identical and source == translated:
            pairs = [
                {"key": key, "en=nl": english}
                for key, english in selected
            ]
        else:
            pairs = [
                {"key": key, "en": english, "nl": translated[key]}
                for key, english in selected
            ]
        document = {
            "pass": state["pass"],
            "target": target,
            "records": len(source),
            "offset": args.offset,
            "shown": len(selected),
            "pairs": pairs,
        }
        print(json.dumps(document, ensure_ascii=False, separators=(",", ":")))


def mark(args) -> None:
    state = read(STATE)
    known = targets()
    if args.target not in known:
        raise ValueError(f"Unknown target: {args.target}")
    if args.target in state["completedTargets"]:
        raise ValueError(f"Target already marked in pass {state['pass']}: {args.target}")
    if args.issues < 0:
        raise ValueError("Issue count cannot be negative")
    if args.issues and not args.note:
        raise ValueError("Issue notes are required when issues were found")
    current_hash = corpus_hash()
    if current_hash != state["corpusSha256AtStart"] and not state["issuesFound"] and not args.issues:
        raise ValueError("Corpus changed during a supposedly clean pass")
    state["completedTargets"].append(args.target)
    state["recordsReviewed"] += len(source_entries(args.target))
    state["issuesFound"] += args.issues
    if args.note:
        state["issueNotes"].append({"target": args.target, "note": args.note})
    state["corpusSha256Current"] = current_hash
    state["updatedAt"] = utc_now()
    write(STATE, state)
    print(json.dumps({
        "pass": state["pass"],
        "marked": args.target,
        "recordsReviewed": state["recordsReviewed"],
        "targetsReviewed": len(state["completedTargets"]),
        "targetsTotal": len(known),
        "issuesFound": state["issuesFound"],
    }, ensure_ascii=False, indent=2))


def finish(args) -> None:
    state = read(STATE)
    missing = [target for target in targets() if target not in state["completedTargets"]]
    if missing:
        raise ValueError(f"Pass is incomplete: {len(missing)} targets remain; first is {missing[0]}")
    if state["recordsReviewed"] != 14720:
        raise ValueError(f"Expected 14,720 reviewed records, got {state['recordsReviewed']}")
    final_hash = corpus_hash()
    clean = state["issuesFound"] == 0 and final_hash == state["corpusSha256AtStart"]
    audits = read(AUDITS)
    entry = {
        "pass": state["pass"],
        "kind": "complete line-by-line English/Dutch editorial audit",
        "recordsRead": state["recordsReviewed"],
        "startedAt": state["startedAt"],
        "completedAt": utc_now(),
        "corpusSha256": final_hash,
        "newObjectiveIssues": state["issuesFound"],
        "issueNotes": state["issueNotes"],
        "clean": clean,
    }
    audits["audits"].append(entry)
    audits["corpusSha256"] = final_hash
    audits["consecutiveCleanFullAudits"] = (
        audits["consecutiveCleanFullAudits"] + 1 if clean else 0
    )
    write(AUDITS, audits)
    STATE.unlink()
    print(json.dumps({
        "completedPass": entry,
        "consecutiveCleanFullAudits": audits["consecutiveCleanFullAudits"],
    }, ensure_ascii=False, indent=2))


def status(_args) -> None:
    print(STATE.read_text() if STATE.exists() else AUDITS.read_text(), end="")


def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    start_parser = sub.add_parser("start")
    start_parser.add_argument("--force", action="store_true")
    show_parser = sub.add_parser("show")
    show_parser.add_argument("targets", nargs="+")
    show_parser.add_argument("--compact-identical", action="store_true")
    show_parser.add_argument("--offset", type=int, default=0)
    show_parser.add_argument("--count", type=int)
    mark_parser = sub.add_parser("mark")
    mark_parser.add_argument("target")
    mark_parser.add_argument("--issues", type=int, default=0)
    mark_parser.add_argument("--note", default="")
    sub.add_parser("finish")
    sub.add_parser("status")
    args = parser.parse_args()
    {"start": start, "show": show, "mark": mark, "finish": finish, "status": status}[args.command](args)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (KeyError, ValueError, FileNotFoundError) as error:
        print(error)
        raise SystemExit(1)

#!/usr/bin/env python3
"""Track two honest full-corpus editorial audits for Latin American Spanish.

The tool presents frozen English/Spanish pairs and records explicit review
receipts. It never infers editorial quality from automated checks, and any
source, glossary, or translation change invalidates the current clean cycle.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path
import tempfile
import uuid


ROOT = Path(__file__).resolve().parent.parent
DOC = ROOT / "Documentation/latin-american-spanish"
SOURCE = Path("/Users/antonkrutov/Developer/data/stardew-english-unpacked")
OUTPUT = ROOT / "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/es-419"
GLOSSARY = ROOT / "Documentation/glossary/glossary.es-419.json"
STATE = DOC / "full-audit-state.json"
MAX_CHARS = 32_000


def read(path: Path):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f"Duplicate JSON key in {path}: {key}")
            result[key] = value
        return result
    return json.loads(path.read_text(), object_pairs_hook=unique)


def write(path: Path, value) -> None:
    content = (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode()
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix=path.name + ".", delete=False) as stream:
        temporary = Path(stream.name)
        stream.write(content)
        stream.flush()
        os.fsync(stream.fileno())
    try:
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def digest(value) -> str:
    if isinstance(value, bytes):
        payload = value
    elif isinstance(value, str):
        payload = value.encode()
    else:
        payload = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(payload).hexdigest()


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def record_id(target: str, key: str) -> str:
    return json.dumps([target, key], ensure_ascii=False, separators=(",", ":"))


class Audit:
    def __init__(self):
        inventory = read(DOC / "source-inventory.json")
        ledger = read(DOC / "reviewed-records.json")
        glossary_hash = digest(GLOSSARY.read_bytes())
        self.rows = []
        for item in inventory["assets"]:
            target = item["target"]
            source_document = read(SOURCE / f"{target}.json")["content"]
            if isinstance(source_document, list):
                source_document = {str(index): value for index, value in enumerate(source_document)}
            translated = read(OUTPUT / f"{target}.json")["Changes"][0]["Entries"]
            if list(translated) != list(source_document):
                raise ValueError(f"Translation coverage/order differs from source: {target}")
            for key, english in source_document.items():
                identity = target + "\0" + key
                evidence = ledger.get(identity)
                spanish = translated[key]
                if not evidence or evidence.get("sourceSha256") != digest(english):
                    raise ValueError(f"Missing or stale source review: {target}:{key}")
                if evidence.get("translationSha256") != digest(spanish):
                    raise ValueError(f"Missing or stale translation review: {target}:{key}")
                if evidence.get("glossarySha256") != glossary_hash:
                    raise ValueError(f"Stale glossary review: {target}:{key}")
                self.rows.append({"id": record_id(target, key), "target": target, "key": key,
                                  "en": english, "es-419": spanish})
        if len(self.rows) != 14720:
            raise ValueError(f"Expected 14,720 records, got {len(self.rows)}")
        self.chunks = self.make_chunks()
        self.snapshot = digest([[row["id"], row["en"], row["es-419"]] for row in self.rows] + [["glossary", glossary_hash]])
        self.original = STATE.read_bytes() if STATE.exists() else None
        stored = read(STATE) if STATE.exists() else None
        self.migration = bool(stored and stored.get("schema") == 1)
        if self.migration:
            history = list(stored.get("history", []))
            if stored.get("cycle"):
                history.append(dict(stored["cycle"], invalidatedAt=now(),
                                    invalidationReason="Reclassified as a corrective editorial pass."))
            stored = {"schema": 2, "locale": "es-419", "requiredConsecutiveCleanPasses": 2,
                      "editing": {}, "clean": None, "history": history}
        self.state = stored or {
            "schema": 2,
            "locale": "es-419",
            "requiredConsecutiveCleanPasses": 2,
            "editing": {},
            "clean": None,
            "history": [],
        }
        if self.state.get("schema") != 2 or self.state.get("locale") != "es-419":
            raise ValueError("Unsupported editorial audit state")

    def make_chunks(self):
        chunks, current, size = [], [], 0
        for index, row in enumerate(self.rows):
            weight = len(row["target"]) + len(row["key"]) + 2 * len(row["en"]) + 100
            if current and size + weight > MAX_CHARS:
                chunks.append(current)
                current, size = [], 0
            current.append(index)
            size += weight
        if current:
            chunks.append(current)
        return chunks

    def chunk_hash(self, index: int) -> str:
        return digest([[self.rows[row]["id"], self.rows[row]["en"], self.rows[row]["es-419"]]
                       for row in self.chunks[index]])

    def editing_complete(self) -> bool:
        return all(self.state["editing"].get(str(index), {}).get("chunkSha256") == self.chunk_hash(index)
                   for index in range(len(self.chunks)))

    def active_pass(self):
        cycle = self.state.get("clean")
        if not cycle or cycle.get("snapshotSha256") != self.snapshot:
            return None
        return next((item for item in cycle["passes"] if item["status"] == "in-progress"), None)

    def clean_count(self):
        cycle = self.state.get("clean")
        if not cycle or cycle.get("snapshotSha256") != self.snapshot:
            return 0
        return sum(item["status"] == "clean" for item in cycle["passes"])

    def archive_invalid_cycle(self, reason: str):
        cycle = self.state.get("clean")
        if cycle:
            cycle = dict(cycle, invalidatedAt=now(), invalidationReason=reason)
            self.state["history"].append(cycle)
            self.state["clean"] = None

    def new_pass(self, number: int):
        return {"id": str(uuid.uuid4()), "number": number, "status": "in-progress",
                "startedAt": now(), "chunks": {}}

    def start_clean(self):
        cycle = self.state.get("clean")
        if cycle and cycle.get("snapshotSha256") != self.snapshot:
            self.archive_invalid_cycle("Source, glossary, or translation changed.")
            cycle = None
        if cycle:
            raise ValueError("A clean audit cycle already exists; continue its active pass")
        if not self.editing_complete():
            raise ValueError("Complete the corrective all-entry editorial pass before clean audits")
        self.state["clean"] = {"snapshotSha256": self.snapshot, "startedAt": now(),
                               "passes": [self.new_pass(1)]}

    def mode(self):
        return "clean" if self.active_pass() else "editing"

    def pending(self):
        active = self.active_pass()
        if active:
            return [index for index in range(len(self.chunks)) if str(index) not in active["chunks"]]
        return [index for index in range(len(self.chunks))
                if self.state["editing"].get(str(index), {}).get("chunkSha256") != self.chunk_hash(index)]

    def receipt(self, indices):
        active = self.active_pass()
        return {
            "schema": 1,
            "locale": "es-419",
            "mode": self.mode(),
            "passId": active["id"] if active else None,
            "snapshotSha256": self.snapshot,
            "chunks": {str(index): self.chunk_hash(index) for index in indices},
        }

    def approve(self, receipt, note: str, no_findings: bool):
        active = self.active_pass()
        mode = self.mode()
        if not note.strip():
            raise ValueError("Approval requires a concrete note")
        if mode == "clean" and not no_findings:
            raise ValueError("Clean approval requires --no-findings")
        if receipt.get("mode") != mode or receipt.get("passId") != (active["id"] if active else None):
            raise ValueError("Receipt belongs to another editorial phase or pass")
        if receipt.get("snapshotSha256") != self.snapshot:
            raise ValueError("Receipt belongs to another pass or translation snapshot")
        if not receipt.get("chunks"):
            raise ValueError("Empty receipt")
        for key, expected_hash in receipt["chunks"].items():
            index = int(key)
            if not 0 <= index < len(self.chunks):
                raise ValueError("Receipt chunk out of range")
            if active and key in active["chunks"]:
                raise ValueError(f"Chunk {index + 1} is already approved")
            current = self.chunk_hash(index)
            if current != expected_hash:
                raise ValueError("Displayed content changed; read the chunk again")
        for key, chunk_hash in receipt["chunks"].items():
            evidence = {"chunkSha256": chunk_hash, "reviewedAt": now(), "note": note}
            self.state["editing"][key] = evidence
            if active:
                active["chunks"][key] = evidence
        if active and len(active["chunks"]) == len(self.chunks):
            active.update(status="clean", completedAt=now(), recordsRead=len(self.rows))
            if active["number"] == 1:
                self.state["clean"]["passes"].append(self.new_pass(2))
            else:
                self.state["clean"]["completedAt"] = now()

    def status(self):
        cycle = self.state.get("clean")
        invalidated = bool(cycle and cycle.get("snapshotSha256") != self.snapshot)
        active = self.active_pass()
        pending = self.pending()
        reviewed_editing = sum(self.state["editing"].get(str(index), {}).get("chunkSha256") == self.chunk_hash(index)
                               for index in range(len(self.chunks)))
        return {
            "locale": "es-419",
            "records": len(self.rows),
            "chunks": len(self.chunks),
            "snapshotSha256": self.snapshot,
            "phase": "clean-audit" if active else ("ready-for-clean-audits" if self.editing_complete() else "editorial-corrections"),
            "migrationRequired": self.migration,
            "cycleInvalidated": invalidated,
            "editingReviewedChunks": reviewed_editing,
            "editingRemainingChunks": len(self.chunks) - reviewed_editing,
            "consecutiveCleanFullAudits": self.clean_count(),
            "activePass": active["number"] if active else None,
            "reviewedChunksInActivePass": len(active["chunks"]) if active else 0,
            "nextChunk": pending[0] + 1 if pending else None,
        }

    def save(self):
        current = STATE.read_bytes() if STATE.exists() else None
        if current != self.original:
            raise ValueError("Audit state changed concurrently; reload before writing")
        write(STATE, self.state)


def selection(text: str, count: int):
    result = set()
    for part in text.split(","):
        bounds = part.split("-")
        if len(bounds) > 2:
            raise ValueError("Use chunk ranges like 1-4,7")
        start, end = int(bounds[0]), int(bounds[-1])
        if not 1 <= start <= end <= count:
            raise ValueError("Chunk range out of bounds")
        result.update(range(start - 1, end))
    return sorted(result)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "action",
        choices=["status", "release", "migrate", "start-clean", "show", "next", "approve"],
    )
    parser.add_argument("--chunks")
    parser.add_argument("--receipt", type=Path)
    parser.add_argument("--note")
    parser.add_argument("--no-findings", action="store_true")
    args = parser.parse_args()
    audit = Audit()
    if args.action == "release":
        status = audit.status()
        if status["cycleInvalidated"] or status["consecutiveCleanFullAudits"] != 2:
            raise ValueError(
                "Release requires two consecutive clean full-corpus editorial audits"
            )
        if status["editingRemainingChunks"] != 0 or status["activePass"] is not None:
            raise ValueError("Editorial review is incomplete")
    elif args.action == "migrate":
        if not audit.migration:
            raise ValueError("No audit-state migration is required")
        audit.save()
    elif args.action == "start-clean":
        audit.start_clean()
        audit.save()
    elif args.action in ("show", "next"):
        pending = audit.pending()
        indices = pending[:1] if args.action == "next" else selection(args.chunks or "0", len(audit.chunks))
        if not indices:
            raise ValueError("No pending chunks")
        receipt = audit.receipt(indices)
        for index in indices:
            active = audit.active_pass()
            pass_label = active["number"] if active else "corrective"
            print(f"AUDIT CHUNK {index + 1}/{len(audit.chunks)} | mode={audit.mode()} | pass={pass_label} | snapshot={audit.snapshot}")
            for sequence, row_index in enumerate(audit.chunks[index], 1):
                row = audit.rows[row_index]
                print(f"\n{sequence}. {row['id']}\nEN {row['en']}\nES-419 {row['es-419']}")
        if args.receipt:
            if args.receipt.exists():
                raise ValueError("Receipt already exists")
            write(args.receipt, receipt)
    elif args.action == "approve":
        if not args.receipt:
            raise ValueError("approve requires --receipt")
        audit.approve(read(args.receipt), args.note or "", args.no_findings)
        audit.save()
    print(json.dumps(Audit().status(), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (KeyError, ValueError, OSError) as error:
        print(f"Error: {error}")
        raise SystemExit(1)

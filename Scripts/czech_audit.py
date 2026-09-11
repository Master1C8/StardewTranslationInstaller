"""Persistent Czech editing evidence and two independent frozen clean passes.

No quality is inferred. Receipts bind explicit review to the displayed content.
Read operations never write the ledger. Canonical translation files are read-only.
"""
import argparse
import copy
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import tempfile
import uuid

MAX_CHARS = 45_000


def read(path):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f"Duplicate JSON key in {path}: {key}")
            result[key] = value
        return result
    return json.loads(Path(path).read_text(), object_pairs_hook=unique)


def digest(value):
    if isinstance(value, bytes):
        return hashlib.sha256(value).hexdigest()
    if not isinstance(value, str):
        value = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(value.encode()).hexdigest()


def write(path, value):
    path = Path(path)
    content = value if isinstance(value, bytes) else (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode()
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix=path.name + ".", delete=False) as f:
        temporary = Path(f.name)
        try:
            f.write(content)
            f.flush()
            os.fsync(f.fileno())
        except BaseException:
            temporary.unlink(missing_ok=True)
            raise
    try:
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def now():
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()


def identity(row):
    return json.dumps([row["target"], str(row["key"]), row.get("field")], ensure_ascii=False, separators=(",", ":"))


def split_rows(rows, legacy=False):
    chunks, current, size = [], [], 0
    for row in rows:
        # New layouts depend only on the source. Existing layouts are persisted.
        weight = len(row["source"]) + (len(row["translation"]) if legacy else len(row["source"])) + len(row["target"]) + len(row["key"]) + 80
        if current and size + weight > MAX_CHARS:
            chunks.append(current)
            current, size = [], 0
        current.append(row)
        size += weight
    if current:
        chunks.append(current)
    return chunks


def legacy_chunk_hash(rows):
    return digest([[r["target"], r["key"], r.get("field"), r["source"], r["translation"]] for r in rows])


class Audit:
    def __init__(self, root):
        self.root = Path(root)
        self.doc = self.root / "Documentation/czech"
        self.path = self.doc / "full-audit-state.json"
        manifest_path = self.doc / "source-manifest.json"
        manifest = read(manifest_path)
        self.manifest_hash = digest(manifest_path.read_bytes())
        glossary_path = self.root / "Documentation/glossary/glossary.cs.json"
        self.glossary_hash = digest(glossary_path.read_bytes())
        expected = {identity(r): r for r in manifest["rows"]}
        if len(expected) != manifest["count"] or len(expected) != len(manifest["rows"]) or not expected:
            raise ValueError("Invalid or duplicate source inventory.")
        rows = []
        for path in sorted((self.doc / "batches").glob("*.json")):
            batch = read(path)
            if batch.get("locale") != "cs":
                raise ValueError(f"Wrong batch locale: {path.name}")
            for row in batch["rows"]:
                row = dict(row, batch=batch["id"], key=str(row["key"]), field=row.get("field"))
                if not isinstance(row["source"], str) or not isinstance(row["translation"], str):
                    raise ValueError("Source and translation must be strings.")
                rid = identity(row)
                if rid not in expected or expected[rid]["sourceSHA256"] != digest(row["source"]):
                    raise ValueError(f"Source differs from manifest: {rid}")
                if row.get("translationSHA256") != digest(row["translation"]):
                    raise ValueError(f"Stale translation hash: {rid}; apply/review the batch first.")
                rows.append(row)
        self.rows = sorted(rows, key=lambda r: (r["target"], r["key"], r.get("field") or ""))
        self.by_id = {identity(r): r for r in self.rows}
        if len(self.by_id) != len(rows) or set(self.by_id) != set(expected):
            raise ValueError("Approved batches contain missing, duplicate, or extra source records.")
        self.hashes = {rid: digest([rid, r["source"], r["translation"], self.glossary_hash]) for rid, r in self.by_id.items()}
        self.snapshot = digest([self.manifest_hash, self.glossary_hash, self.hashes])
        self.original = self.path.read_bytes() if self.path.exists() else None
        stored = read(self.path) if self.original is not None else None
        self.migration = stored is not None and stored.get("schema") == 1
        if stored and stored.get("schema") not in (1, 2):
            raise ValueError("Unsupported audit schema.")
        self.state = self.migrate(stored) if self.migration else (stored or self.fresh())
        layout_ids = [rid for chunk in self.state["chunks"] for rid in chunk]
        if len(layout_ids) != len(set(layout_ids)):
            raise ValueError("Duplicate identities in audit layout.")
        if set(layout_ids) != set(self.by_id):
            # Inventory changes retain row evidence, but require a new source-only layout.
            self.state["chunks"] = self.layout()
        self.clean_invalidated = bool(self.state.get("clean") and self.state["clean"]["snapshotSHA256"] != self.snapshot)
        if self.clean_invalidated:
            self.archive_clean("Source, glossary, or translation changed.")

    def layout(self):
        return [[identity(r) for r in c] for c in split_rows(self.rows)]

    def fresh(self):
        return {"schema": 2, "locale": "cs", "chunks": self.layout(), "editing": {}, "clean": None, "history": [], "findings": []}

    def migrate(self, old):
        state = self.fresh()
        chunks = split_rows(self.rows, legacy=True)
        # Preserve old numbering only when the old layout is reconstructible.
        if old.get("chunkCount") == len(chunks):
            state["chunks"] = [[identity(r) for r in c] for c in chunks]
        checkpoint_path = self.doc / "checkpoint.json"
        checkpoint = read(checkpoint_path) if checkpoint_path.exists() else {}
        context_matches = checkpoint.get("glossarySHA256") == self.glossary_hash and checkpoint.get("sourceManifestSHA256") == self.manifest_hash
        if context_matches and old.get("chunkCount") == len(chunks):
            for audit_pass in old.get("passes", []):
                for index, evidence in audit_pass.get("chunks", {}).items():
                    i = int(index)
                    if not 0 <= i < len(chunks) or evidence.get("chunkSHA256") != legacy_chunk_hash(chunks[i]):
                        continue
                    for row in chunks[i]:
                        rid = identity(row)
                        state["editing"][rid] = {"rowSHA256": self.hashes[rid], "reviewedAt": evidence.get("reviewedAt"), "reviewNote": evidence.get("reviewNote", ""), "provenance": "legacy-editing-only"}
        state["migration"] = {"fromSchema": 1, "legacySHA256": digest(self.original), "retainedEditingRows": len(state["editing"]), "cleanAuditsImported": 0}
        return state

    def archive_clean(self, reason):
        if self.state.get("clean"):
            self.state["history"].append({**self.state["clean"], "invalidatedAt": now(), "reason": reason})
        self.state["clean"] = None

    def reviewed(self):
        return {rid for rid, evidence in self.state["editing"].items() if self.hashes.get(rid) == evidence["rowSHA256"]}

    def clean_count(self):
        clean = self.state.get("clean")
        return sum(p["status"] == "clean" for p in clean["passes"]) if clean else 0

    def active_pass(self):
        clean = self.state.get("clean")
        return next((p for p in clean["passes"] if p["status"] == "in-progress"), None) if clean else None

    def pending(self):
        p = self.active_pass()
        if p:
            return [i for i in range(len(self.state["chunks"])) if str(i) not in p["chunks"]]
        if self.clean_count() == 2:
            return []
        reviewed = self.reviewed()
        return [i for i, c in enumerate(self.state["chunks"]) if any(rid not in reviewed for rid in c)]

    def status(self):
        p = self.active_pass()
        pending = self.pending()
        complete = len(self.reviewed()) == len(self.rows)
        phase = "clean-complete" if self.clean_count() == 2 else ("clean-audit" if p else ("ready-for-clean-audits" if complete else "editorial-corrections"))
        return {"schema": 2, "phase": phase, "sourceRecords": len(self.rows), "chunks": len(self.state["chunks"]), "editingReviewedRecords": len(self.reviewed()), "editingRemainingRecords": len(self.rows) - len(self.reviewed()), "editingPercent": round(100 * len(self.reviewed()) / len(self.rows), 2), "cleanFullAudits": self.clean_count(), "activeCleanPass": p["number"] if p else None, "reviewedChunksInCleanPass": len(p["chunks"]) if p else 0, "nextChunk": pending[0] + 1 if pending else None, "openFindings": sum(not f.get("resolvedAt") for f in self.state["findings"]), "snapshotSHA256": self.snapshot, "migrationRequired": self.migration, "cleanPassInvalidated": self.clean_invalidated}

    def receipt(self, indices):
        p = self.active_pass()
        if self.clean_count() == 2:
            raise ValueError("Two clean audits are already complete.")
        chunks = {str(i): {rid: self.hashes[rid] for rid in self.state["chunks"][i]} for i in indices}
        return {"schema": 1, "mode": "clean" if p else "editing", "passId": p["id"] if p else None, "snapshotSHA256": self.snapshot, "chunks": chunks}

    def approve(self, receipt, note, no_findings=False):
        if not note.strip():
            raise ValueError("Review note is required.")
        if receipt.get("schema") != 1 or not receipt.get("chunks"):
            raise ValueError("Invalid or empty review receipt.")
        p = self.active_pass()
        mode = "clean" if p else "editing"
        if self.clean_count() == 2 or receipt.get("mode") != mode or receipt.get("passId") != (p["id"] if p else None):
            raise ValueError("Receipt belongs to another review phase/pass; read the current material.")
        if mode == "clean" and (not no_findings or receipt.get("snapshotSHA256") != self.snapshot):
            raise ValueError("Clean approval requires --no-findings and the exact frozen snapshot.")
        for key, records in receipt["chunks"].items():
            index = int(key)
            if not 0 <= index < len(self.state["chunks"]):
                raise ValueError("Receipt chunk out of range.")
            if records != {rid: self.hashes[rid] for rid in self.state["chunks"][index]}:
                raise ValueError("Displayed content changed; read affected chunks again.")
            if p and key in p["chunks"]:
                raise ValueError("Chunk already approved in this clean pass.")
        # Validate the whole batch before changing any evidence.
        for key, records in receipt["chunks"].items():
            for rid, row_hash in records.items():
                self.state["editing"][rid] = {"rowSHA256": row_hash, "reviewedAt": now(), "reviewNote": note}
            if p:
                p["chunks"][key] = {"chunkSHA256": digest(records), "reviewedAt": now(), "reviewNote": note}
        if p and len(p["chunks"]) == len(self.state["chunks"]):
            p.update(status="clean", completedAt=now())
            if self.clean_count() == 1:
                self.state["clean"]["passes"].append(self.new_pass(2))

    @staticmethod
    def new_pass(number):
        return {"id": str(uuid.uuid4()), "number": number, "status": "in-progress", "chunks": {}, "startedAt": now()}

    def start_clean(self):
        if len(self.reviewed()) != len(self.rows) or any(not f.get("resolvedAt") for f in self.state["findings"]):
            raise ValueError("Finish editing and resolve recorded findings before starting clean audits.")
        if self.state.get("clean"):
            raise ValueError("A clean cycle already exists; continue its current pass.")
        self.state["clean"] = {"snapshotSHA256": self.snapshot, "passes": [self.new_pass(1)]}

    def save(self):
        # Refuse a concurrent ledger or input update instead of overwriting it.
        current = self.path.read_bytes() if self.path.exists() else None
        if current != self.original:
            raise ValueError("Audit ledger changed concurrently; reload before writing.")
        if Audit(self.root).snapshot != self.snapshot:
            raise ValueError("Source inputs changed during review; reload before writing.")
        if self.migration:
            backup = self.path.with_name("full-audit-state.schema1." + digest(self.original) + ".json")
            if backup.exists() and backup.read_bytes() != self.original:
                raise ValueError("Legacy backup mismatch.")
            if not backup.exists():
                write(backup, self.original)
        write(self.path, self.state)


def selection(text, count):
    result = set()
    for part in text.split(","):
        bounds = part.split("-")
        if len(bounds) > 2:
            raise ValueError("Use chunk ranges like 1-8,10.")
        start, end = int(bounds[0]), int(bounds[-1])
        if not 1 <= start <= end <= count:
            raise ValueError("Chunk range out of bounds.")
        result.update(range(start - 1, end))
    return sorted(result)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["status", "migrate", "show", "next", "approve", "start-clean", "record-findings", "resolve-findings"])
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--chunks", help="One-based ranges, for example 38-45,47.")
    parser.add_argument("--chunk", type=int, help="One-based single chunk, for show only.")
    parser.add_argument("--receipt", type=Path, help="Explicit output for show/next; required input for approve.")
    parser.add_argument("--note")
    parser.add_argument("--no-findings", action="store_true")
    args = parser.parse_args(argv)
    try:
        audit = Audit(args.root)
        if args.action in ("show", "next"):
            if args.action == "next":
                indices = audit.pending()[:1]
            else:
                indices = selection(args.chunks or str(args.chunk or 0), len(audit.state["chunks"]))
            if not indices:
                raise ValueError("No pending chunks; use status/start-clean as appropriate.")
            receipt = audit.receipt(indices)
            for i in indices:
                print(f"AUDIT CHUNK {i + 1}/{len(audit.state['chunks'])} | mode={receipt['mode']} | pass={receipt['passId']} | set={audit.snapshot}")
                for n, rid in enumerate(audit.state["chunks"][i], 1):
                    r = audit.by_id[rid]
                    print(f"\n{n}. [{r['batch']}] {rid}\nEN {r['source']}\nCS {r['translation']}")
            if args.receipt:
                if args.receipt.exists():
                    raise ValueError("Receipt already exists; choose a new path to preserve evidence.")
                write(args.receipt, receipt)
            return
        if args.action == "approve":
            if not args.receipt or args.chunk or args.chunks:
                raise ValueError("approve requires --receipt from show/next; blind --chunk approval is disabled.")
            audit.approve(read(args.receipt), args.note or "", args.no_findings)
        elif args.action == "start-clean":
            audit.start_clean()
        elif args.action in ("record-findings", "resolve-findings"):
            if not args.note or not args.note.strip():
                raise ValueError("A concrete --note is required.")
            if args.action == "record-findings":
                audit.archive_clean("Objective findings recorded: " + args.note)
                audit.state["findings"].append({"note": args.note, "recordedAt": now()})
            else:
                for finding in audit.state["findings"]:
                    if not finding.get("resolvedAt"):
                        finding.update(resolvedAt=now(), resolutionNote=args.note)
        if args.action != "status":
            audit.save()
            audit = Audit(args.root)
        print(json.dumps(audit.status(), ensure_ascii=False, indent=2))
    except (ValueError, KeyError, OSError) as error:
        parser.exit(1, f"Error: {error}\n")

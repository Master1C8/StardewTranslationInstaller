#!/usr/bin/env python3
"""Run the hash-bound structural/editorial checks for every Bulgarian batch."""

import argparse
import json
from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--reverse", action="store_true")
    args = parser.parse_args()
    batches = sorted((ROOT / "Documentation/bulgarian/batches").glob("*.json"),
                     reverse=args.reverse)
    failures = []
    warnings = []
    records = 0
    for path in batches:
        result = subprocess.run(
            [sys.executable, str(ROOT / "Scripts/bulgarian-batch.py"), "check", str(path)],
            cwd=ROOT, capture_output=True, text=True,
        )
        if result.returncode:
            failures.append((path.name, result.stdout, result.stderr))
            continue
        try:
            report = json.loads(result.stdout)
        except json.JSONDecodeError as error:
            failures.append((path.name, result.stdout, f"invalid report: {error}"))
            continue
        records += report.get("checkedRecords", 0)
        if report.get("warnings"):
            warnings.append((path.name, report["warnings"]))
    direction = "reverse" if args.reverse else "forward"
    print(f"Bulgarian {direction} all-batch audit: {len(batches)} batches, "
          f"{records} records, {len(failures)} failures, {len(warnings)} warning batches")
    for failure in failures[:10]:
        print("FAIL", failure)
    for warning in warnings[:10]:
        print("WARN", warning)
    return 1 if failures or warnings or records != 14725 else 0


if __name__ == "__main__":
    raise SystemExit(main())

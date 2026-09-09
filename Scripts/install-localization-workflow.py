#!/usr/bin/env python3
"""Install the reviewed localization prompt into Anton's shared instructions."""

import argparse
import hashlib
import os
from pathlib import Path
import tempfile


def write_atomic(path: Path, content: bytes) -> None:
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
        if path.exists():
            temporary.chmod(path.stat().st_mode & 0o777)
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    modes = parser.add_mutually_exclusive_group()
    modes.add_argument("--check", action="store_true", help="Validate without writing")
    modes.add_argument("--dry-run", action="store_true", help="Show planned paths without writing")
    parser.add_argument("--update", action="store_true", help="Back up and replace an existing different prompt")
    args = parser.parse_args()

    repository = Path(__file__).resolve().parents[1]
    source = repository / "Documentation/GAME_LOCALIZATION_PROMPT.md"
    codex = Path.home() / ".codex"
    reference = codex / "instructions/sitefor-mods.md"
    destination = codex / "instructions/game-localization-prompt.md"
    global_agents = codex / "AGENTS.md"
    content = source.read_bytes()
    instructions = reference.read_text()
    if str(reference) not in global_agents.read_text():
        raise SystemExit("Global AGENTS.md does not route to sitefor-mods.md; review that prerequisite first.")

    start = "<!-- BEGIN: mandatory-game-localization-workflow -->"
    end = "<!-- END: mandatory-game-localization-workflow -->"
    section = f"""{start}
### Mandatory game localization workflow

Before starting or resuming a game localization, or preparing its task prompt,
read `{destination}` in full. Apply it to the current game, repository, slug
and target locale. Do not ask Anton to find or paste the template again.
Continue verified checkpoints, distinguish translation, editorial and technical
progress, and never loop on unchanged percentage messages.

This reference does not itself start a translation, create a goal, or grant
publication, deployment or cross-project mutation permission. The current user
request determines scope; preserve permissions already granted. A request to
draft a prompt stays a drafting task.

The version-controlled recovery copy is `{source}`.
If the installed prompt is missing, restore it from that verified copy before
localization. If both are missing, stop the affected work and report it.
Maintain the recovery copy in Git, then run
`python3 {repository / 'Scripts/install-localization-workflow.py'} --update`
to synchronize the installed prompt. Do not maintain divergent versions.
{end}

"""
    if start in instructions or end in instructions:
        if instructions.count(start) != 1 or instructions.count(end) != 1:
            raise SystemExit("Ambiguous localization markers; inspect shared instructions before updating.")
        a, b = instructions.index(start), instructions.index(end) + len(end)
        if b < a:
            raise SystemExit("Invalid localization marker order.")
        updated = instructions[:a] + section.rstrip() + instructions[b:]
    else:
        anchor = "### Starting localization for a new game\n"
        if instructions.count(anchor) != 1:
            raise SystemExit("Expected localization entry point is missing or ambiguous.")
        updated = instructions.replace(anchor, section + anchor)

    old_prompt = destination.read_bytes() if destination.exists() else None
    changes = []
    if old_prompt != content:
        changes.append(destination)
    if updated != instructions:
        changes.append(reference)
    if not changes:
        print("Localization workflow is installed; prompt and routing match.")
        return
    for path in changes:
        print(f"Needs update: {path}")
    if args.check:
        raise SystemExit(1)
    if args.dry_run:
        return
    if old_prompt is not None and old_prompt != content and not args.update:
        raise SystemExit("Installed prompt differs; inspect it and use --update to back it up and replace it.")

    # Install content before adding the reference, so routing never targets a missing file.
    if old_prompt != content:
        if old_prompt is not None:
            digest = hashlib.sha256(old_prompt).hexdigest()
            backup = destination.with_name(destination.name + f".{digest}.bak")
            if backup.exists() and backup.read_bytes() != old_prompt:
                raise SystemExit("Backup content mismatch; refusing to replace it.")
            if not backup.exists():
                write_atomic(backup, old_prompt)
        write_atomic(destination, content)
    if updated != instructions:
        if reference.read_text() != instructions:
            raise SystemExit("Shared instructions changed during installation; retry after reviewing them.")
        write_atomic(reference, updated.encode())
    print("Installed localization workflow and linked it from shared instructions.")


if __name__ == "__main__":
    main()

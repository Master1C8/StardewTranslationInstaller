#!/usr/bin/env python3
"""Install the reviewed localization workflow into Anton's shared instructions."""

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
    parser.add_argument(
        "--update",
        action="store_true",
        help="Back up and replace existing different workflow files",
    )
    args = parser.parse_args()

    repository = Path(__file__).resolve().parents[1]
    prompt_source = repository / "Documentation/GAME_LOCALIZATION_PROMPT.md"
    audit_source = repository / "Documentation/GAME_LOCALIZATION_AUDIT_WORKFLOW.md"
    codex = Path.home() / ".codex"
    reference = codex / "instructions/sitefor-mods.md"
    prompt_destination = codex / "instructions/game-localization-prompt.md"
    audit_destination = codex / "instructions/game-localization-audit-workflow.md"
    global_agents = codex / "AGENTS.md"
    artifacts = (
        (prompt_source, prompt_destination, prompt_source.read_bytes()),
        (audit_source, audit_destination, audit_source.read_bytes()),
    )
    instructions = reference.read_text()
    if str(reference) not in global_agents.read_text():
        raise SystemExit("Global AGENTS.md does not route to sitefor-mods.md; review that prerequisite first.")

    start = "<!-- BEGIN: mandatory-game-localization-workflow -->"
    end = "<!-- END: mandatory-game-localization-workflow -->"
    section = f"""{start}
### Mandatory game localization workflow

Before starting or resuming a game localization, or preparing its task prompt,
read `{prompt_destination}` and `{audit_destination}` in full. Apply them to the current game, repository, slug
and target locale. Do not ask Anton to find or paste the template again.
Continue verified checkpoints, distinguish translation, editorial and technical
progress, and never loop on unchanged percentage messages.

This reference does not itself start a translation, create a goal, or grant
publication, deployment or cross-project mutation permission. The current user
request determines scope; preserve permissions already granted. A request to
draft a prompt stays a drafting task.

The version-controlled recovery copies are `{prompt_source}` and
`{audit_source}`. If an installed file is missing, restore it from its verified
copy before localization. If both copies of a required file are missing, stop
the affected work and report it. Maintain the recovery copies in Git, then run
`python3 {repository / 'Scripts/install-localization-workflow.py'} --update`
to synchronize the installed workflow. Do not maintain divergent versions.
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

    existing = {
        destination: destination.read_bytes() if destination.exists() else None
        for _, destination, _ in artifacts
    }
    changes = [
        destination
        for _, destination, content in artifacts
        if existing[destination] != content
    ]
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
    if any(
        existing[destination] is not None and existing[destination] != content
        for _, destination, content in artifacts
    ) and not args.update:
        raise SystemExit(
            "An installed localization workflow file differs; inspect it and use --update "
            "to back it up and replace it."
        )

    # Install content before adding the reference, so routing never targets a missing file.
    for _, destination, content in artifacts:
        old_content = existing[destination]
        if old_content == content:
            continue
        if old_content is not None:
            digest = hashlib.sha256(old_content).hexdigest()
            backup = destination.with_name(destination.name + f".{digest}.bak")
            if backup.exists() and backup.read_bytes() != old_content:
                raise SystemExit("Backup content mismatch; refusing to replace it.")
            if not backup.exists():
                write_atomic(backup, old_content)
        write_atomic(destination, content)
    if updated != instructions:
        if reference.read_text() != instructions:
            raise SystemExit("Shared instructions changed during installation; retry after reviewing them.")
        write_atomic(reference, updated.encode())
    print("Installed localization prompt and audit workflow and linked them from shared instructions.")


if __name__ == "__main__":
    main()

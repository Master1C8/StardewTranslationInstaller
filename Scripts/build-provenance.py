#!/usr/bin/env python3
"""Build the existing translator locally and retain unsigned provenance."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import zipfile


def sha(path):
    h = hashlib.sha256()
    with Path(path).open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def git(root, *args):
    return subprocess.check_output(["git", "-C", str(root), *args], text=True).strip()


def inventory(root):
    result = {}
    for path in sorted(root.rglob("*")):
        if path.is_symlink():
            raise ValueError("Symlink material: " + str(path))
        if path.is_file():
            result[path.relative_to(root).as_posix()] = {
                "sha256": sha(path), "sizeBytes": path.stat().st_size}
    if not result:
        raise ValueError("Empty stage")
    return result


def verify(archive, stage, manifest):
    expected = {stage.name + "/" + name: row for name, row in inventory(stage).items()}
    expected[manifest.name] = {"sha256": sha(manifest), "sizeBytes": manifest.stat().st_size}
    with zipfile.ZipFile(archive) as package:
        files = [row for row in package.infolist() if not row.is_dir()]
        if len(files) != len(expected) or {row.filename for row in files} != set(expected):
            raise ValueError("Unexpected or duplicate archive files")
        for row in files:
            h = hashlib.sha256()
            with package.open(row) as stream:
                for block in iter(lambda: stream.read(1024 * 1024), b""):
                    h.update(block)
            if (row.file_size != expected[row.filename]["sizeBytes"]
                    or h.hexdigest() != expected[row.filename]["sha256"]):
                raise ValueError("Archive bytes differ: " + row.filename)
    return len(files)


def main():
    import plistlib
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--release", required=True, type=Path)
    parser.add_argument("--game-path", required=True, type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    out = args.release.resolve()
    game = args.game_path.resolve()
    if not out.is_relative_to(root / "dist") or out.exists():
        raise ValueError("Use a new canonical dist directory")
    if git(root, "branch", "--show-current") != "main" or git(root, "status", "--porcelain"):
        raise ValueError("Commit reviewed source on clean canonical main")
    commit = git(root, "rev-parse", "HEAD")
    if git(root, "rev-parse", "origin/main") != commit:
        raise ValueError("Push source before building")
    repository = git(root, "remote", "get-url", "origin").removesuffix(".git")
    if repository != "https://github.com/Master1C8/StardewTranslationInstaller":
        raise ValueError("Unexpected canonical repository")
    version = plistlib.loads((root / "App/Info.plist").read_bytes())["CFBundleShortVersionString"]
    resources = root / "Sources/StardewTranslationInstaller/Resources"
    materials = inventory(resources)
    references = sorted([*game.glob("*.dll"), *(game / "smapi-internal").glob("*.dll")])
    if not (game / "Stardew Valley.dll").is_file() or not references:
        raise ValueError("Installed game and SMAPI references are required")
    reference_hashes = {str(p.relative_to(game)): sha(p) for p in references}
    tools = {}
    for name in ["swift", "clang", "lipo", "codesign", "ditto", "python3", "node",
                 "x86_64-w64-mingw32-gcc", "x86_64-w64-mingw32-windres", "magick"]:
        executable = shutil.which(name)
        if not executable:
            raise ValueError("Missing tool: " + name)
        if name in {"swift", "clang"} and executable == "/usr/bin/" + name:
            executable = subprocess.check_output(["xcrun", "--find", name], text=True).strip()
        tools[name] = {"path": str(Path(executable).resolve()), "sha256": sha(executable)}
    dotnet = os.environ.get("DOTNET_BIN", "/opt/homebrew/opt/dotnet@8/bin/dotnet")
    sdk_line = subprocess.check_output([dotnet, "--list-sdks"], text=True).strip().splitlines()[-1]
    sdk_version, sdk_root = sdk_line.split(" ", 1)
    compiler = Path(sdk_root.strip("[]")) / sdk_version / "Roslyn/bincore/csc.dll"
    tools["managedCompiler"] = {"sdkVersion": sdk_version, "path": str(compiler), "sha256": sha(compiler)}
    tools["swiftVersion"] = subprocess.check_output(["swift", "--version"], text=True).strip()
    tools["sdkVersion"] = subprocess.check_output(["xcrun", "--show-sdk-version"], text=True).strip()
    started = datetime.now(timezone.utc).isoformat()
    out.mkdir(parents=True)
    env = {**os.environ, "VNREVIVAL_RELEASE_DIR": str(out), "STARDEW_GAME_PATH": str(game),
           "CSC_BIN": str(root / "Scripts/csc-dotnet.sh"), "DOTNET_BIN": dotnet,
           "CODESIGN_IDENTITY": "-"}
    with (out / "build.log").open("x") as log:
        for command in [["bash", "Scripts/release-audit.sh"], ["zsh", "Scripts/build-windows-release.sh"]]:
            subprocess.run(command, cwd=root, env=env, stdout=log, stderr=subprocess.STDOUT, check=True)
    if inventory(resources) != materials:
        raise ValueError("Resource bytes changed during build; review and commit them first")
    if {str(p.relative_to(game)): sha(p) for p in references} != reference_hashes:
        raise ValueError("Read-only game dependencies changed during build")
    if git(root, "rev-parse", "HEAD") != commit or git(root, "status", "--porcelain"):
        raise ValueError("Source changed during build")
    records = []
    for platform, label, stage in [
        ("windows", "Windows", out / ("Stardew Translation Installer-Windows-" + version)),
        ("macos", "macOS", out / "Stardew Translation Installer.app"),
    ]:
        archive = out / ("Stardew-Installer-" + label + "-" + version + ".zip")
        if platform == "windows":
            (out / (stage.name + ".zip")).rename(archive)
        else:
            subprocess.run(["ditto", "-c", "-k", "--norsrc", "--noextattr", "--noqtn",
                            "--keepParent", str(stage), str(archive)], check=True)
        manifest = out / "vnrevival-release.json"
        manifest.write_text(json.dumps({"schemaVersion": 1, "gameSlug": "stardew-valley",
            "platform": platform, "version": version, "sourceCommit": commit,
            "sourceTreeClean": True, "repositoryUrl": repository,
            "recipe": "Scripts/build-provenance.py"}, indent=2) + "\n")
        with zipfile.ZipFile(archive, "a", compression=zipfile.ZIP_DEFLATED) as z:
            z.write(manifest, manifest.name)
        entries = verify(archive, stage, manifest)
        manifest.rename(out / (platform + "-vnrevival-release.json"))
        if archive.stat().st_size > 100_000_000:
            raise ValueError("Archive exceeds 100 MB")
        records.append({"platform": platform, "filename": archive.name, "sha256": sha(archive),
                        "sizeBytes": archive.stat().st_size, "verifiedEntries": entries})
    (out / "payload-materials.json").write_text(json.dumps(materials, indent=2) + "\n")
    (out / "game-reference-materials.json").write_text(json.dumps(reference_hashes, indent=2) + "\n")
    (out / "source-tree.txt").write_text(git(root, "ls-tree", "-r", "--full-tree", commit) + "\n")
    (out / "SHA256SUMS").write_text("".join(r["sha256"] + "  " + r["filename"] + "\n" for r in records))
    (out / "provenance.json").write_text(json.dumps({
        "schemaVersion": 1, "version": version,
        "source": {"repository": repository, "commit": commit, "tree": git(root, "rev-parse", "HEAD^{tree}")},
        "build": {"method": "local macOS compilation and Windows cross-compilation",
                  "recipe": "Scripts/build-provenance.py", "startedAt": started,
                  "completedAt": datetime.now(timezone.utc).isoformat(), "tools": tools,
                  "logSha256": sha(out / "build.log")},
        "materials": {"inventory": "payload-materials.json", "sha256": sha(out / "payload-materials.json"),
                      "gameReferences": "game-reference-materials.json",
                      "gameReferencesSha256": sha(out / "game-reference-materials.json")},
        "artifacts": records,
        "assurance": {"statement": "unsigned local build record", "publisherSignature": None,
                      "notarization": None,
                      "runtimeBoundary": "Native installer fixtures, isolated language-switcher probes and data/font audits; no new real-game run"}
    }, indent=2) + "\n")
    print(json.dumps({"sourceCommit": commit, "artifacts": records}))


if __name__ == "__main__":
    main()

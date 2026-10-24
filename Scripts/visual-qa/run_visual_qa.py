#!/usr/bin/env python3
"""Run deterministic Stardew Valley visual QA through Oculix."""

from __future__ import annotations

import argparse
import contextlib
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import pty
import re
import shutil
import signal
import subprocess
import sys
import tempfile
import threading
import time
import xml.etree.ElementTree as ET


SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
PACKAGE_CONFIG = PROJECT_ROOT / "Sources/StardewTranslationInstaller/Resources/PackageConfig.json"
CONTENT_JSON = PROJECT_ROOT / "Sources/StardewTranslationInstaller/Resources/ModPayload/content.json"
LOCALES_JSON = SCRIPT_DIR / "locales.json"
OCULIX_SCRIPT = SCRIPT_DIR / "qa_capture.sikuli"
DEFAULT_OCULIX_JAR = Path("/Users/antonkrutov/Applications/Oculix/oculixide-4.0.0-macos.jar")
DEFAULT_JAVA = Path("/opt/homebrew/opt/openjdk@17/bin/java")
DEFAULT_GAME_DIR = Path("/Volumes/KINGSTONMAC/SteamLibrary/steamapps/common/Stardew Valley/Contents/MacOS")
DEFAULT_PREFERENCES = Path.home() / ".config/StardewValley/startup_preferences"
DEFAULT_SMAPI_LOG = Path.home() / ".config/StardewValley/ErrorLogs/SMAPI-latest.txt"
TEMPLATE_DIR = SCRIPT_DIR / "templates/2x"
EXPECTED_SIZE = "2560x1600"

CAPTURES = [
    ("01-title-menu", "Localized title menu buttons and labels are visible and unclipped."),
    ("02-character-creation", "Character-creation labels and the lower-right Back button are visible and unclipped."),
    ("03-gus-dialogue", "Gus's portrait, localized name, and dialogue are visible and unclipped."),
    ("04-item-description", "The axe name, category, wrapped description, and inventory metadata are visible."),
    ("05-journal", "The expanded Introductions journal entry, body, and progress line fit the panel."),
]

TEMPLATE_NAMES = (
    "title",
    "character-creation",
    "world",
    "gus-dialogue",
    "inventory",
    "journal",
)


def run_checked(command: list[str], **kwargs: object) -> subprocess.CompletedProcess[str]:
    return subprocess.run(command, check=True, text=True, **kwargs)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_configuration() -> tuple[list[dict[str, str]], dict[str, object]]:
    locales = json.loads(LOCALES_JSON.read_text(encoding="utf-8"))
    package = json.loads(PACKAGE_CONFIG.read_text(encoding="utf-8"))
    content = json.loads(CONTENT_JSON.read_text(encoding="utf-8"))
    codes = [locale["code"] for locale in locales]
    if codes != package["languageCodes"]:
        raise RuntimeError("visual-QA locale order differs from PackageConfig.json")
    site_locales = [locale.get("siteLocale") for locale in locales]
    if any(not isinstance(site_locale, str) or not site_locale for site_locale in site_locales):
        raise RuntimeError("every visual-QA locale requires an explicit siteLocale")
    if len(site_locales) != len(set(site_locales)):
        raise RuntimeError("visual-QA siteLocale values must be unique")
    entries = content["Changes"][0]["Entries"]
    for locale in locales:
        key = "{{ModId}}_" + locale["entry"]
        if key not in entries or entries[key]["LanguageCode"] != locale["code"]:
            raise RuntimeError(f"missing or mismatched Data/AdditionalLanguages entry: {key}")
    return locales, package


def executable(name_or_path: str | Path) -> str:
    value = str(name_or_path)
    found = shutil.which(value) if "/" not in value else (value if os.access(value, os.X_OK) else None)
    if not found:
        raise RuntimeError(f"required executable not found: {value}")
    return found


def ensure_dependencies(java: Path, jar: Path, game_dir: Path, smoke: bool) -> dict[str, str]:
    dependencies = {
        "java": executable(java),
        "magick": executable("/opt/homebrew/bin/magick"),
        "screencapture": executable("/usr/sbin/screencapture"),
        "xcrun": executable("/usr/bin/xcrun"),
        "csc": executable(os.environ.get("CSC_BIN", PROJECT_ROOT / "Scripts/csc-dotnet.sh")),
    }
    if not jar.is_file():
        raise RuntimeError(f"Oculix JAR not found: {jar}")
    if not smoke:
        dependencies["game"] = executable(game_dir / "StardewValley")
        if not DEFAULT_PREFERENCES.is_file():
            raise RuntimeError(f"Stardew preferences not found: {DEFAULT_PREFERENCES}")
        quicksave_config = game_dir / "Mods/QuickSave/config.json"
        if not quicksave_config.is_file():
            raise RuntimeError(f"QuickSave config not found: {quicksave_config}")
        for name in TEMPLATE_NAMES:
            path = TEMPLATE_DIR / f"{name}.png"
            if not path.is_file():
                raise RuntimeError(f"recognition template not found: {path}")
    return dependencies


def prepare_runtime(runtime: Path, magick: str) -> None:
    (runtime / "raw").mkdir(parents=True, exist_ok=True)
    (runtime / "templates/2x").mkdir(parents=True, exist_ok=True)
    for name in TEMPLATE_NAMES:
        shutil.copy2(TEMPLATE_DIR / f"{name}.png", runtime / "templates/2x" / f"{name}.png")
    run_checked([
        "/usr/bin/xcrun", "swiftc", str(SCRIPT_DIR / "cg_input.swift"),
        "-o", str(runtime / "cg-input"),
    ])


def build_smapi_driver(runtime: Path, game_dir: Path, csc: str) -> Path:
    references: list[str] = []
    for directory in (game_dir, game_dir / "smapi-internal"):
        for candidate in sorted(directory.glob("*.dll")):
            kind = subprocess.run(["/usr/bin/file", "-b", str(candidate)], text=True, capture_output=True)
            if "Mono/.Net assembly" in kind.stdout:
                references.append("-r:" + str(candidate))
    if not references:
        raise RuntimeError("no .NET game assemblies found for the visual-QA driver")
    driver_dir = runtime / "smapi-driver"
    driver_dir.mkdir()
    dll = driver_dir / "VNRevival.VisualQADriver.dll"
    run_checked([
        csc, "-noconfig", "-nostdlib", "-nullable:enable", "-langversion:9.0",
        "-target:library", "-deterministic", "-debug:portable",
        "-out:" + str(dll), "-pdb:" + str(driver_dir / "VNRevival.VisualQADriver.pdb"),
        *references, str(SCRIPT_DIR / "SmapiDriver/VisualQADriver.cs"),
    ])
    shutil.copy2(SCRIPT_DIR / "SmapiDriver/manifest.json", driver_dir / "manifest.json")
    return driver_dir


def install_smapi_driver(driver_dir: Path, game_dir: Path) -> Path:
    target = game_dir / "Mods/[SMAPI] VN Revival Visual QA Driver"
    if target.exists():
        raise RuntimeError(f"temporary visual-QA driver already exists: {target}")
    shutil.copytree(driver_dir, target)
    return target


def remove_smapi_driver(target: Path) -> None:
    manifest_path = target / "manifest.json"
    if not manifest_path.is_file():
        raise RuntimeError(f"refusing to remove unverified directory: {target}")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("UniqueID") != "VNRevival.VisualQADriver":
        raise RuntimeError(f"refusing to remove unexpected mod: {target}")
    shutil.rmtree(target)


def run_oculix(java: str, jar: Path, runtime: Path, mode: str, code: str | None = None) -> subprocess.CompletedProcess[str]:
    command = [java, "-jar", str(jar), "-c", "-r", str(OCULIX_SCRIPT), "--", mode, str(runtime)]
    if code:
        command.append(code)
    return subprocess.run(command, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)


def current_stardew_processes() -> list[str]:
    result = subprocess.run(["/usr/bin/pgrep", "-fl", "StardewValley|StardewModdingAPI"], text=True, capture_output=True)
    return [line for line in result.stdout.splitlines() if line.strip()]


def set_language(preferences: Path, language_id: str) -> bytes:
    original = preferences.read_bytes()
    text = original.decode("utf-8-sig")
    root = ET.fromstring(text)
    node = root.find("languageCode")
    if node is None:
        raise RuntimeError("startup_preferences has no languageCode element")
    node.text = language_id
    body = ET.tostring(root, encoding="utf-8", xml_declaration=True)
    preferences.write_bytes(b"\xef\xbb\xbf" + body)
    return original


def launch_game(game_dir: Path, log_path: Path, trigger_path: Path) -> tuple[subprocess.Popen[bytes], threading.Thread]:
    master, slave = pty.openpty()
    environment = os.environ.copy()
    environment["VN_VISUAL_QA_TRIGGER"] = str(trigger_path)
    process = subprocess.Popen(
        [str(game_dir / "StardewValley"), "--use-current-shell"],
        cwd=game_dir,
        stdin=slave,
        stdout=slave,
        stderr=slave,
        start_new_session=True,
        env=environment,
    )
    os.close(slave)

    def copy_output() -> None:
        with os.fdopen(master, "rb", closefd=True) as source, log_path.open("wb") as destination:
            while True:
                try:
                    chunk = source.read(4096)
                except OSError:
                    break
                if not chunk:
                    break
                destination.write(chunk)
                destination.flush()
                sys.stdout.buffer.write(chunk)
                sys.stdout.buffer.flush()

    reader = threading.Thread(target=copy_output, daemon=True)
    reader.start()
    return process, reader


def stop_game(process: subprocess.Popen[bytes], reader: threading.Thread) -> None:
    if process.poll() is None:
        with contextlib.suppress(ProcessLookupError):
            os.killpg(process.pid, signal.SIGINT)
        try:
            process.wait(timeout=8)
        except subprocess.TimeoutExpired:
            with contextlib.suppress(ProcessLookupError):
                os.killpg(process.pid, signal.SIGTERM)
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                with contextlib.suppress(ProcessLookupError):
                    os.killpg(process.pid, signal.SIGKILL)
                process.wait(timeout=5)
    reader.join(timeout=2)


def image_size(magick: str, path: Path) -> str:
    result = run_checked([magick, "identify", "-format", "%wx%h", str(path)], capture_output=True)
    return result.stdout


def postprocess(
    magick: str,
    runtime: Path,
    review_output: Path,
    upload_output: Path,
    locale: dict[str, str],
    smapi_log: Path,
    expected_size: str = EXPECTED_SIZE,
) -> list[Path]:
    review_output.mkdir(parents=True, exist_ok=True)
    upload_output.mkdir(parents=True, exist_ok=True)
    produced: list[Path] = []
    for stem, _ in CAPTURES:
        raw = runtime / "raw" / f"{locale['code']}-{stem}-raw.png"
        if not raw.is_file():
            raise RuntimeError(f"automation did not produce {raw.name}")
        if image_size(magick, raw) != expected_size:
            raise RuntimeError(f"{raw.name} is {image_size(magick, raw)}, expected {expected_size}")
        destination = upload_output / f"{locale['siteLocale']}-{stem}.png"
        shutil.copy2(raw, destination)
        if image_size(magick, destination) != expected_size:
            raise RuntimeError(f"capture copy resized {destination.name}")
        produced.append(destination)

    if len({sha256(path) for path in produced}) != len(CAPTURES):
        raise RuntimeError("different semantic screens produced duplicate image bytes")

    contact_sheet = review_output / f"{locale['siteLocale']}-contact-sheet.png"
    run_checked([
        magick, "montage", *[str(path) for path in produced],
        "-font", "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
        "-thumbnail", "768x480", "-tile", "2x3", "-geometry", "+12+12",
        "-background", "#172033", "PNG8:" + str(contact_sheet),
    ])
    produced.append(contact_sheet)

    if smapi_log.is_file():
        dated_log = review_output / f"{locale['siteLocale']}-smapi-{dt.date.today().isoformat()}.log"
        log_text = smapi_log.read_text(encoding="utf-8", errors="replace")
        dated_log.write_text(log_text.replace("\r\n", "\n").replace("\r", "\n"), encoding="utf-8")
        produced.append(dated_log)
    return produced


def version_from_log(text: str, pattern: str, default: str = "unknown") -> str:
    match = re.search(pattern, text, re.IGNORECASE)
    return match.group(1) if match else default


def write_evidence(
    review_output: Path,
    locale: dict[str, str],
    package: dict[str, object],
    produced: list[Path],
    log_text: str,
    restored: bool,
) -> Path:
    screenshots = []
    for (stem, coverage), path in zip(CAPTURES, produced[:5]):
        screenshots.append({
            "file": os.path.relpath(path, review_output),
            "sha256": sha256(path),
            "coverage": coverage,
        })
    contact = produced[5]
    log_file = next((path for path in produced if path.suffix == ".log"), None)
    cp_errors = len(re.findall(
        r"\bERROR\s+Content Patcher\b|\[Content Patcher\].*\bERROR\b",
        log_text,
        re.IGNORECASE,
    ))
    cp_warnings = len(re.findall(
        r"\bWARN(?:ING)?\s+Content Patcher\b|\[Content Patcher\].*\bWARN(?:ING)?\b",
        log_text,
        re.IGNORECASE,
    ))
    exact_loads = [
        f"Fonts/SpriteFont1.{locale['code']}",
        f"Fonts/SmallFont.{locale['code']}",
        f"Minigames/TitleButtons.{locale['code']}",
    ]
    missing_loads = [asset for asset in exact_loads if asset not in log_text]
    automated_result = "pass" if not cp_errors and not missing_loads else "fail"
    evidence = {
        "schemaVersion": 2,
        "date": dt.date.today().isoformat(),
        "localeLabel": locale["label"],
        "exactLocale": locale["code"],
        "publishingLocale": locale["siteLocale"],
        "gameVersion": version_from_log(log_text, r"Stardew Valley ([0-9.]+(?: build [0-9]+)?)"),
        "smapiVersion": version_from_log(log_text, r"SMAPI ([0-9.]+)"),
        "contentPatcherVersion": version_from_log(log_text, r"Content Patcher ([0-9.]+)"),
        "quickSaveVersion": version_from_log(log_text, r"QuickSave ([0-9.]+)"),
        "packageVersion": json.loads((PROJECT_ROOT / "Sources/StardewTranslationInstaller/Resources/ModPayload/manifest.json").read_text())["Version"],
        "resolution": {"width": 2560, "height": 1600},
        "method": "Oculix focused the live fullscreen game and drove a checked title/character/save/QuickSave/Gus/inventory/journal path. The exact custom locale was selected before launch through Stardew's startup preferences and the original value was restored afterward. macOS captured every stable screen at native resolution without annotations or resizing.",
        "result": "capture-pass-review-pending" if automated_result == "pass" else "automated-fail",
        "automatedResult": automated_result,
        "visualReview": {"status": "pending", "findings": []},
        "exactLocaleLoads": exact_loads,
        "missingLocaleLoads": missing_loads,
        "contentPatcherErrors": cp_errors,
        "contentPatcherWarnings": cp_warnings,
        "screenshots": screenshots,
        "contactSheet": {"file": contact.name, "sha256": sha256(contact)},
        "smapiLog": None if log_file is None else {"file": log_file.name, "sha256": sha256(log_file)},
        "restoration": {"testSaveWritten": False, "startupLanguageRestored": restored},
    }
    evidence_path = review_output / f"{locale['siteLocale']}-evidence.json"
    evidence_path.write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if automated_result != "pass":
        raise RuntimeError(f"evidence failed: missing loads={missing_loads}, Content Patcher errors={cp_errors}")
    return evidence_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("locale", nargs="?", help="exact locale code, for example sr-vnrevival")
    parser.add_argument("--list", action="store_true", help="list supported locale codes")
    parser.add_argument("--all", dest="all_locales", action="store_true", help="capture every locale sequentially")
    parser.add_argument("--smoke", action="store_true", help="only test Oculix capture and macOS permissions")
    parser.add_argument("--replace", action="store_true", help="replace an existing locale visual-QA directory")
    parser.add_argument("--bridge", action="store_true", help="use the guarded SMAPI state bridge and native 1280x780 framebuffer capture")
    parser.add_argument("--keep-language", action="store_true", help="leave the selected locale in startup_preferences")
    parser.add_argument("--oculix-jar", type=Path, default=Path(os.environ.get("OCULIX_JAR", DEFAULT_OCULIX_JAR)))
    parser.add_argument("--java", type=Path, default=Path(os.environ.get("OCULIX_JAVA", DEFAULT_JAVA)))
    parser.add_argument("--game-dir", type=Path, default=Path(os.environ.get("STARDEW_GAME_DIR", DEFAULT_GAME_DIR)))
    parser.add_argument("--output-root", type=Path, default=PROJECT_ROOT / "Documentation")
    return parser.parse_args()


def run_bridge(args: argparse.Namespace, locales: list[dict[str, str]], package: dict[str, object]) -> int:
    """Use the existing local driver when Oculix cannot attach to macOS input.

    Each action is acknowledged by the game thread; SaveLoaded guards both the
    normal load and the subsequent QuickSave restoration. No player save is made.
    """
    locale = next((item for item in locales if item["code"] == args.locale), None)
    if locale is None or args.all_locales or args.smoke or args.keep_language:
        raise RuntimeError("--bridge requires one exact locale and restored preferences")
    if current_stardew_processes():
        raise RuntimeError("Stardew Valley is already running")
    review = args.output_root / locale["slug"] / "visual-qa"
    upload = args.output_root / "visual-qa-upload"
    if review.exists() or any((upload / f"{locale['siteLocale']}-{stem}.png").exists() for stem, _ in CAPTURES):
        raise RuntimeError("bridge output already exists; choose a new evidence directory")
    magick = executable("/opt/homebrew/bin/magick")
    csc = executable(os.environ.get("CSC_BIN", PROJECT_ROOT / "Scripts/csc-dotnet.sh"))
    executable(args.game_dir / "StardewValley")
    save = DEFAULT_PREFERENCES.parent / "Saves/zc_448908119"
    protected = sorted(path for path in save.iterdir() if path.is_file())
    before = {str(path): sha256(path) for path in protected}
    if not (save / "Quicksave").is_file():
        raise RuntimeError("prepared QuickSave checkpoint is absent")
    original = DEFAULT_PREFERENCES.read_bytes()
    with tempfile.TemporaryDirectory(prefix="vn-visual-qa-bridge-") as temporary:
        runtime = Path(temporary)
        (runtime / "raw").mkdir()
        trigger = runtime / "quickload.request"
        driver = build_smapi_driver(runtime, args.game_dir, csc)
        installed = install_smapi_driver(driver, args.game_dir)
        process = reader = None
        captured_log = ""
        try:
            set_language(DEFAULT_PREFERENCES, f"{package['uniqueID']}_{locale['entry']}")
            process, reader = launch_game(args.game_dir, runtime / "launcher.log", trigger)

            def log() -> str:
                text = DEFAULT_SMAPI_LOG.read_text(errors="replace") if DEFAULT_SMAPI_LOG.exists() else ""
                offset = text.find("VN_QA_RUN " + str(trigger))
                return text[offset:] if offset >= 0 else ""

            def wait_for(needle: str, start: int = 0, timeout: float = 120) -> None:
                deadline = time.monotonic() + timeout
                while time.monotonic() < deadline:
                    current = log()[start:]
                    if "ERROR VN Revival Visual QA Driver" in current:
                        raise RuntimeError("visual-QA driver failed: " + current[-2000:])
                    if needle in current:
                        return
                    if process.poll() is not None:
                        raise RuntimeError("game exited before " + needle)
                    time.sleep(0.2)
                raise RuntimeError("game state timed out: " + needle)

            def command(value: str, marker: str, timeout: float = 120) -> None:
                start = len(log())
                pending = trigger.with_suffix(".pending")
                pending.write_text(value + "\n")
                os.replace(pending, trigger)
                wait_for(marker, start, timeout)

            def capture(stem: str) -> None:
                time.sleep(2)
                name = f"{locale['code']}-{stem}-raw.png"
                command("capture raw/" + name, "VN_QA_CAPTURE " + str(runtime / name))
                # The bridge restricts the command to a basename in its runtime.
                shutil.move(runtime / name, runtime / "raw" / name)
                size = image_size(magick, runtime / "raw" / name)
                if size != "1280x780":
                    raise RuntimeError("bridge viewport is " + size + ", expected 1280x780")

            wait_for("VN_QA_STATE title-ready", timeout=180)
            wait_for(f"Context: locale set to mod ({locale['code']})")
            command("viewport", "VN_QA_STATE viewport")
            capture("01-title-menu")
            command("setup", "VN_QA_STATE setup")
            capture("02-character-creation")
            command("title", "VN_QA_STATE title")
            command("load", "VN_QA_STATE world", timeout=180)
            command("quickload", "VN_QA_STATE world", timeout=180)
            command("dialogue", "VN_QA_STATE dialogue")
            time.sleep(8)
            capture("03-gus-dialogue")
            command("advance", "VN_QA_STATE advanced world")
            command("inventory-axe", "VN_QA_STATE inventory")
            capture("04-item-description")
            command("close", "VN_QA_STATE closed")
            command("journal-expanded", "VN_QA_STATE journal")
            capture("05-journal")
            captured_log = DEFAULT_SMAPI_LOG.read_text(errors="replace")
        except BaseException:
            failure = args.output_root / (locale["siteLocale"] + "-bridge-failure")
            failure.mkdir(parents=True, exist_ok=True)
            for path in (runtime / "raw").glob("*.png"):
                shutil.copy2(path, failure / path.name)
            if DEFAULT_SMAPI_LOG.exists():
                shutil.copy2(DEFAULT_SMAPI_LOG, failure / "smapi.log")
            raise
        finally:
            if process is not None and reader is not None:
                stop_game(process, reader)
            DEFAULT_PREFERENCES.write_bytes(original)
            remove_smapi_driver(installed)
        after = {str(path): sha256(path) for path in sorted(save.iterdir()) if path.is_file()}
        if before != after:
            raise RuntimeError("protected test-save bytes changed")
        size = image_size(magick, runtime / "raw" / f"{locale['code']}-01-title-menu-raw.png")
        if size != "1280x780":
            raise RuntimeError("bridge viewport is " + size + ", expected 1280x780")
        produced = postprocess(magick, runtime, review, upload, locale, DEFAULT_SMAPI_LOG, size)
        evidence = write_evidence(review, locale, package, produced, captured_log, DEFAULT_PREFERENCES.read_bytes() == original)
        record = json.loads(evidence.read_text())
        width, height = map(int, size.split("x"))
        record.update({"resolution": {"width": width, "height": height},
            "method": "Project-owned SMAPI bridge: guarded title/setup, prepared normal save followed by QuickSave restoration, real Gus interaction, axe hover, expanded quest. Native framebuffer captured without annotation or resizing. Oculix could not initialize its macOS mouse device.",
            "saveHashesBefore": before, "saveHashesAfter": after,
            "switcherSha256": sha256(args.game_dir / "Mods/[SMAPI] VN Revival Language Switcher/VNRevival.LanguageSwitcher.dll")})
        evidence.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n")
        print("Bridge visual QA complete: " + str(evidence))
    return 0


def run_all_locales(args: argparse.Namespace, locales: list[dict[str, str]]) -> int:
    if args.locale:
        raise RuntimeError("a locale code can't be combined with --all")
    if args.smoke:
        raise RuntimeError("--smoke can't be combined with --all")

    completed = 0
    skipped = 0
    for locale in locales:
        review_output = args.output_root / locale["slug"] / "visual-qa"
        upload_output = args.output_root / "visual-qa-upload"
        screenshots = [upload_output / f"{locale['siteLocale']}-{stem}.png" for stem, _ in CAPTURES]
        if not args.replace:
            evidence = review_output / f"{locale['siteLocale']}-evidence.json"
            if evidence.is_file() and all(path.is_file() for path in screenshots):
                print(f"Skipping {locale['code']}: complete output already exists ({review_output})")
                skipped += 1
                continue
            has_review_output = review_output.exists() and any(review_output.iterdir())
            if has_review_output or any(path.exists() for path in screenshots):
                raise RuntimeError(f"incomplete output requires review or --replace: {review_output}")
            if review_output.exists():
                review_output.rmdir()
        command = [
            sys.executable,
            str(Path(__file__).resolve()),
            locale["code"],
            "--oculix-jar", str(args.oculix_jar),
            "--java", str(args.java),
            "--game-dir", str(args.game_dir),
            "--output-root", str(args.output_root),
        ]
        if args.replace:
            command.append("--replace")
        if args.keep_language:
            command.append("--keep-language")
        for attempt in range(1, 3):
            print(f"\n=== Capturing {locale['label']} (attempt {attempt}/2) ===", flush=True)
            child = subprocess.Popen(command, start_new_session=True)
            try:
                returncode = child.wait()
            except KeyboardInterrupt:
                with contextlib.suppress(ProcessLookupError):
                    os.killpg(child.pid, signal.SIGINT)
                try:
                    child.wait(timeout=30)
                except subprocess.TimeoutExpired:
                    with contextlib.suppress(ProcessLookupError):
                        os.killpg(child.pid, signal.SIGTERM)
                    try:
                        child.wait(timeout=10)
                    except subprocess.TimeoutExpired:
                        with contextlib.suppress(ProcessLookupError):
                            os.killpg(child.pid, signal.SIGKILL)
                        child.wait(timeout=5)
                raise
            if not returncode:
                break
            if attempt == 1 and not review_output.exists():
                print(
                    f"Retrying {locale['code']} after transient capture failure "
                    f"(exit code {returncode}).",
                    file=sys.stderr,
                    flush=True,
                )
                time.sleep(5)
                continue
            print(f"Stopped after {locale['code']} failed with exit code {returncode}.", file=sys.stderr)
            return returncode
        completed += 1
        # Let macOS fully release the game window and input device before the
        # next Oculix JVM initializes its Screen/Mouse device.
        time.sleep(3)
    print(f"All-locale run complete: captured {completed}, skipped {skipped}.")
    return 0


def main() -> int:
    args = parse_args()
    locales, package = load_configuration()
    by_code = {locale["code"]: locale for locale in locales}
    if args.list:
        for locale in locales:
            print(f"{locale['code']} -> {locale['siteLocale']}: {locale['label']}")
        return 0
    if args.all_locales:
        return run_all_locales(args, locales)
    if args.bridge:
        return run_bridge(args, locales, package)
    dependencies = ensure_dependencies(args.java, args.oculix_jar, args.game_dir, args.smoke)
    with tempfile.TemporaryDirectory(prefix="vn-visual-qa-") as temporary:
        runtime = Path(temporary)
        (runtime / "raw").mkdir()
        if args.smoke:
            result = run_oculix(dependencies["java"], args.oculix_jar, runtime, "smoke")
            print(result.stdout, end="")
            if result.returncode:
                return result.returncode
            smoke = runtime / "raw/smoke.png"
            print(f"Smoke capture: {smoke} ({image_size(dependencies['magick'], smoke)})")
            oculix_smoke = runtime / "oculix-smoke.png"
            print(f"Oculix capture: {oculix_smoke} ({image_size(dependencies['magick'], oculix_smoke)})")
            return 0
        if not args.locale or args.locale not in by_code:
            raise RuntimeError("choose one supported locale; use --list")
        running = current_stardew_processes()
        if running:
            raise RuntimeError("Stardew Valley is already running; close it first:\n" + "\n".join(running))
        locale = by_code[args.locale]
        review_output = args.output_root / locale["slug"] / "visual-qa"
        upload_output = args.output_root / "visual-qa-upload"
        upload_screenshots = [
            upload_output / f"{locale['siteLocale']}-{stem}.png" for stem, _ in CAPTURES
        ]
        if review_output.exists() or any(path.exists() for path in upload_screenshots):
            if not args.replace:
                raise RuntimeError(f"output exists (pass --replace to replace it): {review_output}")
            if review_output.exists():
                shutil.rmtree(review_output)
        prepare_runtime(runtime, dependencies["magick"])
        driver_dir = build_smapi_driver(runtime, args.game_dir, dependencies["csc"])
        language_id = f"{package['uniqueID']}_{locale['entry']}"
        original_preferences = DEFAULT_PREFERENCES.read_bytes()
        process: subprocess.Popen[bytes] | None = None
        reader: threading.Thread | None = None
        installed_driver: Path | None = None
        restored = False
        try:
            set_language(DEFAULT_PREFERENCES, language_id)
            installed_driver = install_smapi_driver(driver_dir, args.game_dir)
            process, reader = launch_game(
                args.game_dir, runtime / "launcher.log", runtime / "quickload.request"
            )
            # Stardew briefly captures the pointer while its fullscreen window
            # is being created. Starting Oculix during that interval makes its
            # Screen initialization fail with "Mouse not useable (blocked)".
            # Let the game settle at the title sequence before attaching the
            # automation JVM; its own state timeout still verifies the menu.
            time.sleep(25)
            result = run_oculix(dependencies["java"], args.oculix_jar, runtime, "capture", args.locale)
            print(result.stdout, end="")
            if result.returncode:
                failure = runtime / "failure.png"
                if failure.is_file():
                    destination = PROJECT_ROOT / f"{args.locale}-visual-qa-failure.png"
                    shutil.copy2(failure, destination)
                    print(f"Failure screenshot: {destination}", file=sys.stderr)
                oculix_failure = runtime / "oculix-failure.png"
                if oculix_failure.is_file():
                    destination = PROJECT_ROOT / f"{args.locale}-visual-qa-oculix-failure.png"
                    shutil.copy2(oculix_failure, destination)
                    print(f"Oculix failure screenshot: {destination}", file=sys.stderr)
                return result.returncode
        finally:
            if process is not None and reader is not None:
                stop_game(process, reader)
            if not args.keep_language:
                DEFAULT_PREFERENCES.write_bytes(original_preferences)
                restored = True
            if installed_driver is not None and installed_driver.exists():
                remove_smapi_driver(installed_driver)
        time.sleep(1)
        produced = postprocess(
            dependencies["magick"], runtime, review_output, upload_output, locale, DEFAULT_SMAPI_LOG
        )
        log_text = DEFAULT_SMAPI_LOG.read_text(encoding="utf-8", errors="replace") if DEFAULT_SMAPI_LOG.is_file() else ""
        evidence = write_evidence(review_output, locale, package, produced, log_text, restored)
        print(f"Visual QA complete: {review_output}")
        print(f"Upload-ready screenshots: {upload_output}")
        print(f"Evidence: {evidence}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        raise SystemExit(130)
    except Exception as error:
        print(f"error: {error}", file=sys.stderr)
        raise SystemExit(1)

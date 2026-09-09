#!/usr/bin/env python3
"""Merge only the completed Greek release into the owner's current Desktop tree."""

from pathlib import Path
import hashlib
import json
import os
import shutil

SOURCE = Path("/Users/antonkrutov/.codex/worktrees/3692/StardewTranslationInstaller")
DEST = Path(os.environ.get(
    "GREEK_MERGE_DEST", "/Users/antonkrutov/Desktop/StardewTranslationInstaller"
))


def copy_tree(relative: str) -> None:
    shutil.copytree(SOURCE / relative, DEST / relative, dirs_exist_ok=True)


def copy_file(relative: str) -> None:
    target = DEST / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(SOURCE / relative, target)


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text()
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"expected one match in {path}: {count}: {old[:80]!r}")
    path.write_text(text.replace(old, new, 1))


expected_shared_hashes = {
    "Scripts/generate-unified-content.mjs": "a24f93bfd3ab5106769fa3f7cd689a199102f9c76f56d3f19ba5efb655ef1919",
    "Sources/StardewTranslationInstaller/Resources/PackageConfig.json": "72f2352f5b9aa4c4ebad03d75bec47861b2e018b921bd7b9953925e73b2bb89c",
    "Sources/StardewTranslationInstaller/Resources/ModPayload/content.json": "6866ce4db64124b69ded68b7c59f8084827009bbd704f57ac27916779a01d12a",
    "Sources/StardewTranslationInstaller/Resources/ModPayload/manifest.json": "c267e83309797ef608c30cc4cc815d5229bd10d235924b05d4d7905cc9d73069",
    "Sources/StardewTranslationInstaller/Resources/LanguageSwitcherPayload/manifest.json": "0dd30a40b26f106b2c8b69efaeeda4d54ead2a2ea2353ec821367a5eec2bacf4",
    "Sources/StardewTranslationInstaller/Resources/LanguageSwitcherPayload/VNRevival.LanguageSwitcher.dll": "7d91600d5728b7c64d0ceed94f47f000918cb5b77855fcb0ae69d7273c371f9e",
    "Sources/StardewTranslationInstaller/Resources/LanguageSwitcherPayload/VNRevival.LanguageSwitcher.pdb": "adc96e2664975cc5beafd673b4f0f9473598c4de02d42e8dbdb24770dbff6e89",
    "Tests/StardewTranslationInstallerTests/InstallerCoreTests.swift": "157945ff331873e45773a8882851f26177a75cd8436bbadaaaa0881527fc28bc",
    "Tools/VNRevivalLanguageSwitcher/AssemblyInfo.cs": "00f28ab9d1d66a12b44aadf6fc804a5f03b8f338672dfe2596eac51be48697d7",
    "Tools/VNRevivalLanguageSwitcher/ModEntry.cs": "69ad28d37c8570493566fce079fc251b03defbb2cceb48092162b9baf4b335bb",
    "Tools/VNRevivalLanguageSwitcher/VNRevivalLanguageSwitcher.csproj": "87535ed911d386e4286a3bab177008e91780582280a9a276f21d78ae27e4afcd",
}
for relative, expected in expected_shared_hashes.items():
    actual = hashlib.sha256((DEST / relative).read_bytes()).hexdigest()
    if actual != expected:
        raise RuntimeError(f"Desktop shared file changed after validation: {relative}")
for relative in (
    "Documentation/greek",
    "Documentation/glossary/glossary.el.json",
    "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/greek",
    "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/fonts/greek",
    "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/button-greek.png",
    "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/title/TitleButtons-greek.png",
    "Tools/GreekRuntimeProbe",
):
    if (DEST / relative).exists():
        raise RuntimeError(f"Desktop Greek destination unexpectedly exists: {relative}")

copy_tree("Documentation/greek")
copy_file("Documentation/glossary/glossary.el.json")
for relative in (
    "Scripts/audit-greek.py",
    "Scripts/build-greek-fonts.sh",
    "Scripts/build-greek-static-labels.sh",
    "Scripts/generate-greek-button.py",
    "Scripts/generate-greek-title.py",
    "Scripts/greek-batches.py",
    "Scripts/greek-runtime-probe.py",
    "Scripts/verify-greek-fonts.mjs",
):
    copy_file(relative)
copy_tree("Tools/GreekRuntimeProbe")
copy_tree("Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/greek")
copy_tree("Sources/StardewTranslationInstaller/Resources/ModPayload/assets/fonts/greek")
copy_file("Sources/StardewTranslationInstaller/Resources/ModPayload/assets/button-greek.png")
copy_file("Sources/StardewTranslationInstaller/Resources/ModPayload/assets/title/TitleButtons-greek.png")

generator = DEST / "Scripts/generate-unified-content.mjs"
greek_language = '''  {
    directory: "greek",
    suffix: "Greek",
    code: "el-vnrevival",
    buttonTarget: "ButtonGreek",
    button: "assets/button-greek.png",
    title: "assets/title/TitleButtons-greek.png",
    fonts: "assets/fonts/greek",
  },
'''
replace_once(generator, "];\n\nconst entries", greek_language + "];\n\nconst entries")
replace_once(
    generator,
    '  for (const file of listJSONFiles(directory).sort()) {\n    changes.push',
    '  for (const file of listJSONFiles(directory).sort()) {\n'
    '    if (language.directory === "greek" && file === "grammar-data.json") continue;\n'
    '    changes.push',
)

config_path = DEST / "Sources/StardewTranslationInstaller/Resources/PackageConfig.json"
config = json.loads(config_path.read_text())
if "el-vnrevival" in config["languageCodes"]:
    raise RuntimeError("Greek is already present in Desktop PackageConfig")
config["languageCodes"].append("el-vnrevival")
config["nativeLanguageName"] += " · Ελληνικά"
message = config["copy"]["installingTranslationMessage"]
old_phrase = "румынского и болгарского переводов и перевода на иврит"
if message.count(old_phrase) != 1:
    raise RuntimeError("unexpected current installer message")
config["copy"]["installingTranslationMessage"] = message.replace(
    old_phrase, "румынского, болгарского и греческого переводов и перевода на иврит"
)
config_path.write_text(json.dumps(config, ensure_ascii=False, indent=2) + "\n")

manifest_path = DEST / "Sources/StardewTranslationInstaller/Resources/ModPayload/manifest.json"
manifest = json.loads(manifest_path.read_text())
if manifest["Version"] != "1.14.0" or "Greek" in manifest["Description"]:
    raise RuntimeError("unexpected current content-pack manifest")
manifest["Version"] = "1.15.0"
manifest["Description"] = manifest["Description"].replace(
    "and Bulgarian as", "Bulgarian, and Greek as"
)
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")

switcher = DEST / "Tools/VNRevivalLanguageSwitcher/ModEntry.cs"
replace_once(
    switcher,
    '    private const string BulgarianLanguageCode = "bg-vnrevival";\n',
    '    private const string BulgarianLanguageCode = "bg-vnrevival";\n'
    '    private const string GreekLanguageCode = "el-vnrevival";\n',
)
replace_once(
    switcher,
    '        harmony.Patch(dialogueTarget, prefix: new HarmonyMethod(dialoguePrefix), postfix: new HarmonyMethod(dialoguePostfix));\n',
    '        harmony.Patch(dialogueTarget, prefix: new HarmonyMethod(dialoguePrefix), postfix: new HarmonyMethod(dialoguePostfix));\n\n'
    '        PatchGreekNpcNames(harmony);\n'
    '        PatchGreekRandomWords(harmony);\n',
)
replace_once(
    switcher,
    '        else if (languageCode == BulgarianLanguageCode)\n',
    '        else if (languageCode == BulgarianLanguageCode || languageCode == GreekLanguageCode)\n',
)
greek_source = (SOURCE / "Tools/VNRevivalLanguageSwitcher/ModEntry.cs").read_text()
start = greek_source.index("    private static readonly HashSet<string> GreekNpcReferenceKeys")
end = greek_source.index("    private static void BeforeSetModLanguage", start)
greek_methods = greek_source[start:end]
replace_once(
    switcher,
    "    private static void BeforeDialogueTokens(string str, out bool __state)\n",
    greek_methods + "    private static void BeforeDialogueTokens(string str, out bool __state)\n",
)

assembly_info = DEST / "Tools/VNRevivalLanguageSwitcher/AssemblyInfo.cs"
replace_once(assembly_info, 'AssemblyVersion("1.7.0.0")', 'AssemblyVersion("1.8.0.0")')
replace_once(assembly_info, 'AssemblyFileVersion("1.7.0.0")', 'AssemblyFileVersion("1.8.0.0")')
replace_once(assembly_info, 'AssemblyInformationalVersion("1.7.0")', 'AssemblyInformationalVersion("1.8.0")')
replace_once(
    DEST / "Tools/VNRevivalLanguageSwitcher/VNRevivalLanguageSwitcher.csproj",
    "<Version>1.7.0</Version>", "<Version>1.8.0</Version>",
)
replace_once(
    DEST / "Sources/StardewTranslationInstaller/Resources/LanguageSwitcherPayload/manifest.json",
    '"Version": "1.7.0"', '"Version": "1.8.0"',
)
switcher_manifest = DEST / "Sources/StardewTranslationInstaller/Resources/LanguageSwitcherPayload/manifest.json"
replace_once(
    switcher_manifest,
    "supplies Dutch articles, suppresses Bulgarian articles, applies Serbian grammar,",
    "supplies Dutch articles, suppresses Bulgarian and Greek articles, applies Serbian and Greek grammar,",
)

tests = DEST / "Tests/StardewTranslationInstallerTests/InstallerCoreTests.swift"
replace_once(
    tests,
    '"he-vnrevival", "bg-vnrevival"])',
    '"he-vnrevival", "bg-vnrevival", "el-vnrevival"])',
)
replace_once(tests, "expect(languageEntries.count == 16)", "expect(languageEntries.count == 17)")
replace_once(
    tests,
    '            "bg-vnrevival": ("ButtonBulgarian", "assets/button-bulgarian.png", "assets/title/TitleButtons-bulgarian.png"),\n',
    '            "bg-vnrevival": ("ButtonBulgarian", "assets/button-bulgarian.png", "assets/title/TitleButtons-bulgarian.png"),\n'
    '            "el-vnrevival": ("ButtonGreek", "assets/button-greek.png", "assets/title/TitleButtons-greek.png"),\n',
)
replace_once(
    tests,
    '            ("bg-vnrevival", "bulgarian"),\n',
    '            ("bg-vnrevival", "bulgarian"),\n'
    '            ("el-vnrevival", "greek"),\n',
)
greek_hash_tests = '''
        let greekAssetHashes = [
            "assets/button-greek.png": "7179ce8375733d0064bce58dca08799ace3a1f002e838f78d55cdb161648ad5a",
            "assets/title/TitleButtons-greek.png": "ec8697fd82a9c6430aec0e3353d6f1bf58378c69a2e1da87be3b0754fac901d0",
            "assets/fonts/greek/SpriteFont1.xnb": "247798383dfa9b9d2bce83ae1cdc4d942afbd3c1e83c4b94ba2ebb2172a3c000",
            "assets/fonts/greek/SmallFont.xnb": "83b9c73b735a0250318326c7f5b65b99accfbd262ec07552ce8b9133178a8f20",
        ]
        try expect(try pngDimensions("assets/button-greek.png") == (174, 78))
        try expect(try pngDimensions("assets/title/TitleButtons-greek.png") == (400, 655))
        for (assetPath, expectedHash) in greekAssetHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(assetPath))
                    == expectedHash
            )
        }

'''
replace_once(tests, "        let retiredLanguages = [\n", greek_hash_tests + "        let retiredLanguages = [\n")
replace_once(tests, "expect(includes.count == 3_892)", "expect(includes.count == 4_082)")
replace_once(
    tests,
    '            } else if relativePath.contains("/bulgarian/") {\n'
    '                expectedLanguage = "bg-vnrevival"\n',
    '            } else if relativePath.contains("/bulgarian/") {\n'
    '                expectedLanguage = "bg-vnrevival"\n'
    '            } else if relativePath.contains("/greek/") {\n'
    '                expectedLanguage = "el-vnrevival"\n',
)
replace_once(
    tests,
    '                expect(condition == ["Language": expectedLanguage])\n',
    '                expect(condition["Language"] == expectedLanguage)\n'
    '                expect(Set(condition.keys).isSubset(of: ["Language", "PlayerGender"]))\n',
)

print("Merged Greek-only release files into Desktop tree.")

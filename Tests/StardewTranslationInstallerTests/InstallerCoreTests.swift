import Foundation
import XCTest
@testable import StardewTranslationInstaller

final class InstallerCoreTests: XCTestCase {
    private struct RequiredValueMissing: Error {}

    private func expect(
        _ condition: @autoclosure () throws -> Bool,
        file: StaticString = #filePath,
        line: UInt = #line
    ) rethrows {
        XCTAssertTrue(try condition(), file: file, line: line)
    }

    private func expect<E: Error>(
        throws expectedType: E.Type,
        file: StaticString = #filePath,
        line: UInt = #line,
        _ body: () throws -> Void
    ) {
        XCTAssertThrowsError(try body(), file: file, line: line) { error in
            XCTAssertTrue(error is E, "Expected \(expectedType), got \(type(of: error))", file: file, line: line)
        }
    }

    private func require<T>(
        _ value: T?,
        file: StaticString = #filePath,
        line: UInt = #line
    ) throws -> T {
        guard let value else {
            XCTFail("Required value is missing", file: file, line: line)
            throw RequiredValueMissing()
        }
        return value
    }
    private func projectRoot() -> URL {
        URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent()
            .deletingLastPathComponent()
            .deletingLastPathComponent()
    }

    private func translationPackage() throws -> TranslationPackage {
        return try TranslationPackage.load(
            from: projectRoot().appendingPathComponent(
                "Sources/StardewTranslationInstaller/Resources/PackageConfig.json"
            )
        )
    }

    private func writePayloadIdentity(
        at payload: URL,
        package: TranslationPackage
    ) throws {
        let manifest: [String: Any] = ["UniqueID": package.uniqueID]
        let content: [String: Any] = [
            "Changes": [[
                "Action": "EditData",
                "Target": "Data/AdditionalLanguages",
                "Entries": Dictionary(
                    uniqueKeysWithValues: package.languageCodes.enumerated().map {
                        ("Test\($0.offset)", ["LanguageCode": $0.element])
                    }
                ),
            ]],
        ]
        try JSONSerialization.data(withJSONObject: manifest)
            .write(to: payload.appendingPathComponent("manifest.json"))
        try JSONSerialization.data(withJSONObject: content)
            .write(to: payload.appendingPathComponent("content.json"))
    }

    func testLoadsTranslationPackage() throws {
        let package = try translationPackage()
        expect(package.schemaVersion == 2)
        expect(package.siteLocale == "ru")
        expect(package.languageCodes == ["ru-vnrevival", "pl-vnrevival", "uz-vnrevival", "sw-vnrevival", "am-vnrevival", "kn-vnrevival", "ml-vnrevival", "mr-vnrevival", "my-vnrevival"])
        expect(package.uniqueID == "VNRevival.StardewValleyTranslations")
        expect(TranslationPackage.supportedSiteLocales.count == 43)
    }

    func testValidatesCurrentInterfaceAssets() throws {
        let package = try translationPackage()
        let payload = projectRoot().appendingPathComponent(
            "Sources/StardewTranslationInstaller/Resources/ModPayload"
        )
        let json = try require(
            JSONSerialization.jsonObject(
                with: Data(contentsOf: payload.appendingPathComponent("content.json"))
            ) as? [String: Any]
        )
        let changes = try require(json["Changes"] as? [[String: Any]])
        let languagePatch = try require(changes.first {
            ($0["Action"] as? String) == "EditData"
                && ($0["Target"] as? String) == "Data/AdditionalLanguages"
        })
        let languageEntries = try require(languagePatch["Entries"] as? [String: Any])
        expect(languageEntries.count == 9)
        let expectedButtons = [
            "ru-vnrevival": ("ButtonRussian", "assets/button-russian.png", "assets/title/TitleButtons-russian.png"),
            "pl-vnrevival": ("ButtonPolish", "assets/button.png", "assets/title/TitleButtons.png"),
            "uz-vnrevival": ("ButtonUzbek", "assets/button-uzbek.png", "assets/title/TitleButtons-uzbek.png"),
            "sw-vnrevival": ("ButtonSwahili", "assets/button-swahili.png", "assets/title/TitleButtons-swahili.png"),
            "am-vnrevival": ("ButtonAmharic", "assets/button-amharic.png", "assets/title/TitleButtons-amharic.png"),
            "kn-vnrevival": ("ButtonKannada", "assets/button-kannada.png", "assets/title/TitleButtons-kannada.png"),
            "ml-vnrevival": ("ButtonMalayalam", "assets/button-malayalam.png", "assets/title/TitleButtons-malayalam.png"),
            "mr-vnrevival": ("ButtonMarathi", "assets/button-marathi.png", "assets/title/TitleButtons-marathi.png"),
            "my-vnrevival": ("ButtonBurmese", "assets/button-burmese.png", "assets/title/TitleButtons-burmese.png"),
        ]
        for code in package.languageCodes {
            let expected = try require(expectedButtons[code])
            let language = try require(languageEntries.values.compactMap { $0 as? [String: Any] }.first {
                ($0["LanguageCode"] as? String) == code
            })
            expect(language["ButtonTexture"] as? String == "Mods/{{ModId}}/\(expected.0)")
            expect(language["UseLatinFont"] as? Bool == !["ru-vnrevival", "am-vnrevival", "kn-vnrevival", "ml-vnrevival", "mr-vnrevival", "my-vnrevival"].contains(code))
            if code == "ru-vnrevival" {
                expect(language["FontFile"] as? String == "Fonts/Russian")
                expect(language["FontPixelZoom"] as? Int == 3)
            }
            if code == "am-vnrevival" {
                expect(language["FontFile"] as? String == "Fonts/Amharic")
                expect(language["FontPixelZoom"] as? Int == 3)
            }
            if code == "kn-vnrevival" {
                expect(language["FontFile"] as? String == "Fonts/Kannada")
                expect(language["FontPixelZoom"] as? Int == 3)
            }
            if code == "ml-vnrevival" {
                expect(language["FontFile"] as? String == "Fonts/Malayalam")
                expect(language["FontPixelZoom"] as? Int == 3)
            }
            if code == "mr-vnrevival" {
                expect(language["FontFile"] as? String == "Fonts/Marathi")
                expect(language["FontPixelZoom"] as? Int == 3)
            }
            if code == "my-vnrevival" {
                expect(language["FontFile"] as? String == "Fonts/Burmese")
                expect(language["FontPixelZoom"] as? Int == 3)
            }
            let button = try require(changes.first {
                ($0["Action"] as? String) == "Load"
                    && ($0["Target"] as? String) == "Mods/{{ModId}}/\(expected.0)"
            })
            expect(button["FromFile"] as? String == expected.1)
            let title = try require(changes.first {
                ($0["Action"] as? String) == "Load"
                    && ($0["Target"] as? String) == "Minigames/TitleButtons"
                    && ($0["TargetLocale"] as? String) == code
            })
            expect(title["FromFile"] as? String == expected.2)
        }

        for (locale, directory) in [
            ("ru-vnrevival", "russian"),
            ("pl-vnrevival", "polish"),
            ("am-vnrevival", "amharic"),
            ("kn-vnrevival", "kannada"),
            ("ml-vnrevival", "malayalam"),
            ("mr-vnrevival", "marathi"),
            ("my-vnrevival", "burmese"),
        ] {
          for target in ["Fonts/SpriteFont1", "Fonts/SmallFont"] {
            let font = try require(changes.first {
                ($0["Action"] as? String) == "Load"
                    && ($0["Target"] as? String) == target
                    && ($0["TargetLocale"] as? String) == locale
            })
            let fontPath = try require(font["FromFile"] as? String)
            expect(fontPath == "assets/fonts/\(directory)/\(target.split(separator: "/").last!).xnb")
            let fontData = try Data(contentsOf: payload.appendingPathComponent(fontPath))
            expect(Array(fontData.prefix(3)) == Array("XNB".utf8))
          }
        }

        for (target, fontPath) in [
            ("Fonts/Amharic", "assets/fonts/amharic/Amharic.xnb"),
            ("Fonts/Amharic_0", "assets/fonts/amharic/Amharic_0.xnb"),
            ("Fonts/Kannada", "assets/fonts/kannada/Kannada.xnb"),
            ("Fonts/Kannada_0", "assets/fonts/kannada/Kannada_0.xnb"),
            ("Fonts/Malayalam", "assets/fonts/malayalam/Malayalam.xnb"),
            ("Fonts/Malayalam_0", "assets/fonts/malayalam/Malayalam_0.xnb"),
            ("Fonts/Marathi", "assets/fonts/marathi/Marathi.xnb"),
            ("Fonts/Marathi_0", "assets/fonts/marathi/Marathi_0.xnb"),
            ("Fonts/Burmese", "assets/fonts/burmese/Burmese.xnb"),
            ("Fonts/Burmese_0", "assets/fonts/burmese/Burmese_0.xnb"),
        ] {
            let font = try require(changes.first {
                ($0["Action"] as? String) == "Load"
                    && ($0["Target"] as? String) == target
                    && $0["TargetLocale"] == nil
            })
            expect(font["FromFile"] as? String == fontPath)
            let fontData = try Data(contentsOf: payload.appendingPathComponent(fontPath))
            expect(Array(fontData.prefix(3)) == Array("XNB".utf8))
        }

        let amharicFontHashes = [
            "assets/fonts/amharic/SpriteFont1.xnb": "2516c95a51492052973a06678a55e8849e136a8d977d423b0703d92e5dedddd2",
            "assets/fonts/amharic/SmallFont.xnb": "cd5fc1c5f4ade4b29611dd4e9966cdc56cadcc4845fb4de4818c376e943e1983",
            "assets/fonts/amharic/Amharic.xnb": "3f9d88180850330e6bd00f024b8da7771421f214970268a99e0bbdd66f26f460",
            "assets/fonts/amharic/Amharic_0.xnb": "fb6c1dbb5195a35250bab105751b930185858ee9a599c3ae9d15724eab727055",
        ]
        for (fontPath, expectedHash) in amharicFontHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(fontPath))
                    == expectedHash
            )
        }

        let kannadaFontHashes = [
            "assets/fonts/kannada/SpriteFont1.xnb": "cd71e39e360f447c52dbc5344e3e9da942d15f8d90408e13f2f489ba6707354b",
            "assets/fonts/kannada/SmallFont.xnb": "968b43115b908034ae37bc77b9be40e8d01cf737d65bdef81993d2d61efc6784",
            "assets/fonts/kannada/Kannada.xnb": "cf68034203db903e2dac2ffc2e59883f1698fe4a7c2865b470d2488f17496c0b",
            "assets/fonts/kannada/Kannada_0.xnb": "df5fd06bc26fc4fc3c167f92769c342c021ef9295f9b536c7c5e1c0c0207bcad",
        ]
        for (fontPath, expectedHash) in kannadaFontHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(fontPath))
                    == expectedHash
            )
        }

        let malayalamFontHashes = [
            "assets/fonts/malayalam/SpriteFont1.xnb": "2eede2a80e5e24c7d8c71d64f712bf5aa7c9167992e8f4fe2549e140fe00c526",
            "assets/fonts/malayalam/SmallFont.xnb": "ba1e909f08376be50bf145e632194560bb8d09116258a324a7b905935b4019b7",
            "assets/fonts/malayalam/Malayalam.xnb": "9a9952ac1dd73c744e48cc59c9d749bad958ae3131ac2f49026fe9572c9eba26",
            "assets/fonts/malayalam/Malayalam_0.xnb": "22e1b49563e0fb650c45785b7ac5fb4c0c0d7c342a14b03aec93b6588c6444be",
        ]
        for (fontPath, expectedHash) in malayalamFontHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(fontPath))
                    == expectedHash
            )
        }

        let marathiFontHashes = [
            "assets/fonts/marathi/SpriteFont1.xnb": "4f6602d9793e1f01447849e7e3da7666554e08449b2a59c4401806dfd6161e7c",
            "assets/fonts/marathi/SmallFont.xnb": "48feda030fcb1107eb8dbdeaa41156e8c5a15daeda057b0d62d7ff7cfa57afac",
            "assets/fonts/marathi/Marathi.xnb": "ed9fec4dea11a8498c98113dd96922db8ba90240a31feb0a87733a276be06716",
            "assets/fonts/marathi/Marathi_0.xnb": "a15abe5d6ecee042057be12c9675f396207e29714e82830c50c0c832af99a369",
        ]
        for (fontPath, expectedHash) in marathiFontHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(fontPath))
                    == expectedHash
            )
        }

        let burmeseFontHashes = [
            "assets/fonts/burmese/SpriteFont1.xnb": "956ed364c3632cc266e123176b35fa09d066551d5e332541a715ed62babedf63",
            "assets/fonts/burmese/SmallFont.xnb": "f7ddf27927abfb9a9961a5dbe3e4fad8cf46002d424496acd0ff26b8153ec8b2",
            "assets/fonts/burmese/Burmese.xnb": "4793ab1c4a0a7b5624aa1916c1992c2700e3df9d084d1fc2708a423c3bce6fdc",
            "assets/fonts/burmese/Burmese_0.xnb": "b9b9674065a2f72e335bce2ff979667d96ab763c125cb2bdde701560e48a492d",
        ]
        for (fontPath, expectedHash) in burmeseFontHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(fontPath))
                    == expectedHash
            )
        }

        func pngDimensions(_ relativePath: String) throws -> (Int, Int) {
            let data = try Data(contentsOf: payload.appendingPathComponent(relativePath))
            expect(data.count >= 24)
            expect(Array(data.prefix(8)) == [137, 80, 78, 71, 13, 10, 26, 10])
            func integer(at offset: Int) -> Int {
                (Int(data[offset]) << 24)
                    | (Int(data[offset + 1]) << 16)
                    | (Int(data[offset + 2]) << 8)
                    | Int(data[offset + 3])
            }
            return (integer(at: 16), integer(at: 20))
        }

        let buttonPath = "assets/button-amharic.png"
        let buttonSize = try pngDimensions(buttonPath)
        expect(buttonSize == (174, 78))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(buttonPath))
                == "0873236c6a0180af2334454d80409f2560366d72a1a85115b11af056fa5aa1ae"
        )
        let titlePath = "assets/title/TitleButtons-amharic.png"
        let titleSize = try pngDimensions(titlePath)
        expect(titleSize == (400, 655))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(titlePath))
                == "e6d16b41e8875db8d1dfdb67ac5024e908311e86f614cec63e2403542e3052ae"
        )

        let swahiliButtonPath = "assets/button-swahili.png"
        try expect(try pngDimensions(swahiliButtonPath) == (174, 78))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(swahiliButtonPath))
                == "5c8cc1b9736ce2f60b4aecea2f619ca6ac192732ef25ed21901972ad70346d31"
        )
        let swahiliTitlePath = "assets/title/TitleButtons-swahili.png"
        try expect(try pngDimensions(swahiliTitlePath) == (400, 655))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(swahiliTitlePath))
                == "60ea1526f085758e190214431e9e82daab01b7e699d8792d4c09b1d493b7bec1"
        )

        try expect(try pngDimensions("assets/button-kannada.png") == (174, 78))
        try expect(try pngDimensions("assets/title/TitleButtons-kannada.png") == (400, 655))
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/button-kannada.png")
            ) == "4ae50dc8c371c48a687c906819f5d2c10740eb646d6beb5e7a19d0e0fbee1102"
        )
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/title/TitleButtons-kannada.png")
            ) == "87aa54c9f39e56306eab3cf808e8decf00cbffaf551203aacd1c1c97441407fa"
        )

        try expect(try pngDimensions("assets/button-malayalam.png") == (174, 78))
        try expect(try pngDimensions("assets/title/TitleButtons-malayalam.png") == (400, 655))
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/button-malayalam.png")
            ) == "14de253ab8e981dc5fde775bf7236c55eada09a27486722aec92a9c9c830d721"
        )
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/title/TitleButtons-malayalam.png")
            ) == "7ca3895b8f7d960fafb9fb46ff56c7ca05554dffcc2ee315a00c62059d318e7d"
        )

        try expect(try pngDimensions("assets/button-marathi.png") == (174, 78))
        try expect(try pngDimensions("assets/title/TitleButtons-marathi.png") == (400, 655))
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/button-marathi.png")
            ) == "f912ce84aedbce3e844b408c52f022f61c4fccf04c15c30540db35bb05e0ff89"
        )
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/title/TitleButtons-marathi.png")
            ) == "120af12573ac44aabdcbceeb3fc19b0adb8b5b34b5443122c9264a3b50eca037"
        )

        try expect(try pngDimensions("assets/button-burmese.png") == (174, 78))
        try expect(try pngDimensions("assets/title/TitleButtons-burmese.png") == (400, 655))
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/button-burmese.png")
            ) == "31e99aa0cf39e8e7925863f60f772e005f7a5cb52e07a07eb01ca6c35c2a9446"
        )
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/title/TitleButtons-burmese.png")
            ) == "76d20f9fa6612f0c44c8d7b9c818d4e97b183cd6dc602b87c60e67500032ece1"
        )
    }

    func testInstallsLanguageSwitcher() throws {
        let fm = FileManager.default
        let source = projectRoot().appendingPathComponent(
            "Sources/StardewTranslationInstaller/Resources/LanguageSwitcherPayload"
        )
        let manifestData = try Data(contentsOf: source.appendingPathComponent("manifest.json"))
        let manifest = try require(
            JSONSerialization.jsonObject(with: manifestData) as? [String: Any]
        )
        expect(manifest["UniqueID"] as? String == InstallerCore.languageSwitcherUniqueID)
        expect(manifest["EntryDll"] as? String == "VNRevival.LanguageSwitcher.dll")
        let library = source.appendingPathComponent("VNRevival.LanguageSwitcher.dll")
        try expect(try Data(contentsOf: library).count > 4_096)

        let temporary = fm.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        defer { try? fm.removeItem(at: temporary) }
        let executable = temporary.appendingPathComponent("Contents/MacOS")
        try fm.createDirectory(at: executable, withIntermediateDirectories: true)
        try Data().write(to: executable.appendingPathComponent("Stardew Valley.dll"))
        let installation = try require(InstallerCore().resolveInstallation(temporary))

        try InstallerCore().installLanguageSwitcher(payload: source, into: installation)
        let installed = installation.modsDirectory.appendingPathComponent(
            InstallerCore.languageSwitcherFolderName
        )
        expect(fm.fileExists(atPath: installed.appendingPathComponent("manifest.json").path))
        expect(fm.fileExists(atPath: installed.appendingPathComponent("VNRevival.LanguageSwitcher.dll").path))
    }

    func testValidatesIncludedTranslationFiles() throws {
        let payload = projectRoot().appendingPathComponent(
            "Sources/StardewTranslationInstaller/Resources/ModPayload"
        )
        let content = try require(
            JSONSerialization.jsonObject(
                with: Data(contentsOf: payload.appendingPathComponent("content.json"))
            ) as? [String: Any]
        )
        expect(content["Format"] != nil)
        let changes = try require(content["Changes"] as? [[String: Any]])
        let includes = changes.filter { ($0["Action"] as? String) == "Include" }
        expect(includes.count == 2_074)
        let includedPaths = try includes.map { try require($0["FromFile"] as? String) }
        expect(Set(includedPaths).count == includedPaths.count)
        var malayalamPrivateUseGlyphs = 0
        var rawMalayalamScalars = 0
        var marathiPrivateUseGlyphs = 0
        var rawMarathiScalars = 0
        var burmesePrivateUseGlyphs = 0
        var rawBurmeseScalars = 0

        for include in includes {
            let relativePath = try require(include["FromFile"] as? String)
            let secondary = try require(
                JSONSerialization.jsonObject(
                    with: Data(contentsOf: payload.appendingPathComponent(relativePath))
                ) as? [String: Any]
            )
            expect(secondary["Format"] == nil)
            let secondaryChanges = try require(secondary["Changes"] as? [[String: Any]])
            expect(!secondaryChanges.isEmpty)
            let expectedLanguage: String
            if relativePath.contains("/russian/") {
                expectedLanguage = "ru-vnrevival"
            } else if relativePath.contains("/polish/") {
                expectedLanguage = "pl-vnrevival"
            } else if relativePath.contains("/uzbek/") {
                expectedLanguage = "uz-vnrevival"
            } else if relativePath.contains("/swahili/") {
                expectedLanguage = "sw-vnrevival"
            } else if relativePath.contains("/amharic/") {
                expectedLanguage = "am-vnrevival"
            } else if relativePath.contains("/malayalam/") {
                expectedLanguage = "ml-vnrevival"
            } else if relativePath.contains("/marathi/") {
                expectedLanguage = "mr-vnrevival"
            } else if relativePath.contains("/burmese/") {
                expectedLanguage = "my-vnrevival"
            } else {
                expectedLanguage = "kn-vnrevival"
            }
            for change in secondaryChanges {
                let condition = try require(change["When"] as? [String: String])
                expect(condition == ["Language": expectedLanguage])
                if expectedLanguage == "ml-vnrevival" {
                    let entries = try require(change["Entries"] as? [String: String])
                    for value in entries.values {
                        for scalar in value.unicodeScalars {
                            if (0xE000...0xF8FF).contains(scalar.value) {
                                malayalamPrivateUseGlyphs += 1
                            }
                            if (0x0D00...0x0D7F).contains(scalar.value) {
                                rawMalayalamScalars += 1
                            }
                        }
                    }
                }
                if expectedLanguage == "mr-vnrevival" {
                    let entries = try require(change["Entries"] as? [String: String])
                    for value in entries.values {
                        for scalar in value.unicodeScalars {
                            if (0xE000...0xF8FF).contains(scalar.value) {
                                marathiPrivateUseGlyphs += 1
                            }
                            if (0x0900...0x097F).contains(scalar.value)
                                || (0xA8E0...0xA8FF).contains(scalar.value) {
                                rawMarathiScalars += 1
                            }
                        }
                    }
                }
                if expectedLanguage == "my-vnrevival" {
                    let entries = try require(change["Entries"] as? [String: String])
                    for value in entries.values {
                        for scalar in value.unicodeScalars {
                            if (0xE000...0xF8FF).contains(scalar.value) {
                                burmesePrivateUseGlyphs += 1
                            }
                            if (0x1000...0x109F).contains(scalar.value)
                                || (0xA9E0...0xA9FF).contains(scalar.value)
                                || (0xAA60...0xAA7F).contains(scalar.value) {
                                rawBurmeseScalars += 1
                            }
                        }
                    }
                }
            }
        }
        expect(malayalamPrivateUseGlyphs > 100_000)
        expect(rawMalayalamScalars == 0)
        expect(marathiPrivateUseGlyphs > 100_000)
        expect(rawMarathiScalars == 0)
        expect(burmesePrivateUseGlyphs > 100_000)
        expect(rawBurmeseScalars == 0)
    }

    func testComputesChecksum() throws {
        let file = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        defer { try? FileManager.default.removeItem(at: file) }
        try Data("hello".utf8).write(to: file)
        try expect(
            try DependencyInstaller.sha256(of: file)
                == "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
        )
    }

    func testInstallAndRemove() throws {
        let fm = FileManager.default
        let temporary = fm.temporaryDirectory.appendingPathComponent(UUID().uuidString, isDirectory: true)
        defer { try? fm.removeItem(at: temporary) }
        let executable = temporary.appendingPathComponent("Contents/MacOS", isDirectory: true)
        try fm.createDirectory(at: executable, withIntermediateDirectories: true)
        try Data().write(to: executable.appendingPathComponent("Stardew Valley.dll"))

        let payload = temporary.appendingPathComponent("Payload", isDirectory: true)
        try fm.createDirectory(at: payload, withIntermediateDirectories: true)
        let package = try translationPackage()
        try writePayloadIdentity(at: payload, package: package)

        let core = InstallerCore(fileManager: fm)
        let installation = try require(core.resolveInstallation(temporary))
        try core.install(
            payload: payload,
            package: package,
            into: installation,
            requirePrerequisites: false
        )
        expect(core.status(for: installation, package: package).modInstalled)
        try core.uninstall(package: package, from: installation)
        expect(!fm.fileExists(atPath: installation.modDirectory(for: package).path))
    }

    func testProtectsForeignFolder() throws {
        let fm = FileManager.default
        let temporary = fm.temporaryDirectory.appendingPathComponent(UUID().uuidString, isDirectory: true)
        defer { try? fm.removeItem(at: temporary) }
        let executable = temporary.appendingPathComponent("Contents/MacOS", isDirectory: true)
        let package = try translationPackage()
        let foreign = executable.appendingPathComponent("Mods/\(package.modFolderName)", isDirectory: true)
        try fm.createDirectory(at: foreign, withIntermediateDirectories: true)
        try Data().write(to: executable.appendingPathComponent("Stardew Valley.dll"))
        try #"{"UniqueID":"Somebody.Else"}"#.data(using: .utf8)!.write(to: foreign.appendingPathComponent("manifest.json"))

        let payload = temporary.appendingPathComponent("Payload", isDirectory: true)
        try fm.createDirectory(at: payload, withIntermediateDirectories: true)
        try writePayloadIdentity(at: payload, package: package)

        let core = InstallerCore(fileManager: fm)
        let installation = try require(core.resolveInstallation(temporary))
        expect(throws: InstallerError.self) {
            try core.install(
                payload: payload,
                package: package,
                into: installation,
                requirePrerequisites: false
            )
        }
    }

    func testMigratesLegacyPackages() throws {
        let fm = FileManager.default
        let temporary = fm.temporaryDirectory.appendingPathComponent(UUID().uuidString, isDirectory: true)
        defer { try? fm.removeItem(at: temporary) }
        let executable = temporary.appendingPathComponent("Contents/MacOS", isDirectory: true)
        try fm.createDirectory(at: executable, withIntermediateDirectories: true)
        try Data().write(to: executable.appendingPathComponent("Stardew Valley.dll"))

        let package = try translationPackage()
        let mods = executable.appendingPathComponent("Mods", isDirectory: true)
        for legacy in package.legacyPackages {
            let folder = mods.appendingPathComponent(legacy.modFolderName, isDirectory: true)
            try fm.createDirectory(at: folder, withIntermediateDirectories: true)
            let manifest = ["UniqueID": legacy.uniqueID]
            try JSONSerialization.data(withJSONObject: manifest)
                .write(to: folder.appendingPathComponent("manifest.json"))
        }

        let payload = temporary.appendingPathComponent("Payload", isDirectory: true)
        try fm.createDirectory(at: payload, withIntermediateDirectories: true)
        try writePayloadIdentity(at: payload, package: package)
        let core = InstallerCore(fileManager: fm)
        let installation = try require(core.resolveInstallation(temporary))
        try core.install(
            payload: payload,
            package: package,
            into: installation,
            requirePrerequisites: false
        )

        expect(core.status(for: installation, package: package).modInstalled)
        for legacy in package.legacyPackages {
            let folder = mods.appendingPathComponent(legacy.modFolderName, isDirectory: true)
            expect(!fm.fileExists(atPath: folder.path))
        }
    }
}

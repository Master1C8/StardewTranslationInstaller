import Foundation
import Testing
@testable import StardewTranslationInstaller

@Suite
struct InstallerCoreTests {
    private struct RequiredValueMissing: Error {}

    private func expect(
        _ condition: @autoclosure () throws -> Bool,
        line: Int = #line
    ) rethrows {
        if try !condition() {
            Issue.record("Expectation failed at line \(line)")
        }
    }

    private func expect<E: Error>(
        throws expectedType: E.Type,
        _ body: () throws -> Void
    ) {
        do {
            try body()
            Issue.record("Expected \(expectedType), but no error was thrown")
        } catch is E {
            return
        } catch {
            Issue.record("Expected \(expectedType), got \(type(of: error))")
        }
    }

    private func require<T>(
        _ value: T?
    ) throws -> T {
        guard let value else {
            Issue.record("Required value is missing")
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

    @Test func testLoadsTranslationPackage() throws {
        let package = try translationPackage()
        expect(package.schemaVersion == 2)
        expect(package.siteLocale == "ru")
        expect(package.languageCodes == ["ru-vnrevival", "sr-vnrevival", "pl-vnrevival", "uk-vnrevival", "vi-vnrevival", "sw-vnrevival", "fa-vnrevival", "ar-vnrevival", "id-vnrevival", "fil-vnrevival", "nl-vnrevival", "hi-vnrevival", "zh-TW-vnrevival", "ro-vnrevival", "he-vnrevival", "bg-vnrevival"])
        expect(package.uniqueID == "VNRevival.StardewValleyTranslations")
        expect(TranslationPackage.supportedSiteLocales == [
            "zh", "en", "ru", "es", "pt-BR", "ja", "de", "ko", "fr", "tr", "pl", "zh-TW",
            "it", "th", "vi", "id", "uk", "ar", "cs", "hu", "nl", "fa", "ro", "hi", "fil",
            "el", "bg", "sr", "sw", "he",
        ])
    }

    @Test func testValidatesCurrentInterfaceAssets() throws {
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
        expect(languageEntries.count == 16)
        let expectedButtons = [
            "ru-vnrevival": ("ButtonRussian", "assets/button-russian.png", "assets/title/TitleButtons-russian.png"),
            "sr-vnrevival": ("ButtonSerbian", "assets/button-serbian.png", "assets/title/TitleButtons-serbian.png"),
            "pl-vnrevival": ("ButtonPolish", "assets/button.png", "assets/title/TitleButtons.png"),
            "uk-vnrevival": ("ButtonUkrainian", "assets/button-ukrainian.png", "assets/title/TitleButtons-ukrainian.png"),
            "vi-vnrevival": ("ButtonVietnamese", "assets/button-vietnamese.png", "assets/title/TitleButtons-vietnamese.png"),
            "sw-vnrevival": ("ButtonSwahili", "assets/button-swahili.png", "assets/title/TitleButtons-swahili.png"),
            "fa-vnrevival": ("ButtonPersian", "assets/button-persian.png", "assets/title/TitleButtons-persian.png"),
            "ar-vnrevival": ("ButtonArabic", "assets/button-arabic.png", "assets/title/TitleButtons-arabic.png"),
            "id-vnrevival": ("ButtonIndonesian", "assets/button-indonesian.png", "assets/title/TitleButtons-indonesian.png"),
            "fil-vnrevival": ("ButtonFilipino", "assets/button-filipino.png", "assets/title/TitleButtons-filipino.png"),
            "nl-vnrevival": ("ButtonDutch", "assets/button-dutch.png", "assets/title/TitleButtons-dutch.png"),
            "hi-vnrevival": ("ButtonHindi", "assets/button-hindi.png", "assets/title/TitleButtons-hindi.png"),
            "zh-TW-vnrevival": ("ButtonTraditionalChinese", "assets/button-traditional-chinese.png", "assets/title/TitleButtons-traditional-chinese.png"),
            "ro-vnrevival": ("ButtonRomanian", "assets/button-romanian.png", "assets/title/TitleButtons-romanian.png"),
            "he-vnrevival": ("ButtonHebrew", "assets/button-hebrew.png", "assets/title/TitleButtons-hebrew.png"),
            "bg-vnrevival": ("ButtonBulgarian", "assets/button-bulgarian.png", "assets/title/TitleButtons-bulgarian.png"),
        ]
        for code in package.languageCodes {
            let expected = try require(expectedButtons[code])
            let language = try require(languageEntries.values.compactMap { $0 as? [String: Any] }.first {
                ($0["LanguageCode"] as? String) == code
            })
            expect(language["ButtonTexture"] as? String == "Mods/{{ModId}}/\(expected.0)")
            expect(language["UseLatinFont"] as? Bool == !["ru-vnrevival", "sr-vnrevival", "fa-vnrevival", "ar-vnrevival", "hi-vnrevival", "zh-TW-vnrevival", "he-vnrevival", "bg-vnrevival"].contains(code))
            if code == "ru-vnrevival" || code == "sr-vnrevival" || code == "bg-vnrevival" {
                expect(language["FontFile"] as? String == "Fonts/Russian")
                expect(language["FontPixelZoom"] as? Int == 3)
            }
            if code == "fa-vnrevival" {
                expect(language["FontFile"] as? String == "Fonts/Persian")
                expect(language["FontPixelZoom"] as? Int == 3)
            }
            if code == "ar-vnrevival" {
                expect(language["FontFile"] as? String == "Fonts/Arabic")
                expect(language["FontPixelZoom"] as? Int == 3)
            }
            if code == "hi-vnrevival" {
                expect(language["FontFile"] as? String == "Fonts/Hindi")
                expect(language["FontPixelZoom"] as? Int == 3)
            }
            if code == "zh-TW-vnrevival" {
                expect(language["FontFile"] as? String == "Fonts/ChineseTraditional")
                expect(language["FontPixelZoom"] as? Int == 3)
            }
            if code == "he-vnrevival" {
                expect(language["FontFile"] as? String == "Fonts/Hebrew")
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
            ("sr-vnrevival", "serbian"),
            ("pl-vnrevival", "polish"),
            ("uk-vnrevival", "ukrainian"),
            ("vi-vnrevival", "vietnamese"),
            ("fil-vnrevival", "filipino"),
            ("nl-vnrevival", "dutch"),
            ("fa-vnrevival", "persian"),
            ("ar-vnrevival", "arabic"),
            ("hi-vnrevival", "hindi"),
            ("zh-TW-vnrevival", "traditional-chinese"),
            ("ro-vnrevival", "romanian"),
            ("he-vnrevival", "hebrew"),
            ("bg-vnrevival", "bulgarian"),
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
            ("Fonts/Persian", "assets/fonts/persian/Persian.xnb"),
            ("Fonts/Persian_0", "assets/fonts/persian/Persian_0.xnb"),
            ("Fonts/Arabic", "assets/fonts/arabic/Arabic.xnb"),
            ("Fonts/Arabic_0", "assets/fonts/arabic/Arabic_0.xnb"),
            ("Fonts/Hindi", "assets/fonts/hindi/Hindi.xnb"),
            ("Fonts/Hindi_0", "assets/fonts/hindi/Hindi_0.xnb"),
            ("Fonts/Hebrew", "assets/fonts/hebrew/Hebrew.xnb"),
            ("Fonts/Hebrew_0", "assets/fonts/hebrew/Hebrew_0.xnb"),
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

        let vietnameseFontHashes = [
            "assets/fonts/vietnamese/SpriteFont1.xnb": "460c192146c5c7099aaebaff9e1dbb39ce00843670a9d79fdb96d897ce3494dd",
            "assets/fonts/vietnamese/SmallFont.xnb": "812f32313bdebe4a2b240a4ad4818a41b445d70a0bad630c3d26997f5596b72a",
        ]
        for (fontPath, expectedHash) in vietnameseFontHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(fontPath))
                    == expectedHash
            )
        }

        let romanianFontHashes = [
            "assets/fonts/romanian/SpriteFont1.xnb": "58225c91ec5985d39a6aba44958cef63c9e256dd11903822e48a7f4ff9c4c85a",
            "assets/fonts/romanian/SmallFont.xnb": "b777da7dc4fa4bc7ae77d68320ec7f50a9d7a3fb361a44c6c81d16a3c5b7eff7",
        ]
        for (fontPath, expectedHash) in romanianFontHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(fontPath))
                    == expectedHash
            )
        }

        let persianFontHashes = [
            "assets/fonts/persian/SpriteFont1.xnb": "763d7805feef033a1d4c5cfd3dce5d430758b353bd8570a5f4b8daffefe7c5da",
            "assets/fonts/persian/SmallFont.xnb": "446d9bab23f4d36e6b0494711a9bc1de6f042b5cde31f3d59bde83eddd5f946a",
            "assets/fonts/persian/Persian.xnb": "e07656aeedc1a1ef578b354334dd84a5052da6301310b5bbb416c9ceac3f8fe0",
            "assets/fonts/persian/Persian_0.xnb": "7d528e00b6080746408844a1672fe93dec92a30f1a2e762818a1ac368ea22da8",
        ]
        for (fontPath, expectedHash) in persianFontHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(fontPath))
                    == expectedHash
            )
        }

        let arabicFontHashes = [
            "assets/fonts/arabic/SpriteFont1.xnb": "f437e6068eb98369c941499e885bd1f9efb70de1503ea656927bd38814fdde92",
            "assets/fonts/arabic/SmallFont.xnb": "6d44e66e157890fcefabe44f72edaeb765777ecc7650c3b0dd21e0160c8a2267",
            "assets/fonts/arabic/Arabic.xnb": "bdb595905f1f7033fe63b59413b8ff954df89a73ad12f8ddddf0ffcfe7a14f91",
            "assets/fonts/arabic/Arabic_0.xnb": "e789a4688f0ab61263155172914788910aaa883599e3c31133abb14b1e8d5199",
        ]
        for (fontPath, expectedHash) in arabicFontHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(fontPath))
                    == expectedHash
            )
        }

        let hindiFontHashes = [
            "assets/fonts/hindi/SpriteFont1.xnb": "690371af4bcbb60748efc616a7e437cca91955f5d7583093d2979802775ac796",
            "assets/fonts/hindi/SmallFont.xnb": "ead57d283edf138d6e3baf5d3d8924d48326c8b7a1cd443c54b9d36ee31d09eb",
            "assets/fonts/hindi/Hindi.xnb": "dc929c21e434e8414243ef21a169aa8e4370ed7fd3694234d8a39435fe07b861",
            "assets/fonts/hindi/Hindi_0.xnb": "79e16c38128299e038a339535e6f81dfaf154ee32bf92d1f473f5292cf82c90a",
        ]
        for (fontPath, expectedHash) in hindiFontHashes {
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

        let vietnameseButtonPath = "assets/button-vietnamese.png"
        try expect(try pngDimensions(vietnameseButtonPath) == (174, 78))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(vietnameseButtonPath))
                == "be0551c7dd7214b17e7e1b42c9808063ec91e2ce4e67dfe51ebb9994bd3018ba"
        )
        let vietnameseTitlePath = "assets/title/TitleButtons-vietnamese.png"
        try expect(try pngDimensions(vietnameseTitlePath) == (400, 655))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(vietnameseTitlePath))
                == "3df4db304c9f1487c3e620bee52615b801f783bff976a103504e1f59e4bd2803"
        )

        let hindiButtonPath = "assets/button-hindi.png"
        try expect(try pngDimensions(hindiButtonPath) == (174, 78))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(hindiButtonPath))
                == "63d1b99db23dbc7237b254804cbf347716d2a8dd8cf5132697085c7cdd80fd67"
        )
        let hindiTitlePath = "assets/title/TitleButtons-hindi.png"
        try expect(try pngDimensions(hindiTitlePath) == (400, 655))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(hindiTitlePath))
                == "85e12d552629e046f774807531e3ff5b4ca2cc05be86e37992aa845815970768"
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

        let indonesianButtonPath = "assets/button-indonesian.png"
        try expect(try pngDimensions(indonesianButtonPath) == (174, 78))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(indonesianButtonPath))
                == "6e5a4b156c988f2dc7f94fed5c44d31f94604acf65bfd20d3f07fe26e22c0743"
        )
        let indonesianTitlePath = "assets/title/TitleButtons-indonesian.png"
        try expect(try pngDimensions(indonesianTitlePath) == (400, 655))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(indonesianTitlePath))
                == "03997fa4db85d3e0638a7db5210cf8020bd7aacd658cf00d1ba2112a9c62722a"
        )


        let filipinoButtonPath = "assets/button-filipino.png"
        try expect(try pngDimensions(filipinoButtonPath) == (174, 78))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(filipinoButtonPath))
                == "d134b7337d24394bed1ec515586d29d9c5553b71addb8601369ac49393db4c8b"
        )
        let filipinoTitlePath = "assets/title/TitleButtons-filipino.png"
        try expect(try pngDimensions(filipinoTitlePath) == (400, 655))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(filipinoTitlePath))
                == "d6e4b47e0ccf257c655f8c52f4c1ad5205231957ad19a701ea70da33419c1007"
        )

        let filipinoFontHashes = [
            "assets/fonts/filipino/SpriteFont1.xnb": "6c22d21660baa07c2a86f99da9c3f70019a77b68c0640a111096bfaf21195f6d",
            "assets/fonts/filipino/SmallFont.xnb": "d5ab8bcd224288b7401ece73ba9af6ccfb2306012e39d0d92175fd527e3b5d82",
        ]
        for (fontPath, expectedHash) in filipinoFontHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(fontPath))
                    == expectedHash
            )
        }

        let romanianButtonPath = "assets/button-romanian.png"
        try expect(try pngDimensions(romanianButtonPath) == (174, 78))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(romanianButtonPath))
                == "7092f18d812e1b3128762b7c89a8983df24487ae30c7af6022b783c575a11389"
        )
        let romanianTitlePath = "assets/title/TitleButtons-romanian.png"
        try expect(try pngDimensions(romanianTitlePath) == (400, 655))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(romanianTitlePath))
                == "1d07ee588d395d97bcc7fb84c4b84587c76895487ff047b820331c68661c89b8"
        )

        try expect(try pngDimensions("assets/button-persian.png") == (174, 78))
        try expect(try pngDimensions("assets/title/TitleButtons-persian.png") == (400, 655))
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/button-persian.png")
            ) == "ae33c27660fe31e4b8c70f5c63094b0131ad99cb61bd9223bf2473cf6f9f2765"
        )
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/title/TitleButtons-persian.png")
            ) == "1e55ce4c9a3fac77c2836adbec0fd8699d012ff14a587840ceac466a12d67684"
        )

        try expect(try pngDimensions("assets/button-arabic.png") == (174, 78))
        try expect(try pngDimensions("assets/title/TitleButtons-arabic.png") == (400, 655))
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/button-arabic.png")
            ) == "be46227a1a3a0e2d98bb17d9d70fe11d705143badcaee6a01ce8141b38a4a8dc"
        )
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/title/TitleButtons-arabic.png")
            ) == "994bb20ff4a583a31ffddaafbc6d53b5f7a14644fa1425a8c37e6d7d09873962"
        )

        let bulgarianAssetHashes = [
            "assets/button-bulgarian.png": "4e0f6f90cbcc0993e6ef9072023125e5e6ce80eea376c9c993b17ff04fe365d2",
            "assets/title/TitleButtons-bulgarian.png": "3186a547e368601d4d694c5df8fca33c3d0473a6c36d5b023e15932bcecfc08d",
            "assets/fonts/bulgarian/SpriteFont1.xnb": "79b0bc55244a90a81a68e36aec198c42f22d8dd98f5a4489f425adc4d52dd233",
            "assets/fonts/bulgarian/SmallFont.xnb": "79b0bc55244a90a81a68e36aec198c42f22d8dd98f5a4489f425adc4d52dd233",
        ]
        try expect(try pngDimensions("assets/button-bulgarian.png") == (174, 78))
        try expect(try pngDimensions("assets/title/TitleButtons-bulgarian.png") == (400, 655))
        for (assetPath, expectedHash) in bulgarianAssetHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(assetPath))
                    == expectedHash
            )
        }

        let retiredLanguages = [
            "uzbek", "amharic", "kannada", "malayalam", "marathi",
            "burmese", "telugu", "urdu", "tamil", "bengali",
        ]
        for language in retiredLanguages {
            expect(!FileManager.default.fileExists(
                atPath: payload.appendingPathComponent("assets/translations/\(language)").path
            ))
            expect(!FileManager.default.fileExists(
                atPath: payload.appendingPathComponent("assets/button-\(language).png").path
            ))
            expect(!FileManager.default.fileExists(
                atPath: payload.appendingPathComponent("assets/title/TitleButtons-\(language).png").path
            ))
        }
        for language in retiredLanguages.dropFirst() {
            expect(!FileManager.default.fileExists(
                atPath: payload.appendingPathComponent("assets/fonts/\(language)").path
            ))
        }
    }

    @Test func testInstallsLanguageSwitcher() throws {
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
        expect(!fm.fileExists(atPath: source.appendingPathComponent("urdu-shaping-map.json").path))
        let persianShapingMap = try require(
            JSONSerialization.jsonObject(
                with: Data(contentsOf: source.appendingPathComponent("persian-shaping-map.json"))
            ) as? [String: Any]
        )
        expect(persianShapingMap["format"] as? Int == 2)
        let persianShapingEntries = try require(persianShapingMap["entries"] as? [[String: Any]])
        expect(persianShapingEntries.count == 381)
        expect(Set(persianShapingEntries.compactMap { $0["glyph"] as? String }).count == 381)
        let arabicShapingMap = try require(
            JSONSerialization.jsonObject(
                with: Data(contentsOf: source.appendingPathComponent("arabic-shaping-map.json"))
            ) as? [String: Any]
        )
        expect(arabicShapingMap["format"] as? Int == 2)
        let arabicShapingEntries = try require(arabicShapingMap["entries"] as? [[String: Any]])
        expect(arabicShapingEntries.count == 556)
        expect(Set(arabicShapingEntries.compactMap { $0["glyph"] as? String }).count == 556)

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

    @Test func testValidatesIncludedTranslationFiles() throws {
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
        expect(includes.count == 3_892)
        let includedPaths = try includes.map { try require($0["FromFile"] as? String) }
        expect(Set(includedPaths).count == includedPaths.count)
        var hindiPrivateUseGlyphs = 0
        var rawHindiScalars = 0

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
            } else if relativePath.contains("/serbian/") {
                expectedLanguage = "sr-vnrevival"
            } else if relativePath.contains("/polish/") {
                expectedLanguage = "pl-vnrevival"
            } else if relativePath.contains("/ukrainian/") {
                expectedLanguage = "uk-vnrevival"
            } else if relativePath.contains("/vietnamese/") {
                expectedLanguage = "vi-vnrevival"
            } else if relativePath.contains("/swahili/") {
                expectedLanguage = "sw-vnrevival"
            } else if relativePath.contains("/persian/") {
                expectedLanguage = "fa-vnrevival"
            } else if relativePath.contains("/arabic/") {
                expectedLanguage = "ar-vnrevival"
            } else if relativePath.contains("/indonesian/") {
                expectedLanguage = "id-vnrevival"
            } else if relativePath.contains("/filipino/") {
                expectedLanguage = "fil-vnrevival"
            } else if relativePath.contains("/dutch/") {
                expectedLanguage = "nl-vnrevival"
            } else if relativePath.contains("/hindi/") {
                expectedLanguage = "hi-vnrevival"
            } else if relativePath.contains("/traditional-chinese/") {
                expectedLanguage = "zh-TW-vnrevival"
            } else if relativePath.contains("/romanian/") {
                expectedLanguage = "ro-vnrevival"
            } else if relativePath.contains("/hebrew/") {
                expectedLanguage = "he-vnrevival"
            } else if relativePath.contains("/bulgarian/") {
                expectedLanguage = "bg-vnrevival"
            } else {
                throw RequiredValueMissing()
            }
            for change in secondaryChanges {
                let condition = try require(change["When"] as? [String: String])
                expect(condition == ["Language": expectedLanguage])
                if expectedLanguage == "hi-vnrevival" {
                    let entries = try require(change["Entries"] as? [String: String])
                    for value in entries.values {
                        for scalar in value.unicodeScalars {
                            if (0xE000...0xF8FF).contains(scalar.value) {
                                hindiPrivateUseGlyphs += 1
                            }
                            if (0x0900...0x097F).contains(scalar.value)
                                || (0xA8E0...0xA8FF).contains(scalar.value) {
                                rawHindiScalars += 1
                            }
                        }
                    }
                }
            }
        }
        expect(hindiPrivateUseGlyphs > 100_000)
        expect(rawHindiScalars == 0)
    }

    @Test func testComputesChecksum() throws {
        let file = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        defer { try? FileManager.default.removeItem(at: file) }
        try Data("hello".utf8).write(to: file)
        try expect(
            try DependencyInstaller.sha256(of: file)
                == "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
        )
    }

    @Test func testInstallAndRemove() throws {
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

    @Test func testProtectsForeignFolder() throws {
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

    @Test func testMigratesLegacyPackages() throws {
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

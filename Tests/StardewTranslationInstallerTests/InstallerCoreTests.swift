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
        expect(package.languageCodes == ["ru-vnrevival", "sr-vnrevival", "pl-vnrevival", "uk-vnrevival", "vi-vnrevival", "sw-vnrevival", "fa-vnrevival", "ar-vnrevival", "id-vnrevival", "fil-vnrevival", "nl-vnrevival", "hi-vnrevival", "zh-TW-vnrevival", "ro-vnrevival", "he-vnrevival", "bg-vnrevival", "th-vnrevival", "el-vnrevival", "cs-vnrevival"])
        expect(Array(package.languageCodes.prefix(12)) == [
            "ru-vnrevival", "sr-vnrevival", "pl-vnrevival",
            "uk-vnrevival", "vi-vnrevival", "sw-vnrevival",
            "fa-vnrevival", "ar-vnrevival", "id-vnrevival",
            "fil-vnrevival", "nl-vnrevival", "hi-vnrevival",
        ])
        expect(Array(package.languageCodes.dropFirst(12)) == [
            "zh-TW-vnrevival", "ro-vnrevival", "he-vnrevival",
            "bg-vnrevival", "th-vnrevival", "el-vnrevival",
            "cs-vnrevival",
        ])
        expect(package.uniqueID == "VNRevival.StardewValleyTranslations")
        expect(package.copy.windowTitle == "VN Revival Languages for Stardew Valley")
        expect(package.copy.preparingTitle == "VN Revival Languages for Stardew Valley")
        expect(package.copy.installingTitle == "Installing translations")
        expect(package.copy.installedMessage == "All translations installed")
        expect(package.copy.launchButton == "Launch game")
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
        expect(languageEntries.count == 19)
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
            "th-vnrevival": ("ButtonThai", "assets/button-thai.png", "assets/title/TitleButtons-thai.png"),
            "el-vnrevival": ("ButtonGreek", "assets/button-greek.png", "assets/title/TitleButtons-greek.png"),
            "cs-vnrevival": ("ButtonCzech", "assets/button-czech.png", "assets/title/TitleButtons-czech.png"),
        ]
        let expectedBitmapFonts = [
            "sr-vnrevival": ("Serbian", "serbian"),
            "pl-vnrevival": ("Polish", "polish"),
            "uk-vnrevival": ("Ukrainian", "ukrainian"),
            "vi-vnrevival": ("Vietnamese", "vietnamese"),
            "sw-vnrevival": ("Swahili", "swahili"),
            "fa-vnrevival": ("Persian", "persian"),
            "ar-vnrevival": ("Arabic", "arabic"),
            "id-vnrevival": ("Indonesian", "indonesian"),
            "fil-vnrevival": ("Filipino", "filipino"),
            "nl-vnrevival": ("Dutch", "dutch"),
            "hi-vnrevival": ("Hindi", "hindi"),
            "zh-TW-vnrevival": ("ChineseTraditional", "traditional-chinese"),
            "ro-vnrevival": ("Romanian", "romanian"),
            "he-vnrevival": ("Hebrew", "hebrew"),
            "bg-vnrevival": ("Bulgarian", "bulgarian"),
            "th-vnrevival": ("Thai", "thai"),
            "el-vnrevival": ("Greek", "greek"),
            "cs-vnrevival": ("Czech", "czech"),
        ]
        for code in package.languageCodes {
            let expected = try require(expectedButtons[code])
            let language = try require(languageEntries.values.compactMap { $0 as? [String: Any] }.first {
                ($0["LanguageCode"] as? String) == code
            })
            expect(language["ButtonTexture"] as? String == "Mods/{{ModId}}/\(expected.0)")
            expect(language["UseLatinFont"] as? Bool == false)
            expect(language["FontPixelZoom"] as? Int == (code == "ru-vnrevival" ? 3 : 1))
            if code == "ru-vnrevival" {
                expect(language["FontFile"] as? String == "Fonts/Russian")
            } else {
                let bitmapFont = try require(expectedBitmapFonts[code])
                expect(language["FontFile"] as? String == "Fonts/\(bitmapFont.0)")
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
            ("sw-vnrevival", "swahili"),
            ("fil-vnrevival", "filipino"),
            ("nl-vnrevival", "dutch"),
            ("fa-vnrevival", "persian"),
            ("ar-vnrevival", "arabic"),
            ("id-vnrevival", "indonesian"),
            ("hi-vnrevival", "hindi"),
            ("zh-TW-vnrevival", "traditional-chinese"),
            ("ro-vnrevival", "romanian"),
            ("he-vnrevival", "hebrew"),
            ("bg-vnrevival", "bulgarian"),
            ("cs-vnrevival", "czech"),
            ("th-vnrevival", "thai"),
            ("el-vnrevival", "greek"),
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
            expect(fontData.count >= 14 && (fontData[5] & 0x40) != 0 && (fontData[5] & 0x80) == 0)
          }
        }

        for (_, bitmapFont) in expectedBitmapFonts {
            for name in [bitmapFont.0, "\(bitmapFont.0)_0"] {
                let target = "Fonts/\(name)"
                let fontPath = "assets/fonts/\(bitmapFont.1)/\(name).xnb"
                let font = try require(changes.first {
                    ($0["Action"] as? String) == "Load"
                        && ($0["Target"] as? String) == target
                        && $0["TargetLocale"] == nil
                })
                expect(font["FromFile"] as? String == fontPath)
                let fontData = try Data(contentsOf: payload.appendingPathComponent(fontPath))
                expect(Array(fontData.prefix(3)) == Array("XNB".utf8))
                expect(fontData.count >= 14 && (fontData[5] & 0x40) != 0 && (fontData[5] & 0x80) == 0)
            }
        }

        let vietnameseFontHashes = [
            "assets/fonts/vietnamese/SpriteFont1.xnb": "6b01e985434e56493d602b66a60ba2f1050a9dd152d561e2b3d11e9c94a426b2",
            "assets/fonts/vietnamese/SmallFont.xnb": "b7de6d25686c6c1844c043b964ad10376dceefb7cb50e6335bd5900084784110",
        ]
        for (fontPath, expectedHash) in vietnameseFontHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(fontPath))
                    == expectedHash
            )
        }

        let romanianFontHashes = [
            "assets/fonts/romanian/SpriteFont1.xnb": "626f123e8874332d387fe3ab180ac4ecefa10ae0e6fe51cfcd3fb1449b60c856",
            "assets/fonts/romanian/SmallFont.xnb": "24b6022d588dcf5c7289732af4d6e5bbd1fa4b733931bf29fc5b6465eb4d2d27",
        ]
        for (fontPath, expectedHash) in romanianFontHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(fontPath))
                    == expectedHash
            )
        }

        let persianFontHashes = [
            "assets/fonts/persian/SpriteFont1.xnb": "b4a1309ff96d648d6f2c62cb3cf7d409bc5a00b24625f987e51dc0bac0120935",
            "assets/fonts/persian/SmallFont.xnb": "4e9b04ab7144ac61d68e23922f03a4264a5baee6af455f78269bfef734757969",
            "assets/fonts/persian/Persian.xnb": "f312aa85c7835035d928f028cde76b8bbabe102a627c0e80122f8eac331763e7",
            "assets/fonts/persian/Persian_0.xnb": "7636466d6f7b84c9caa26ab4598672f18da927dc9be47b96e6c597e3a3461b04",
        ]
        for (fontPath, expectedHash) in persianFontHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(fontPath))
                    == expectedHash
            )
        }

        let arabicFontHashes = [
            "assets/fonts/arabic/SpriteFont1.xnb": "ef03a896307f93b14d60db2da267b82fe8cb197de73999f61ecbb4cabe7579ba",
            "assets/fonts/arabic/SmallFont.xnb": "7f332a694f40fbe82e77b0da9128de3298f260db1e2903777b1802969aeeebfa",
            "assets/fonts/arabic/Arabic.xnb": "0b3617e7ad7ae1a667618dcf21da72ee8a84657ed0b1aeeee3bf6291fdb14817",
            "assets/fonts/arabic/Arabic_0.xnb": "36c0fa014a26eef241a16dc35139bd11e4dcf5b8c6be5860ce2c7ccda1caf9d4",
        ]
        for (fontPath, expectedHash) in arabicFontHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(fontPath))
                    == expectedHash
            )
        }

        let hindiFontHashes = [
            "assets/fonts/hindi/SpriteFont1.xnb": "5674a9c057d4300b0e486fc967baae9290abc57ca00b084bc9b91ee91095daea",
            "assets/fonts/hindi/SmallFont.xnb": "4605ca474a407c9a45d87ab3e10298da50c36e3bac53d72adf6dca52c8f42481",
            "assets/fonts/hindi/Hindi.xnb": "45d33ae7514da6af02f3628639f5e5ccf3847dab3089ee41ef4d6c817877c53d",
            "assets/fonts/hindi/Hindi_0.xnb": "63799d747543ece08c3d145ba827b407075453db89318c9c11dd3f77c906db35",
        ]
        for (fontPath, expectedHash) in hindiFontHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(fontPath))
                    == expectedHash
            )
        }

        let traditionalChineseFontHashes = [
            "assets/fonts/traditional-chinese/SpriteFont1.xnb": "58cc635bca5544520ddfc92966b577478923e7c3aff640d075771c54bd470b89",
            "assets/fonts/traditional-chinese/SmallFont.xnb": "7407549bb569e7bdca384be434335322a22a0295663ad50d624fdc96eb81ff2e",
            "assets/fonts/traditional-chinese/ChineseTraditional.xnb": "ab4f4906c33887cc86ff50325420aa1b8c800c8d1d1251ff20b0d33866ba457b",
            "assets/fonts/traditional-chinese/ChineseTraditional_0.xnb": "feaef04007687f3f98b6f08d64188813ce46cfd7db30b59020750cebf9d1132b",
        ]
        for (fontPath, expectedHash) in traditionalChineseFontHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(fontPath))
                    == expectedHash
            )
        }
        let traditionalChineseLicense = try String(
            contentsOf: payload.appendingPathComponent(
                "assets/fonts/traditional-chinese/OFL.txt"
            ),
            encoding: .utf8
        )
        expect(traditionalChineseLicense.contains("SIL OPEN FONT LICENSE Version 1.1"))

        let thaiFontHashes = [
            "assets/fonts/thai/SpriteFont1.xnb": "35393514d41b8d553bb0a607d6556473a38ce6f5ae69d269e018ce2c0570d386",
            "assets/fonts/thai/SmallFont.xnb": "786a1c6c0925ef6d45a30a38461acd7da9270f1e3b98d0dcc13422d5b2d28422",
            "assets/fonts/thai/Thai.xnb": "e1e4fd904d03a0e53250e77dc5bc50c7432c123a46f4b02317322109c77f8944",
            "assets/fonts/thai/Thai_0.xnb": "bc768b383d7cd1cdfbd364e74b792fa1b22d438b28c9fae3467354b6ba2b2468",
        ]
        for (fontPath, expectedHash) in thaiFontHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(fontPath))
                    == expectedHash
            )
        }

        func pngDimensions(_ file: URL) throws -> (Int, Int) {
            let data = try Data(contentsOf: file)
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
        func pngDimensions(_ relativePath: String) throws -> (Int, Int) {
            try pngDimensions(payload.appendingPathComponent(relativePath))
        }

        let unifiedButtonHashes = [
            "assets/button-russian.png": "cfcd9f41147e8ec379ce94b59c7690a148f3d4926af16c3a55e87d8319ef0c9b",
            "assets/button-serbian.png": "ba11eb3707e4ad90002473fe3e5b4d9e627f18fcef51a1d1dc0c5a4b5535ae0f",
            "assets/button.png": "349a4749d3e578188a7c7e5bdf6a46ddb5ed10636f5b2cb17511b1d80a66fced",
            "assets/button-ukrainian.png": "c9f4c5bc0b134e36a6bbd9b8fe680e78689247c6a8e1388dd5eb2be75389e54b",
            "assets/button-vietnamese.png": "1d5bb7752d8c24c4d53c6d2945945b0bf0fc1728efbe3630a2dfeb4108763758",
            "assets/button-swahili.png": "3242f8511f9949c535b72ee0fb0b478b9c94ce780e11eaf807aab8f91f16cd50",
            "assets/button-persian.png": "d8ef2b42de343b30919f6394b9d79f219aa80312145aed961f0c878a0db21d74",
            "assets/button-arabic.png": "4c9055e590abe59dcf55e62a822562e1c95489e8c0cdb1de796ed8cc2d03d2ba",
            "assets/button-indonesian.png": "f94b9ad5fca72ec10bb086d6e3e91189d14a5f3ba8f7df28d0e6b68f58dfa46c",
            "assets/button-filipino.png": "89445081c6df19081f019269dd207b5286e08c8724499b2e0214e001d335d8b6",
            "assets/button-dutch.png": "c39bf8a21e67c8c5523e3f52d9ff4ff0293d159032bbb04eb7c837e81e3392cc",
            "assets/button-hindi.png": "59073efabc0839714847885d2f372f3380c1da36ebbc2ff3e0b7fff2f53729ef",
            "assets/button-traditional-chinese.png": "857c94a354f8f6073279d09ada3e1998b40daa6a8d2470d62fe448972ef11220",
            "assets/button-romanian.png": "b18cff1e8433127e1c7eb85c080f51227ae6fdba26fd83e9efb0d6ef33876a4e",
            "assets/button-hebrew.png": "60467c300d844542a706dd9a30d61c0529d4301203e683a1262ae745e0ba2c76",
            "assets/button-bulgarian.png": "99e095ea1435174b7129769e27e539bf310f2641791cb69846c1160064893119",
            "assets/button-thai.png": "3ac5f17beb7afebfd1dc7da8cd336dac44de9051757c65f116c69b80af69f0cd",
            "assets/button-greek.png": "b0669776b789397294e1fe3b2649244b5e43712606e158e6b62a29ae3704027d",
            "assets/button-czech.png": "98266efc2c8d4bdf1213c617ec40f95b09a1f14be77b92310ae0745f79287071",
        ]
        for (buttonPath, expectedHash) in unifiedButtonHashes {
            try expect(try pngDimensions(buttonPath) == (174, 78))
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(buttonPath))
                    == expectedHash
            )
        }
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent("assets/button.png"))
                == DependencyInstaller.sha256(
                    of: payload.appendingPathComponent("assets/button-polish.png")
                )
        )

        let approvedTitleLabels = projectRoot().appendingPathComponent(
            "Scripts/assets/title-button-labels.png"
        )
        try expect(
            try DependencyInstaller.sha256(of: approvedTitleLabels)
                == "c4b1e89e08009295f43e4958118d3378cb090b91dbb243407323d047ffcb8ce6"
        )
        let titleBackTemplate = projectRoot().appendingPathComponent(
            "Scripts/assets/title-back-template.png"
        )
        try expect(try pngDimensions(titleBackTemplate) == (45, 28))
        try expect(
            try DependencyInstaller.sha256(of: titleBackTemplate)
                == "a79d95a79d46713a9a51a4a1ac204309ee4cf9accac873e3ea484b3a5a6b3c01"
        )
        let titleBackLabels = projectRoot().appendingPathComponent(
            "Scripts/assets/title-back-labels.png"
        )
        try expect(try pngDimensions(titleBackLabels) == (264, 2_052))
        try expect(
            try DependencyInstaller.sha256(of: titleBackLabels)
                == "c848778c46ee54c8a91741453909b7ff3b59a0264a93e55489ba573f76d4fa2b"
        )

        let unifiedTitleButtonHashes = [
            "assets/title/TitleButtons-russian.png": "9af3d34c7beb1a869358b55101cd249c41838494af9bcb445c80e2a7bb28cb06",
            "assets/title/TitleButtons-serbian.png": "2f0a61fff35c40991804baa0b8821a989b30c6f5e58b26324db5086430a8e0e2",
            "assets/title/TitleButtons.png": "1c2253e99bfd70f04a05162cc0a299e2d0a37ca26a357c2e8d3d0ecc45391ff4",
            "assets/title/TitleButtons-ukrainian.png": "9af3d34c7beb1a869358b55101cd249c41838494af9bcb445c80e2a7bb28cb06",
            "assets/title/TitleButtons-vietnamese.png": "2f0a61fff35c40991804baa0b8821a989b30c6f5e58b26324db5086430a8e0e2",
            "assets/title/TitleButtons-swahili.png": "2f0a61fff35c40991804baa0b8821a989b30c6f5e58b26324db5086430a8e0e2",
            "assets/title/TitleButtons-persian.png": "2f0a61fff35c40991804baa0b8821a989b30c6f5e58b26324db5086430a8e0e2",
            "assets/title/TitleButtons-arabic.png": "2f0a61fff35c40991804baa0b8821a989b30c6f5e58b26324db5086430a8e0e2",
            "assets/title/TitleButtons-indonesian.png": "2f0a61fff35c40991804baa0b8821a989b30c6f5e58b26324db5086430a8e0e2",
            "assets/title/TitleButtons-filipino.png": "2f0a61fff35c40991804baa0b8821a989b30c6f5e58b26324db5086430a8e0e2",
            "assets/title/TitleButtons-dutch.png": "1c2253e99bfd70f04a05162cc0a299e2d0a37ca26a357c2e8d3d0ecc45391ff4",
            "assets/title/TitleButtons-hindi.png": "2f0a61fff35c40991804baa0b8821a989b30c6f5e58b26324db5086430a8e0e2",
            "assets/title/TitleButtons-traditional-chinese.png": "1c2253e99bfd70f04a05162cc0a299e2d0a37ca26a357c2e8d3d0ecc45391ff4",
            "assets/title/TitleButtons-romanian.png": "1c2253e99bfd70f04a05162cc0a299e2d0a37ca26a357c2e8d3d0ecc45391ff4",
            "assets/title/TitleButtons-hebrew.png": "2f0a61fff35c40991804baa0b8821a989b30c6f5e58b26324db5086430a8e0e2",
            "assets/title/TitleButtons-bulgarian.png": "9af3d34c7beb1a869358b55101cd249c41838494af9bcb445c80e2a7bb28cb06",
            "assets/title/TitleButtons-thai.png": "2f0a61fff35c40991804baa0b8821a989b30c6f5e58b26324db5086430a8e0e2",
            "assets/title/TitleButtons-greek.png": "2f0a61fff35c40991804baa0b8821a989b30c6f5e58b26324db5086430a8e0e2",
            "assets/title/TitleButtons-czech.png": "1c2253e99bfd70f04a05162cc0a299e2d0a37ca26a357c2e8d3d0ecc45391ff4",
        ]
        for (titlePath, expectedHash) in unifiedTitleButtonHashes {
            try expect(try pngDimensions(titlePath) == (400, 655))
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(titlePath))
                    == expectedHash
            )
        }

        let vietnameseButtonPath = "assets/button-vietnamese.png"
        try expect(try pngDimensions(vietnameseButtonPath) == (174, 78))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(vietnameseButtonPath))
                == "1d5bb7752d8c24c4d53c6d2945945b0bf0fc1728efbe3630a2dfeb4108763758"
        )
        let vietnameseTitlePath = "assets/title/TitleButtons-vietnamese.png"
        try expect(try pngDimensions(vietnameseTitlePath) == (400, 655))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(vietnameseTitlePath))
                == "2f0a61fff35c40991804baa0b8821a989b30c6f5e58b26324db5086430a8e0e2"
        )

        let hindiButtonPath = "assets/button-hindi.png"
        try expect(try pngDimensions(hindiButtonPath) == (174, 78))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(hindiButtonPath))
                == "59073efabc0839714847885d2f372f3380c1da36ebbc2ff3e0b7fff2f53729ef"
        )
        let hindiTitlePath = "assets/title/TitleButtons-hindi.png"
        try expect(try pngDimensions(hindiTitlePath) == (400, 655))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(hindiTitlePath))
                == "2f0a61fff35c40991804baa0b8821a989b30c6f5e58b26324db5086430a8e0e2"
        )

        let swahiliButtonPath = "assets/button-swahili.png"
        try expect(try pngDimensions(swahiliButtonPath) == (174, 78))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(swahiliButtonPath))
                == "3242f8511f9949c535b72ee0fb0b478b9c94ce780e11eaf807aab8f91f16cd50"
        )
        let swahiliTitlePath = "assets/title/TitleButtons-swahili.png"
        try expect(try pngDimensions(swahiliTitlePath) == (400, 655))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(swahiliTitlePath))
                == "2f0a61fff35c40991804baa0b8821a989b30c6f5e58b26324db5086430a8e0e2"
        )

        let indonesianButtonPath = "assets/button-indonesian.png"
        try expect(try pngDimensions(indonesianButtonPath) == (174, 78))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(indonesianButtonPath))
                == "f94b9ad5fca72ec10bb086d6e3e91189d14a5f3ba8f7df28d0e6b68f58dfa46c"
        )
        let indonesianTitlePath = "assets/title/TitleButtons-indonesian.png"
        try expect(try pngDimensions(indonesianTitlePath) == (400, 655))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(indonesianTitlePath))
                == "2f0a61fff35c40991804baa0b8821a989b30c6f5e58b26324db5086430a8e0e2"
        )


        let filipinoButtonPath = "assets/button-filipino.png"
        try expect(try pngDimensions(filipinoButtonPath) == (174, 78))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(filipinoButtonPath))
                == "89445081c6df19081f019269dd207b5286e08c8724499b2e0214e001d335d8b6"
        )
        let filipinoTitlePath = "assets/title/TitleButtons-filipino.png"
        try expect(try pngDimensions(filipinoTitlePath) == (400, 655))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(filipinoTitlePath))
                == "2f0a61fff35c40991804baa0b8821a989b30c6f5e58b26324db5086430a8e0e2"
        )

        let filipinoFontHashes = [
            "assets/fonts/filipino/SpriteFont1.xnb": "be1732f1208dcb0a6b4f0e9882bdd87ea85b42b13d40336aa7d94a6a2cd7e0a9",
            "assets/fonts/filipino/SmallFont.xnb": "780c2475ac67705b8d29deab9da97465b4bbcb40ac30eb1d9bac981480c50042",
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
                == "b18cff1e8433127e1c7eb85c080f51227ae6fdba26fd83e9efb0d6ef33876a4e"
        )
        let romanianTitlePath = "assets/title/TitleButtons-romanian.png"
        try expect(try pngDimensions(romanianTitlePath) == (400, 655))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(romanianTitlePath))
                == "1c2253e99bfd70f04a05162cc0a299e2d0a37ca26a357c2e8d3d0ecc45391ff4"
        )

        try expect(try pngDimensions("assets/button-persian.png") == (174, 78))
        try expect(try pngDimensions("assets/title/TitleButtons-persian.png") == (400, 655))
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/button-persian.png")
            ) == "d8ef2b42de343b30919f6394b9d79f219aa80312145aed961f0c878a0db21d74"
        )
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/title/TitleButtons-persian.png")
            ) == "2f0a61fff35c40991804baa0b8821a989b30c6f5e58b26324db5086430a8e0e2"
        )

        try expect(try pngDimensions("assets/button-arabic.png") == (174, 78))
        try expect(try pngDimensions("assets/title/TitleButtons-arabic.png") == (400, 655))
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/button-arabic.png")
            ) == "4c9055e590abe59dcf55e62a822562e1c95489e8c0cdb1de796ed8cc2d03d2ba"
        )
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/title/TitleButtons-arabic.png")
            ) == "2f0a61fff35c40991804baa0b8821a989b30c6f5e58b26324db5086430a8e0e2"
        )

        let bulgarianAssetHashes = [
            "assets/button-bulgarian.png": "99e095ea1435174b7129769e27e539bf310f2641791cb69846c1160064893119",
            "assets/title/TitleButtons-bulgarian.png": "9af3d34c7beb1a869358b55101cd249c41838494af9bcb445c80e2a7bb28cb06",
            "assets/fonts/bulgarian/SpriteFont1.xnb": "7b15db49448dc56a8d78a6a32d459f94c9f5c46b370cf3863b22e3a2cc06d9d6",
            "assets/fonts/bulgarian/SmallFont.xnb": "7b15db49448dc56a8d78a6a32d459f94c9f5c46b370cf3863b22e3a2cc06d9d6",
        ]
        try expect(try pngDimensions("assets/button-bulgarian.png") == (174, 78))
        try expect(try pngDimensions("assets/title/TitleButtons-bulgarian.png") == (400, 655))
        for (assetPath, expectedHash) in bulgarianAssetHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(assetPath))
                    == expectedHash
            )
        }

        try expect(try pngDimensions("assets/button-thai.png") == (174, 78))
        try expect(try pngDimensions("assets/title/TitleButtons-thai.png") == (400, 655))
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/button-thai.png")
            ) == "3ac5f17beb7afebfd1dc7da8cd336dac44de9051757c65f116c69b80af69f0cd"
        )
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/title/TitleButtons-thai.png")
            ) == "2f0a61fff35c40991804baa0b8821a989b30c6f5e58b26324db5086430a8e0e2"
        )

        let greekFontHashes = [
            "assets/fonts/greek/SpriteFont1.xnb": "6213346c2108f45c8946dcbe8e6e7862e2dccdfe83c4e3645eff52616f0d0c7a",
            "assets/fonts/greek/SmallFont.xnb": "6961b56d2e424fbbc2b48a788dc5792c9878d60367c811cefb2039d921908711",
        ]
        for (fontPath, expectedHash) in greekFontHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(fontPath))
                    == expectedHash
            )
        }
        try expect(try pngDimensions("assets/button-greek.png") == (174, 78))
        try expect(try pngDimensions("assets/title/TitleButtons-greek.png") == (400, 655))
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/button-greek.png")
            ) == "b0669776b789397294e1fe3b2649244b5e43712606e158e6b62a29ae3704027d"
        )
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/title/TitleButtons-greek.png")
            ) == "2f0a61fff35c40991804baa0b8821a989b30c6f5e58b26324db5086430a8e0e2"
        )

        let czechAssetHashes = [
            "assets/button-czech.png": "98266efc2c8d4bdf1213c617ec40f95b09a1f14be77b92310ae0745f79287071",
            "assets/title/TitleButtons-czech.png": "1c2253e99bfd70f04a05162cc0a299e2d0a37ca26a357c2e8d3d0ecc45391ff4",
            "assets/fonts/czech/SpriteFont1.xnb": "4dd584d39bde4d1a71d4bc0bc5869953e34dfe971ad3735ef4dc8b0c111cedba",
            "assets/fonts/czech/SmallFont.xnb": "f957a30c98c58d59e3d2bbbc2f67e79bd73398a9b24742707db8272ab9f4b4af",
        ]
        try expect(try pngDimensions("assets/button-czech.png") == (174, 78))
        try expect(try pngDimensions("assets/title/TitleButtons-czech.png") == (400, 655))
        for (assetPath, expectedHash) in czechAssetHashes {
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
        expect(manifest["Version"] as? String == "1.9.12")
        let library = source.appendingPathComponent("VNRevival.LanguageSwitcher.dll")
        try expect(try Data(contentsOf: library).count > 4_096)
        func imageDimensions(_ file: URL) throws -> (Int, Int) {
            let data = try Data(contentsOf: file)
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
        let titleOverlays = source.appendingPathComponent("title-overlays")
        let overlayNames = [
            "russian", "serbian", "polish", "ukrainian", "vietnamese", "swahili",
            "persian", "arabic", "indonesian", "filipino", "dutch", "hindi",
            "traditional-chinese", "romanian", "hebrew", "bulgarian", "thai",
            "greek", "czech",
        ]
        for name in overlayNames {
            let overlay = titleOverlays.appendingPathComponent("TitleLabels-\(name).png")
            expect(fm.fileExists(atPath: overlay.path))
            let dimensions = try imageDimensions(overlay)
            expect(dimensions == (888, 174))
            let backOverlay = titleOverlays.appendingPathComponent("TitleBack-\(name).png")
            expect(fm.fileExists(atPath: backOverlay.path))
            let backDimensions = try imageDimensions(backOverlay)
            expect(backDimensions == (264, 108))
            let developerOverlay = titleOverlays.appendingPathComponent(
                "TitleDeveloper-\(name).png"
            )
            expect(fm.fileExists(atPath: developerOverlay.path))
            let developerDimensions = try imageDimensions(developerOverlay)
            expect(developerDimensions == (333, 180))
        }
        let arabicBackOverlay = titleOverlays.appendingPathComponent("TitleBack-arabic.png")
        expect(fm.fileExists(atPath: arabicBackOverlay.path))
        let arabicBackOverlayDimensions = try imageDimensions(arabicBackOverlay)
        expect(arabicBackOverlayDimensions == (264, 108))
        try expect(
            try DependencyInstaller.sha256(of: arabicBackOverlay)
                == "88ef21f47451bcaa5a2dbc352d30136ca34f0fa22e38d721b452c9cbeb00e3ff"
        )
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
        expect(includes.count == 4_910)
        let includedPaths = try includes.map { try require($0["FromFile"] as? String) }
        expect(Set(includedPaths).count == includedPaths.count)
        var hindiPrivateUseGlyphs = 0
        var rawHindiScalars = 0
        var thaiPrivateUseGlyphs = 0
        var rawThaiScalars = 0

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
            } else if relativePath.contains("/thai/") {
                expectedLanguage = "th-vnrevival"
            } else if relativePath.contains("/greek/") {
                expectedLanguage = "el-vnrevival"
            } else if relativePath.contains("/czech/") {
                expectedLanguage = "cs-vnrevival"
            } else {
                throw RequiredValueMissing()
            }
            for change in secondaryChanges {
                let condition = try require(change["When"] as? [String: String])
                expect(condition["Language"] == expectedLanguage)
                expect(Set(condition.keys).isSubset(of: ["Language", "PlayerGender"]))
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
                if expectedLanguage == "th-vnrevival" {
                    let entries = try require(change["Entries"] as? [String: String])
                    for value in entries.values {
                        for scalar in value.unicodeScalars {
                            if (0xE000...0xF8FF).contains(scalar.value) {
                                thaiPrivateUseGlyphs += 1
                            }
                            if (0x0E00...0x0E7F).contains(scalar.value) {
                                rawThaiScalars += 1
                            }
                        }
                    }
                }
            }
        }
        expect(hindiPrivateUseGlyphs > 100_000)
        expect(rawHindiScalars == 0)
        expect(thaiPrivateUseGlyphs > 100_000)
        expect(rawThaiScalars == 0)
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

    @Test func testBoundsExternalCommandFailureDetails() throws {
        let error = DependencyError.commandFailed("SMAPI installer", 1, String(repeating: "x", count: 5_000))
        let description = try require(error.errorDescription)
        expect(description.count < 900)
        expect(description.hasSuffix("… Output truncated."))
    }

    @Test func testDependencyStatusRequiresPinnedMinimumVersions() throws {
        let fm = FileManager.default
        let temporary = fm.temporaryDirectory.appendingPathComponent(UUID().uuidString, isDirectory: true)
        defer { try? fm.removeItem(at: temporary) }
        let executable = temporary.appendingPathComponent("Contents/MacOS", isDirectory: true)
        let contentPatcher = executable.appendingPathComponent("Mods/ContentPatcher", isDirectory: true)
        try fm.createDirectory(at: contentPatcher, withIntermediateDirectories: true)
        try Data().write(to: executable.appendingPathComponent("Stardew Valley.dll"))
        let smapiMetadata = "dependency 13.0.3+abcdef0123456789"
            + String(repeating: "x", count: 256)
            + "4.5.2+abcdef0123456789 SMAPI"
        try Data(smapiMetadata.utf8)
            .write(to: executable.appendingPathComponent("StardewModdingAPI.dll"))
        try #"{"UniqueID":"Pathoschild.ContentPatcher","Version":"2.9.1"}"#
            .data(using: .utf8)!.write(to: contentPatcher.appendingPathComponent("manifest.json"))

        let core = InstallerCore(fileManager: fm)
        let installation = try require(core.resolveInstallation(temporary))
        expect(core.status(for: installation).readyToInstall)

        try #"{"UniqueID":"Pathoschild.ContentPatcher","Version":"2.9.0"}"#
            .data(using: .utf8)!.write(to: contentPatcher.appendingPathComponent("manifest.json"))
        expect(!core.status(for: installation).contentPatcherFound)

        try #"{"UniqueID":"Pathoschild.ContentPatcher","Version":"2.9.1"}"#
            .data(using: .utf8)!.write(to: contentPatcher.appendingPathComponent("manifest.json"))
        try Data("metadata 4.5.1+abcdef0123456789 SMAPI".utf8)
            .write(to: executable.appendingPathComponent("StardewModdingAPI.dll"))
        expect(!core.status(for: installation).smapiFound)
    }

    @Test func testFindsAndUpdatesRenamedContentPatcherFolderWithoutCreatingDuplicate() throws {
        let fm = FileManager.default
        let temporary = fm.temporaryDirectory.appendingPathComponent(UUID().uuidString, isDirectory: true)
        defer { try? fm.removeItem(at: temporary) }
        let executable = temporary.appendingPathComponent("Contents/MacOS", isDirectory: true)
        let mods = executable.appendingPathComponent("Mods", isDirectory: true)
        let renamed = mods.appendingPathComponent("Content Patcher 2.9", isDirectory: true)
        try fm.createDirectory(at: renamed, withIntermediateDirectories: true)
        try Data().write(to: executable.appendingPathComponent("Stardew Valley.dll"))
        try #"{"UniqueID":"Pathoschild.ContentPatcher","Version":"2.9.0"}"#
            .data(using: .utf8)!.write(to: renamed.appendingPathComponent("manifest.json"))

        let payload = temporary.appendingPathComponent("ContentPatcherPayload", isDirectory: true)
        try fm.createDirectory(at: payload, withIntermediateDirectories: true)
        try #"{"UniqueID":"Pathoschild.ContentPatcher","Version":"2.9.1"}"#
            .data(using: .utf8)!.write(to: payload.appendingPathComponent("manifest.json"))
        try Data("payload".utf8).write(to: payload.appendingPathComponent("ContentPatcher.dll"))

        let core = InstallerCore(fileManager: fm)
        let installation = try require(core.resolveInstallation(temporary))
        expect(!core.status(for: installation).contentPatcherFound)
        try core.installContentPatcher(payload: payload, into: installation)
        expect(core.status(for: installation).contentPatcherFound)
        expect(fm.fileExists(atPath: renamed.appendingPathComponent("ContentPatcher.dll").path))
        expect(!fm.fileExists(atPath: mods.appendingPathComponent("ContentPatcher").path))
    }

    @Test func testRejectsDuplicateContentPatcherFolders() throws {
        let fm = FileManager.default
        let temporary = fm.temporaryDirectory.appendingPathComponent(UUID().uuidString, isDirectory: true)
        defer { try? fm.removeItem(at: temporary) }
        let executable = temporary.appendingPathComponent("Contents/MacOS", isDirectory: true)
        let mods = executable.appendingPathComponent("Mods", isDirectory: true)
        try fm.createDirectory(at: mods, withIntermediateDirectories: true)
        try Data().write(to: executable.appendingPathComponent("Stardew Valley.dll"))
        for name in ["ContentPatcher", "Content Patcher Copy"] {
            let folder = mods.appendingPathComponent(name, isDirectory: true)
            try fm.createDirectory(at: folder, withIntermediateDirectories: true)
            try #"{"UniqueID":"Pathoschild.ContentPatcher","Version":"2.9.1"}"#
                .data(using: .utf8)!.write(to: folder.appendingPathComponent("manifest.json"))
        }
        let payload = temporary.appendingPathComponent("ContentPatcherPayload", isDirectory: true)
        try fm.createDirectory(at: payload, withIntermediateDirectories: true)
        try #"{"UniqueID":"Pathoschild.ContentPatcher","Version":"2.9.1"}"#
            .data(using: .utf8)!.write(to: payload.appendingPathComponent("manifest.json"))

        let core = InstallerCore(fileManager: fm)
        let installation = try require(core.resolveInstallation(temporary))
        expect(!core.status(for: installation).contentPatcherFound)
        expect(throws: InstallerError.self) {
            try core.installContentPatcher(payload: payload, into: installation)
        }
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

    @Test func testRecoversInterruptedAtomicReplacement() throws {
        let fm = FileManager.default
        let temporary = fm.temporaryDirectory.appendingPathComponent(UUID().uuidString, isDirectory: true)
        defer { try? fm.removeItem(at: temporary) }
        let executable = temporary.appendingPathComponent("Contents/MacOS", isDirectory: true)
        let mods = executable.appendingPathComponent("Mods", isDirectory: true)
        try fm.createDirectory(at: mods, withIntermediateDirectories: true)
        try Data().write(to: executable.appendingPathComponent("Stardew Valley.dll"))

        let package = try translationPackage()
        let payload = temporary.appendingPathComponent("Payload", isDirectory: true)
        try fm.createDirectory(at: payload, withIntermediateDirectories: true)
        try writePayloadIdentity(at: payload, package: package)
        try Data("new".utf8).write(to: payload.appendingPathComponent("generation.txt"))

        let backup = mods.appendingPathComponent(".vn-revival-backup-interrupted", isDirectory: true)
        try fm.createDirectory(at: backup, withIntermediateDirectories: true)
        try writePayloadIdentity(at: backup, package: package)
        let staging = mods.appendingPathComponent(
            ".vn-revival-staging-\(package.uniqueID)-interrupted",
            isDirectory: true
        )
        try fm.createDirectory(at: staging, withIntermediateDirectories: true)
        try Data("partial".utf8).write(to: staging.appendingPathComponent("partial.txt"))

        let core = InstallerCore(fileManager: fm)
        let installation = try require(core.resolveInstallation(temporary))
        try core.install(
            payload: payload,
            package: package,
            into: installation,
            requirePrerequisites: false
        )

        let installed = installation.modDirectory(for: package)
        try expect(String(contentsOf: installed.appendingPathComponent("generation.txt")) == "new")
        let leftovers = try fm.contentsOfDirectory(atPath: mods.path).filter {
            $0.hasPrefix(".vn-revival-staging-") || $0.hasPrefix(".vn-revival-backup-")
        }
        expect(leftovers.isEmpty)
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

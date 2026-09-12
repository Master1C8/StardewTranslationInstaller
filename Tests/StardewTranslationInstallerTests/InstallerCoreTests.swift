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
            }
        }

        let vietnameseFontHashes = [
            "assets/fonts/vietnamese/SpriteFont1.xnb": "41d7c962969516c780989b963b11bf5d3ed9d65a60e18b9a75307b728163e7cd",
            "assets/fonts/vietnamese/SmallFont.xnb": "219d0bdfafcfea991c7f7655a0cd0f6cb9b59c3631620a56971c282109962692",
        ]
        for (fontPath, expectedHash) in vietnameseFontHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(fontPath))
                    == expectedHash
            )
        }

        let romanianFontHashes = [
            "assets/fonts/romanian/SpriteFont1.xnb": "7eafc7286a8c84adf4041c13b2ca9dcca1ff0a6beb51e3b530b274dc9597e767",
            "assets/fonts/romanian/SmallFont.xnb": "4f163bee218ac4fec57d527a952092b7042ecb54798c47cb4d407a9312eb4a75",
        ]
        for (fontPath, expectedHash) in romanianFontHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(fontPath))
                    == expectedHash
            )
        }

        let persianFontHashes = [
            "assets/fonts/persian/SpriteFont1.xnb": "1e8c57bc97e395e0fb39806c701b5b198360f91e720e91df4295c51c4fda1927",
            "assets/fonts/persian/SmallFont.xnb": "f4c7662913e6808ceadae41cc690228cc47a83c58f6ee5a2540a56aff2991a0d",
            "assets/fonts/persian/Persian.xnb": "540628d5480ef69f624ae1c9bdd583f634fe840b30e8625a83feecd7054da381",
            "assets/fonts/persian/Persian_0.xnb": "edcbd92966775bf4e8526447ede71c14e12b10a7ec9a651e17a55e6c9d687b06",
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
            "assets/fonts/arabic/Arabic.xnb": "b361ef6d38d5e5d4ef323ab2cd98786f7cceef014463833abb2a49b3280943b2",
            "assets/fonts/arabic/Arabic_0.xnb": "942718d6ccc3b59012b00753a3ba555d4dfac05299e930b1abab2f3214501059",
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
            "assets/fonts/hindi/Hindi.xnb": "745280948baa70baf4606a678160cf20d29a09adf0bf42681ff15e77938705e1",
            "assets/fonts/hindi/Hindi_0.xnb": "9bedfed1924b2d069a19075a23876cd65b6470d1b0050e4ebcd0b60fcdc35bca",
        ]
        for (fontPath, expectedHash) in hindiFontHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(fontPath))
                    == expectedHash
            )
        }

        let traditionalChineseFontHashes = [
            "assets/fonts/traditional-chinese/SpriteFont1.xnb": "ea7f73c93a3af65a9e40e7f195b15c82856cdd3c5be32b5cf8b92ae3e4a2afeb",
            "assets/fonts/traditional-chinese/SmallFont.xnb": "aedaf7a77e849edfa5a734b1fe62ccef4f199dc068eb89615a7ba983e67603b4",
            "assets/fonts/traditional-chinese/ChineseTraditional.xnb": "d83091133d819c5d3e6e8a4ed45478af39e3418e8edb31eccdeaf3c79b2a1984",
            "assets/fonts/traditional-chinese/ChineseTraditional_0.xnb": "4b57c0b9a996bcef4faf25f81b5779ef9c0be14ddde87013abcae130801673b8",
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
            "assets/fonts/thai/SpriteFont1.xnb": "e44f9fc41d5c9d6138f2b9225b8790f50c4bbbbff83bc66cd0339890d979e1f1",
            "assets/fonts/thai/SmallFont.xnb": "01c3dd9f30325734c3e1987cf671c1037322ed2b3ad70efe3c3e499f4beccbca",
            "assets/fonts/thai/Thai.xnb": "823f9989d257236eba69af86fca886469cabd780acd844d5a40c7a82ec0982e9",
            "assets/fonts/thai/Thai_0.xnb": "fc788fbcf79910af5fee8ec8947be5ee2525695c87d67e224a286afe27843543",
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
            "assets/title/TitleButtons-russian.png": "303667ad30a7bb0cb3f6e9cb8384ec39982bf6c0a33b4ed087760dacf9648887",
            "assets/title/TitleButtons-serbian.png": "4851f86425392e7778cb765bbd6764ba61777b58105c61c366682870479612d3",
            "assets/title/TitleButtons.png": "9051846d8eedd2296df3c0b375e55b2db6fcda27fc61d71b2801de43192efb74",
            "assets/title/TitleButtons-ukrainian.png": "c7aefd26a49a87210a25d277e5e0b6c778068f6f11ee7e232a6c572fcd664e27",
            "assets/title/TitleButtons-vietnamese.png": "f65cd0fa3849305e67a52f4498d539333ea7da010a973e0a87fbbe573697da42",
            "assets/title/TitleButtons-swahili.png": "82f56d29ce9ed6b9230352f41796f546fc04420239c012c4f103a612f6954a86",
            "assets/title/TitleButtons-persian.png": "6d4106e288a1f109ea9918e13fba523fbd764befe67b3091fab2409fcd7df0bc",
            "assets/title/TitleButtons-arabic.png": "448d260ff256b9b90394b196b3c193c42ec358d74917acf23dbe5f81f0556e95",
            "assets/title/TitleButtons-indonesian.png": "665bf215c90c77f4f4c0d5eed91357f3e0ac3a3ebec624b2df79412d093995a8",
            "assets/title/TitleButtons-filipino.png": "9814007c0bf21155bcc55c940633f82962fc4fd9539739f8ac115cc6b1ae1389",
            "assets/title/TitleButtons-dutch.png": "25400a8789b7c87a3c727764233eee2fb2db0a8237e76a4a136627336d3df042",
            "assets/title/TitleButtons-hindi.png": "9d2c7be3f20d868904f0b8966fb4654e91d5daa1320bb7a506e246897e1b9611",
            "assets/title/TitleButtons-traditional-chinese.png": "5a6576f0d2b605c3bfa6abd921c0d3c792205bc80019644743deb16db56425bc",
            "assets/title/TitleButtons-romanian.png": "a9835954dc3c0a404c20b3503abcef4c214d7c54ba4a14f11f802a0a54a79afa",
            "assets/title/TitleButtons-hebrew.png": "1e33bfc39391b2203cbde3286c1a6fbbffb68abd6b87fecf9ecd7cd6804c02f1",
            "assets/title/TitleButtons-bulgarian.png": "68f51af5ed8d8042e5e7ef5f39fbc5524867f817bd99327fd413fc01b0b37cd2",
            "assets/title/TitleButtons-thai.png": "24c561fa562ff360046a8c7a603a35fa711bc586710f948335e612b045414a01",
            "assets/title/TitleButtons-greek.png": "de3945b35a52360c117d77c3b27fa825dd0d15a92ed0ab51a3991d69c5cb3729",
            "assets/title/TitleButtons-czech.png": "c5f52ceab181d9c97746cf4e4a535d6b5f850bdb5e03c9ad754ef995d8210e3d",
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
                == "f65cd0fa3849305e67a52f4498d539333ea7da010a973e0a87fbbe573697da42"
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
                == "9d2c7be3f20d868904f0b8966fb4654e91d5daa1320bb7a506e246897e1b9611"
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
                == "82f56d29ce9ed6b9230352f41796f546fc04420239c012c4f103a612f6954a86"
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
                == "665bf215c90c77f4f4c0d5eed91357f3e0ac3a3ebec624b2df79412d093995a8"
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
                == "9814007c0bf21155bcc55c940633f82962fc4fd9539739f8ac115cc6b1ae1389"
        )

        let filipinoFontHashes = [
            "assets/fonts/filipino/SpriteFont1.xnb": "530c656db956e21ca0ffd62263bd9270aab3c3cd14616bf1a6603203e055642b",
            "assets/fonts/filipino/SmallFont.xnb": "982a7bffe36de91989ba6768956965b6a028777a52ab9e3d2d32e69d5ae73992",
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
                == "a9835954dc3c0a404c20b3503abcef4c214d7c54ba4a14f11f802a0a54a79afa"
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
            ) == "6d4106e288a1f109ea9918e13fba523fbd764befe67b3091fab2409fcd7df0bc"
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
            ) == "448d260ff256b9b90394b196b3c193c42ec358d74917acf23dbe5f81f0556e95"
        )

        let bulgarianAssetHashes = [
            "assets/button-bulgarian.png": "99e095ea1435174b7129769e27e539bf310f2641791cb69846c1160064893119",
            "assets/title/TitleButtons-bulgarian.png": "68f51af5ed8d8042e5e7ef5f39fbc5524867f817bd99327fd413fc01b0b37cd2",
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
            ) == "24c561fa562ff360046a8c7a603a35fa711bc586710f948335e612b045414a01"
        )

        let greekFontHashes = [
            "assets/fonts/greek/SpriteFont1.xnb": "aa512867f7faff6ce29bf0797fc936728317372b7525045ed2ecf777e0dc8413",
            "assets/fonts/greek/SmallFont.xnb": "6fc4a311335bf9a4f5b1a550640e77d6df26935a4a445de93fc67becd8ce6b8c",
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
            ) == "de3945b35a52360c117d77c3b27fa825dd0d15a92ed0ab51a3991d69c5cb3729"
        )

        let czechAssetHashes = [
            "assets/button-czech.png": "98266efc2c8d4bdf1213c617ec40f95b09a1f14be77b92310ae0745f79287071",
            "assets/title/TitleButtons-czech.png": "c5f52ceab181d9c97746cf4e4a535d6b5f850bdb5e03c9ad754ef995d8210e3d",
            "assets/fonts/czech/SpriteFont1.xnb": "4e73922c73a398ae6e833b5680883bab6b33f93e1365b150519d712cd7df2334",
            "assets/fonts/czech/SmallFont.xnb": "da13be7533bdb70d4859ad7c3857b5fa50a61e006ac34f42705a177642eae280",
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
        expect(manifest["Version"] as? String == "1.9.8")
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

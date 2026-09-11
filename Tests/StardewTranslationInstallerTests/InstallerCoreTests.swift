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
            expect(language["FontPixelZoom"] as? Int == 3)
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

        let thaiFontHashes = [
            "assets/fonts/thai/SpriteFont1.xnb": "e44f9fc41d5c9d6138f2b9225b8790f50c4bbbbff83bc66cd0339890d979e1f1",
            "assets/fonts/thai/SmallFont.xnb": "01c3dd9f30325734c3e1987cf671c1037322ed2b3ad70efe3c3e499f4beccbca",
            "assets/fonts/thai/Thai.xnb": "b62808844ea469b780f933baaa0e5d86aacf2ecb9c7272778a40f752f460a17e",
            "assets/fonts/thai/Thai_0.xnb": "73b95aac51b3e69bf37ec1d56490728929204ff53f5e6fa4b31d7a4dd64b78f1",
        ]
        for (fontPath, expectedHash) in thaiFontHashes {
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

        let unifiedButtonHashes = [
            "assets/button-russian.png": "e8a8a3ac82dd1803fd7ca40089758f81c800f18ae370477472a51a93f413c7ac",
            "assets/button-serbian.png": "dd3ba41d42e336ff6222c5c7ad3b370aed28504c9309b36204ad88e7075cd815",
            "assets/button.png": "900d78cc42a4a2bea85df99862718749336561af2f02ae7aab2384744f7d375b",
            "assets/button-ukrainian.png": "c2c4aa8188fd0417dc50c91c5f5f5c6ae3aab59b8cbe7428a71c3289a69ae768",
            "assets/button-vietnamese.png": "370aaa43e2f0bc549963c83a9b35cac026b4f1e42fcef6bbd209ee550c168d23",
            "assets/button-swahili.png": "79c1c277ece9db4bf3753c1023fa90a3b170c79857b2d631218fde1e94193fc2",
            "assets/button-persian.png": "d8657504f21c71a7a2dd6eb5de231a01419d7e2f6df578cfc26ad35659af43a6",
            "assets/button-arabic.png": "d96a859272c6c0b8dbb3590c7aa4aeac059ad804ebff29b38b6b8f505cd2fca2",
            "assets/button-indonesian.png": "67c2a98e0e5af7246b5175a92060ea8430b1898a30d02a5e7b55eb37649466d7",
            "assets/button-filipino.png": "55fec7c86d0cb720209c7d7e496ba2bf4467bf25f377666e7876ace2016df2e5",
            "assets/button-dutch.png": "c567e578d74f39a1c35c778f20b321e0d57281ed3d148e00fb988e55fb55fcb0",
            "assets/button-hindi.png": "ee04a25bd92e48a06f7a9e691986e1315da06afb81cdb3f027258defadb95037",
            "assets/button-traditional-chinese.png": "0aef2b1e3be469af403fa93bbcce02e07e8fd3678d0dbd684c0a2ce66249fa25",
            "assets/button-romanian.png": "44c5d1aaad0246f2b48e966d33d978ef835c72f3165a8704b70fc3283e8a7771",
            "assets/button-hebrew.png": "5489bc7393c7b5525fd8dfd9e66047997338361b655398f736216a2398417e36",
            "assets/button-bulgarian.png": "0663820648d16e88f5d0f94736d30e14e6e64b688e312b21e9b85934a266ddad",
            "assets/button-thai.png": "039e652e228dba8a10299d11d81e77fc28ca12748141d0f5d4493368c2f8b4ef",
            "assets/button-greek.png": "940bf3da638437b10e5560ce45c505fdff007f3d30212f85e14a6ee1c2956aa3",
            "assets/button-czech.png": "5c14fa9f579564635a8ce44e56118377c731eae1b5f01ef0d29820ea2865755a",
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

        let unifiedTitleButtonHashes = [
            "assets/title/TitleButtons-russian.png": "4aa1f3e5cc5c42ab3ce1309f279e8cb4ba33e4247a2cfddee366e63e5e469917",
            "assets/title/TitleButtons-serbian.png": "b22772060da7fabdc2b71d2b0247c48d9ebfdb8c08c5e720ab1ef62d97768fda",
            "assets/title/TitleButtons.png": "3bea0cfa94a84086b7878fbfd924491cc2ed96605515d459ead05b86fce0213d",
            "assets/title/TitleButtons-ukrainian.png": "a104ee7b6f6f5af3c6077293aad1802398fed7cd3d7eb2559e9686a512eaff88",
            "assets/title/TitleButtons-vietnamese.png": "48deb43ab639c06fc214a013595407e440793f595e981ab3a5df5db49ca971ea",
            "assets/title/TitleButtons-swahili.png": "b9a646e59ac1d1c8f5817230a7ffe2fbab759b9cf2db62c2856b1e2fcd6fd2bb",
            "assets/title/TitleButtons-persian.png": "c382a193f4945f2b8194e10a7479134541034e641c54c3817ac92d6cf117a21a",
            "assets/title/TitleButtons-arabic.png": "656b2041fef380b7949559edfa536b1f0414bba8d5e9620c612283780bca2956",
            "assets/title/TitleButtons-indonesian.png": "6106e0cb1005dee5ed098c2d8ba8bc747cd6dbcede8c74dae7f018ca259daecb",
            "assets/title/TitleButtons-filipino.png": "06e57bd4199a50f863edaa974ca75a14d6320046f43b508451b1d435f90de052",
            "assets/title/TitleButtons-dutch.png": "6d899dcf793f16dbad7966be5f4df30d3cdc7bb5fb55d80bfbfa7d5191e48b6c",
            "assets/title/TitleButtons-hindi.png": "0a2c925d6532ff0c2cfe21d96583dd208046350c39cd63cad1c99103422db4cb",
            "assets/title/TitleButtons-traditional-chinese.png": "8eb01e40314d7c98c9b5ed3876cc4864c186629ba61903b2a6b017d807761d3b",
            "assets/title/TitleButtons-romanian.png": "13bd788ec3e9b34adf0f94f9e860381d328396a49b4215a90c6224c5dc6b6d55",
            "assets/title/TitleButtons-hebrew.png": "d0992d6f7034f6d81d712d588d78d567582a20c1199009ab8cc1d07d4470a0f4",
            "assets/title/TitleButtons-bulgarian.png": "04733e38da6820d7b43281d5df3dfb74c1d049ef06e1ed97f8837328fa37e5e6",
            "assets/title/TitleButtons-thai.png": "f1a160573cd0284ada352a2ac61de7ef0f132afbbb54caba6a5931775a892cdc",
            "assets/title/TitleButtons-greek.png": "e0d4cfcbec29d148238dbd7c2b728379edf6dba8be47548021f854d2068c6aca",
            "assets/title/TitleButtons-czech.png": "82df8b32994aa1c986366a9803f15bf3aef3350a4df323dd0fbf417388855ea5",
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
                == "370aaa43e2f0bc549963c83a9b35cac026b4f1e42fcef6bbd209ee550c168d23"
        )
        let vietnameseTitlePath = "assets/title/TitleButtons-vietnamese.png"
        try expect(try pngDimensions(vietnameseTitlePath) == (400, 655))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(vietnameseTitlePath))
                == "48deb43ab639c06fc214a013595407e440793f595e981ab3a5df5db49ca971ea"
        )

        let hindiButtonPath = "assets/button-hindi.png"
        try expect(try pngDimensions(hindiButtonPath) == (174, 78))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(hindiButtonPath))
                == "ee04a25bd92e48a06f7a9e691986e1315da06afb81cdb3f027258defadb95037"
        )
        let hindiTitlePath = "assets/title/TitleButtons-hindi.png"
        try expect(try pngDimensions(hindiTitlePath) == (400, 655))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(hindiTitlePath))
                == "0a2c925d6532ff0c2cfe21d96583dd208046350c39cd63cad1c99103422db4cb"
        )

        let swahiliButtonPath = "assets/button-swahili.png"
        try expect(try pngDimensions(swahiliButtonPath) == (174, 78))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(swahiliButtonPath))
                == "79c1c277ece9db4bf3753c1023fa90a3b170c79857b2d631218fde1e94193fc2"
        )
        let swahiliTitlePath = "assets/title/TitleButtons-swahili.png"
        try expect(try pngDimensions(swahiliTitlePath) == (400, 655))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(swahiliTitlePath))
                == "b9a646e59ac1d1c8f5817230a7ffe2fbab759b9cf2db62c2856b1e2fcd6fd2bb"
        )

        let indonesianButtonPath = "assets/button-indonesian.png"
        try expect(try pngDimensions(indonesianButtonPath) == (174, 78))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(indonesianButtonPath))
                == "67c2a98e0e5af7246b5175a92060ea8430b1898a30d02a5e7b55eb37649466d7"
        )
        let indonesianTitlePath = "assets/title/TitleButtons-indonesian.png"
        try expect(try pngDimensions(indonesianTitlePath) == (400, 655))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(indonesianTitlePath))
                == "6106e0cb1005dee5ed098c2d8ba8bc747cd6dbcede8c74dae7f018ca259daecb"
        )


        let filipinoButtonPath = "assets/button-filipino.png"
        try expect(try pngDimensions(filipinoButtonPath) == (174, 78))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(filipinoButtonPath))
                == "55fec7c86d0cb720209c7d7e496ba2bf4467bf25f377666e7876ace2016df2e5"
        )
        let filipinoTitlePath = "assets/title/TitleButtons-filipino.png"
        try expect(try pngDimensions(filipinoTitlePath) == (400, 655))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(filipinoTitlePath))
                == "06e57bd4199a50f863edaa974ca75a14d6320046f43b508451b1d435f90de052"
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
                == "44c5d1aaad0246f2b48e966d33d978ef835c72f3165a8704b70fc3283e8a7771"
        )
        let romanianTitlePath = "assets/title/TitleButtons-romanian.png"
        try expect(try pngDimensions(romanianTitlePath) == (400, 655))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(romanianTitlePath))
                == "13bd788ec3e9b34adf0f94f9e860381d328396a49b4215a90c6224c5dc6b6d55"
        )

        try expect(try pngDimensions("assets/button-persian.png") == (174, 78))
        try expect(try pngDimensions("assets/title/TitleButtons-persian.png") == (400, 655))
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/button-persian.png")
            ) == "d8657504f21c71a7a2dd6eb5de231a01419d7e2f6df578cfc26ad35659af43a6"
        )
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/title/TitleButtons-persian.png")
            ) == "c382a193f4945f2b8194e10a7479134541034e641c54c3817ac92d6cf117a21a"
        )

        try expect(try pngDimensions("assets/button-arabic.png") == (174, 78))
        try expect(try pngDimensions("assets/title/TitleButtons-arabic.png") == (400, 655))
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/button-arabic.png")
            ) == "d96a859272c6c0b8dbb3590c7aa4aeac059ad804ebff29b38b6b8f505cd2fca2"
        )
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/title/TitleButtons-arabic.png")
            ) == "656b2041fef380b7949559edfa536b1f0414bba8d5e9620c612283780bca2956"
        )

        let bulgarianAssetHashes = [
            "assets/button-bulgarian.png": "0663820648d16e88f5d0f94736d30e14e6e64b688e312b21e9b85934a266ddad",
            "assets/title/TitleButtons-bulgarian.png": "04733e38da6820d7b43281d5df3dfb74c1d049ef06e1ed97f8837328fa37e5e6",
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
            ) == "039e652e228dba8a10299d11d81e77fc28ca12748141d0f5d4493368c2f8b4ef"
        )
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/title/TitleButtons-thai.png")
            ) == "f1a160573cd0284ada352a2ac61de7ef0f132afbbb54caba6a5931775a892cdc"
        )

        let greekFontHashes = [
            "assets/fonts/greek/SpriteFont1.xnb": "247798383dfa9b9d2bce83ae1cdc4d942afbd3c1e83c4b94ba2ebb2172a3c000",
            "assets/fonts/greek/SmallFont.xnb": "83b9c73b735a0250318326c7f5b65b99accfbd262ec07552ce8b9133178a8f20",
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
            ) == "940bf3da638437b10e5560ce45c505fdff007f3d30212f85e14a6ee1c2956aa3"
        )
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/title/TitleButtons-greek.png")
            ) == "e0d4cfcbec29d148238dbd7c2b728379edf6dba8be47548021f854d2068c6aca"
        )

        let czechAssetHashes = [
            "assets/button-czech.png": "5c14fa9f579564635a8ce44e56118377c731eae1b5f01ef0d29820ea2865755a",
            "assets/title/TitleButtons-czech.png": "82df8b32994aa1c986366a9803f15bf3aef3350a4df323dd0fbf417388855ea5",
            "assets/fonts/czech/SpriteFont1.xnb": "65b107082554a8c747c97443f94f8f9f3311b2529da5875c4f2fd7801d52c5ab",
            "assets/fonts/czech/SmallFont.xnb": "88589cae57b67fae0b1c958b4e1554ffeba51bd7774f51f1a178fe6712253dfe",
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

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
        expect(package.languageCodes == ["ru-vnrevival", "pl-vnrevival", "uz-vnrevival", "vi-vnrevival", "sw-vnrevival", "am-vnrevival", "kn-vnrevival", "ml-vnrevival", "mr-vnrevival", "my-vnrevival", "te-vnrevival", "ur-vnrevival", "fa-vnrevival", "ar-vnrevival", "ta-vnrevival", "bn-vnrevival", "id-vnrevival", "hi-vnrevival", "zh-TW-vnrevival"])
        expect(package.uniqueID == "VNRevival.StardewValleyTranslations")
        expect(TranslationPackage.supportedSiteLocales.count == 43)
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
            "pl-vnrevival": ("ButtonPolish", "assets/button.png", "assets/title/TitleButtons.png"),
            "uz-vnrevival": ("ButtonUzbek", "assets/button-uzbek.png", "assets/title/TitleButtons-uzbek.png"),
            "vi-vnrevival": ("ButtonVietnamese", "assets/button-vietnamese.png", "assets/title/TitleButtons-vietnamese.png"),
            "sw-vnrevival": ("ButtonSwahili", "assets/button-swahili.png", "assets/title/TitleButtons-swahili.png"),
            "am-vnrevival": ("ButtonAmharic", "assets/button-amharic.png", "assets/title/TitleButtons-amharic.png"),
            "kn-vnrevival": ("ButtonKannada", "assets/button-kannada.png", "assets/title/TitleButtons-kannada.png"),
            "ml-vnrevival": ("ButtonMalayalam", "assets/button-malayalam.png", "assets/title/TitleButtons-malayalam.png"),
            "mr-vnrevival": ("ButtonMarathi", "assets/button-marathi.png", "assets/title/TitleButtons-marathi.png"),
            "my-vnrevival": ("ButtonBurmese", "assets/button-burmese.png", "assets/title/TitleButtons-burmese.png"),
            "te-vnrevival": ("ButtonTelugu", "assets/button-telugu.png", "assets/title/TitleButtons-telugu.png"),
            "ur-vnrevival": ("ButtonUrdu", "assets/button-urdu.png", "assets/title/TitleButtons-urdu.png"),
            "fa-vnrevival": ("ButtonPersian", "assets/button-persian.png", "assets/title/TitleButtons-persian.png"),
            "ar-vnrevival": ("ButtonArabic", "assets/button-arabic.png", "assets/title/TitleButtons-arabic.png"),
            "ta-vnrevival": ("ButtonTamil", "assets/button-tamil.png", "assets/title/TitleButtons-tamil.png"),
            "bn-vnrevival": ("ButtonBengali", "assets/button-bengali.png", "assets/title/TitleButtons-bengali.png"),
            "id-vnrevival": ("ButtonIndonesian", "assets/button-indonesian.png", "assets/title/TitleButtons-indonesian.png"),
            "hi-vnrevival": ("ButtonHindi", "assets/button-hindi.png", "assets/title/TitleButtons-hindi.png"),
            "zh-TW-vnrevival": ("ButtonTraditionalChinese", "assets/button-traditional-chinese.png", "assets/title/TitleButtons-traditional-chinese.png"),
        ]
        for code in package.languageCodes {
            let expected = try require(expectedButtons[code])
            let language = try require(languageEntries.values.compactMap { $0 as? [String: Any] }.first {
                ($0["LanguageCode"] as? String) == code
            })
            expect(language["ButtonTexture"] as? String == "Mods/{{ModId}}/\(expected.0)")
            expect(language["UseLatinFont"] as? Bool == !["ru-vnrevival", "am-vnrevival", "kn-vnrevival", "ml-vnrevival", "mr-vnrevival", "my-vnrevival", "te-vnrevival", "ur-vnrevival", "fa-vnrevival", "ar-vnrevival", "ta-vnrevival", "bn-vnrevival", "hi-vnrevival", "zh-TW-vnrevival"].contains(code))
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
            if code == "te-vnrevival" {
                expect(language["FontFile"] as? String == "Fonts/Telugu")
                expect(language["FontPixelZoom"] as? Int == 3)
            }
            if code == "ur-vnrevival" {
                expect(language["FontFile"] as? String == "Fonts/Urdu")
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
            if code == "ta-vnrevival" {
                expect(language["FontFile"] as? String == "Fonts/Tamil")
                expect(language["FontPixelZoom"] as? Int == 3)
            }
            if code == "bn-vnrevival" {
                expect(language["FontFile"] as? String == "Fonts/Bengali")
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
            ("vi-vnrevival", "vietnamese"),
            ("am-vnrevival", "amharic"),
            ("kn-vnrevival", "kannada"),
            ("ml-vnrevival", "malayalam"),
            ("mr-vnrevival", "marathi"),
            ("my-vnrevival", "burmese"),
            ("te-vnrevival", "telugu"),
            ("ur-vnrevival", "urdu"),
            ("fa-vnrevival", "persian"),
            ("ar-vnrevival", "arabic"),
            ("ta-vnrevival", "tamil"),
            ("bn-vnrevival", "bengali"),
            ("hi-vnrevival", "hindi"),
            ("zh-TW-vnrevival", "traditional-chinese"),
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
            ("Fonts/Telugu", "assets/fonts/telugu/Telugu.xnb"),
            ("Fonts/Telugu_0", "assets/fonts/telugu/Telugu_0.xnb"),
            ("Fonts/Urdu", "assets/fonts/urdu/Urdu.xnb"),
            ("Fonts/Urdu_0", "assets/fonts/urdu/Urdu_0.xnb"),
            ("Fonts/Persian", "assets/fonts/persian/Persian.xnb"),
            ("Fonts/Persian_0", "assets/fonts/persian/Persian_0.xnb"),
            ("Fonts/Arabic", "assets/fonts/arabic/Arabic.xnb"),
            ("Fonts/Arabic_0", "assets/fonts/arabic/Arabic_0.xnb"),
            ("Fonts/Tamil", "assets/fonts/tamil/Tamil.xnb"),
            ("Fonts/Tamil_0", "assets/fonts/tamil/Tamil_0.xnb"),
            ("Fonts/Bengali", "assets/fonts/bengali/Bengali.xnb"),
            ("Fonts/Bengali_0", "assets/fonts/bengali/Bengali_0.xnb"),
            ("Fonts/Hindi", "assets/fonts/hindi/Hindi.xnb"),
            ("Fonts/Hindi_0", "assets/fonts/hindi/Hindi_0.xnb"),
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

        let teluguFontHashes = [
            "assets/fonts/telugu/SpriteFont1.xnb": "5f4eff41593621d02d692fea24d25fddcebef1f4cf642d87f8775143e11217be",
            "assets/fonts/telugu/SmallFont.xnb": "5b897d77f962d01da2b53cc7a989ce407249951f372ce3ac9bf161139c80a222",
            "assets/fonts/telugu/Telugu.xnb": "7777ddcee358c81a24184cdf9159600b491a58067b5f711e4e8965563602d001",
            "assets/fonts/telugu/Telugu_0.xnb": "34852dbc004ce9e56480a6fcb2a423689e156da56780957362fd6ff6004ab31f",
        ]
        for (fontPath, expectedHash) in teluguFontHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(fontPath))
                    == expectedHash
            )
        }

        let urduFontHashes = [
            "assets/fonts/urdu/SpriteFont1.xnb": "f7b64f70ac22194b944d807a41a61b186d2683036ca0bff8d19ef8fde9370fe3",
            "assets/fonts/urdu/SmallFont.xnb": "ddaee34a326858e4a8f56a3229136fbde712cd16a7af50effbd931a16b8ce87a",
            "assets/fonts/urdu/Urdu.xnb": "a5cf673f0d49a3cce99fa46cfcda5234cfd49a001d8f83c3f85ebc8bac105e89",
            "assets/fonts/urdu/Urdu_0.xnb": "d124da8590f72568290d03e03b9bb07d03e2697067ca30f270c965a56264e1d0",
        ]
        for (fontPath, expectedHash) in urduFontHashes {
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

        let tamilFontHashes = [
            "assets/fonts/tamil/SpriteFont1.xnb": "1d3331c775f0a446ae24255dc1fdc960fd9270aaef811d4af071081d7652a283",
            "assets/fonts/tamil/SmallFont.xnb": "aaaeee55715ef26754cb95d8c4af92116b43b0611543bd1846e3cc5a28dc3b89",
            "assets/fonts/tamil/Tamil.xnb": "7e8d5b9170c073bbbb9c81e495915e98f13850008ecc87a7ca7d6646694a23ed",
            "assets/fonts/tamil/Tamil_0.xnb": "5efcc6cbba126165e6fcf804d81ca3938a3bd656ab2a750989b6e71cb2c6b555",
        ]
        for (fontPath, expectedHash) in tamilFontHashes {
            try expect(
                try DependencyInstaller.sha256(of: payload.appendingPathComponent(fontPath))
                    == expectedHash
            )
        }

        let bengaliFontHashes = [
            "assets/fonts/bengali/SpriteFont1.xnb": "4ec241daeae2c84f6a53abedcfd550c99b32bc20e49ec43dda5dadffcf0d1a4b",
            "assets/fonts/bengali/SmallFont.xnb": "f25cc6185456d980889f53990da689d5200c0644ff3df823907f3be63eaeaa38",
            "assets/fonts/bengali/Bengali.xnb": "82c7fdc1b1f4e67bef08c52e737819c65142b883c19b211460d568e5119800f7",
            "assets/fonts/bengali/Bengali_0.xnb": "f93976f8e3df23fe7dd73639f9a42bd41d3ec0ec16233cfd8d09453d768f4a50",
        ]
        for (fontPath, expectedHash) in bengaliFontHashes {
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

        let bengaliButtonPath = "assets/button-bengali.png"
        try expect(try pngDimensions(bengaliButtonPath) == (174, 78))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(bengaliButtonPath))
                == "3fa4967bfc34093ea267e442a8b2cb9eb08cb7267d6cd0dcc6b4bd53d3031eaa"
        )
        let bengaliTitlePath = "assets/title/TitleButtons-bengali.png"
        try expect(try pngDimensions(bengaliTitlePath) == (400, 655))
        try expect(
            try DependencyInstaller.sha256(of: payload.appendingPathComponent(bengaliTitlePath))
                == "0aca0fe2a79d6f02e7316d64e98995f31eb3a7925abf4c0770640c518f52c6d4"
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

        try expect(try pngDimensions("assets/button-telugu.png") == (174, 78))
        try expect(try pngDimensions("assets/title/TitleButtons-telugu.png") == (400, 655))
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/button-telugu.png")
            ) == "c4d5911f337dd0787d6f0eb78ee0c529c959241b1a29cc1c65df88a767f49835"
        )
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/title/TitleButtons-telugu.png")
            ) == "8568fe1e6852be1f6ae4bd47005c6b70ae53dc10783cc614f23da9360a182b19"
        )

        try expect(try pngDimensions("assets/button-urdu.png") == (174, 78))
        try expect(try pngDimensions("assets/title/TitleButtons-urdu.png") == (400, 655))
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/button-urdu.png")
            ) == "17725d462ff0d357f42ebc29782abea5314b530293dbc3f9fc509231786abc3a"
        )
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/title/TitleButtons-urdu.png")
            ) == "726e4ab46a89bfd78295316a51becf213a792949be965e4b7fc2ca96edc856b8"
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

        try expect(try pngDimensions("assets/button-tamil.png") == (174, 78))
        try expect(try pngDimensions("assets/title/TitleButtons-tamil.png") == (400, 655))
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/button-tamil.png")
            ) == "fc0b131efcd0bdcebbbf81039bdbeab5e8eea5f0b309858b4ce77ec7d0791d0f"
        )
        try expect(
            try DependencyInstaller.sha256(
                of: payload.appendingPathComponent("assets/title/TitleButtons-tamil.png")
            ) == "59109b526623feeaa435d2929e2d30421c455c93de129460ce564f6a9bd95e44"
        )
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
        let urduShapingMap = try require(
            JSONSerialization.jsonObject(
                with: Data(contentsOf: source.appendingPathComponent("urdu-shaping-map.json"))
            ) as? [String: Any]
        )
        expect(urduShapingMap["format"] as? Int == 2)
        let urduShapingEntries = try require(urduShapingMap["entries"] as? [[String: Any]])
        expect(urduShapingEntries.count == 282)
        expect(Set(urduShapingEntries.compactMap { $0["glyph"] as? String }).count == 282)
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
        expect(includes.count == 4_520)
        let includedPaths = try includes.map { try require($0["FromFile"] as? String) }
        expect(Set(includedPaths).count == includedPaths.count)
        var malayalamPrivateUseGlyphs = 0
        var rawMalayalamScalars = 0
        var marathiPrivateUseGlyphs = 0
        var rawMarathiScalars = 0
        var burmesePrivateUseGlyphs = 0
        var rawBurmeseScalars = 0
        var teluguPrivateUseGlyphs = 0
        var rawTeluguScalars = 0
        var tamilPrivateUseGlyphs = 0
        var rawTamilScalars = 0
        var bengaliPrivateUseGlyphs = 0
        var rawBengaliScalars = 0
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
            } else if relativePath.contains("/polish/") {
                expectedLanguage = "pl-vnrevival"
            } else if relativePath.contains("/uzbek/") {
                expectedLanguage = "uz-vnrevival"
            } else if relativePath.contains("/vietnamese/") {
                expectedLanguage = "vi-vnrevival"
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
            } else if relativePath.contains("/telugu/") {
                expectedLanguage = "te-vnrevival"
            } else if relativePath.contains("/urdu/") {
                expectedLanguage = "ur-vnrevival"
            } else if relativePath.contains("/persian/") {
                expectedLanguage = "fa-vnrevival"
            } else if relativePath.contains("/arabic/") {
                expectedLanguage = "ar-vnrevival"
            } else if relativePath.contains("/tamil/") {
                expectedLanguage = "ta-vnrevival"
            } else if relativePath.contains("/bengali/") {
                expectedLanguage = "bn-vnrevival"
            } else if relativePath.contains("/indonesian/") {
                expectedLanguage = "id-vnrevival"
            } else if relativePath.contains("/hindi/") {
                expectedLanguage = "hi-vnrevival"
            } else if relativePath.contains("/traditional-chinese/") {
                expectedLanguage = "zh-TW-vnrevival"
            } else if relativePath.contains("/thai/") {
                expectedLanguage = "th-vnrevival"
            } else if relativePath.contains("/kannada/") {
                expectedLanguage = "kn-vnrevival"
            } else {
                throw RequiredValueMissing()
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
                if expectedLanguage == "te-vnrevival" {
                    let entries = try require(change["Entries"] as? [String: String])
                    for value in entries.values {
                        for scalar in value.unicodeScalars {
                            if (0xE000...0xF8FF).contains(scalar.value) {
                                teluguPrivateUseGlyphs += 1
                            }
                            if (0x0C00...0x0C7F).contains(scalar.value) {
                                rawTeluguScalars += 1
                            }
                        }
                    }
                }
                if expectedLanguage == "ta-vnrevival" {
                    let entries = try require(change["Entries"] as? [String: String])
                    for value in entries.values {
                        for scalar in value.unicodeScalars {
                            if (0xE000...0xF8FF).contains(scalar.value) {
                                tamilPrivateUseGlyphs += 1
                            }
                            if (0x0B80...0x0BFF).contains(scalar.value) {
                                rawTamilScalars += 1
                            }
                        }
                    }
                }
                if expectedLanguage == "bn-vnrevival" {
                    let entries = try require(change["Entries"] as? [String: String])
                    for value in entries.values {
                        for scalar in value.unicodeScalars {
                            if (0xE000...0xF8FF).contains(scalar.value) {
                                bengaliPrivateUseGlyphs += 1
                            }
                            if (0x0980...0x09FF).contains(scalar.value) {
                                rawBengaliScalars += 1
                            }
                        }
                    }
                }
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
        expect(malayalamPrivateUseGlyphs > 100_000)
        expect(rawMalayalamScalars == 0)
        expect(marathiPrivateUseGlyphs > 100_000)
        expect(rawMarathiScalars == 0)
        expect(burmesePrivateUseGlyphs > 100_000)
        expect(rawBurmeseScalars == 0)
        expect(teluguPrivateUseGlyphs > 100_000)
        expect(rawTeluguScalars == 0)
        expect(tamilPrivateUseGlyphs > 100_000)
        expect(rawTamilScalars == 0)
        expect(bengaliPrivateUseGlyphs > 100_000)
        expect(rawBengaliScalars == 0)
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

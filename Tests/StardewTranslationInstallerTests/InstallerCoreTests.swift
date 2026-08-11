import Foundation
import Testing
@testable import StardewTranslationInstaller

@Suite("Installer core")
struct InstallerCoreTests {
    private func translationPackage() throws -> TranslationPackage {
        let projectRoot = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent()
            .deletingLastPathComponent()
            .deletingLastPathComponent()
        return try TranslationPackage.load(
            from: projectRoot.appendingPathComponent(
                "Sources/StardewTranslationInstaller/Resources/PackageConfig.json"
            )
        )
    }

    @Test("loads a package for a SiteForMods language")
    func loadsTranslationPackage() throws {
        let package = try translationPackage()
        #expect(package.siteLocale == "pl")
        #expect(package.languageCode == "pl-vnrevival")
        #expect(TranslationPackage.supportedSiteLocales.count == 43)
    }

    @Test("computes the pinned archive checksum")
    func computesChecksum() throws {
        let file = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        defer { try? FileManager.default.removeItem(at: file) }
        try Data("hello".utf8).write(to: file)
        #expect(
            try DependencyInstaller.sha256(of: file)
                == "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
        )
    }

    @Test("installs and removes only the owned content pack")
    func installAndRemove() throws {
        let fm = FileManager.default
        let temporary = fm.temporaryDirectory.appendingPathComponent(UUID().uuidString, isDirectory: true)
        defer { try? fm.removeItem(at: temporary) }
        let executable = temporary.appendingPathComponent("Contents/MacOS", isDirectory: true)
        try fm.createDirectory(at: executable, withIntermediateDirectories: true)
        try Data().write(to: executable.appendingPathComponent("Stardew Valley.dll"))

        let payload = temporary.appendingPathComponent("Payload", isDirectory: true)
        try fm.createDirectory(at: payload, withIntermediateDirectories: true)
        let manifest = #"{"UniqueID":"VNRevival.StardewValleyPolish"}"#.data(using: .utf8)!
        try manifest.write(to: payload.appendingPathComponent("manifest.json"))
        try #"{"LanguageCode":"pl-vnrevival"}"#.data(using: .utf8)!
            .write(to: payload.appendingPathComponent("content.json"))

        let core = InstallerCore(fileManager: fm)
        let package = try translationPackage()
        let installation = try #require(core.resolveInstallation(temporary))
        try core.install(
            payload: payload,
            package: package,
            into: installation,
            requirePrerequisites: false
        )
        #expect(core.status(for: installation, package: package).modInstalled)
        try core.uninstall(package: package, from: installation)
        #expect(!fm.fileExists(atPath: installation.modDirectory(for: package).path))
    }

    @Test("does not overwrite a foreign folder")
    func protectsForeignFolder() throws {
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
        try #"{"UniqueID":"VNRevival.StardewValleyPolish"}"#.data(using: .utf8)!.write(to: payload.appendingPathComponent("manifest.json"))
        try #"{"LanguageCode":"pl-vnrevival"}"#.data(using: .utf8)!
            .write(to: payload.appendingPathComponent("content.json"))

        let core = InstallerCore(fileManager: fm)
        let installation = try #require(core.resolveInstallation(temporary))
        #expect(throws: InstallerError.self) {
            try core.install(
                payload: payload,
                package: package,
                into: installation,
                requirePrerequisites: false
            )
        }
    }
}

import Foundation

struct InstallerCopy: Codable, Equatable, Sendable {
    let windowTitle: String
    let preparingTitle: String
    let installingTitle: String
    let readyTitle: String
    let failedTitle: String
    let preparingMessage: String
    let findingGameMessage: String
    let gameNotFoundMessage: String
    let chooseGameTitle: String
    let chooseGameMessage: String
    let chooseGamePrompt: String
    let installingTranslationMessage: String
    let installedMessage: String
    let launchingMessage: String
    let steamFailedMessage: String
    let installationErrorMessage: String
    let downloadingSMAPI: String
    let downloadingContentPatcher: String
    let launchButton: String
    let chooseGameButton: String
    let retryButton: String
    let waitHint: String

    func dependencyMessage(_ progress: DependencyProgress) -> String {
        switch progress {
        case .downloadingSMAPI(let version):
            downloadingSMAPI.replacingOccurrences(of: "{version}", with: version)
        case .downloadingContentPatcher(let version):
            downloadingContentPatcher.replacingOccurrences(of: "{version}", with: version)
        }
    }
}

struct TranslationPackage: Codable, Equatable, Sendable {
    static let supportedSiteLocales: Set<String> = [
        "zh", "en", "ru", "es", "pt-BR", "ja", "de", "ko", "fr", "tr", "pl", "zh-TW",
        "it", "th", "vi", "id", "uk", "ar", "cs", "hu", "nl", "fa", "ro", "hi", "fil",
        "el", "bg", "sr", "sw", "he",
    ]

    let schemaVersion: Int
    let siteLocale: String
    let languageCodes: [String]
    let nativeLanguageName: String
    let uniqueID: String
    let modFolderName: String
    let steamAppID: String
    let legacyPackages: [LegacyTranslationPackage]
    let copy: InstallerCopy

    static func load(from url: URL) throws -> TranslationPackage {
        let package = try JSONDecoder().decode(TranslationPackage.self, from: Data(contentsOf: url))
        try package.validate()
        return package
    }

    func validate() throws {
        guard schemaVersion == 2 else { throw TranslationPackageError.unsupportedSchema(schemaVersion) }
        guard Self.supportedSiteLocales.contains(siteLocale) else {
            throw TranslationPackageError.unsupportedSiteLocale(siteLocale)
        }
        let required = [nativeLanguageName, uniqueID, modFolderName, steamAppID] + languageCodes
        guard required.allSatisfy({ !$0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) else {
            throw TranslationPackageError.missingValue
        }
        guard !languageCodes.isEmpty, Set(languageCodes).count == languageCodes.count else {
            throw TranslationPackageError.invalidLanguageCodes
        }
        guard !modFolderName.contains("/") else { throw TranslationPackageError.invalidFolderName }
        guard legacyPackages.allSatisfy({ !$0.modFolderName.contains("/") }) else {
            throw TranslationPackageError.invalidFolderName
        }
    }
}

struct LegacyTranslationPackage: Codable, Equatable, Sendable {
    let uniqueID: String
    let modFolderName: String
}

enum TranslationPackageError: LocalizedError {
    case unsupportedSchema(Int)
    case unsupportedSiteLocale(String)
    case missingValue
    case invalidLanguageCodes
    case invalidFolderName

    var errorDescription: String? {
        switch self {
        case .unsupportedSchema(let version):
            "Unsupported translation package schema: \(version)."
        case .unsupportedSiteLocale(let locale):
            "Unsupported SiteForMods language: \(locale)."
        case .missingValue:
            "The translation package configuration has an empty required value."
        case .invalidLanguageCodes:
            "The translation package language-code list is empty or contains duplicates."
        case .invalidFolderName:
            "The translation package folder name is invalid."
        }
    }
}

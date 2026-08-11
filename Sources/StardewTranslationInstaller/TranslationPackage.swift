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
        "en", "ru", "fr", "de", "es", "pl", "tr", "ar", "pt", "ja", "ko", "zh", "zh-TW",
        "it", "th", "vi", "id", "fa", "hi", "cs", "hu", "ro", "el", "bn", "ur", "ta",
        "te", "he", "fi", "fil", "bg", "sr", "my", "mr", "ml", "kn", "hy", "ka", "kk",
        "uz", "uk", "sw", "am",
    ]

    let schemaVersion: Int
    let siteLocale: String
    let languageCode: String
    let nativeLanguageName: String
    let uniqueID: String
    let modFolderName: String
    let steamAppID: String
    let copy: InstallerCopy

    static func load(from url: URL) throws -> TranslationPackage {
        let package = try JSONDecoder().decode(TranslationPackage.self, from: Data(contentsOf: url))
        try package.validate()
        return package
    }

    func validate() throws {
        guard schemaVersion == 1 else { throw TranslationPackageError.unsupportedSchema(schemaVersion) }
        guard Self.supportedSiteLocales.contains(siteLocale) else {
            throw TranslationPackageError.unsupportedSiteLocale(siteLocale)
        }
        let required = [languageCode, nativeLanguageName, uniqueID, modFolderName, steamAppID]
        guard required.allSatisfy({ !$0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) else {
            throw TranslationPackageError.missingValue
        }
        guard !modFolderName.contains("/") else { throw TranslationPackageError.invalidFolderName }
    }
}

enum TranslationPackageError: LocalizedError {
    case unsupportedSchema(Int)
    case unsupportedSiteLocale(String)
    case missingValue
    case invalidFolderName

    var errorDescription: String? {
        switch self {
        case .unsupportedSchema(let version):
            "Unsupported translation package schema: \(version)."
        case .unsupportedSiteLocale(let locale):
            "Unsupported SiteForMods language: \(locale)."
        case .missingValue:
            "The translation package configuration has an empty required value."
        case .invalidFolderName:
            "The translation package folder name is invalid."
        }
    }
}

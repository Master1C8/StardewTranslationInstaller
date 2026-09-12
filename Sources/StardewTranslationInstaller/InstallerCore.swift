import Foundation

struct GameInstallation: Equatable, Sendable {
    let root: URL
    let executableDirectory: URL

    var modsDirectory: URL { executableDirectory.appendingPathComponent("Mods", isDirectory: true) }

    func modDirectory(for package: TranslationPackage) -> URL {
        modsDirectory.appendingPathComponent(package.modFolderName, isDirectory: true)
    }
}

struct InstallationStatus: Sendable {
    let gameFound: Bool
    let smapiFound: Bool
    let contentPatcherFound: Bool
    let modInstalled: Bool

    var readyToInstall: Bool { gameFound && smapiFound && contentPatcherFound }
}

struct SemanticVersion: Comparable, Equatable, Sendable {
    let major: Int
    let minor: Int
    let patch: Int

    init?(_ value: String) {
        let core = value.split(separator: "+", maxSplits: 1)[0]
            .split(separator: "-", maxSplits: 1)[0]
        let parts = core.split(separator: ".")
        guard parts.count >= 3,
              let major = Int(parts[0]),
              let minor = Int(parts[1]),
              let patch = Int(parts[2]) else { return nil }
        self.major = major
        self.minor = minor
        self.patch = patch
    }

    static func < (lhs: Self, rhs: Self) -> Bool {
        (lhs.major, lhs.minor, lhs.patch) < (rhs.major, rhs.minor, rhs.patch)
    }
}

enum InstallerError: LocalizedError {
    case invalidGameFolder
    case missingPrerequisites
    case missingPayload
    case packageMismatch
    case foreignFolder(URL)
    case duplicateMod(String, [URL])
    case malformedManifest(URL)

    var errorDescription: String? {
        switch self {
        case .invalidGameFolder:
            return "Stardew Valley was not found in the selected folder."
        case .missingPrerequisites:
            return "Install SMAPI and Content Patcher first."
        case .missingPayload:
            return "The mod package is missing from the application."
        case .packageMismatch:
            return "The language configuration does not match the translation package."
        case .foreignFolder(let url):
            return "The \(url.lastPathComponent) folder belongs to another mod and will not be overwritten."
        case .duplicateMod(let uniqueID, let folders):
            let names = folders.map(\.lastPathComponent).joined(separator: ", ")
            return "Multiple copies of \(uniqueID) were found in Mods: \(names). Remove the duplicate and try again."
        case .malformedManifest(let url):
            return "Could not validate manifest.json in \(url.path)."
        }
    }
}

struct InstallerCore {
    static let languageSwitcherUniqueID = "VNRevival.LanguageSwitcher"
    static let languageSwitcherFolderName = "[SMAPI] VN Revival Language Switcher"
    static let minimumSMAPIVersion = "4.5.2"
    static let minimumContentPatcherVersion = "2.9.1"

    let fileManager: FileManager

    init(fileManager: FileManager = .default) {
        self.fileManager = fileManager
    }

    func detectInstallation() -> GameInstallation? {
        let home = fileManager.homeDirectoryForCurrentUser
        let candidates = [
            home.appendingPathComponent("Library/Application Support/Steam/steamapps/common/Stardew Valley"),
            URL(fileURLWithPath: "/Applications/Stardew Valley.app"),
            home.appendingPathComponent("Applications/Stardew Valley.app"),
        ]
        return candidates.compactMap(resolveInstallation).first
    }

    func resolveInstallation(_ selectedURL: URL) -> GameInstallation? {
        let candidates = [
            selectedURL,
            selectedURL.appendingPathComponent("Contents/MacOS", isDirectory: true),
        ]
        for directory in candidates {
            let markers = ["Stardew Valley.dll", "StardewValley", "Stardew Valley.exe"]
            if markers.contains(where: { fileManager.fileExists(atPath: directory.appendingPathComponent($0).path) }) {
                let root = directory.lastPathComponent == "MacOS"
                    ? directory.deletingLastPathComponent().deletingLastPathComponent()
                    : selectedURL
                return GameInstallation(root: root, executableDirectory: directory)
            }
        }
        return nil
    }

    func status(for installation: GameInstallation) -> InstallationStatus {
        status(for: installation, package: nil)
    }

    func status(for installation: GameInstallation, package: TranslationPackage?) -> InstallationStatus {
        let smapiFound = installedSMAPIVersion(in: installation).map {
            $0 >= SemanticVersion(Self.minimumSMAPIVersion)!
        } ?? false
        let contentPatcherFolders = modFolders(
            withUniqueID: "Pathoschild.ContentPatcher",
            below: installation.modsDirectory
        )
        let contentPatcherFound = contentPatcherFolders.count == 1
            && (manifestVersion(in: contentPatcherFolders[0]).map {
                $0 >= SemanticVersion(Self.minimumContentPatcherVersion)!
            } ?? false)
        return InstallationStatus(
            gameFound: true,
            smapiFound: smapiFound,
            contentPatcherFound: contentPatcherFound,
            modInstalled: package.map {
                ownsFolder(installation.modDirectory(for: $0), uniqueID: $0.uniqueID)
            } ?? false
        )
    }

    func install(
        payload: URL,
        package: TranslationPackage,
        into installation: GameInstallation,
        requirePrerequisites: Bool = true
    ) throws {
        guard resolveInstallation(installation.root) != nil else { throw InstallerError.invalidGameFolder }
        if requirePrerequisites && !status(for: installation).readyToInstall {
            throw InstallerError.missingPrerequisites
        }
        guard folderHasUniqueID(payload, uniqueID: package.uniqueID) else {
            throw InstallerError.missingPayload
        }
        guard package.languageCodes.allSatisfy({
            payloadHasLanguageCode(payload, languageCode: $0)
        }) else {
            throw InstallerError.packageMismatch
        }
        try replaceOwnedFolder(
            payload: payload,
            destination: installation.modDirectory(for: package),
            uniqueID: package.uniqueID
        )
        try removeOwnedLegacyPackages(package.legacyPackages, from: installation)
    }

    func installContentPatcher(payload: URL, into installation: GameInstallation) throws {
        guard folderHasUniqueID(payload, uniqueID: "Pathoschild.ContentPatcher") else {
            throw InstallerError.malformedManifest(payload)
        }
        let existing = modFolders(
            withUniqueID: "Pathoschild.ContentPatcher",
            below: installation.modsDirectory
        )
        guard existing.count <= 1 else {
            throw InstallerError.duplicateMod("Pathoschild.ContentPatcher", existing)
        }
        let destination = existing.first ?? installation.modsDirectory.appendingPathComponent(
            "ContentPatcher",
            isDirectory: true
        )
        try replaceOwnedFolder(
            payload: payload,
            destination: destination,
            uniqueID: "Pathoschild.ContentPatcher"
        )
    }

    func installLanguageSwitcher(payload: URL, into installation: GameInstallation) throws {
        let destination = installation.modsDirectory.appendingPathComponent(
            Self.languageSwitcherFolderName,
            isDirectory: true
        )
        guard folderHasUniqueID(payload, uniqueID: Self.languageSwitcherUniqueID) else {
            throw InstallerError.malformedManifest(payload)
        }
        try replaceOwnedFolder(
            payload: payload,
            destination: destination,
            uniqueID: Self.languageSwitcherUniqueID
        )
    }

    func uninstall(package: TranslationPackage, from installation: GameInstallation) throws {
        let modDirectory = installation.modDirectory(for: package)
        guard fileManager.fileExists(atPath: modDirectory.path) else { return }
        guard ownsFolder(modDirectory, uniqueID: package.uniqueID) else {
            throw InstallerError.foreignFolder(modDirectory)
        }
        try fileManager.removeItem(at: modDirectory)
    }

    func folderHasUniqueID(_ folder: URL, uniqueID: String) -> Bool {
        let manifest = folder.appendingPathComponent("manifest.json")
        guard let data = try? Data(contentsOf: manifest),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let foundID = json["UniqueID"] as? String else {
            return false
        }
        return foundID == uniqueID
    }

    func modFolders(withUniqueID uniqueID: String, below modsDirectory: URL) -> [URL] {
        guard let entries = try? fileManager.contentsOfDirectory(
            at: modsDirectory,
            includingPropertiesForKeys: [.isDirectoryKey],
            options: [.skipsHiddenFiles]
        ) else { return [] }
        return entries.filter { folder in
            let values = try? folder.resourceValues(forKeys: [.isDirectoryKey])
            return values?.isDirectory == true && folderHasUniqueID(folder, uniqueID: uniqueID)
        }.sorted { $0.lastPathComponent.localizedStandardCompare($1.lastPathComponent) == .orderedAscending }
    }

    func payloadHasLanguageCode(_ folder: URL, languageCode: String) -> Bool {
        let content = folder.appendingPathComponent("content.json")
        guard let data = try? Data(contentsOf: content),
              let json = try? JSONSerialization.jsonObject(with: data) else {
            return false
        }
        return containsLanguageCode(json, expected: languageCode)
    }

    func installedSMAPIVersion(in installation: GameInstallation) -> SemanticVersion? {
        let assembly = installation.executableDirectory.appendingPathComponent("StardewModdingAPI.dll")
        guard let data = try? Data(contentsOf: assembly, options: .mappedIfSafe) else { return nil }
        let strings = String(decoding: data, as: UTF8.self)
        let pattern = #"(?<![0-9])([0-9]+\.[0-9]+\.[0-9]+)(?:\.[0-9]+)?\+[0-9a-fA-F]{7,64}"#
        guard let expression = try? NSRegularExpression(pattern: pattern) else { return nil }
        let fullRange = NSRange(strings.startIndex..., in: strings)
        let cocoa = strings as NSString
        for match in expression.matches(in: strings, range: fullRange) {
            let contextStart = max(0, match.range.location - 128)
            let contextEnd = min(cocoa.length, match.range.location + match.range.length + 128)
            let context = cocoa.substring(
                with: NSRange(location: contextStart, length: contextEnd - contextStart)
            )
            guard context.localizedCaseInsensitiveContains("SMAPI"),
                  let range = Range(match.range(at: 1), in: strings) else { continue }
            return SemanticVersion(String(strings[range]))
        }
        return nil
    }

    func manifestVersion(in folder: URL) -> SemanticVersion? {
        let manifest = folder.appendingPathComponent("manifest.json")
        guard let data = try? Data(contentsOf: manifest),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let version = json["Version"] as? String else { return nil }
        return SemanticVersion(version)
    }

    private func containsLanguageCode(_ value: Any, expected: String) -> Bool {
        if let object = value as? [String: Any] {
            if object["LanguageCode"] as? String == expected { return true }
            return object.values.contains { containsLanguageCode($0, expected: expected) }
        }
        if let array = value as? [Any] {
            return array.contains { containsLanguageCode($0, expected: expected) }
        }
        return false
    }

    private func ownsFolder(_ folder: URL, uniqueID: String) -> Bool {
        folderHasUniqueID(folder, uniqueID: uniqueID)
    }

    private func replaceOwnedFolder(payload: URL, destination: URL, uniqueID: String) throws {
        let parent = destination.deletingLastPathComponent()
        try fileManager.createDirectory(at: parent, withIntermediateDirectories: true)
        try recoverInterruptedReplacement(destination: destination, uniqueID: uniqueID)
        if fileManager.fileExists(atPath: destination.path),
           !folderHasUniqueID(destination, uniqueID: uniqueID) {
            throw InstallerError.foreignFolder(destination)
        }

        let token = "\(uniqueID)-\(UUID().uuidString)"
        let staging = parent.appendingPathComponent(".vn-revival-staging-\(token)", isDirectory: true)
        let backup = parent.appendingPathComponent(".vn-revival-backup-\(token)", isDirectory: true)
        try fileManager.copyItem(at: payload, to: staging)
        do {
            if fileManager.fileExists(atPath: destination.path) {
                try fileManager.moveItem(at: destination, to: backup)
            }
            try fileManager.moveItem(at: staging, to: destination)
            if fileManager.fileExists(atPath: backup.path) {
                try fileManager.removeItem(at: backup)
            }
        } catch {
            try? fileManager.removeItem(at: staging)
            if !fileManager.fileExists(atPath: destination.path),
               fileManager.fileExists(atPath: backup.path) {
                try? fileManager.moveItem(at: backup, to: destination)
            }
            throw error
        }
    }

    private func recoverInterruptedReplacement(destination: URL, uniqueID: String) throws {
        let parent = destination.deletingLastPathComponent()
        let entries = try fileManager.contentsOfDirectory(
            at: parent,
            includingPropertiesForKeys: [.contentModificationDateKey],
            options: []
        )
        let specificStagingPrefix = ".vn-revival-staging-\(uniqueID)-"
        let specificBackupPrefix = ".vn-revival-backup-\(uniqueID)-"
        let staging = entries.filter {
            $0.lastPathComponent.hasPrefix(specificStagingPrefix)
                || ($0.lastPathComponent.hasPrefix(".vn-revival-staging-")
                    && folderHasUniqueID($0, uniqueID: uniqueID))
        }
        var backups = entries.filter {
            $0.lastPathComponent.hasPrefix(specificBackupPrefix)
                || ($0.lastPathComponent.hasPrefix(".vn-revival-backup-")
                    && folderHasUniqueID($0, uniqueID: uniqueID))
        }

        for artifact in staging {
            try fileManager.removeItem(at: artifact)
        }

        if !fileManager.fileExists(atPath: destination.path), !backups.isEmpty {
            backups.sort {
                let left = (try? $0.resourceValues(forKeys: [.contentModificationDateKey]))?
                    .contentModificationDate ?? .distantPast
                let right = (try? $1.resourceValues(forKeys: [.contentModificationDateKey]))?
                    .contentModificationDate ?? .distantPast
                return left > right
            }
            try fileManager.moveItem(at: backups.removeFirst(), to: destination)
        }

        if fileManager.fileExists(atPath: destination.path),
           folderHasUniqueID(destination, uniqueID: uniqueID) {
            for artifact in backups {
                try fileManager.removeItem(at: artifact)
            }
        }
    }

    private func removeOwnedLegacyPackages(
        _ packages: [LegacyTranslationPackage],
        from installation: GameInstallation
    ) throws {
        for package in packages {
            let directory = installation.modsDirectory.appendingPathComponent(
                package.modFolderName,
                isDirectory: true
            )
            if ownsFolder(directory, uniqueID: package.uniqueID) {
                try fileManager.removeItem(at: directory)
            }
        }
    }
}

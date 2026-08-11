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

enum InstallerError: LocalizedError {
    case invalidGameFolder
    case missingPrerequisites
    case missingPayload
    case packageMismatch
    case foreignFolder(URL)
    case malformedManifest(URL)

    var errorDescription: String? {
        switch self {
        case .invalidGameFolder:
            return "В выбранной папке не найдена Stardew Valley."
        case .missingPrerequisites:
            return "Сначала установите SMAPI и Content Patcher."
        case .missingPayload:
            return "В приложении отсутствует пакет мода."
        case .packageMismatch:
            return "Конфигурация языка не совпадает с пакетом перевода."
        case .foreignFolder(let url):
            return "Папка \(url.lastPathComponent) принадлежит другому моду и не будет перезаписана."
        case .malformedManifest(let url):
            return "Не удалось проверить manifest.json в \(url.path)."
        }
    }
}

struct InstallerCore {
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
        let directory = installation.executableDirectory
        let smapiMarkers = ["StardewModdingAPI", "StardewModdingAPI.exe", "StardewModdingAPI.dll"]
        let smapiFound = smapiMarkers.contains {
            fileManager.fileExists(atPath: directory.appendingPathComponent($0).path)
        }
        let contentPatcherFound = ownsFolder(
            installation.modsDirectory.appendingPathComponent("ContentPatcher", isDirectory: true),
            uniqueID: "Pathoschild.ContentPatcher"
        )
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
        guard payloadHasLanguageCode(payload, languageCode: package.languageCode) else {
            throw InstallerError.packageMismatch
        }
        try replaceOwnedFolder(
            payload: payload,
            destination: installation.modDirectory(for: package),
            uniqueID: package.uniqueID
        )
    }

    func installContentPatcher(payload: URL, into installation: GameInstallation) throws {
        let destination = installation.modsDirectory.appendingPathComponent("ContentPatcher", isDirectory: true)
        guard folderHasUniqueID(payload, uniqueID: "Pathoschild.ContentPatcher") else {
            throw InstallerError.malformedManifest(payload)
        }
        try replaceOwnedFolder(
            payload: payload,
            destination: destination,
            uniqueID: "Pathoschild.ContentPatcher"
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

    func payloadHasLanguageCode(_ folder: URL, languageCode: String) -> Bool {
        let content = folder.appendingPathComponent("content.json")
        guard let data = try? Data(contentsOf: content),
              let json = try? JSONSerialization.jsonObject(with: data) else {
            return false
        }
        return containsLanguageCode(json, expected: languageCode)
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
        if fileManager.fileExists(atPath: destination.path),
           !folderHasUniqueID(destination, uniqueID: uniqueID) {
            throw InstallerError.foreignFolder(destination)
        }

        let token = UUID().uuidString
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
}

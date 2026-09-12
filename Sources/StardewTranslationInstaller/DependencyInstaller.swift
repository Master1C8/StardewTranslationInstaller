import CryptoKit
import Foundation

struct DependencySpec: Sendable {
    let name: String
    let version: String
    let url: URL
    let sha256: String
}

enum DependencyProgress: Sendable {
    case downloadingSMAPI(String)
    case downloadingContentPatcher(String)
}

enum DependencyError: LocalizedError {
    case badResponse(String)
    case checksumMismatch(String)
    case archiveLayout(String)
    case commandFailed(String, Int32, String)
    case installationDidNotComplete(String)

    var errorDescription: String? {
        switch self {
        case .badResponse(let name):
            return "Could not download \(name) from the official server."
        case .checksumMismatch(let name):
            return "The \(name) checksum did not match. Installation was stopped."
        case .archiveLayout(let name):
            return "The \(name) archive does not contain the expected files."
        case .commandFailed(let name, let code, let output):
            let details = output.trimmingCharacters(in: .whitespacesAndNewlines)
            return "\(name) exited with code \(code).\(details.isEmpty ? "" : "\n\(details)")"
        case .installationDidNotComplete(let name):
            return "\(name) was not found in the game folder after installation."
        }
    }
}

actor DependencyInstaller {
    static let smapi = DependencySpec(
        name: "SMAPI",
        version: InstallerCore.minimumSMAPIVersion,
        url: URL(string: "https://github.com/Pathoschild/SMAPI/releases/download/4.5.2/SMAPI-4.5.2-installer.zip")!,
        sha256: "dd01ddca7b566bfe0d3b3d2d03833496abc56c53da976241f2ab443f5484acc4"
    )
    static let contentPatcher = DependencySpec(
        name: "Content Patcher",
        version: InstallerCore.minimumContentPatcherVersion,
        url: URL(string: "https://www.curseforge.com/api/v1/mods/275441/files/7759981/download")!,
        sha256: "22962ecbeda204d207f66f4dded727a2ce67134f7decdd249c1024bbc4576817"
    )

    private let fileManager = FileManager.default
    private let core = InstallerCore()

    func installMissingDependencies(
        into installation: GameInstallation,
        progress: @escaping @Sendable (DependencyProgress) async -> Void
    ) async throws {
        var current = core.status(for: installation)
        if !current.smapiFound {
            await progress(.downloadingSMAPI(Self.smapi.version))
            try await installSMAPI(into: installation)
            current = core.status(for: installation)
            guard current.smapiFound else {
                throw DependencyError.installationDidNotComplete(Self.smapi.name)
            }
        }

        if !current.contentPatcherFound {
            await progress(.downloadingContentPatcher(Self.contentPatcher.version))
            try await installContentPatcher(into: installation)
            current = core.status(for: installation)
            guard current.contentPatcherFound else {
                throw DependencyError.installationDidNotComplete(Self.contentPatcher.name)
            }
        }
    }

    private func installSMAPI(into installation: GameInstallation) async throws {
        let working = try makeWorkingDirectory()
        defer { try? fileManager.removeItem(at: working) }
        let archive = try await downloadVerified(Self.smapi, into: working)
        let extracted = working.appendingPathComponent("extracted", isDirectory: true)
        try fileManager.createDirectory(at: extracted, withIntermediateDirectories: true)
        _ = try await Self.runProcess(
            executable: URL(fileURLWithPath: "/usr/bin/ditto"),
            arguments: ["-x", "-k", archive.path, extracted.path],
            name: "Extracting SMAPI"
        )

        guard let executable = findFile(named: "SMAPI.Installer", below: extracted),
              executable.path.contains("/internal/macOS/") else {
            throw DependencyError.archiveLayout(Self.smapi.name)
        }
        try fileManager.setAttributes([.posixPermissions: 0o755], ofItemAtPath: executable.path)
        _ = try await Self.runProcess(
            executable: executable,
            arguments: [
                "--install",
                "--game-path", installation.executableDirectory.path,
                "--no-prompt",
            ],
            name: "SMAPI installer"
        )
    }

    private func installContentPatcher(into installation: GameInstallation) async throws {
        let working = try makeWorkingDirectory()
        defer { try? fileManager.removeItem(at: working) }
        let archive = try await downloadVerified(Self.contentPatcher, into: working)
        let extracted = working.appendingPathComponent("extracted", isDirectory: true)
        try fileManager.createDirectory(at: extracted, withIntermediateDirectories: true)
        _ = try await Self.runProcess(
            executable: URL(fileURLWithPath: "/usr/bin/ditto"),
            arguments: ["-x", "-k", archive.path, extracted.path],
            name: "Extracting Content Patcher"
        )
        guard let payload = findFolder(
            uniqueID: "Pathoschild.ContentPatcher",
            below: extracted
        ) else {
            throw DependencyError.archiveLayout(Self.contentPatcher.name)
        }
        try core.installContentPatcher(payload: payload, into: installation)
    }

    private func downloadVerified(_ spec: DependencySpec, into directory: URL) async throws -> URL {
        let (temporaryURL, response) = try await URLSession.shared.download(from: spec.url)
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
            throw DependencyError.badResponse(spec.name)
        }
        let destination = directory.appendingPathComponent("\(spec.name)-\(spec.version).zip")
        try fileManager.moveItem(at: temporaryURL, to: destination)
        let found = try Self.sha256(of: destination)
        guard found == spec.sha256 else {
            throw DependencyError.checksumMismatch(spec.name)
        }
        return destination
    }

    private func makeWorkingDirectory() throws -> URL {
        let directory = fileManager.temporaryDirectory
            .appendingPathComponent("vn-revival-installer-\(UUID().uuidString)", isDirectory: true)
        try fileManager.createDirectory(at: directory, withIntermediateDirectories: true)
        return directory
    }

    private func findFile(named name: String, below root: URL) -> URL? {
        let keys: [URLResourceKey] = [.isRegularFileKey]
        guard let enumerator = fileManager.enumerator(
            at: root,
            includingPropertiesForKeys: keys,
            options: [.skipsHiddenFiles]
        ) else { return nil }
        for case let url as URL in enumerator where url.lastPathComponent == name {
            return url
        }
        return nil
    }

    private func findFolder(uniqueID: String, below root: URL) -> URL? {
        let keys: [URLResourceKey] = [.isDirectoryKey]
        guard let enumerator = fileManager.enumerator(
            at: root,
            includingPropertiesForKeys: keys,
            options: [.skipsHiddenFiles]
        ) else { return nil }
        for case let url as URL in enumerator {
            if core.folderHasUniqueID(url, uniqueID: uniqueID) { return url }
        }
        return nil
    }

    static func sha256(of url: URL) throws -> String {
        let data = try Data(contentsOf: url, options: .mappedIfSafe)
        return SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined()
    }

    private static func runProcess(
        executable: URL,
        arguments: [String],
        name: String
    ) async throws -> String {
        try await Task.detached {
            let fileManager = FileManager.default
            let logURL = fileManager.temporaryDirectory
                .appendingPathComponent("stardew-installer-\(UUID().uuidString).log")
            guard fileManager.createFile(atPath: logURL.path, contents: nil) else {
                throw DependencyError.commandFailed(name, -1, "Could not create a temporary log file.")
            }
            defer { try? fileManager.removeItem(at: logURL) }

            let logHandle = try FileHandle(forWritingTo: logURL)
            let process = Process()
            process.executableURL = executable
            process.arguments = arguments
            process.standardOutput = logHandle
            process.standardError = logHandle
            do {
                try process.run()
            } catch {
                try? logHandle.close()
                throw error
            }
            process.waitUntilExit()
            try logHandle.close()
            let data = try Data(contentsOf: logURL)
            let output = String(decoding: data, as: UTF8.self)
            guard process.terminationStatus == 0 else {
                throw DependencyError.commandFailed(name, process.terminationStatus, output)
            }
            return output
        }.value
    }
}

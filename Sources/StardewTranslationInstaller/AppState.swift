import AppKit
import Foundation

enum InstallerPhase: Equatable {
    case preparing
    case installing
    case ready
    case failed
}

@MainActor
final class AppState: ObservableObject {
    @Published private(set) var phase: InstallerPhase = .preparing
    @Published private(set) var message: String
    @Published private(set) var copy: InstallerCopy

    private var installation: GameInstallation?
    private var hasStarted = false
    private var package: TranslationPackage?
    private var packageLoadError: Error?
    private let core = InstallerCore()
    private let dependencyInstaller = DependencyInstaller()

    init() {
        let fallback = InstallerCopy.fallback
        copy = fallback
        message = fallback.preparingMessage
        do {
            let urls = try Self.resourceURLs()
            let loaded = try TranslationPackage.load(from: urls.config)
            package = loaded
            copy = loaded.copy
            message = loaded.copy.preparingMessage
        } catch {
            packageLoadError = error
        }
    }

    var phaseTitle: String {
        switch phase {
        case .preparing: copy.preparingTitle
        case .installing: copy.installingTitle
        case .ready: copy.readyTitle
        case .failed: copy.failedTitle
        }
    }

    func start() async {
        guard !hasStarted else { return }
        hasStarted = true
        phase = .preparing
        message = copy.findingGameMessage

        guard let package else {
            return fail(packageLoadError?.localizedDescription ?? copy.installationErrorMessage)
        }
        if installation == nil {
            installation = core.detectInstallation()
        }
        guard let installation else { return fail(copy.gameNotFoundMessage) }
        guard let resources = try? Self.resourceURLs() else {
            return fail(copy.installationErrorMessage)
        }

        phase = .installing
        do {
            try await dependencyInstaller.installMissingDependencies(
                into: installation
            ) { [weak self] progress in
                await MainActor.run {
                    guard let self else { return }
                    self.message = self.copy.dependencyMessage(progress)
                }
            }
            message = copy.installingTranslationMessage
            try core.installLanguageSwitcher(
                payload: resources.languageSwitcher,
                into: installation
            )
            try core.install(payload: resources.payload, package: package, into: installation)
            phase = .ready
            message = copy.installedMessage
        } catch {
            fail(copy.installationErrorMessage)
        }
    }

    func retry() async {
        hasStarted = false
        await start()
    }

    func chooseGameFolder() async {
        let panel = NSOpenPanel()
        panel.title = copy.chooseGameTitle
        panel.message = copy.chooseGameMessage
        panel.prompt = copy.chooseGamePrompt
        panel.canChooseDirectories = true
        panel.canChooseFiles = false
        panel.allowsMultipleSelection = false
        guard panel.runModal() == .OK, let url = panel.url else { return }
        guard let found = core.resolveInstallation(url) else {
            return fail(copy.gameNotFoundMessage)
        }
        installation = found
        await retry()
    }

    func launchGame() {
        guard phase == .ready, let package else { return }
        guard let steamURL = URL(string: "steam://rungameid/\(package.steamAppID)"),
              NSWorkspace.shared.open(steamURL) else {
            return fail(copy.steamFailedMessage)
        }
        message = copy.launchingMessage
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            NSApplication.shared.terminate(nil)
        }
    }

    private static func resourceURLs() throws -> (config: URL, payload: URL, languageSwitcher: URL) {
        let bundleName = "StardewTranslationInstaller_StardewTranslationInstaller.bundle"
        guard let resources = Bundle.main.resourceURL,
              let resourceBundle = Bundle(
                url: resources.appendingPathComponent(bundleName, isDirectory: true)
              ),
              let config = resourceBundle.url(forResource: "PackageConfig", withExtension: "json"),
              let payload = resourceBundle.url(forResource: "ModPayload", withExtension: nil),
              let languageSwitcher = resourceBundle.url(
                  forResource: "LanguageSwitcherPayload",
                  withExtension: nil
              ) else {
            throw InstallerError.missingPayload
        }
        return (config, payload, languageSwitcher)
    }

    private func fail(_ text: String) {
        phase = .failed
        message = text
    }
}

private extension InstallerCopy {
    static let fallback = InstallerCopy(
        windowTitle: "Stardew Valley Translation",
        preparingTitle: "Stardew Valley Translation",
        installingTitle: "Installing translation",
        readyTitle: "Ready",
        failedTitle: "Installation failed",
        preparingMessage: "Preparing installation…",
        findingGameMessage: "Finding Stardew Valley…",
        gameNotFoundMessage: "Stardew Valley was not found. Choose the game folder.",
        chooseGameTitle: "Choose Stardew Valley",
        chooseGameMessage: "Choose the Stardew Valley or Contents/MacOS folder.",
        chooseGamePrompt: "Choose",
        installingTranslationMessage: "Installing translation…",
        installedMessage: "Translation installed",
        launchingMessage: "Launching Stardew Valley…",
        steamFailedMessage: "Steam could not be opened. Launch Stardew Valley from your Steam library.",
        installationErrorMessage: "Installation did not finish. Check your internet connection and try again.",
        downloadingSMAPI: "Downloading SMAPI {version}…",
        downloadingContentPatcher: "Downloading Content Patcher {version}…",
        launchButton: "Launch game",
        chooseGameButton: "Choose game…",
        retryButton: "Retry",
        waitHint: "This may take a few minutes"
    )
}

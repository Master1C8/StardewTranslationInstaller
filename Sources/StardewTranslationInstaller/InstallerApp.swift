import SwiftUI

@main
struct StardewTranslationInstallerApp: App {
    @StateObject private var state = AppState()

    var body: some Scene {
        WindowGroup(state.copy.windowTitle) {
            ContentView(state: state)
                .frame(width: 460, height: 350)
        }
        .windowResizability(.contentSize)
    }
}

struct ContentView: View {
    @ObservedObject var state: AppState

    var body: some View {
        VStack(spacing: 22) {
            Spacer(minLength: 4)

            Image(systemName: state.phase == .ready ? "checkmark.circle.fill" : iconName)
                .font(.system(size: 60, weight: .semibold))
                .foregroundStyle(iconColor)
                .symbolEffect(.pulse, isActive: state.phase == .installing)

            VStack(spacing: 8) {
                Text(state.phaseTitle)
                    .font(.system(size: 27, weight: .bold, design: .rounded))
                    .multilineTextAlignment(.center)
                if state.phase == .failed {
                    ScrollView {
                        Text(state.message)
                            .foregroundStyle(Color.red)
                            .multilineTextAlignment(.leading)
                            .textSelection(.enabled)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .frame(maxWidth: 380, maxHeight: 105)
                } else {
                    Text(state.message)
                        .foregroundStyle(Color.secondary)
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: 380)
                }
            }

            if state.phase == .preparing || state.phase == .installing {
                ProgressView()
                    .progressViewStyle(.linear)
                    .frame(width: 300)
            }

            Spacer()

            controls
        }
        .padding(30)
        .task { await state.start() }
    }

    @ViewBuilder
    private var controls: some View {
        switch state.phase {
        case .ready:
            Button(state.copy.launchButton, action: state.launchGame)
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
                .keyboardShortcut(.defaultAction)
        case .failed:
            HStack {
                Button(state.copy.chooseGameButton) {
                    Task { await state.chooseGameFolder() }
                }
                Button(state.copy.retryButton) {
                    Task { await state.retry() }
                }
                .buttonStyle(.borderedProminent)
                .keyboardShortcut(.defaultAction)
            }
        case .preparing, .installing:
            Text(state.copy.waitHint)
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
    }

    private var iconName: String {
        switch state.phase {
        case .preparing, .installing: "arrow.down.circle.fill"
        case .ready: "checkmark.circle.fill"
        case .failed: "exclamationmark.triangle.fill"
        }
    }

    private var iconColor: Color {
        switch state.phase {
        case .preparing, .installing: .accentColor
        case .ready: .green
        case .failed: .orange
        }
    }
}

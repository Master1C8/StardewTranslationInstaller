// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "StardewTranslationInstaller",
    platforms: [.macOS(.v14)],
    products: [
        .executable(name: "StardewTranslationInstaller", targets: ["StardewTranslationInstaller"]),
    ],
    targets: [
        .executableTarget(
            name: "StardewTranslationInstaller",
            resources: [
                .copy("Resources/ModPayload"),
                .copy("Resources/LanguageSwitcherPayload"),
                .copy("Resources/PackageConfig.json"),
            ]
        ),
        .testTarget(
            name: "StardewTranslationInstallerTests",
            dependencies: ["StardewTranslationInstaller"]
        ),
    ]
)

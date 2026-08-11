#!/bin/zsh
set -euo pipefail

project_dir="${0:A:h:h}"
cd "$project_dir"

export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"
export CLANG_MODULE_CACHE_PATH="${CLANG_MODULE_CACHE_PATH:-/private/tmp/stardew-installer-swift-cache}"

swift build -c release --disable-sandbox

app="$project_dir/dist/Stardew Translation Installer.app"
binary="$project_dir/.build/release/StardewTranslationInstaller"
resource_bundle="$project_dir/.build/release/StardewTranslationInstaller_StardewTranslationInstaller.bundle"

mkdir -p "$app/Contents/MacOS" "$app/Contents/Resources"
cp "$binary" "$app/Contents/MacOS/Stardew Translation Installer"
if [[ -d "$resource_bundle" ]]; then
  cp -R "$resource_bundle" "$app/Contents/Resources/"
fi
cp "$project_dir/App/Info.plist" "$app/Contents/Info.plist"
codesign --force --deep --sign - "$app"
echo "$app"

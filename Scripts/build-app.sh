#!/bin/zsh
set -euo pipefail

project_dir="${0:A:h:h}"
cd "$project_dir"

export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"
export CLANG_MODULE_CACHE_PATH="${CLANG_MODULE_CACHE_PATH:-/private/tmp/stardew-installer-swift-cache}"
export SWIFT_MODULECACHE_PATH="${SWIFT_MODULECACHE_PATH:-$CLANG_MODULE_CACHE_PATH}"
export SWIFTPM_MODULECACHE_OVERRIDE="${SWIFTPM_MODULECACHE_OVERRIDE:-$CLANG_MODULE_CACHE_PATH}"
scratch_path="${VN_SWIFT_SCRATCH_PATH:-$project_dir/.build}"

swift build -c release --disable-sandbox --scratch-path "$scratch_path"

app="$project_dir/dist/Stardew Translation Installer.app"
binary="$scratch_path/release/StardewTranslationInstaller"
resource_bundle="$scratch_path/release/StardewTranslationInstaller_StardewTranslationInstaller.bundle"

# The app is a generated artifact. Recreate it so deleted resources can never
# survive an incremental build through cp -R's merge behavior.
rm -rf "$app"
mkdir -p "$app/Contents/MacOS" "$app/Contents/Resources"
cp "$binary" "$app/Contents/MacOS/Stardew Translation Installer"
if [[ -d "$resource_bundle" ]]; then
  cp -R "$resource_bundle" "$app/Contents/Resources/"
fi
cp "$project_dir/App/Info.plist" "$app/Contents/Info.plist"
codesign --force --deep --sign - "$app"
echo "$app"

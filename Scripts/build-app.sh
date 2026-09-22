#!/bin/zsh
set -euo pipefail

project_dir="${0:A:h:h}"
cd "$project_dir"

export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"
export CLANG_MODULE_CACHE_PATH="${CLANG_MODULE_CACHE_PATH:-/private/tmp/stardew-installer-swift-cache}"
export SWIFT_MODULECACHE_PATH="${SWIFT_MODULECACHE_PATH:-$CLANG_MODULE_CACHE_PATH}"
export SWIFTPM_MODULECACHE_OVERRIDE="${SWIFTPM_MODULECACHE_OVERRIDE:-$CLANG_MODULE_CACHE_PATH}"
scratch_root="${VN_SWIFT_SCRATCH_PATH:-$project_dir/.build-app}"
architectures=(arm64 x86_64)
arm_binary_dir=""
x86_binary_dir=""

"$project_dir/Scripts/compress-xnb-fonts.swift" --verify
"$project_dir/Scripts/build-language-switcher.sh"

for architecture in "${architectures[@]}"; do
  architecture_scratch="$scratch_root/$architecture"
  build_arguments=(
    -c release \
    --disable-sandbox \
    --scratch-path "$architecture_scratch" \
    --triple "${architecture}-apple-macosx14.0"
  )
  swift build "${build_arguments[@]}"
  binary_dir="$(swift build "${build_arguments[@]}" --show-bin-path)"
  if [[ "$architecture" == "arm64" ]]; then
    arm_binary_dir="$binary_dir"
  else
    x86_binary_dir="$binary_dir"
  fi
done

app="$project_dir/dist/Stardew Translation Installer.app"
arm_binary="$arm_binary_dir/StardewTranslationInstaller"
x86_binary="$x86_binary_dir/StardewTranslationInstaller"
resource_bundle="$arm_binary_dir/StardewTranslationInstaller_StardewTranslationInstaller.bundle"
universal_binary="$scratch_root/StardewTranslationInstaller-universal"

lipo -create "$arm_binary" "$x86_binary" -output "$universal_binary"

# The app is a generated artifact. Recreate it so deleted resources can never
# survive an incremental build through cp -R's merge behavior.
rm -rf "$app"
mkdir -p "$app/Contents/MacOS" "$app/Contents/Resources"
cp "$universal_binary" "$app/Contents/MacOS/Stardew Translation Installer"
if [[ -d "$resource_bundle" ]]; then
  cp -R "$resource_bundle" "$app/Contents/Resources/"
fi
cp "$project_dir/App/Info.plist" "$app/Contents/Info.plist"
cp "$project_dir/App/App.icns" "$app/Contents/Resources/App.icns"
identity="${CODESIGN_IDENTITY:--}"
if [[ "$identity" == "-" ]]; then
  codesign --force --deep --sign - "$app"
else
  codesign --force --deep --options runtime --timestamp --sign "$identity" "$app"
fi
echo "$app"

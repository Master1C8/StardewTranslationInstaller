#!/bin/zsh
set -euo pipefail

project_dir="${0:A:h:h}"
cd "$project_dir"

compiler="${WINDOWS_CC:-/opt/homebrew/bin/x86_64-w64-mingw32-gcc}"
resource_compiler="${WINDOWS_WINDRES:-/opt/homebrew/bin/x86_64-w64-mingw32-windres}"
image_converter="${MAGICK:-/opt/homebrew/bin/magick}"
for tool in "$compiler" "$resource_compiler" "$image_converter" /usr/bin/sips /usr/bin/zip /usr/bin/unzip; do
  [[ -x "$tool" ]] || { echo "Required build tool is missing: $tool" >&2; exit 1; }
done

version="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$project_dir/App/Info.plist")"
[[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "Invalid application version: $version" >&2; exit 1; }
version_parts=("${(@s:.:)version}")
grep -Fq "VN Revival Stardew Installer/$version" "$project_dir/Windows/install.ps1" || {
  echo "Windows installer version is not synchronized with App/Info.plist: $version" >&2
  exit 1
}

stage="$project_dir/dist/Stardew Translation Installer-Windows-$version"
archive="$project_dir/dist/Stardew Translation Installer-Windows-$version.zip"
work="$(mktemp -d "${TMPDIR:-/tmp}/stardew-windows-release.XXXXXX")"
trap 'rm -rf "$work"' EXIT

rm -rf "$stage"
rm -f "$archive"
mkdir -p "$stage/Resources"

/usr/bin/sips -s format png "$project_dir/App/App.icns" --out "$work/App.png" >/dev/null
"$image_converter" "$work/App.png" -define icon:auto-resize=256,128,64,48,32,16 "$work/App.ico"
cp "$project_dir/Windows/Installer.manifest" "$work/Installer.manifest"
cp "$project_dir/Windows/Installer.rc" "$work/Installer.rc"

(
  cd "$work"
  "$resource_compiler" \
    -DVERSION_MAJOR="${version_parts[1]}" \
    -DVERSION_MINOR="${version_parts[2]}" \
    -DVERSION_PATCH="${version_parts[3]}" \
    -DVERSION_TEXT="\\\"$version\\\"" \
    Installer.rc -O coff -o InstallerResources.o
)

"$compiler" \
  -std=c11 -O2 -Wall -Wextra -Werror -municode -mwindows \
  "$project_dir/Windows/StardewTranslationInstaller.c" \
  "$work/InstallerResources.o" \
  -o "$stage/Stardew Translation Installer.exe" \
  -lcomctl32 -lshell32 -lole32 -luuid

cp "$project_dir/Windows/install.ps1" "$stage/Resources/install.ps1"
cp "$project_dir/Windows/README.txt" "$stage/README.txt"
cp "$project_dir/Sources/StardewTranslationInstaller/Resources/PackageConfig.json" "$stage/Resources/PackageConfig.json"
cp -R "$project_dir/Sources/StardewTranslationInstaller/Resources/ModPayload" "$stage/Resources/ModPayload"
cp -R "$project_dir/Sources/StardewTranslationInstaller/Resources/LanguageSwitcherPayload" "$stage/Resources/LanguageSwitcherPayload"

file "$stage/Stardew Translation Installer.exe" | grep -q 'PE32+ executable.*x86-64'
CLANG_MODULE_CACHE_PATH="$work/clang-module-cache" \
SWIFT_MODULECACHE_PATH="$work/swift-module-cache" \
  "$project_dir/Scripts/compress-xnb-fonts.swift" --verify

(
  cd "$project_dir/dist"
  /usr/bin/zip -q -r -X "${archive:t}" "${stage:t}"
)
/usr/bin/unzip -t "$archive" >/dev/null
echo "$archive"

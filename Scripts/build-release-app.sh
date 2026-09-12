#!/bin/zsh
set -euo pipefail

project_dir="${0:A:h:h}"
app="$project_dir/dist/Stardew Translation Installer.app"
version="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$project_dir/App/Info.plist")"
archive="$project_dir/dist/Stardew Translation Installer-$version.zip"
work="$(mktemp -d "${TMPDIR:-/tmp}/vn-revival-notary.XXXXXX")"
trap 'rm -rf "$work"' EXIT

: "${CODESIGN_IDENTITY:?Set CODESIGN_IDENTITY to a Developer ID Application identity.}"
: "${NOTARY_KEYCHAIN_PROFILE:?Set NOTARY_KEYCHAIN_PROFILE to an xcrun notarytool keychain profile.}"

"$project_dir/Scripts/release-audit.sh"
CODESIGN_IDENTITY="$CODESIGN_IDENTITY" "$project_dir/Scripts/build-app.sh"
codesign --verify --deep --strict --verbose=2 "$app"
lipo "$app/Contents/MacOS/Stardew Translation Installer" -verify_arch arm64 x86_64
ditto -c -k --keepParent "$app" "$work/submission.zip"
xcrun notarytool submit "$work/submission.zip" \
  --keychain-profile "$NOTARY_KEYCHAIN_PROFILE" \
  --wait
xcrun stapler staple "$app"
xcrun stapler validate "$app"
ditto -c -k --keepParent "$app" "$archive"
unzip -t "$archive"
echo "$archive"

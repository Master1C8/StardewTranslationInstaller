#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$project_root"

export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"
export CLANG_MODULE_CACHE_PATH="${CLANG_MODULE_CACHE_PATH:-/private/tmp/stardew-installer-swift-cache}"
export SWIFT_MODULECACHE_PATH="${SWIFT_MODULECACHE_PATH:-$CLANG_MODULE_CACHE_PATH}"
export SWIFTPM_MODULECACHE_OVERRIDE="${SWIFTPM_MODULECACHE_OVERRIDE:-$CLANG_MODULE_CACHE_PATH}"
python_bin="${PYTHON_BIN:-python3}"

node Scripts/audit-release-structure.mjs
./Scripts/compress-xnb-fonts.swift --verify
swift test --disable-sandbox
node Scripts/audit-character-creation-layout.mjs
node Scripts/audit-bitmap-font-coverage.mjs
./Scripts/build-language-switcher.sh
./Scripts/run-hebrew-rtl-probe.sh
"$python_bin" Scripts/greek-runtime-probe.py
"$python_bin" Scripts/check-bulgarian-runtime.py
./Scripts/build-app.sh
codesign --verify --deep --strict "dist/Stardew Translation Installer.app"
lipo "dist/Stardew Translation Installer.app/Contents/MacOS/Stardew Translation Installer" \
  -verify_arch arm64 x86_64

echo "Technical release audit passed. Locale editorial and glossary gates remain separate mandatory checks."

#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$project_root"

export DEVELOPER_DIR="${DEVELOPER_DIR:-$(xcode-select -p)}"
export CLANG_MODULE_CACHE_PATH="${CLANG_MODULE_CACHE_PATH:-/private/tmp/stardew-installer-swift-cache}"
export SWIFT_MODULECACHE_PATH="${SWIFT_MODULECACHE_PATH:-$CLANG_MODULE_CACHE_PATH}"
export SWIFTPM_MODULECACHE_OVERRIDE="${SWIFTPM_MODULECACHE_OVERRIDE:-$CLANG_MODULE_CACHE_PATH}"
python_bin="${PYTHON_BIN:-$project_root/.venv/bin/python}"
if [[ -n "${STARDEW_GAME_PATH:-}" ]]; then
  export STARDEW_SMALL_FONT="${STARDEW_SMALL_FONT:-$STARDEW_GAME_PATH/../Resources/Content/Fonts/SmallFont.xnb}"
fi

PYTHON_BIN="$python_bin" ./Scripts/audit-locale-data.sh
./Scripts/build-title-buttons.sh --check
./Scripts/compress-xnb-fonts.swift --verify
./Scripts/test-swift.sh
node Scripts/audit-character-creation-layout.mjs
node Scripts/audit-bitmap-font-coverage.mjs
./Scripts/build-language-switcher.sh
./Scripts/run-hebrew-rtl-probe.sh
./Scripts/run-language-switcher-probe.sh
"$python_bin" Scripts/greek-runtime-probe.py
"$python_bin" Scripts/check-bulgarian-runtime.py
./Scripts/build-app.sh
codesign --verify --deep --strict "${VNREVIVAL_RELEASE_DIR:-dist}/Stardew Translation Installer.app"
lipo "${VNREVIVAL_RELEASE_DIR:-dist}/Stardew Translation Installer.app/Contents/MacOS/Stardew Translation Installer" \
  -verify_arch arm64 x86_64

echo "Technical release audit passed. Glossary publication and live visual gates remain separate mandatory checks."

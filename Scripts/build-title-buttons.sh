#!/bin/zsh
set -euo pipefail

script_dir=${0:A:h}
project_root=${script_dir:h}
assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets/title"
renderer=/private/tmp/stardew-render-shaped-text

SWIFT_MODULECACHE_PATH=/private/tmp/stardew-swift-module-cache \
CLANG_MODULE_CACHE_PATH=/private/tmp/stardew-swift-module-cache \
/usr/bin/swiftc "$project_root/Scripts/render-shaped-text.swift" -o "$renderer"

/usr/bin/python3 "$project_root/Scripts/generate-title-buttons.py" \
  "$assets" "$renderer" \
  --template "$project_root/Scripts/assets/title-button-template.png" "$@"

#!/bin/zsh
set -euo pipefail

script_dir=${0:A:h}
project_root=${script_dir:h}
font_file=${VN_MARATHI_FONT:-/System/Library/Fonts/Supplemental/Devanagari\ Sangam\ MN.ttc}
assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets"
renderer=/private/tmp/stardew-render-shaped-text
button_output=/private/tmp/stardew-button-marathi.png
title_output=/private/tmp/stardew-titlebuttons-marathi.png

SWIFT_MODULECACHE_PATH=/private/tmp/stardew-swift-module-cache \
CLANG_MODULE_CACHE_PATH=/private/tmp/stardew-swift-module-cache \
/usr/bin/swiftc "$project_root/Scripts/render-shaped-text.swift" -o "$renderer"

VN_SHAPED_TEXT_RENDERER="$renderer" VN_LANGUAGE_LABEL='मराठी' \
/usr/bin/python3 "$project_root/Scripts/generate-kannada-button.py" \
  "$assets/button-marathi.png" "$font_file" "$button_output"

VN_SHAPED_TEXT_RENDERER="$renderer" VN_TITLE_LOCALE=mr \
/usr/bin/python3 "$project_root/Scripts/generate-kannada-title.py" \
  "$assets/title/TitleButtons-marathi.png" "$font_file" "$title_output"

/bin/cp "$button_output" "$assets/button-marathi.png"
/bin/cp "$title_output" "$assets/title/TitleButtons-marathi.png"
print "Built shaped Marathi language and title labels."

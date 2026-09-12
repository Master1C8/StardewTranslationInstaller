#!/bin/zsh
set -euo pipefail

script_dir=${0:A:h}
project_root=${script_dir:h}
font_file=${VN_ARABIC_FONT:-/System/Library/Fonts/Supplemental/Arial\ Unicode.ttf}
assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets"
renderer=/private/tmp/stardew-render-shaped-text
button_output=/private/tmp/stardew-button-arabic.png
title_output=/private/tmp/stardew-titlebuttons-arabic.png
back_overlay_output=/private/tmp/stardew-titleback-arabic.png

SWIFT_MODULECACHE_PATH=/private/tmp/stardew-swift-module-cache \
CLANG_MODULE_CACHE_PATH=/private/tmp/stardew-swift-module-cache \
/usr/bin/swiftc "$project_root/Scripts/render-shaped-text.swift" -o "$renderer"

VN_SHAPED_TEXT_RENDERER="$renderer" VN_LANGUAGE_LABEL='العربية' \
/usr/bin/python3 "$project_root/Scripts/generate-kannada-button.py" \
  "$assets/button-persian.png" "$font_file" "$button_output"

VN_SHAPED_TEXT_RENDERER="$renderer" VN_TITLE_LOCALE=ar VN_TITLE_BACK_OVERLAY="$back_overlay_output" \
/usr/bin/python3 "$project_root/Scripts/generate-kannada-title.py" \
  "$assets/title/TitleButtons-persian.png" "$font_file" "$title_output"

/bin/cp "$button_output" "$assets/button-arabic.png"
/bin/cp "$title_output" "$assets/title/TitleButtons-arabic.png"
/bin/cp "$back_overlay_output" \
  "$project_root/Sources/StardewTranslationInstaller/Resources/LanguageSwitcherPayload/title-overlays/TitleBack-arabic.png"
print "Built shaped Arabic language and title labels."

#!/bin/zsh
set -euo pipefail

script_dir=${0:A:h}
project_root=${script_dir:h}
font_file=${VN_BURMESE_FONT:-/System/Library/Fonts/NotoSansMyanmar.ttc}
assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets"
renderer=/private/tmp/stardew-render-shaped-text
button_output=/private/tmp/stardew-button-burmese.png
title_output=/private/tmp/stardew-titlebuttons-burmese.png

SWIFT_MODULECACHE_PATH=/private/tmp/stardew-swift-module-cache \
CLANG_MODULE_CACHE_PATH=/private/tmp/stardew-swift-module-cache \
/usr/bin/swiftc "$project_root/Scripts/render-shaped-text.swift" -o "$renderer"

VN_SHAPED_TEXT_RENDERER="$renderer" VN_LANGUAGE_LABEL='မြန်မာ' \
/usr/bin/python3 "$project_root/Scripts/generate-kannada-button.py" \
  "$assets/button-burmese.png" "$font_file" "$button_output"

VN_SHAPED_TEXT_RENDERER="$renderer" VN_TITLE_LOCALE=my \
/usr/bin/python3 "$project_root/Scripts/generate-kannada-title.py" \
  "$assets/title/TitleButtons-burmese.png" "$font_file" "$title_output"

/bin/cp "$button_output" "$assets/button-burmese.png"
/bin/cp "$title_output" "$assets/title/TitleButtons-burmese.png"
print "Built shaped Burmese language and title labels."

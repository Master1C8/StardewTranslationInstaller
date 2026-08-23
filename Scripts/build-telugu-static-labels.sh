#!/bin/zsh
set -euo pipefail

script_dir=${0:A:h}
project_root=${script_dir:h}
font_file=${VN_TELUGU_FONT:-/System/Library/Fonts/KohinoorTelugu.ttc}
assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets"
renderer=/private/tmp/stardew-render-shaped-text
button_output=/private/tmp/stardew-button-telugu.png
title_output=/private/tmp/stardew-titlebuttons-telugu.png

SWIFT_MODULECACHE_PATH=/private/tmp/stardew-swift-module-cache \
CLANG_MODULE_CACHE_PATH=/private/tmp/stardew-swift-module-cache \
/usr/bin/swiftc "$project_root/Scripts/render-shaped-text.swift" -o "$renderer"

VN_SHAPED_TEXT_RENDERER="$renderer" VN_LANGUAGE_LABEL='తెలుగు' \
/usr/bin/python3 "$project_root/Scripts/generate-kannada-button.py" \
  "$assets/button-telugu.png" "$font_file" "$button_output"

VN_SHAPED_TEXT_RENDERER="$renderer" VN_TITLE_LOCALE=te \
/usr/bin/python3 "$project_root/Scripts/generate-kannada-title.py" \
  "$assets/title/TitleButtons-telugu.png" "$font_file" "$title_output"

/bin/cp "$button_output" "$assets/button-telugu.png"
/bin/cp "$title_output" "$assets/title/TitleButtons-telugu.png"
print "Built shaped Telugu language and title labels."

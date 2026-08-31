#!/bin/zsh
set -euo pipefail

script_dir=${0:A:h}
project_root=${script_dir:h}
assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets"
font_file=${VN_TRADITIONAL_CHINESE_FONT:-/System/Library/Fonts/Supplemental/Songti.ttc}
button_output=/private/tmp/stardew-button-traditional-chinese.png
title_output=/private/tmp/stardew-title-traditional-chinese.png

VN_FONT_INDEX=2 VN_LANGUAGE_LABEL=繁中 \
/usr/bin/python3 "$project_root/Scripts/generate-kannada-button.py" \
  "$assets/button.png" "$font_file" "$button_output"

VN_FONT_INDEX=2 VN_TITLE_LOCALE=zh-TW \
/usr/bin/python3 "$project_root/Scripts/generate-kannada-title.py" \
  "$assets/title/TitleButtons.png" "$font_file" "$title_output"

/bin/cp "$button_output" "$assets/button-traditional-chinese.png"
/bin/cp "$title_output" "$assets/title/TitleButtons-traditional-chinese.png"
print "Built Traditional Chinese language button and title labels."

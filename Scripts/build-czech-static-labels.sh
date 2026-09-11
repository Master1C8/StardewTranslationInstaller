#!/bin/zsh
set -euo pipefail

script_dir=${0:A:h}
project_root=${script_dir:h}
assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets"

/usr/bin/python3 "$project_root/Scripts/generate-czech-button.py" \
  "$assets/button.png" \
  "$assets/button-czech.png"
/usr/bin/python3 "$project_root/Scripts/generate-czech-title.py" \
  "$assets/title/TitleButtons.png" \
  "$assets/title/TitleButtons-czech.png"

print "Built Czech language and title labels."

#!/bin/zsh
set -euo pipefail

project_root="${0:A:h:h}"
assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets"

/usr/bin/python3 "$project_root/Scripts/generate-ukrainian-button.py" \
  "$assets/button-russian.png" \
  "$assets/button-ukrainian.png"
/usr/bin/python3 "$project_root/Scripts/generate-ukrainian-title.py" \
  "$assets/title/TitleButtons-russian.png" \
  "$assets/title/TitleButtons-ukrainian.png"

echo "Built Ukrainian static labels."

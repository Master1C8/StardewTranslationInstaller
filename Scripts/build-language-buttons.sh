#!/bin/zsh
set -euo pipefail

script_dir=${0:A:h}
project_root=${script_dir:h}
assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets"

/usr/bin/python3 "$project_root/Scripts/generate-language-buttons.py" \
  "$assets" \
  --template "$project_root/Scripts/assets/language-button-template.png" \
  --labels "$project_root/Scripts/assets/language-button-labels.png" "$@"

print "Built 20 unified language buttons."

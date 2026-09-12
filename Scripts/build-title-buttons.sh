#!/bin/zsh
set -euo pipefail

script_dir=${0:A:h}
project_root=${script_dir:h}
assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets/title"

/usr/bin/python3 "$project_root/Scripts/generate-title-buttons.py" \
  "$assets" \
  --overlays "$project_root/Sources/StardewTranslationInstaller/Resources/LanguageSwitcherPayload/title-overlays" \
  --template "$project_root/Scripts/assets/title-button-template.png" \
  --labels "$project_root/Scripts/assets/title-button-labels.png" \
  --back-template "$project_root/Scripts/assets/title-back-template.png" \
  --back-labels "$project_root/Scripts/assets/title-back-labels.png" \
  --developer-labels "$project_root/Scripts/assets/title-developer-labels.png" "$@"

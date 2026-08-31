#!/bin/zsh
set -euo pipefail

script_dir=${0:A:h}
project_root=${script_dir:h}
assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets"

/usr/bin/python3 "$script_dir/generate-vietnamese-button.py" \
  "$assets/button-indonesian.png" \
  "$assets/button-vietnamese.png"
/usr/bin/python3 "$script_dir/generate-vietnamese-title.py" \
  "$assets/title/TitleButtons-indonesian.png" \
  "$assets/title/TitleButtons-vietnamese.png"

print "Built Vietnamese language and title-button atlases."

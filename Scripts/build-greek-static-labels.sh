#!/bin/zsh
set -euo pipefail

script_dir=${0:A:h}
project_root=${script_dir:h}
assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets"

/usr/bin/python3 "$script_dir/generate-greek-button.py" \
  "$assets/button-indonesian.png" \
  "$assets/button-greek.png"
/usr/bin/python3 "$script_dir/generate-greek-title.py" \
  "$assets/title/TitleButtons-indonesian.png" \
  "$assets/title/TitleButtons-greek.png"

print "Built Greek language and title-button atlases."

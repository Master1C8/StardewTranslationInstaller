#!/bin/zsh
set -euo pipefail

script_dir=${0:A:h}
project_root=${script_dir:h}
python=${VN_PYTHON:-/Users/antonkrutov/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3}
assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets"

"$python" "$project_root/Scripts/generate-romanian-button.py" \
  "$assets/button.png" "$assets/button-romanian.png"
"$python" "$project_root/Scripts/generate-romanian-title.py" \
  "$assets/title/TitleButtons.png" "$assets/title/TitleButtons-romanian.png"

print "Built Romanian language and title-button atlases."

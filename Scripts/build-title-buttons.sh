#!/bin/zsh
set -euo pipefail

script_dir=${0:A:h}
project_root=${script_dir:h}
assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets/title"
python_bin="${PYTHON_BIN:-$project_root/.venv/bin/python}"

if [[ ! -x "$python_bin" ]]; then
  echo "Pinned Python environment is missing. Run 'uv sync' or set PYTHON_BIN explicitly." >&2
  exit 1
fi

"$python_bin" "$project_root/Scripts/generate-title-buttons.py" \
  "$assets" \
  --overlays "$project_root/Sources/StardewTranslationInstaller/Resources/LanguageSwitcherPayload/title-overlays" \
  --template "$project_root/Scripts/assets/title-button-template.png" \
  --labels "$project_root/Scripts/assets/title-button-labels.png" \
  --back-template "$project_root/Scripts/assets/title-back-template.png" \
  --back-labels "$project_root/Scripts/assets/title-back-labels.png" \
  --developer-labels "$project_root/Scripts/assets/title-developer-labels.png" "$@"

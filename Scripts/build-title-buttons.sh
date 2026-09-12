#!/bin/zsh
set -euo pipefail

script_dir=${0:A:h}
project_root=${script_dir:h}
assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets/title"
if [[ -n "${PYTHON_BIN:-}" ]]; then
  python_command=("$PYTHON_BIN")
elif command -v uv >/dev/null 2>&1; then
  uv_cache_dir="${UV_CACHE_DIR:-/private/tmp/stardew-installer-uv-cache}"
  python_command=(env "UV_CACHE_DIR=$uv_cache_dir" uv run --frozen --project "$project_root" python)
else
  echo "uv is required for the pinned graphics environment, or set PYTHON_BIN explicitly." >&2
  exit 1
fi

"${python_command[@]}" -c 'import PIL, fontTools' || {
  echo "The graphics dependencies are unavailable. Run 'uv sync --frozen'." >&2
  exit 1
}

"${python_command[@]}" "$project_root/Scripts/generate-title-buttons.py" \
  "$assets" \
  --overlays "$project_root/Sources/StardewTranslationInstaller/Resources/LanguageSwitcherPayload/title-overlays" \
  --template "$project_root/Scripts/assets/title-button-template.png" \
  --labels "$project_root/Scripts/assets/title-button-labels.png" \
  --back-template "$project_root/Scripts/assets/title-back-template.png" \
  --back-labels "$project_root/Scripts/assets/title-back-labels.png" \
  --developer-labels "$project_root/Scripts/assets/title-developer-labels.png" "$@"

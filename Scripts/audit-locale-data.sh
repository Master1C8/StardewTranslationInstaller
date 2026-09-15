#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "$0")/.." && pwd)"
source_root="${STARDEW_ENGLISH_ROOT:-/Users/antonkrutov/Developer/data/stardew-english-unpacked}"
python_bin="${PYTHON_BIN:-$project_root/.venv/bin/python}"
cd "$project_root"

if [[ ! -d "$source_root" ]]; then
  echo "English Stardew Valley extraction was not found at $source_root." >&2
  exit 1
fi
if [[ ! -x "$python_bin" ]]; then
  echo "Pinned Python environment was not found. Run 'uv sync --frozen' or set PYTHON_BIN." >&2
  exit 1
fi

# Russian and Polish are covered by the unified structure/font gates. The
# retained locales below also have dedicated data/editorial release auditors.
node Scripts/audit-release-structure.mjs
node Scripts/audit-filipino.mjs
node Scripts/audit-hindi.mjs --encoded
node Scripts/audit-thai.mjs
node Scripts/audit-traditional-chinese.mjs
node Scripts/audit-ukrainian-release.mjs
node Scripts/audit-vietnamese.mjs "$source_root"
node Scripts/audit-swahili.mjs "$source_root"
node Scripts/audit-persian.mjs --release
node Scripts/audit-arabic.mjs --release
node Scripts/audit-indonesian.mjs "$source_root"
"$python_bin" Scripts/audit-dutch-release.py
"$python_bin" Scripts/audit-greek.py
"$python_bin" Scripts/audit-romanian-progress.py
"$python_bin" Scripts/audit-serbian.py
"$python_bin" Scripts/audit-bulgarian-release.py
"$python_bin" Scripts/czech-full-audit.py status
"$python_bin" Scripts/audit-es-419-glossary.py
"$python_bin" Scripts/es-419-work.py audit
"$python_bin" Scripts/es-419-editorial-audit.py release

echo "Retained-locale data and editorial gates passed."

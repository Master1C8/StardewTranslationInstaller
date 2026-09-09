#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "$0")/.." && pwd)"
game_path="${STARDREW_GAME_PATH:-$HOME/Library/Application Support/Steam/steamapps/common/Stardew Valley/Contents/MacOS}"
csc_bin="${CSC_BIN:-csc}"
probe_dir="$(mktemp -d "${TMPDIR:-/tmp}/vnrevival-hebrew-probe.XXXXXX")"
trap 'rm -rf "$probe_dir"' EXIT

if ! command -v "$csc_bin" >/dev/null 2>&1; then
  echo "csc is required." >&2
  exit 1
fi
if [[ ! -x "$game_path/StardewModdingAPI" ]]; then
  echo "The Stardew Valley .NET app host was not found at $game_path." >&2
  exit 1
fi

references=()
for directory in "$game_path" "$game_path/smapi-internal"; do
  while IFS= read -r -d '' candidate; do
    if file "$candidate" | grep -q 'Mono/.Net assembly'; then
      references+=("-r:$candidate")
    fi
  done < <(find "$directory" -maxdepth 1 -type f -name '*.dll' -print0)
done
references+=("-r:$project_root/Sources/StardewTranslationInstaller/Resources/LanguageSwitcherPayload/VNRevival.LanguageSwitcher.dll")

"$csc_bin" \
  -noconfig \
  -nostdlib \
  -nullable:enable \
  -langversion:9.0 \
  -target:exe \
  -out:"$probe_dir/HebrewProbe.dll" \
  "${references[@]}" \
  "$project_root/Tools/VNRevivalHebrewProbe/Program.cs"

find "$game_path" -maxdepth 1 -type f -exec ln -s '{}' "$probe_dir/" \;
ln -s "$project_root/Sources/StardewTranslationInstaller/Resources/LanguageSwitcherPayload/VNRevival.LanguageSwitcher.dll" \
  "$probe_dir/VNRevival.LanguageSwitcher.dll"
cp "$game_path/StardewModdingAPI" "$probe_dir/HebrewProbe"
cp "$game_path/StardewModdingAPI.runtimeconfig.json" "$probe_dir/HebrewProbe.runtimeconfig.json"
cp "$game_path/StardewModdingAPI.deps.json" "$probe_dir/HebrewProbe.deps.json"
python3 -c 'import json, sys
path = sys.argv[1]
with open(path, encoding="utf-8") as stream: document = json.load(stream)
target = document["runtimeTarget"]["name"]
identity = "VNRevival.LanguageSwitcher/1.4.0"
document["targets"][target][identity] = {"runtime": {"VNRevival.LanguageSwitcher.dll": {}}}
document["libraries"][identity] = {"type": "reference", "serviceable": False, "sha512": ""}
with open(path, "w", encoding="utf-8") as stream: json.dump(document, stream, separators=(",", ":"))' \
  "$probe_dir/HebrewProbe.deps.json"

python3 -c 'from pathlib import Path; import sys
p = Path(sys.argv[1]); data = p.read_bytes()
old = b"StardewModdingAPI.dll"; new = b"HebrewProbe.dll" + b"\0" * 6
assert len(old) == len(new) and data.count(old) == 1
p.write_bytes(data.replace(old, new))' "$probe_dir/HebrewProbe"

"$probe_dir/HebrewProbe"

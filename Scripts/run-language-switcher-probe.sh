#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "$0")/.." && pwd)"
game_path="${STARDEW_GAME_PATH:-${STARDREW_GAME_PATH:-$HOME/Library/Application Support/Steam/steamapps/common/Stardew Valley/Contents/MacOS}}"
csc_bin="${CSC_BIN:-csc}"
probe_dir="$(mktemp -d "${TMPDIR:-/tmp}/vnrevival-language-switcher-probe.XXXXXX")"
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
payload="$project_root/Sources/StardewTranslationInstaller/Resources/LanguageSwitcherPayload"
references+=("-r:$payload/VNRevival.LanguageSwitcher.dll")

"$csc_bin" \
  -noconfig \
  -nostdlib \
  -nullable:enable \
  -langversion:9.0 \
  -target:exe \
  -out:"$probe_dir/LSProbe.dll" \
  "${references[@]}" \
  "$project_root/Tools/VNRevivalLanguageSwitcherProbe/Program.cs"

find "$game_path" -maxdepth 1 -type f -exec ln -s '{}' "$probe_dir/" \;
ln -s "$payload/VNRevival.LanguageSwitcher.dll" "$probe_dir/VNRevival.LanguageSwitcher.dll"
cp "$game_path/StardewModdingAPI" "$probe_dir/LanguageSwitcherProbe"
cp "$game_path/StardewModdingAPI.runtimeconfig.json" "$probe_dir/LSProbe.runtimeconfig.json"
cp "$game_path/StardewModdingAPI.deps.json" "$probe_dir/LSProbe.deps.json"

python3 -c 'import json, sys
deps_path, manifest_path = sys.argv[1:]
with open(deps_path, encoding="utf-8") as stream: document = json.load(stream)
with open(manifest_path, encoding="utf-8") as stream: manifest = json.load(stream)
target = document["runtimeTarget"]["name"]
version = manifest["Version"]
identity = f"VNRevival.LanguageSwitcher/{version}"
document["targets"][target][identity] = {"runtime": {"VNRevival.LanguageSwitcher.dll": {}}}
document["libraries"][identity] = {"type": "reference", "serviceable": False, "sha512": ""}
with open(deps_path, "w", encoding="utf-8") as stream: json.dump(document, stream, separators=(",", ":"))' \
  "$probe_dir/LSProbe.deps.json" \
  "$payload/manifest.json"

python3 -c 'from pathlib import Path; import sys
p = Path(sys.argv[1]); data = p.read_bytes()
old = b"StardewModdingAPI.dll"; new = b"LSProbe.dll"
assert len(new) <= len(old) and data.count(old) == 1
p.write_bytes(data.replace(old, new + b"\0" * (len(old) - len(new))))' \
  "$probe_dir/LanguageSwitcherProbe"

"$probe_dir/LanguageSwitcherProbe" \
  "$payload/persian-shaping-map.json" \
  "$payload/arabic-shaping-map.json"

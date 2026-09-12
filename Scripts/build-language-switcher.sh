#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "$0")/.." && pwd)"
game_path="${STARDEW_GAME_PATH:-${STARDREW_GAME_PATH:-$HOME/Library/Application Support/Steam/steamapps/common/Stardew Valley/Contents/MacOS}}"
dotnet_bin="${DOTNET_BIN:-dotnet}"

if command -v "$dotnet_bin" >/dev/null 2>&1; then
  "$dotnet_bin" build \
    "$project_root/Tools/VNRevivalLanguageSwitcher/VNRevivalLanguageSwitcher.csproj" \
    --configuration Release \
    -p:StardewGamePath="$game_path" \
    -p:ContinuousIntegrationBuild=true \
    -p:PathMap="$project_root=."
else
  csc_bin="${CSC_BIN:-csc}"
  if ! command -v "$csc_bin" >/dev/null 2>&1; then
    echo "Neither dotnet nor csc is available." >&2
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
  "$csc_bin" \
    -noconfig \
    -nostdlib \
    -nullable:enable \
    -langversion:9.0 \
    -target:library \
    -deterministic \
    -pathmap:"$project_root"=. \
    -debug:portable \
    -out:"$payload/VNRevival.LanguageSwitcher.dll" \
    -pdb:"$payload/VNRevival.LanguageSwitcher.pdb" \
    "${references[@]}" \
    "$project_root/Tools/VNRevivalLanguageSwitcher/AssemblyInfo.cs" \
    "$project_root/Tools/VNRevivalLanguageSwitcher/SerbianGrammar.cs" \
    "$project_root/Tools/VNRevivalLanguageSwitcher/ModEntry.cs"
fi

payload="$project_root/Sources/StardewTranslationInstaller/Resources/LanguageSwitcherPayload"

node -e '
const fs = require("fs");
const manifest = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
const deps = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const target = deps.targets[deps.runtimeTarget.name];
const expected = `VNRevival.LanguageSwitcher/${manifest.Version}`;
if (!target?.[expected] || !deps.libraries?.[expected]) {
  throw new Error(`Language-switcher deps metadata does not contain ${expected}`);
}
' \
  "$payload/manifest.json" \
  "$payload/VNRevival.LanguageSwitcher.deps.json"

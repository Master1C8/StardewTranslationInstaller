#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "$0")/.." && pwd)"
game_path="${STARDREW_GAME_PATH:-$HOME/Library/Application Support/Steam/steamapps/common/Stardew Valley/Contents/MacOS}"
dotnet_bin="${DOTNET_BIN:-dotnet}"

"$dotnet_bin" build \
  "$project_root/Tools/VNRevivalLanguageSwitcher/VNRevivalLanguageSwitcher.csproj" \
  --configuration Release \
  -p:StardewGamePath="$game_path"

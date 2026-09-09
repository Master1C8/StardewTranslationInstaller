#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "$0")/.." && pwd)"
english_root="/Users/antonkrutov/Developer/data/stardew-english-unpacked"
modern_root="${1:-/private/tmp/stardew-fil-source-supplement/modern}"
xnbcli="${XNBCLI:-/Users/antonkrutov/Developer/tools/xnbcli/xnbcli}"
font_assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets/fonts/filipino"
font_scratch="$(mktemp -d /private/tmp/stardew-fil-audit-fonts.XXXXXX)"
trap 'rm -rf "$font_scratch"' EXIT

cd "$project_root"
node Scripts/audit-filipino.mjs
node Scripts/audit-filipino-supplemental.mjs "$modern_root"
node Scripts/audit-filipino-editorial.mjs "$english_root" --report=gate
node Scripts/audit-filipino-runtime.mjs
mkdir -p "$font_scratch/packed" "$font_scratch/unpacked"
cp "$font_assets/SpriteFont1.xnb" "$font_assets/SmallFont.xnb" "$font_scratch/packed/"
if ! "$xnbcli" unpack "$font_scratch/packed" "$font_scratch/unpacked" >"$font_scratch/xnbcli.log" 2>&1; then
  cat "$font_scratch/xnbcli.log"
  exit 1
fi
node Scripts/verify-filipino-fonts.mjs "$font_scratch/unpacked"

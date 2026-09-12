#!/bin/zsh
set -euo pipefail

script_dir=${0:A:h}
project_root=${script_dir:h}
xnbcli=${XNBCLI:-${HOME}/Developer/tools/xnbcli/xnbcli}
font_file=${VN_PERSIAN_FONT:-/System/Library/Fonts/Supplemental/Arial\ Unicode.ttf}
font_assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets/fonts/persian"
base_assets="$font_assets"
translations="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/persian"
font_map="$project_root/Documentation/persian-cluster-map.json"
temp_root=$(/usr/bin/mktemp -d /private/tmp/stardew-fa-fonts.XXXXXX)
trap '/bin/rm -rf "$temp_root"' EXIT

/bin/mkdir -p "$font_assets" "$temp_root/base-packed" "$temp_root/base-unpacked" "$temp_root/generated" "$temp_root/packed" "$temp_root/verify"
node "$project_root/Scripts/generate-persian-font-map.mjs"
/bin/cp "$base_assets/SpriteFont1.xnb" "$base_assets/SmallFont.xnb" "$temp_root/base-packed/"
"$xnbcli" unpack "$temp_root/base-packed" "$temp_root/base-unpacked"

SWIFT_MODULECACHE_PATH=/private/tmp/stardew-swift-module-cache \
CLANG_MODULE_CACHE_PATH=/private/tmp/stardew-swift-module-cache \
VN_BITMAP_FONT_NAME=Persian \
VN_BITMAP_FALLBACK_FONT_FACES=ArialMT \
VN_BITMAP_FONT_ATLAS_SIZE=2048 \
VN_BITMAP_FONT_SIZE=32 \
VN_BITMAP_FONT_LINE_HEIGHT=36 \
VN_BITMAP_FONT_BASE=28 \
VN_BITMAP_FONT_Y_OFFSET=-9 \
VN_BITMAP_FONT_ANTIALIAS=1 \
/usr/bin/swift "$project_root/Scripts/generate-amharic-fonts.swift" \
  "$temp_root/base-unpacked" \
  "$translations" \
  "$temp_root/generated" \
  "$font_file" \
  "$font_map"

"$xnbcli" pack "$temp_root/generated" "$temp_root/packed"
for name in SpriteFont1 SmallFont Persian Persian_0; do
  test -f "$temp_root/packed/$name.xnb"
  /bin/cp "$temp_root/packed/$name.xnb" "$font_assets/$name.xnb"
done

"$xnbcli" unpack "$temp_root/packed" "$temp_root/verify"
node "$project_root/Scripts/verify-persian-fonts.mjs" "$temp_root/verify" "$font_map"
print "Built and round-trip verified four Persian fonts."

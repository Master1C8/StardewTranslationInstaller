#!/bin/zsh
set -euo pipefail

script_dir=${0:A:h}
project_root=${script_dir:h}
xnbcli=${XNBCLI:-${HOME}/Developer/tools/xnbcli/xnbcli}
font_file=${VN_URDU_FONT:-/System/Library/Fonts/Supplemental/Arial\ Unicode.ttf}
font_assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets/fonts/urdu"
base_assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets/fonts/malayalam"
translations="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/urdu"
font_map="$project_root/Documentation/urdu-cluster-map.json"
temp_root=$(/usr/bin/mktemp -d /private/tmp/stardew-ur-fonts.XXXXXX)
trap '/bin/rm -rf "$temp_root"' EXIT

/bin/mkdir -p "$font_assets" "$temp_root/base-packed" "$temp_root/base-unpacked" "$temp_root/generated" "$temp_root/packed" "$temp_root/verify"
node "$project_root/Scripts/generate-urdu-font-map.mjs"
/bin/cp "$base_assets/SpriteFont1.xnb" "$base_assets/SmallFont.xnb" "$temp_root/base-packed/"
"$xnbcli" unpack "$temp_root/base-packed" "$temp_root/base-unpacked"

SWIFT_MODULECACHE_PATH=/private/tmp/stardew-swift-module-cache \
CLANG_MODULE_CACHE_PATH=/private/tmp/stardew-swift-module-cache \
VN_BITMAP_FONT_NAME=Urdu \
/usr/bin/swift "$project_root/Scripts/generate-amharic-fonts.swift" \
  "$temp_root/base-unpacked" \
  "$translations" \
  "$temp_root/generated" \
  "$font_file" \
  "$font_map"

"$xnbcli" pack "$temp_root/generated" "$temp_root/packed"
for name in SpriteFont1 SmallFont Urdu Urdu_0; do
  test -f "$temp_root/packed/$name.xnb"
  /bin/cp "$temp_root/packed/$name.xnb" "$font_assets/$name.xnb"
done

"$xnbcli" unpack "$temp_root/packed" "$temp_root/verify"
node "$project_root/Scripts/verify-urdu-fonts.mjs" "$temp_root/verify" "$font_map"
print "Built and round-trip verified four Urdu fonts."

#!/bin/zsh
set -euo pipefail

script_dir=${0:A:h}
project_root=${script_dir:h}
xnbcli=${XNBCLI:-/Users/antonkrutov/Developer/tools/xnbcli/xnbcli}
font_file=${VN_DUTCH_FONT:-/System/Library/Fonts/Supplemental/Arial.ttf}
font_assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets/fonts/dutch"
base_assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets/fonts/polish"
translations="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/dutch"
temp_root=$(/usr/bin/mktemp -d /private/tmp/stardew-nl-fonts.XXXXXX)
trap '/bin/rm -rf "$temp_root"' EXIT

/bin/mkdir -p "$font_assets" "$temp_root/base-packed" "$temp_root/base-unpacked" "$temp_root/generated" "$temp_root/packed" "$temp_root/verify"
/bin/cp "$base_assets/SpriteFont1.xnb" "$base_assets/SmallFont.xnb" "$temp_root/base-packed/"
"$xnbcli" unpack "$temp_root/base-packed" "$temp_root/base-unpacked"

SWIFT_MODULECACHE_PATH=/private/tmp/stardew-swift-module-cache \
CLANG_MODULE_CACHE_PATH=/private/tmp/stardew-swift-module-cache \
VN_SPRITEFONT_SIZE=26 \
VN_SMALLFONT_SIZE=17 \
/usr/bin/swift "$project_root/Scripts/generate-amharic-fonts.swift" \
  "$temp_root/base-unpacked" \
  "$translations" \
  "$temp_root/generated" \
  "$font_file"

"$xnbcli" pack "$temp_root/generated" "$temp_root/packed"
for name in SpriteFont1 SmallFont; do
  test -f "$temp_root/packed/$name.xnb"
  /bin/cp "$temp_root/packed/$name.xnb" "$font_assets/$name.xnb"
done
"$xnbcli" unpack "$temp_root/packed" "$temp_root/verify"
node "$project_root/Scripts/verify-dutch-fonts.mjs" "$temp_root/verify"
print "Built and round-trip verified Dutch SpriteFonts."

#!/bin/zsh
set -euo pipefail

script_dir=${0:A:h}
project_root=${script_dir:h}
xnbcli=${XNBCLI:-${HOME}/Developer/tools/xnbcli/xnbcli}
if [[ -n "${VN_TRADITIONAL_CHINESE_FONT:-}" ]]; then
  font_file=$VN_TRADITIONAL_CHINESE_FONT
else
  font_file=$("$script_dir/fetch-noto-sans-cjk-tc-font.sh" Regular)
fi
font_name=${VN_TRADITIONAL_CHINESE_FONT_NAME:-NotoSansCJKtc-Regular}
bitmap_font_file=${VN_TRADITIONAL_CHINESE_BITMAP_FONT:-$font_file}
bitmap_font_face=${VN_TRADITIONAL_CHINESE_BITMAP_FONT_NAME:-$font_name}
font_assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets/fonts/traditional-chinese"
translations="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/traditional-chinese"
temp_root=$(/usr/bin/mktemp -d /private/tmp/stardew-zh-tw-fonts.XXXXXX)
trap '/bin/rm -rf "$temp_root"' EXIT

/bin/mkdir -p "$temp_root/base-packed" "$temp_root/base-unpacked" "$temp_root/generated" "$temp_root/packed" "$temp_root/verify"
/bin/cp "$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets/fonts/polish/SpriteFont1.xnb" "$temp_root/base-packed/SpriteFont1.xnb"
/bin/cp "$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets/fonts/polish/SmallFont.xnb" "$temp_root/base-packed/SmallFont.xnb"
"$xnbcli" unpack "$temp_root/base-packed" "$temp_root/base-unpacked"

SWIFT_MODULECACHE_PATH=/private/tmp/stardew-swift-module-cache \
CLANG_MODULE_CACHE_PATH=/private/tmp/stardew-swift-module-cache \
VN_FONT_NAME="$font_name" \
VN_BITMAP_FONT_FILE="$bitmap_font_file" \
VN_BITMAP_FONT_FACE="$bitmap_font_face" \
VN_BITMAP_FALLBACK_FONT_FACES=ArialMT \
VN_GENERATE_BITMAP_FONT=1 \
VN_BITMAP_FONT_NAME=ChineseTraditional \
VN_SPRITEFONT_ATLAS_SIZE=4096 \
VN_SMALLFONT_ATLAS_SIZE=2048 \
VN_BITMAP_FONT_ATLAS_SIZE=2048 \
VN_SPRITEFONT_SIZE=36 \
VN_SMALLFONT_SIZE=24 \
VN_BITMAP_FONT_SIZE=32 \
VN_BITMAP_FONT_LINE_HEIGHT=36 \
VN_BITMAP_FONT_BASE=28 \
VN_BITMAP_FONT_Y_OFFSET=-6 \
VN_BITMAP_FONT_ANTIALIAS=1 \
/usr/bin/swift "$project_root/Scripts/generate-amharic-fonts.swift" \
  "$temp_root/base-unpacked" \
  "$translations" \
  "$temp_root/generated" \
  "$font_file"

"$xnbcli" pack "$temp_root/generated" "$temp_root/packed"
/bin/mkdir -p "$font_assets"
for name in SpriteFont1 SmallFont ChineseTraditional ChineseTraditional_0; do
  test -f "$temp_root/packed/$name.xnb"
  /bin/cp "$temp_root/packed/$name.xnb" "$font_assets/$name.xnb"
done

"$xnbcli" unpack "$temp_root/packed" "$temp_root/verify"
node "$project_root/Scripts/verify-traditional-chinese-fonts.mjs" "$temp_root/verify" "$translations"
print "Built and round-trip verified four Traditional Chinese fonts."

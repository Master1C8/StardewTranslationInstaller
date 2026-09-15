#!/bin/zsh
set -euo pipefail

script_dir=${0:A:h}
project_root=${script_dir:h}
xnbcli=${XNBCLI:-/Users/antonkrutov/Developer/tools/xnbcli/xnbcli}
font_file=${VN_EXTENDED_BITMAP_FONT:-/System/Library/Fonts/Supplemental/Arial.ttf}
payload="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload"
base_assets="$payload/assets/fonts/polish"
temp_root=$(/usr/bin/mktemp -d /private/tmp/stardew-extended-bitmap-fonts.XXXXXX)
trap '/bin/rm -rf "$temp_root"' EXIT

locales=(
  'serbian|Serbian'
  'polish|Polish'
  'ukrainian|Ukrainian'
  'vietnamese|Vietnamese'
  'swahili|Swahili'
  'indonesian|Indonesian'
  'filipino|Filipino'
  'dutch|Dutch'
  'romanian|Romanian'
  'bulgarian|Bulgarian'
  'greek|Greek'
  'czech|Czech'
  'es-419|LatinAmericanSpanish'
)

/bin/mkdir -p "$temp_root/base-packed" "$temp_root/base-unpacked"
/bin/cp "$base_assets/SpriteFont1.xnb" "$base_assets/SmallFont.xnb" "$temp_root/base-packed/"
"$xnbcli" unpack "$temp_root/base-packed" "$temp_root/base-unpacked"

for specification in $locales; do
  directory=${specification%%|*}
  font_name=${specification#*|}
  if (( $# > 0 )); then
    requested=false
    for requested_directory in "$@"; do
      if [[ "$requested_directory" == "$directory" ]]; then
        requested=true
        break
      fi
    done
    $requested || continue
  fi
  translations="$payload/assets/translations/$directory"
  destination="$payload/assets/fonts/$directory"
  generated="$temp_root/$directory/generated"
  packed="$temp_root/$directory/packed"
  verify="$temp_root/$directory/verify"

  /bin/mkdir -p "$destination" "$generated" "$packed" "$verify"
  SWIFT_MODULECACHE_PATH=/private/tmp/stardew-swift-module-cache \
  CLANG_MODULE_CACHE_PATH=/private/tmp/stardew-swift-module-cache \
  VN_GENERATE_BITMAP_FONT=1 \
  VN_BITMAP_FONT_NAME="$font_name" \
  VN_BITMAP_FONT_SIZE=32 \
  VN_BITMAP_FONT_LINE_HEIGHT=36 \
  VN_BITMAP_FONT_BASE=28 \
  VN_BITMAP_FONT_Y_OFFSET=-9 \
  VN_BITMAP_FONT_ANTIALIAS=1 \
  /usr/bin/swift "$project_root/Scripts/generate-amharic-fonts.swift" \
    "$temp_root/base-unpacked" \
    "$translations" \
    "$generated" \
    "$font_file"

  if [[ "$directory" == "es-419" ]]; then
    node "$project_root/Scripts/adjust-es-419-font-metrics.mjs" "$generated"
  fi

  "$xnbcli" pack "$generated" "$packed"
  for name in "$font_name" "${font_name}_0"; do
    test -f "$packed/$name.xnb"
    /bin/cp "$packed/$name.xnb" "$destination/$name.xnb"
  done
  if [[ "$directory" == "swahili" || "$directory" == "indonesian" || "$directory" == "es-419" ]]; then
    for name in SpriteFont1 SmallFont; do
      test -f "$packed/$name.xnb"
      /bin/cp "$packed/$name.xnb" "$destination/$name.xnb"
    done
  fi

  SWIFT_MODULECACHE_PATH=/private/tmp/stardew-swift-module-cache \
  CLANG_MODULE_CACHE_PATH=/private/tmp/stardew-swift-module-cache \
    "$project_root/Scripts/compress-xnb-fonts.swift" "$destination"
  "$xnbcli" unpack "$destination/$font_name.xnb" "$verify"
  test -f "$verify/$font_name.xml"
  print "Built and round-trip verified $font_name bitmap font."
done

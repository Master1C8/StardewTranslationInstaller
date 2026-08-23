#!/bin/zsh
set -euo pipefail

script_dir=${0:A:h}
project_root=${script_dir:h}
xnbcli=${XNBCLI:-${HOME}/Developer/tools/xnbcli/xnbcli}
font_file=${VN_MALAYALAM_FONT:-/System/Library/Fonts/Supplemental/Malayalam\ Sangam\ MN.ttc}
font_assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets/fonts/malayalam"
translations="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/malayalam"
cluster_map="$project_root/Documentation/malayalam-cluster-map.json"
temp_root=$(/usr/bin/mktemp -d /private/tmp/stardew-ml-cluster-fonts.XXXXXX)
trap '/bin/rm -rf "$temp_root"' EXIT

/bin/mkdir -p "$temp_root/base-packed" "$temp_root/base-unpacked" "$temp_root/generated" "$temp_root/packed" "$temp_root/verify"
/bin/cp "$font_assets/SpriteFont1.xnb" "$font_assets/SmallFont.xnb" "$temp_root/base-packed/"
"$xnbcli" unpack "$temp_root/base-packed" "$temp_root/base-unpacked"

SWIFT_MODULECACHE_PATH=/private/tmp/stardew-swift-module-cache \
CLANG_MODULE_CACHE_PATH=/private/tmp/stardew-swift-module-cache \
/usr/bin/swift "$project_root/Scripts/generate-amharic-fonts.swift" \
  "$temp_root/base-unpacked" \
  "$translations" \
  "$temp_root/generated" \
  "$font_file" \
  "$cluster_map"

"$xnbcli" pack "$temp_root/generated" "$temp_root/packed"
for name in SpriteFont1 SmallFont Malayalam Malayalam_0; do
  test -f "$temp_root/packed/$name.xnb"
  /bin/cp "$temp_root/packed/$name.xnb" "$font_assets/$name.xnb"
done

"$xnbcli" unpack "$temp_root/packed" "$temp_root/verify"
print "Built and round-trip verified four Malayalam cluster fonts."

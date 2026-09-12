#!/bin/zsh
set -euo pipefail

script_dir=${0:A:h}
project_root=${script_dir:h}
xnbcli=${XNBCLI:-/Users/antonkrutov/Developer/tools/xnbcli/xnbcli}
font_file=${VN_HEBREW_FONT:-/System/Library/Fonts/Supplemental/Arial\ Unicode.ttf}
font_assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets/fonts/hebrew"
base_assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets/fonts/polish"
translations="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/hebrew"
temp_root=$(/usr/bin/mktemp -d /private/tmp/stardew-he-fonts.XXXXXX)
trap '/bin/rm -rf "$temp_root"' EXIT

/bin/mkdir -p "$font_assets" "$temp_root/base-packed" "$temp_root/base-unpacked" "$temp_root/generated" "$temp_root/packed" "$temp_root/verify"
/bin/cp "$base_assets/SpriteFont1.xnb" "$base_assets/SmallFont.xnb" "$temp_root/base-packed/"
"$xnbcli" unpack "$temp_root/base-packed" "$temp_root/base-unpacked"

SWIFT_MODULECACHE_PATH=/private/tmp/stardew-swift-module-cache \
CLANG_MODULE_CACHE_PATH=/private/tmp/stardew-swift-module-cache \
VN_GENERATE_BITMAP_FONT=1 \
VN_BITMAP_FONT_NAME=Hebrew \
VN_BITMAP_FONT_SIZE=32 \
VN_BITMAP_FONT_LINE_HEIGHT=36 \
VN_BITMAP_FONT_BASE=28 \
VN_BITMAP_FONT_ANTIALIAS=1 \
/usr/bin/swift "$project_root/Scripts/generate-amharic-fonts.swift" \
  "$temp_root/base-unpacked" \
  "$translations" \
  "$temp_root/generated" \
  "$font_file"

"$xnbcli" pack "$temp_root/generated" "$temp_root/packed"
for name in SpriteFont1 SmallFont Hebrew Hebrew_0; do
  test -f "$temp_root/packed/$name.xnb"
  /bin/cp "$temp_root/packed/$name.xnb" "$font_assets/$name.xnb"
done

"$xnbcli" unpack "$temp_root/packed" "$temp_root/verify"
python3 - "$temp_root/verify" <<'PY'
import json, sys
from pathlib import Path
root = Path(sys.argv[1])
required = {chr(value) for value in range(0x05D0, 0x05EB)}
for name in ('SpriteFont1', 'SmallFont'):
    content = json.load(open(root / f'{name}.json'))['content']
    maps = content['characterMap']
    assert maps == sorted(maps, key=ord)
    assert len(maps) == len(content['glyphs']) == len(content['cropping']) == len(content['kerning'])
    assert required <= set(maps)
for name in ('Hebrew', 'Hebrew_0'):
    assert (root / f'{name}.json').is_file()
print('Hebrew fonts passed round-trip metadata validation.')
PY
print "Built and round-trip verified four Hebrew fonts."

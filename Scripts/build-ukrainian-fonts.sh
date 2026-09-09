#!/bin/zsh
set -euo pipefail

script_dir=${0:A:h}
project_root=${script_dir:h}
xnbcli=${XNBCLI:-/Users/antonkrutov/Developer/tools/xnbcli/xnbcli}
font_file=${VN_UKRAINIAN_FONT:-/System/Library/Fonts/Supplemental/Arial\ Bold.ttf}
assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets"
temp_root=$(/usr/bin/mktemp -d /private/tmp/stardew-uk-fonts.XXXXXX)
trap '/bin/rm -rf "$temp_root"' EXIT

/bin/mkdir -p "$temp_root/base-packed" "$temp_root/base-unpacked" "$temp_root/corpus" "$temp_root/generated" "$temp_root/packed" "$temp_root/verify"
/bin/cp "$assets/fonts/russian/SpriteFont1.xnb" "$assets/fonts/russian/SmallFont.xnb" "$temp_root/base-packed/"
/bin/cp "$project_root/Documentation/glossary/glossary.uk.json" "$temp_root/corpus/glossary.json"
if [[ -d "$assets/translations/ukrainian" ]]; then
  /bin/cp -R "$assets/translations/ukrainian" "$temp_root/corpus/translations"
fi
"$xnbcli" unpack "$temp_root/base-packed" "$temp_root/base-unpacked"

# The Cyrillic base already contains all Ukrainian letters in the game's
# original pixel style. Only missing characters are rasterized. Both base
# resources use the same 33-pixel line height and 1024-pixel texture.
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer \
SWIFT_MODULECACHE_PATH=/private/tmp/stardew-swift-module-cache \
CLANG_MODULE_CACHE_PATH=/private/tmp/stardew-swift-module-cache \
VN_SPRITEFONT_SIZE=26 VN_SMALLFONT_SIZE=26 \
VN_SPRITEFONT_ATLAS_SIZE=1024 VN_SMALLFONT_ATLAS_SIZE=1024 \
VN_EXTRA_CHARACTERS='АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯабвгґдеєжзиіїйклмнопрстуфхцчшщьюя’ʼ«»–—…' \
/usr/bin/swift "$script_dir/generate-amharic-fonts.swift" \
  "$temp_root/base-unpacked" "$temp_root/corpus" "$temp_root/generated" "$font_file"

node "$script_dir/verify-ukrainian-fonts.mjs" --align-punctuation "$temp_root/generated" "$temp_root/base-unpacked"
"$xnbcli" pack "$temp_root/generated" "$temp_root/packed"
"$xnbcli" unpack "$temp_root/packed" "$temp_root/verify"
node "$script_dir/verify-ukrainian-fonts.mjs" "$temp_root/verify" "$temp_root/base-unpacked"

# Replace source artifacts only after both generated resources pass the
# round-trip checks. This does not register or activate the unfinished locale.
/bin/mkdir -p "$assets/fonts/ukrainian"
for name in SpriteFont1 SmallFont; do
  test -s "$temp_root/packed/$name.xnb"
  /bin/cp "$temp_root/packed/$name.xnb" "$assets/fonts/ukrainian/$name.xnb"
done
print 'Built and round-trip verified Ukrainian SpriteFonts; runtime visual QA is still required.'

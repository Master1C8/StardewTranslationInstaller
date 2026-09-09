#!/bin/zsh
set -euo pipefail

project_root="${0:A:h:h}"
assets="$project_root/Sources/StardewTranslationInstaller/Resources/ModPayload/assets"
temp_root=$(/usr/bin/mktemp -d /private/tmp/stardew-uk-font-proof.XXXXXX)
trap '/bin/rm -rf "$temp_root"' EXIT

/bin/mkdir -p "$temp_root/packed" "$temp_root/unpacked"
/bin/cp "$assets/fonts/ukrainian/SpriteFont1.xnb" "$assets/fonts/ukrainian/SmallFont.xnb" "$temp_root/packed/"
/Users/antonkrutov/Developer/tools/xnbcli/xnbcli unpack "$temp_root/packed" "$temp_root/unpacked"
/usr/bin/python3 "$project_root/Scripts/render-ukrainian-font-proof.py" \
  "$temp_root/unpacked" \
  "$project_root/Documentation/uk/ukrainian-font-visual-proof.png"
echo "Rendered Ukrainian proof from both packed game fonts."

#!/bin/zsh
set -euo pipefail

version=v1.500
font_sha256=0193f5f033612496df6b45ee92ac3b335bc6a5a24ff95da55ca87b33e57dcf62
font_name=Cubic_11.ttf
cache_root=/private/tmp/vn-revival-cubic-11-${version}
font_path="$cache_root/$font_name"

/bin/mkdir -p "$cache_root"

if [[ ! -f "$font_path" ]] || [[ "$(/usr/bin/shasum -a 256 "$font_path" | /usr/bin/awk '{print $1}')" != "$font_sha256" ]]; then
  /usr/bin/curl --fail --location --retry 3 \
    "https://raw.githubusercontent.com/ACh-K/Cubic-11/${version}/fonts/ttf/${font_name}" \
    --output "$font_path"
fi

actual_font_sha256=$(/usr/bin/shasum -a 256 "$font_path" | /usr/bin/awk '{print $1}')
if [[ "$actual_font_sha256" != "$font_sha256" ]]; then
  print -u2 "Cubic 11 font checksum mismatch."
  exit 1
fi

print -r -- "$font_path"

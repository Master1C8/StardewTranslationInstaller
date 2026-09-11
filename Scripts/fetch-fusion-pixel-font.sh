#!/bin/zsh
set -euo pipefail

version=2026.09.01
archive_name=fusion-pixel-font-12px-proportional-ttf-v${version}.zip
archive_sha256=cf607641a61c721cd58409fa58a1ccf432e97d9ad25e76687948fa3027246fee
font_name=fusion-pixel-12px-proportional-zh_hant.ttf
font_sha256=743ddb744884f81289bc7422a936d251615a721c804415fdb820aa55369494f6
cache_root=/private/tmp/vn-revival-fusion-pixel-${version}
archive_path="$cache_root/$archive_name"
font_path="$cache_root/$font_name"

/bin/mkdir -p "$cache_root"

if [[ ! -f "$font_path" ]] || [[ "$(/usr/bin/shasum -a 256 "$font_path" | /usr/bin/awk '{print $1}')" != "$font_sha256" ]]; then
  if [[ ! -f "$archive_path" ]] || [[ "$(/usr/bin/shasum -a 256 "$archive_path" | /usr/bin/awk '{print $1}')" != "$archive_sha256" ]]; then
    /usr/bin/curl --fail --location --retry 3 \
      "https://github.com/TakWolf/fusion-pixel-font/releases/download/${version}/${archive_name}" \
      --output "$archive_path"
  fi

  actual_archive_sha256=$(/usr/bin/shasum -a 256 "$archive_path" | /usr/bin/awk '{print $1}')
  if [[ "$actual_archive_sha256" != "$archive_sha256" ]]; then
    print -u2 "Fusion Pixel archive checksum mismatch."
    exit 1
  fi

  /usr/bin/unzip -p "$archive_path" "$font_name" > "$font_path"
fi

actual_font_sha256=$(/usr/bin/shasum -a 256 "$font_path" | /usr/bin/awk '{print $1}')
if [[ "$actual_font_sha256" != "$font_sha256" ]]; then
  print -u2 "Fusion Pixel Traditional Chinese font checksum mismatch."
  exit 1
fi

print -r -- "$font_path"

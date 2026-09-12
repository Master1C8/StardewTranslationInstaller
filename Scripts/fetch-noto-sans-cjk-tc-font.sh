#!/bin/zsh
set -euo pipefail

version=Sans2.004
weight=${1:-Regular}
case "$weight" in
  Regular)
    font_sha256=dce08bd4fd91aa8aa76ed8fea4b694c2dfb8550f67871e326843212ddbeb88b4
    ;;
  Light)
    font_sha256=a49db53f6aac529d91a036606e55d68e2ab1df1360f507504ac4ff2cbb0f9407
    ;;
  *)
    print -u2 "Unsupported Noto Sans CJK TC weight: $weight"
    exit 2
    ;;
esac
font_name=NotoSansCJKtc-${weight}.otf
cache_root=/private/tmp/vn-revival-noto-sans-cjk-tc-${version}
font_path="$cache_root/$font_name"

/bin/mkdir -p "$cache_root"

if [[ ! -f "$font_path" ]] || [[ "$(/usr/bin/shasum -a 256 "$font_path" | /usr/bin/awk '{print $1}')" != "$font_sha256" ]]; then
  /usr/bin/curl --fail --location --retry 3 \
    "https://raw.githubusercontent.com/notofonts/noto-cjk/${version}/Sans/OTF/TraditionalChinese/${font_name}" \
    --output "$font_path"
fi

actual_font_sha256=$(/usr/bin/shasum -a 256 "$font_path" | /usr/bin/awk '{print $1}')
if [[ "$actual_font_sha256" != "$font_sha256" ]]; then
  print -u2 "Noto Sans CJK TC $weight font checksum mismatch."
  exit 1
fi

print -r -- "$font_path"

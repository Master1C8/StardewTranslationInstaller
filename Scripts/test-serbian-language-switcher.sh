#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "$0")/.." && pwd)"
output="${TMPDIR:-/private/tmp}/VNRevivalLanguageSwitcherSerbianProbe.exe"
csc_bin="${CSC_BIN:-csc}"
mono_bin="${MONO_BIN:-mono}"

"$csc_bin" \
  -nologo \
  -langversion:9.0 \
  -out:"$output" \
  "$project_root/Tools/VNRevivalLanguageSwitcher/SerbianGrammar.cs" \
  "$project_root/Tools/VNRevivalLanguageSwitcherSerbianProbe/Program.cs"
"$mono_bin" "$output"

#!/usr/bin/env bash
set -euo pipefail
dotnet_bin="${DOTNET_BIN:-/opt/homebrew/opt/dotnet@8/bin/dotnet}"
[[ -x "$dotnet_bin" ]] || { echo "Set DOTNET_BIN to an installed .NET SDK host" >&2; exit 1; }
sdk_line="$("$dotnet_bin" --list-sdks | tail -n 1)"
sdk_version="${sdk_line%% *}"
sdk_root="${sdk_line#*[}"
sdk_root="${sdk_root%]}"
compiler="$sdk_root/$sdk_version/Roslyn/bincore/csc.dll"
[[ -f "$compiler" ]] || { echo "SDK C# compiler not found" >&2; exit 1; }
exec "$dotnet_bin" "$compiler" "$@"

# Ukrainian source discovery

The pinned `xnbcli` cannot deserialize 49 structured `Data` assets in Stardew
Valley 1.6.15. This reader uses the installed game's MonoGame and GameData
assemblies, without launching the game or creating a graphics device. It writes
only to the specified output directory outside the game's `Content` directory.

Build with .NET SDK 8.0.424. On this Apple Silicon workstation, the installed
MonoGame assembly is an **x64** managed assembly: build with the ARM SDK, then run
the output DLL with the x64 .NET 8 runtime under Rosetta. No NuGet package is used.
Set `GameAssemblyRoot` when building against a different game installation.

The verified temporary runtimes used for this task are:

- `/private/tmp/stardew-uk-dotnet/dotnet` — ARM SDK 8.0.424.
- `/private/tmp/stardew-uk-dotnet-x64/dotnet` — x64 runtime 8.0.30.

Both official Microsoft downloads were checked against the SHA-512 hashes in
the Microsoft .NET 8 release manifest. They are temporary tools, not a system
installation or release dependency.

From the repository root:

```sh
DOTNET_CLI_TELEMETRY_OPTOUT=1 DOTNET_GENERATE_ASPNET_CERTIFICATE=false \
DOTNET_CLI_HOME=/private/tmp/stardew-uk-dotnet-home \
NUGET_PACKAGES=/private/tmp/stardew-uk-nuget \
/private/tmp/stardew-uk-dotnet/dotnet build Scripts/uk-extract-structured/UkExtract.csproj

/private/tmp/stardew-uk-dotnet-x64/dotnet \
  Scripts/uk-extract-structured/bin/Debug/net8.0/UkExtract.dll \
  '/Users/antonkrutov/Library/Application Support/Steam/steamapps/common/Stardew Valley/Contents/Resources/Content' \
  Documentation/uk/source-discovery.json /private/tmp/stardew-uk-structured-unpacked

node Scripts/verify-uk-structured-source.mjs /private/tmp/stardew-uk-structured-unpacked
```

The string inventory records JSON pointers and the game's documented field or
property for every string leaf. The verifier independently walks serialized
JSON to detect missed fields, then checks references against the original
English extraction. It records plain display fields separately. Technical names,
IDs, item queries, event commands, and bundle selectors remain source data; the
reader and verifier never generate translated wording.

The five current display candidates include a hidden track marked
`Available: false` and the intentional `???` name. Their final treatment must be
recorded explicitly. The two `Farmhouse` fields and turtle display name need
locale-scoped field patches. Reference validation is separate from editorial
review and runtime testing.

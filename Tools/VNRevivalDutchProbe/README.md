# Dutch article runtime probe

This probe loads the installed game's assemblies and patches the real
`Utility.AOrAn` method with the production postfix. It exercises Dutch vowel and
consonant cases, empty input, changing to Polish, a missing mod language, built-in
English with stale Dutch metadata, and Hungarian's existing article rule.
It never launches the game or installer, loads a save, or writes installed files.

Build with a .NET SDK and the same `StardewGamePath` used by the language switcher:

```sh
dotnet build Tools/VNRevivalDutchProbe/VNRevivalDutchProbe.csproj -c Release \
  -p:StardewGamePath="/path/to/Stardew Valley/Contents/MacOS"
```

Run the resulting `bin/Release/net6.0/VNRevivalDutchProbe.dll` with an **x64 .NET 6**
runtime and pass that same game directory as the only argument. The installed
1.6.15 game assembly targets x64, and its bundled Harmony build needs .NET 6;
arm64 .NET and .NET 8 do not provide a valid runtime test for this installation.

The Dutch task verified nine actual Harmony calls on Microsoft .NET 6.0.32 x64.
The runtime archive was checked against Microsoft's release metadata SHA-512.
Live SMAPI and language-switching QA remain separate release requirements.

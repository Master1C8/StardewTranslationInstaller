param(
    [Parameter(Mandatory = $true)][string]$BaseDirectory,
    [Parameter(Mandatory = $true)][string]$StatusFile,
    [string]$GamePath = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$smapiVersion = "4.5.2"
$contentPatcherVersion = "2.9.1"
$smapiUrl = "https://github.com/Pathoschild/SMAPI/releases/download/4.5.2/SMAPI-4.5.2-installer.zip"
$smapiSha256 = "dd01ddca7b566bfe0d3b3d2d03833496abc56c53da976241f2ab443f5484acc4"
$contentPatcherUrl = "https://www.curseforge.com/api/v1/mods/275441/files/7759981/download"
$contentPatcherSha256 = "22962ecbeda204d207f66f4dded727a2ce67134f7decdd249c1024bbc4576817"

function Write-Status([string]$Message) {
    [IO.File]::WriteAllText($StatusFile, $Message, [Text.UTF8Encoding]::new($false))
}

function Get-Manifest([string]$Folder) {
    $manifestPath = Join-Path $Folder "manifest.json"
    if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) { return $null }
    return Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
}

function Test-OwnedFolder([string]$Folder, [string]$UniqueID) {
    try {
        $manifest = Get-Manifest $Folder
        return $null -ne $manifest -and [string]$manifest.UniqueID -eq $UniqueID
    } catch {
        return $false
    }
}

function Resolve-GameFolder([string]$Candidate) {
    if ([string]::IsNullOrWhiteSpace($Candidate)) { return $null }
    try { $full = [IO.Path]::GetFullPath($Candidate) } catch { return $null }
    if (-not (Test-Path -LiteralPath $full -PathType Container)) { return $null }
    foreach ($marker in @("Stardew Valley.exe", "Stardew Valley.dll")) {
        if (Test-Path -LiteralPath (Join-Path $full $marker) -PathType Leaf) { return $full }
    }
    return $null
}

function Find-GameFolder([string]$RequestedPath) {
    $resolved = Resolve-GameFolder $RequestedPath
    if ($null -ne $resolved) { return $resolved }

    $steamRoots = [Collections.Generic.List[string]]::new()
    foreach ($registryPath in @(
        "HKCU:\Software\Valve\Steam",
        "HKLM:\SOFTWARE\WOW6432Node\Valve\Steam",
        "HKLM:\SOFTWARE\Valve\Steam"
    )) {
        try {
            $properties = Get-ItemProperty -LiteralPath $registryPath -ErrorAction Stop
            $value = $null
            foreach ($propertyName in @("SteamPath", "InstallPath")) {
                $property = $properties.PSObject.Properties[$propertyName]
                if ($null -ne $property -and -not [string]::IsNullOrWhiteSpace([string]$property.Value)) {
                    $value = [string]$property.Value
                    break
                }
            }
            if (-not [string]::IsNullOrWhiteSpace($value)) { $steamRoots.Add([string]$value) }
        } catch { }
    }
    if (${env:ProgramFiles(x86)}) { $steamRoots.Add((Join-Path ${env:ProgramFiles(x86)} "Steam")) }
    if ($env:ProgramFiles) { $steamRoots.Add((Join-Path $env:ProgramFiles "Steam")) }

    $libraryRoots = [Collections.Generic.List[string]]::new()
    foreach ($steamRoot in $steamRoots) {
        if ([string]::IsNullOrWhiteSpace($steamRoot)) { continue }
        $libraryRoots.Add($steamRoot)
        $vdf = Join-Path $steamRoot "steamapps\libraryfolders.vdf"
        if (Test-Path -LiteralPath $vdf -PathType Leaf) {
            $contents = Get-Content -LiteralPath $vdf -Raw
            foreach ($match in [regex]::Matches($contents, '"path"\s+"([^"]+)"')) {
                $libraryRoots.Add($match.Groups[1].Value.Replace("\\", "\"))
            }
        }
    }

    $candidates = [Collections.Generic.List[string]]::new()
    foreach ($library in $libraryRoots) {
        $candidates.Add((Join-Path $library "steamapps\common\Stardew Valley"))
    }
    if ($env:ProgramFiles) { $candidates.Add((Join-Path $env:ProgramFiles "GOG Galaxy\Games\Stardew Valley")) }
    $candidates.Add("C:\GOG Games\Stardew Valley")

    foreach ($candidate in $candidates) {
        $resolved = Resolve-GameFolder $candidate
        if ($null -ne $resolved) { return $resolved }
    }
    return $null
}

function Get-SmapiVersion([string]$Root) {
    $assembly = Join-Path $Root "StardewModdingAPI.dll"
    if (-not (Test-Path -LiteralPath $assembly -PathType Leaf)) { return $null }
    try {
        $text = [Text.Encoding]::UTF8.GetString([IO.File]::ReadAllBytes($assembly))
        foreach ($match in [regex]::Matches($text, '(?<![0-9])([0-9]+\.[0-9]+\.[0-9]+)(?:\.[0-9]+)?\+[0-9a-fA-F]{7,64}')) {
            $start = [Math]::Max(0, $match.Index - 128)
            $length = [Math]::Min($text.Length - $start, $match.Length + 256)
            if ($text.Substring($start, $length) -match "SMAPI") {
                return [version]$match.Groups[1].Value
            }
        }
    } catch { }
    return $null
}

function Find-ModFolders([string]$ModsFolder, [string]$UniqueID) {
    if (-not (Test-Path -LiteralPath $ModsFolder -PathType Container)) { return @() }
    return @(Get-ChildItem -LiteralPath $ModsFolder -Directory | Where-Object {
        Test-OwnedFolder $_.FullName $UniqueID
    })
}

function Download-Verified([string]$Name, [string]$Uri, [string]$Sha256, [string]$Destination) {
    Write-Status "Downloading $Name…"
    Invoke-WebRequest -Uri $Uri -OutFile $Destination -UseBasicParsing -Headers @{ "User-Agent" = "VN Revival Stardew Installer/1.17.24" }
    $actual = (Get-FileHash -LiteralPath $Destination -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actual -ne $Sha256) { throw "$Name checksum did not match. Installation was stopped." }
}

function Install-OwnedFolder([string]$Source, [string]$Destination, [string]$UniqueID) {
    if (-not (Test-OwnedFolder $Source $UniqueID)) { throw "The bundled $UniqueID payload is invalid." }
    $parent = Split-Path -Parent $Destination
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
    if ((Test-Path -LiteralPath $Destination) -and -not (Test-OwnedFolder $Destination $UniqueID)) {
        throw "The $(Split-Path -Leaf $Destination) folder belongs to another mod and will not be overwritten."
    }

    $token = [guid]::NewGuid().ToString("N")
    $staging = "$Destination.vnrevival-new-$token"
    $backup = "$Destination.vnrevival-old-$token"
    Copy-Item -LiteralPath $Source -Destination $staging -Recurse
    if (-not (Test-OwnedFolder $staging $UniqueID)) { throw "The staged $UniqueID payload is invalid." }
    try {
        if (Test-Path -LiteralPath $Destination) { Move-Item -LiteralPath $Destination -Destination $backup }
        Move-Item -LiteralPath $staging -Destination $Destination
        if (Test-Path -LiteralPath $backup) { Remove-Item -LiteralPath $backup -Recurse -Force }
    } catch {
        if ((Test-Path -LiteralPath $backup) -and -not (Test-Path -LiteralPath $Destination)) {
            Move-Item -LiteralPath $backup -Destination $Destination
        }
        throw
    } finally {
        if (Test-Path -LiteralPath $staging) { Remove-Item -LiteralPath $staging -Recurse -Force }
    }
}

$working = Join-Path ([IO.Path]::GetTempPath()) ("vn-revival-installer-" + [guid]::NewGuid().ToString("N"))
try {
    $gameFolder = Find-GameFolder $GamePath
    if ($null -eq $gameFolder) {
        Write-Status "Stardew Valley was not found. Choose the game folder."
        exit 2
    }

    $resources = Join-Path $BaseDirectory "Resources"
    $configPath = Join-Path $resources "PackageConfig.json"
    $modPayload = Join-Path $resources "ModPayload"
    $switcherPayload = Join-Path $resources "LanguageSwitcherPayload"
    if (-not (Test-Path -LiteralPath $configPath -PathType Leaf)) { throw "PackageConfig.json is missing from the installer." }
    $config = Get-Content -LiteralPath $configPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ([int]$config.schemaVersion -ne 2) { throw "The bundled package configuration is unsupported." }
    if (@($config.languageCodes).Count -eq 0) { throw "The bundled language list is empty." }
    if (-not (Test-OwnedFolder $modPayload ([string]$config.uniqueID))) { throw "The translation payload is missing or invalid." }
    if (-not (Test-OwnedFolder $switcherPayload "VNRevival.LanguageSwitcher")) { throw "The language switcher payload is missing or invalid." }
    $contentText = Get-Content -LiteralPath (Join-Path $modPayload "content.json") -Raw -Encoding UTF8
    foreach ($languageCode in @($config.languageCodes)) {
        if ($contentText -notmatch [regex]::Escape([string]$languageCode)) {
            throw "The translation payload does not register language code $languageCode."
        }
    }

    New-Item -ItemType Directory -Path $working -Force | Out-Null
    $modsFolder = Join-Path $gameFolder "Mods"
    New-Item -ItemType Directory -Path $modsFolder -Force | Out-Null

    $installedSmapi = Get-SmapiVersion $gameFolder
    if ($null -eq $installedSmapi -or $installedSmapi -lt [version]$smapiVersion) {
        $smapiArchive = Join-Path $working "SMAPI-$smapiVersion.zip"
        Download-Verified "SMAPI $smapiVersion" $smapiUrl $smapiSha256 $smapiArchive
        $smapiExtracted = Join-Path $working "smapi"
        Expand-Archive -LiteralPath $smapiArchive -DestinationPath $smapiExtracted -Force
        $smapiInstaller = Get-ChildItem -LiteralPath $smapiExtracted -Recurse -File -Filter "SMAPI.Installer.exe" | Where-Object {
            $_.FullName -match '[\\/]internal[\\/]windows[\\/]'
        } | Select-Object -First 1
        if ($null -eq $smapiInstaller) { throw "The SMAPI archive does not contain its Windows installer." }
        Write-Status "Installing SMAPI $smapiVersion…"
        & $smapiInstaller.FullName --install --game-path $gameFolder --no-prompt
        if ($LASTEXITCODE -ne 0) { throw "SMAPI installer exited with code $LASTEXITCODE." }
        $installedSmapi = Get-SmapiVersion $gameFolder
        if ($null -eq $installedSmapi -or $installedSmapi -lt [version]$smapiVersion) {
            throw "SMAPI was not found after installation."
        }
    }

    $contentPatcherFolders = Find-ModFolders $modsFolder "Pathoschild.ContentPatcher"
    if ($contentPatcherFolders.Count -gt 1) { throw "Multiple copies of Content Patcher were found. Remove the duplicate and try again." }
    $contentPatcherCurrent = $null
    if ($contentPatcherFolders.Count -eq 1) {
        try { $contentPatcherCurrent = [version](Get-Manifest $contentPatcherFolders[0].FullName).Version } catch { }
    }
    if ($null -eq $contentPatcherCurrent -or $contentPatcherCurrent -lt [version]$contentPatcherVersion) {
        $contentArchive = Join-Path $working "ContentPatcher-$contentPatcherVersion.zip"
        Download-Verified "Content Patcher $contentPatcherVersion" $contentPatcherUrl $contentPatcherSha256 $contentArchive
        $contentExtracted = Join-Path $working "content-patcher"
        Expand-Archive -LiteralPath $contentArchive -DestinationPath $contentExtracted -Force
        $contentSource = Get-ChildItem -LiteralPath $contentExtracted -Recurse -Directory | Where-Object {
            Test-OwnedFolder $_.FullName "Pathoschild.ContentPatcher"
        } | Select-Object -First 1
        if ($null -eq $contentSource) { throw "The Content Patcher archive does not contain the expected mod." }
        $contentDestination = if ($contentPatcherFolders.Count -eq 1) {
            $contentPatcherFolders[0].FullName
        } else {
            Join-Path $modsFolder "ContentPatcher"
        }
        Write-Status "Installing Content Patcher $contentPatcherVersion…"
        Install-OwnedFolder $contentSource.FullName $contentDestination "Pathoschild.ContentPatcher"
    }

    Write-Status "Installing all VN Revival language packs…"
    Install-OwnedFolder $switcherPayload (Join-Path $modsFolder "[SMAPI] VN Revival Language Switcher") "VNRevival.LanguageSwitcher"
    Install-OwnedFolder $modPayload (Join-Path $modsFolder ([string]$config.modFolderName)) ([string]$config.uniqueID)

    foreach ($legacy in @($config.legacyPackages)) {
        $legacyFolder = Join-Path $modsFolder ([string]$legacy.modFolderName)
        if ((Test-Path -LiteralPath $legacyFolder) -and (Test-OwnedFolder $legacyFolder ([string]$legacy.uniqueID))) {
            Remove-Item -LiteralPath $legacyFolder -Recurse -Force
        }
    }
    Write-Status "All translations installed"
    exit 0
} catch {
    $message = $_.Exception.Message
    if ([string]::IsNullOrWhiteSpace($message)) { $message = "Installation did not finish. Check your internet connection and try again." }
    Write-Status $message
    exit 1
} finally {
    if (Test-Path -LiteralPath $working) { Remove-Item -LiteralPath $working -Recurse -Force -ErrorAction SilentlyContinue }
}

# Finds node.exe and prints its full path. Exit code 1 when not found.
# Called from find-node.bat.
#
# NOTE: keep this file ASCII-only and saved with a UTF-8 BOM.
# Windows PowerShell 5.1 reads BOM-less files as ANSI (cp932 on Japanese
# systems), which turns non-ASCII comments into parse errors.
#
# Search order:
#   1. PATH as stored in the registry (works even if this window is stale)
#   2. usual install folders
#   3. registry entries written by the Node.js installer
#   4. version managers (nvm / fnm / Volta)
#   5. last resort: shallow recursive search

$ErrorActionPreference = 'SilentlyContinue'

function Test-NodeExe($dir) {
    if (-not $dir) { return $null }
    try {
        $exe = Join-Path $dir.ToString().Trim().Trim('"') 'node.exe'
        if (Test-Path -LiteralPath $exe) { return $exe }
    } catch { }
    return $null
}

$dirs = New-Object System.Collections.ArrayList

# 1. PATH from the registry
foreach ($scope in @('Machine', 'User')) {
    $value = [Environment]::GetEnvironmentVariable('Path', $scope)
    if ($value) { foreach ($p in $value.Split(';')) { [void]$dirs.Add($p) } }
}

# 2. usual install folders
foreach ($base in @($env:ProgramFiles, $env:ProgramW6432, ${env:ProgramFiles(x86)})) {
    if ($base) { [void]$dirs.Add((Join-Path $base 'nodejs')) }
}
[void]$dirs.Add((Join-Path $env:LOCALAPPDATA 'Programs\nodejs'))
[void]$dirs.Add((Join-Path $env:LOCALAPPDATA 'Volta\bin'))
[void]$dirs.Add('C:\nodejs')

# 3. registry entries left by the installer
foreach ($key in @('HKLM:\SOFTWARE\Node.js', 'HKLM:\SOFTWARE\WOW6432Node\Node.js')) {
    $install = (Get-ItemProperty -Path $key).InstallPath
    if ($install) { [void]$dirs.Add($install) }
}
foreach ($root in @('HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*',
                    'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*')) {
    foreach ($app in (Get-ItemProperty -Path $root)) {
        if ($app.DisplayName -like 'Node.js*' -and $app.InstallLocation) {
            [void]$dirs.Add($app.InstallLocation)
        }
    }
}

# 4. version managers, newest first
foreach ($vm in @((Join-Path $env:APPDATA 'nvm'),
                  (Join-Path $env:LOCALAPPDATA 'fnm_multishells'),
                  (Join-Path $env:LOCALAPPDATA 'fnm\node-versions'),
                  (Join-Path $env:USERPROFILE '.volta\tools\image\node'))) {
    foreach ($sub in (Get-ChildItem -LiteralPath $vm -Directory | Sort-Object Name -Descending)) {
        [void]$dirs.Add($sub.FullName)
        [void]$dirs.Add((Join-Path $sub.FullName 'bin'))
    }
}

foreach ($dir in $dirs) {
    $exe = Test-NodeExe $dir
    if ($exe) { Write-Output $exe; exit 0 }
}

# 5. last resort
foreach ($root in @($env:ProgramFiles, $env:LOCALAPPDATA, $env:APPDATA, $env:USERPROFILE)) {
    if (-not $root) { continue }
    $hit = Get-ChildItem -LiteralPath $root -Filter 'node.exe' -Recurse -Depth 3 -File |
           Select-Object -First 1
    if ($hit) { Write-Output $hit.FullName; exit 0 }
}

exit 1

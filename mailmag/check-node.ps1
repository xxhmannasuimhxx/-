# Writes a report about this PC (where node.exe is, what PATH holds) and
# opens it in Notepad, so the user can show it to Claude.
#
# NOTE: keep this file ASCII-only and saved with a UTF-8 BOM
# (Windows PowerShell 5.1 reads BOM-less files as ANSI).

$ErrorActionPreference = 'SilentlyContinue'
$out = Join-Path $env:TEMP 'mailmag-check.txt'
$lines = New-Object System.Collections.ArrayList
function Note($text) { [void]$lines.Add($text) }

Note '=== mailmag: Node.js check ==='
Note ('Date       : ' + (Get-Date))
Note ('Windows    : ' + (Get-CimInstance Win32_OperatingSystem).Caption)
Note ('PowerShell : ' + $PSVersionTable.PSVersion)
Note ('Folder     : ' + $PSScriptRoot)
Note ''

Note '--- winget ---'
$winget = Get-Command winget -ErrorAction SilentlyContinue
if ($winget) { Note $winget.Source } else { Note 'not found' }
Note ''

Note '--- checked locations ---'
$checked = @(
    (Join-Path $env:ProgramFiles 'nodejs\node.exe'),
    (Join-Path $env:ProgramW6432 'nodejs\node.exe'),
    (Join-Path ${env:ProgramFiles(x86)} 'nodejs\node.exe'),
    (Join-Path $env:LOCALAPPDATA 'Programs\nodejs\node.exe'),
    (Join-Path $env:LOCALAPPDATA 'Volta\bin\node.exe'),
    'C:\nodejs\node.exe'
)
foreach ($p in $checked) {
    if ($p) {
        $mark = 'MISSING'
        if (Test-Path -LiteralPath $p) { $mark = 'FOUND  ' }
        Note ('[' + $mark + '] ' + $p)
    }
}
Note ''

Note '--- registry ---'
foreach ($key in @('HKLM:\SOFTWARE\Node.js', 'HKLM:\SOFTWARE\WOW6432Node\Node.js')) {
    $install = (Get-ItemProperty -Path $key).InstallPath
    if (-not $install) { $install = '(none)' }
    Note ($key + ' -> ' + $install)
}
foreach ($root in @('HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*',
                    'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*')) {
    foreach ($app in (Get-ItemProperty -Path $root)) {
        if ($app.DisplayName -like '*Node*') {
            Note ('installed: ' + $app.DisplayName + ' / ' + $app.InstallLocation)
        }
    }
}
Note ''

Note '--- PATH (this window) ---'
Note $env:Path
Note ''
Note '--- PATH (stored in Windows) ---'
Note ('Machine: ' + [Environment]::GetEnvironmentVariable('Path', 'Machine'))
Note ('User   : ' + [Environment]::GetEnvironmentVariable('Path', 'User'))
Note ''

Note '--- node.exe found by shallow search ---'
$found = @()
foreach ($root in @($env:ProgramFiles, ${env:ProgramFiles(x86)}, $env:LOCALAPPDATA, $env:APPDATA, $env:USERPROFILE)) {
    if (-not $root) { continue }
    $found += Get-ChildItem -LiteralPath $root -Filter 'node.exe' -Recurse -Depth 3 -File |
              Select-Object -First 5
}
if ($found.Count -eq 0) { Note 'none (Node.js is probably not installed yet)' }
foreach ($f in $found) { Note $f.FullName }

Set-Content -LiteralPath $out -Value ($lines -join "`r`n") -Encoding UTF8
Write-Output $out
Start-Process notepad.exe $out

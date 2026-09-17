# Node.js がどうしても見つからないときに、状況をまとめたメモを作って開く。
# 内容をそのまま Claude に見せてもらうためのもの。

$ErrorActionPreference = 'SilentlyContinue'
$out = Join-Path $env:TEMP 'mailmag-check.txt'
$lines = New-Object System.Collections.ArrayList
function Add($text) { [void]$lines.Add($text) }

Add '=== mailmag: Node.js さがしものメモ ==='
Add ('日時       : ' + (Get-Date))
Add ('Windows    : ' + (Get-CimInstance Win32_OperatingSystem).Caption)
Add ('PowerShell : ' + $PSVersionTable.PSVersion)
Add ''

Add '--- winget があるか ---'
$winget = Get-Command winget -ErrorAction SilentlyContinue
if ($winget) { Add $winget.Source } else { Add '見つかりません（Windows 10 の古い版などでは入っていません）' }
Add ''

Add '--- node.exe を探した場所 ---'
$checked = @(
    (Join-Path $env:ProgramFiles 'nodejs\node.exe'),
    (Join-Path $env:ProgramW6432 'nodejs\node.exe'),
    (Join-Path ${env:ProgramFiles(x86)} 'nodejs\node.exe'),
    (Join-Path $env:LOCALAPPDATA 'Programs\nodejs\node.exe'),
    (Join-Path $env:LOCALAPPDATA 'Volta\bin\node.exe'),
    'C:\nodejs\node.exe'
)
foreach ($p in $checked) {
    if ($p) { Add (('[{0}] {1}' -f $(if (Test-Path -LiteralPath $p) { 'あり' } else { 'なし' }), $p)) }
}
Add ''

Add '--- レジストリの Node.js 情報 ---'
foreach ($key in @('HKLM:\SOFTWARE\Node.js', 'HKLM:\SOFTWARE\WOW6432Node\Node.js')) {
    $install = (Get-ItemProperty -Path $key).InstallPath
    Add ('{0} -> {1}' -f $key, $(if ($install) { $install } else { '(なし)' }))
}
foreach ($root in @('HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*',
                    'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*')) {
    foreach ($app in (Get-ItemProperty -Path $root)) {
        if ($app.DisplayName -like '*Node*') {
            Add ('インストール済み: {0} / {1}' -f $app.DisplayName, $app.InstallLocation)
        }
    }
}
Add ''

Add '--- PATH（この画面） ---'
Add $env:Path
Add ''
Add '--- PATH（Windows に保存されている分） ---'
Add ('Machine: ' + [Environment]::GetEnvironmentVariable('Path', 'Machine'))
Add ('User   : ' + [Environment]::GetEnvironmentVariable('Path', 'User'))
Add ''

Add '--- パソコン内の node.exe（浅い範囲だけ検索） ---'
$found = @()
foreach ($root in @($env:ProgramFiles, ${env:ProgramFiles(x86)}, $env:LOCALAPPDATA, $env:APPDATA, $env:USERPROFILE)) {
    if (-not $root) { continue }
    $found += Get-ChildItem -LiteralPath $root -Filter 'node.exe' -Recurse -Depth 3 -File |
              Select-Object -First 5
}
if ($found.Count -eq 0) { Add '見つかりませんでした（＝まだ入っていない可能性が高いです）' }
foreach ($f in $found) { Add $f.FullName }

Set-Content -LiteralPath $out -Value ($lines -join "`r`n") -Encoding UTF8
Write-Output $out
Start-Process notepad.exe $out

# node.exe の場所を探して、見つかればそのパスだけを表示するスクリプト。
# 1-SETUP.bat / 2-POST.bat から呼ばれる。見つからなければ終了コード 1。
#
# "where node" が失敗するケースが色々あるため、順に調べる:
#   1. レジストリに保存されている PATH（この画面の PATH が古くても拾える）
#   2. よくあるインストール先
#   3. Node.js インストーラがレジストリに残す場所
#   4. nvm / fnm / Volta などのバージョン管理ツールの置き場
#   5. 最後の手段として、限られた範囲を再帰検索

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

# 1. レジストリ上の PATH
foreach ($scope in @('Machine', 'User')) {
    $value = [Environment]::GetEnvironmentVariable('Path', $scope)
    if ($value) { foreach ($p in $value.Split(';')) { [void]$dirs.Add($p) } }
}

# 2. よくあるインストール先
foreach ($base in @($env:ProgramFiles, $env:ProgramW6432, ${env:ProgramFiles(x86)})) {
    if ($base) { [void]$dirs.Add((Join-Path $base 'nodejs')) }
}
[void]$dirs.Add((Join-Path $env:LOCALAPPDATA 'Programs\nodejs'))
[void]$dirs.Add((Join-Path $env:LOCALAPPDATA 'Volta\bin'))
[void]$dirs.Add('C:\nodejs')

# 3. インストーラが残すレジストリの情報
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

# 4. バージョン管理ツール（新しいものから）
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

# 5. 最後の手段：限られた範囲だけ探す
foreach ($root in @($env:ProgramFiles, $env:LOCALAPPDATA, $env:APPDATA, $env:USERPROFILE)) {
    if (-not $root) { continue }
    $hit = Get-ChildItem -LiteralPath $root -Filter 'node.exe' -Recurse -Depth 3 -File |
           Select-Object -First 1
    if ($hit) { Write-Output $hit.FullName; exit 0 }
}

exit 1

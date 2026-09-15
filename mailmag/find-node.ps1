# node.exe の場所を探して表示するだけのスクリプト（1-SETUP.bat / 2-POST.bat から呼ばれる）
#
# "where node" が失敗するのは、Node.js を入れた直後で、この画面の PATH が
# 古いままのことがあるため。レジストリから最新の PATH を読み直し、
# よくあるインストール先も直接調べる。

$dirs = @()

foreach ($scope in @('Machine', 'User')) {
    $value = [Environment]::GetEnvironmentVariable('Path', $scope)
    if ($value) { $dirs += $value.Split(';') }
}

$dirs += $env:ProgramFiles, $env:ProgramW6432 | Where-Object { $_ } | ForEach-Object { Join-Path $_ 'nodejs' }
$dirs += Join-Path ${env:ProgramFiles(x86)} 'nodejs'
$dirs += Join-Path $env:LOCALAPPDATA 'Programs\nodejs'
$dirs += Join-Path $env:LOCALAPPDATA 'Volta\bin'
$dirs += Join-Path $env:APPDATA 'npm'

foreach ($dir in $dirs) {
    if (-not $dir) { continue }
    try {
        $exe = Join-Path $dir.Trim('"') 'node.exe'
        if (Test-Path -LiteralPath $exe) {
            Write-Output $exe
            exit 0
        }
    } catch { }
}

exit 1

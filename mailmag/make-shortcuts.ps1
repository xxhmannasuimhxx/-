# Creates two Desktop shortcuts so the user never has to hunt for the
# folder again. Takes the tool folder (the one holding "mailmag") as $args[0].
# Failing here is not important, so every step is best-effort.
#
# NOTE: keep this file ASCII-only and saved with a UTF-8 BOM.

$ErrorActionPreference = 'SilentlyContinue'

$root = $args[0]
if (-not $root) { exit 1 }

$desktop = [Environment]::GetFolderPath('Desktop')
if (-not $desktop) { exit 1 }

$shell = New-Object -ComObject WScript.Shell

function New-Link($linkName, $targetBat) {
    if (-not (Test-Path -LiteralPath $targetBat)) { return }
    $link = $shell.CreateShortcut((Join-Path $desktop $linkName))
    $link.TargetPath = $targetBat
    $link.WorkingDirectory = Split-Path -Parent $targetBat
    $link.IconLocation = 'shell32.dll,44'
    $link.Save()
    Write-Output (Join-Path $desktop $linkName)
}

New-Link 'mailmag 1-SETUP.lnk' (Join-Path $root 'mailmag\1-SETUP.bat')
New-Link 'mailmag 2-POST.lnk'  (Join-Path $root 'mailmag\2-POST.bat')
New-Link 'mailmag 3-AUTO.lnk'  (Join-Path $root 'mailmag\3-AUTO.bat')
exit 0

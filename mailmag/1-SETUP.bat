@echo off
rem Windows: double-click this file to set up the mail magazine tool.
rem (All Japanese messages are printed by Node.js at the end.)
chcp 65001 >nul
setlocal
title mailmag setup
set "ROOT=%~dp0.."

rem --- Case 1: normal start from an extracted folder ---------------------
if exist "%ROOT%\mailmag\src\setup.js" goto CHECKNODE

rem --- Case 2: started from INSIDE the ZIP file --------------------------
rem Windows copies only this one file to a Temp folder, so the rest is missing.
rem Try to extract the downloaded ZIP automatically.
echo.
echo   [!] This file was started from INSIDE the ZIP file.
echo       ZIP wo tenkai (extract) sezu ni jikkou saremashita.
echo       Extracting the ZIP for you, please wait...
echo.

set "DEST=%USERPROFILE%\mailmag-tool"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$dl = Join-Path $env:USERPROFILE 'Downloads'; $all = @(Get-ChildItem -Path $dl -Filter 'mailmag-setup*.zip' -ErrorAction SilentlyContinue); if ($all.Count -eq 0) { exit 1 }; $z = $null; foreach ($f in $all) { if (-not $z -or $f.LastWriteTime -gt $z.LastWriteTime) { $z = $f } }; $dest = Join-Path $env:USERPROFILE 'mailmag-tool'; Expand-Archive -LiteralPath $z.FullName -DestinationPath $dest -Force; Write-Host ('   Extracted: ' + $z.Name)"
if errorlevel 1 goto NEEDEXTRACT

if exist "%DEST%\mailmag-tool\mailmag\src\setup.js" set "ROOT=%DEST%\mailmag-tool"
if exist "%DEST%\mailmag\src\setup.js" set "ROOT=%DEST%"
if not exist "%ROOT%\mailmag\src\setup.js" goto NEEDEXTRACT

echo   OK. Folder: %ROOT%
echo   (Next time, start 1-SETUP / 2-POST from this folder.)
echo.
goto CHECKNODE

:NEEDEXTRACT
echo.
echo   Please extract the ZIP first / ZIP wo tenkai shite kudasai:
echo     1. Close this window.
echo     2. The Downloads folder opens now.
echo     3. Right-click "mailmag-setup.zip" -^> "Extract All" (subete tenkai) -^> Extract
echo     4. In the new folder: mailmag-tool -^> mailmag -^> 1-SETUP
echo.
start "" "%USERPROFILE%\Downloads"
pause
exit /b 1

:CHECKNODE
set "FINDER=%~dp0find-node.bat"
if exist "%ROOT%\mailmag\find-node.bat" set "FINDER=%ROOT%\mailmag\find-node.bat"
call "%FINDER%"
if errorlevel 1 goto NONODE

echo   Node.js: %NODEEXE%
"%NODEEXE%" "%ROOT%\mailmag\src\setup.js"
echo.
pause
exit /b 0

:NONODE
echo.
echo   Node.js is required. / Node.js ga hitsuyou desu.
echo.
echo   1. The download page will open in your browser.
echo   2. Click the green "LTS" button and install it (keep clicking Next).
echo   3. Run this file (1-SETUP) again.
echo.
echo   * If you already installed it, restart the PC once and try again.
echo     (Sudeni install zumi nara, PC wo saikidou shite mou ichido)
echo.
start "" "https://nodejs.org/ja/download"
pause
exit /b 1

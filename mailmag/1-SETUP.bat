@echo off
rem Windows: double-click this file to set up the mail magazine tool.
rem (All Japanese messages are printed by Node.js at the end.)
chcp 65001 >nul
setlocal
title mailmag setup
set "ROOT=%~dp0.."
set "TRIED="

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

rem --- Node.js -----------------------------------------------------------
:CHECKNODE
set "FINDER=%~dp0find-node.bat"
if exist "%ROOT%\mailmag\find-node.bat" set "FINDER=%ROOT%\mailmag\find-node.bat"
call "%FINDER%"
if not errorlevel 1 goto RUN
if defined TRIED goto NONODE

rem Not found: install Node.js automatically with winget (Windows 10/11).
set "TRIED=1"
echo.
echo   Node.js is not installed. Installing it for you now...
echo   Node.js wo jidou de install shimasu. Sukoshi jikan ga kakarimasu.
echo   (If a permission dialog appears, please allow it.)
echo.
where winget >nul 2>nul
if errorlevel 1 goto MANUALINSTALL

winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements --disable-interactivity
echo.
echo   Checking again...
goto CHECKNODE

:MANUALINSTALL
echo   Automatic install is not available on this PC.
echo   The download page opens now. Click the green "LTS" button,
echo   run the downloaded file, keep clicking Next, then start 1-SETUP again.
echo.
start "" "https://nodejs.org/ja/download"
pause
exit /b 1

:RUN
echo   Node.js: %NODEEXE%
"%NODEEXE%" "%ROOT%\mailmag\src\setup.js"
echo.
pause
exit /b 0

:NONODE
echo.
echo   Node.js is still not found. / Mada mitsukarimasen.
echo   Making a report file so Claude can see what happened...
echo.
set "CHECKER=%~dp0check-node.ps1"
if exist "%ROOT%\mailmag\check-node.ps1" set "CHECKER=%ROOT%\mailmag\check-node.ps1"
powershell -NoProfile -ExecutionPolicy Bypass -File "%CHECKER%"
echo.
echo   A Notepad window opened (mailmag-check.txt).
echo   Please paste its contents into the chat with Claude.
echo   Memo wo Claude ni hattsukete kudasai.
echo.
pause
exit /b 1

@echo off
rem Windows: double-click this file to set up the mail magazine tool.
rem (All Japanese messages are printed by Node.js at the end.)
chcp 65001 >nul
setlocal
title mailmag setup
set "ROOT=%~dp0.."
set "TRIED="
set "RESULT=%TEMP%\mailmag-result.txt"

rem --- Case 1: normal start from an extracted folder ---------------------
if exist "%ROOT%\mailmag\src\setup.js" goto CHECKNODE

rem --- Case 2: started from INSIDE the ZIP file --------------------------
rem Windows copies only this one file to a Temp folder, so the rest is
rem missing. Find the downloaded ZIP (Desktop / Downloads / OneDrive / ...)
rem and extract it to %USERPROFILE%\mailmag-tool.
echo.
echo   [!] This file was started from INSIDE the ZIP file.
echo       ZIP wo tenkai (extract) sezu ni jikkou saremashita.
echo       Looking for the ZIP and extracting it for you, please wait...
echo.

del "%RESULT%" >nul 2>nul
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='SilentlyContinue'; $roots=@([Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('MyDocuments'), $env:USERPROFILE, (Join-Path $env:USERPROFILE 'Downloads'), $env:OneDrive); $newest=$null; foreach($r in $roots){ if(-not $r){continue}; foreach($h in (Get-ChildItem -LiteralPath $r -Filter 'mailmag-setup*.zip' -Recurse -Depth 2 -File)){ if(-not $newest -or $h.LastWriteTime -gt $newest.LastWriteTime){$newest=$h} } }; if(-not $newest){exit 1}; $dest=Join-Path $env:USERPROFILE 'mailmag-tool'; Expand-Archive -LiteralPath $newest.FullName -DestinationPath $dest -Force; foreach($c in @($dest,(Join-Path $dest 'mailmag-tool'))){ if(Test-Path -LiteralPath (Join-Path $c 'mailmag\src\setup.js')){ Write-Output $c; exit 0 } }; exit 1" > "%RESULT%" 2>nul
if not exist "%RESULT%" goto NEEDEXTRACT
set "FOUND="
for /f "usebackq delims=" %%P in ("%RESULT%") do if not defined FOUND set "FOUND=%%P"
del "%RESULT%" >nul 2>nul
if not defined FOUND goto NEEDEXTRACT
if not exist "%FOUND%\mailmag\src\setup.js" goto NEEDEXTRACT

set "ROOT=%FOUND%"
echo   OK. Extracted to: %ROOT%
echo.
goto CHECKNODE

:NEEDEXTRACT
echo.
echo   Could not find the ZIP automatically.
echo   Please extract it by hand / ZIP wo tenkai shite kudasai:
echo     1. Close this window.
echo     2. Find "mailmag-setup.zip" (Desktop or Downloads).
echo     3. Right-click it -^> "Extract All" (subete tenkai) -^> Extract
echo     4. In the new folder: mailmag-tool -^> mailmag -^> 1-SETUP
echo.
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

rem Put shortcuts on the Desktop so the folder never has to be hunted again.
powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%\mailmag\make-shortcuts.ps1" "%ROOT%" >nul 2>nul
echo.
echo   (Desktop shortcuts: "mailmag 1-SETUP" / "mailmag 2-POST")
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
echo.
pause
exit /b 1

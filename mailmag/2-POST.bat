@echo off
rem Windows: double-click this file to save the next draft into Reserve Stock.
rem (All Japanese messages are printed by Node.js at the end.)
chcp 65001 >nul
setlocal
title mailmag post
set "ROOT=%~dp0.."

if exist "%ROOT%\mailmag\src\cli.js" goto CHECKNODE

echo.
echo   [!] This file was started from INSIDE the ZIP file.
echo       ZIP wo tenkai (extract) shite kara jikkou shite kudasai.
echo.
echo     1. Close this window.
echo     2. The Downloads folder opens now.
echo     3. Right-click "mailmag-setup.zip" -^> "Extract All" (subete tenkai) -^> Extract
echo     4. In the new folder: mailmag-tool -^> mailmag -^> 1-SETUP (first time only)
echo.
start "" "%USERPROFILE%\Downloads"
pause
exit /b 1

:CHECKNODE
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Node.js not found. Please run 1-SETUP first.
  echo.
  pause
  exit /b 1
)

node "%ROOT%\mailmag\src\cli.js" post --headed
echo.
pause

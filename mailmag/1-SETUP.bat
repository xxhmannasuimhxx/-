@echo off
rem Windows: double-click this file to set up the mail magazine tool.
rem (All Japanese messages are printed by Node.js below.)
chcp 65001 >nul
cd /d "%~dp0.."
title mailmag setup

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Node.js is required. / Node.js ga hitsuyou desu.
  echo.
  echo   1. The download page will open in your browser.
  echo   2. Click the green "LTS" button and install it.
  echo   3. Run this file again.
  echo.
  start "" "https://nodejs.org/ja/download"
  pause
  exit /b 1
)

node mailmag\src\setup.js
echo.
pause

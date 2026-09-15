@echo off
rem Windows: double-click this file to save the next draft into Reserve Stock.
rem (All Japanese messages are printed by Node.js below.)
chcp 65001 >nul
cd /d "%~dp0.."
title mailmag post

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Node.js not found. Please run 1-SETUP.bat first.
  echo.
  pause
  exit /b 1
)

node mailmag\src\cli.js post --headed
echo.
pause

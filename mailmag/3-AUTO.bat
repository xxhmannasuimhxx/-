@echo off
rem Windows: double-click to turn the automatic draft posting on or off.
rem (All Japanese messages are printed by Node.js.)
chcp 65001 >nul
setlocal
title mailmag auto
set "ROOT=%~dp0.."

if not exist "%ROOT%\mailmag\src\schedule.js" (
  echo.
  echo   Please extract the ZIP first, then run 1-SETUP once.
  echo   ZIP wo tenkai shite, saisho ni 1-SETUP wo jikkou shite kudasai.
  echo.
  pause
  exit /b 1
)

call "%~dp0find-node.bat"
if errorlevel 1 (
  echo.
  echo   Node.js not found. Please run 1-SETUP first.
  echo.
  pause
  exit /b 1
)

"%NODEEXE%" "%ROOT%\mailmag\src\schedule.js"
echo.
pause

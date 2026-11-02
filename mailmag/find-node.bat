@echo off
rem ---------------------------------------------------------------
rem Locate node.exe and set NODEEXE / NODEDIR (adds its folder to PATH).
rem Returns exit code 1 when Node.js cannot be found at all.
rem Called by 1-SETUP.bat and 2-POST.bat.
rem
rem The PowerShell result is passed through a temp file on purpose:
rem a folder name containing "(" or ")" (e.g. "mailmag-setup (3)")
rem breaks a  for /f ... in (`powershell ...`)  command clause.
rem ---------------------------------------------------------------
set "NODEEXE="
set "NODEDIR="
set "NODELIST=%TEMP%\mailmag-node.txt"

for /f "delims=" %%P in ('where node 2^>nul') do if not defined NODEEXE set "NODEEXE=%%P"
if defined NODEEXE if not exist "%NODEEXE%" set "NODEEXE="
if defined NODEEXE goto FOUND

if exist "%ProgramFiles%\nodejs\node.exe" set "NODEEXE=%ProgramFiles%\nodejs\node.exe"
if not defined NODEEXE if exist "%ProgramW6432%\nodejs\node.exe" set "NODEEXE=%ProgramW6432%\nodejs\node.exe"
if not defined NODEEXE if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "NODEEXE=%ProgramFiles(x86)%\nodejs\node.exe"
if not defined NODEEXE if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "NODEEXE=%LOCALAPPDATA%\Programs\nodejs\node.exe"
if not defined NODEEXE if exist "%LOCALAPPDATA%\Volta\bin\node.exe" set "NODEEXE=%LOCALAPPDATA%\Volta\bin\node.exe"
if defined NODEEXE goto FOUND

del "%NODELIST%" >nul 2>nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0find-node.ps1" > "%NODELIST%" 2>nul
if not exist "%NODELIST%" goto NOTFOUND
for /f "usebackq delims=" %%P in ("%NODELIST%") do if not defined NODEEXE set "NODEEXE=%%P"
del "%NODELIST%" >nul 2>nul

rem Never trust the captured text: it must really be a file on disk.
if defined NODEEXE if not exist "%NODEEXE%" set "NODEEXE="

:FOUND
if not defined NODEEXE goto NOTFOUND
for %%D in ("%NODEEXE%") do set "NODEDIR=%%~dpD"
rem npm.cmd / npx.cmd live next to node.exe, so put that folder first.
set "PATH=%NODEDIR%;%PATH%"
exit /b 0

:NOTFOUND
set "NODEEXE="
exit /b 1

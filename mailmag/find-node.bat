@echo off
rem ---------------------------------------------------------------
rem Locate node.exe and set NODEEXE / NODEDIR (adds its folder to PATH).
rem Returns exit code 1 when Node.js cannot be found at all.
rem Called by 1-SETUP.bat and 2-POST.bat.
rem
rem "where node" fails when this window has a stale or broken PATH
rem (e.g. Node.js was installed after Explorer started), so we also
rem look in the usual install folders and then read the PATH that is
rem stored in the registry (find-node.ps1).
rem ---------------------------------------------------------------
set "NODEEXE="
set "NODEDIR="

for /f "delims=" %%P in ('where node 2^>nul') do if not defined NODEEXE set "NODEEXE=%%P"

if not defined NODEEXE if exist "%ProgramFiles%\nodejs\node.exe" set "NODEEXE=%ProgramFiles%\nodejs\node.exe"
if not defined NODEEXE if exist "%ProgramW6432%\nodejs\node.exe" set "NODEEXE=%ProgramW6432%\nodejs\node.exe"
if not defined NODEEXE if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "NODEEXE=%ProgramFiles(x86)%\nodejs\node.exe"
if not defined NODEEXE if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "NODEEXE=%LOCALAPPDATA%\Programs\nodejs\node.exe"
if not defined NODEEXE if exist "%LOCALAPPDATA%\Volta\bin\node.exe" set "NODEEXE=%LOCALAPPDATA%\Volta\bin\node.exe"

if not defined NODEEXE (
  for /f "usebackq delims=" %%P in (`powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0find-node.ps1"`) do if not defined NODEEXE set "NODEEXE=%%P"
)

if not defined NODEEXE exit /b 1

for %%D in ("%NODEEXE%") do set "NODEDIR=%%~dpD"
rem npm.cmd / npx.cmd live next to node.exe, so put that folder first.
set "PATH=%NODEDIR%;%PATH%"
exit /b 0

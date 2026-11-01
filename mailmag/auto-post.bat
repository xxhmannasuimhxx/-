@echo off
rem Runs quietly from Task Scheduler: saves the next draft into Reserve Stock.
rem Never sends; it only saves a draft. Output goes to mailmag\out\auto-post.log
chcp 65001 >nul
setlocal
set "ROOT=%~dp0.."

call "%~dp0find-node.bat"
if errorlevel 1 exit /b 1

if not exist "%ROOT%\mailmag\out" mkdir "%ROOT%\mailmag\out"
"%NODEEXE%" "%ROOT%\mailmag\src\cli.js" post --auto >> "%ROOT%\mailmag\out\auto-post.log" 2>&1
exit /b %errorlevel%

@echo off
rem Windows用：このファイルをダブルクリックすると、
rem いちばん古い「投稿まちの原稿」をリザストに下書き保存します。
chcp 65001 >nul
cd /d "%~dp0.."

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js が見つかりません。先に「はじめに準備.bat」を実行してください。
  pause
  exit /b 1
)

echo リザーブストックに下書きを保存します。ブラウザが自動で動きます。
echo.
node mailmag\src\cli.js post --headed
echo.
pause

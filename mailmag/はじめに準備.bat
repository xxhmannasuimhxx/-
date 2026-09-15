@echo off
rem Windows用：このファイルをダブルクリックすると、メルマガ自動投稿の準備が始まります。
chcp 65001 >nul
cd /d "%~dp0.."

where node >nul 2>nul
if errorlevel 1 (
  echo ================================================
  echo   Node.js ^(このしくみを動かす土台^) が必要です
  echo ================================================
  echo.
  echo いまブラウザで配布ページを開きます。
  echo   1. 「LTS」と書かれたボタンをクリック
  echo   2. ダウンロードされたファイルを開いて、画面の指示どおり進める
  echo   3. 終わったら、もう一度このファイルをダブルクリック
  echo.
  start "" "https://nodejs.org/ja/download"
  pause
  exit /b 1
)

node mailmag\src\setup.js
echo.
pause

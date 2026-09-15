#!/bin/bash
# Mac用（Windowsの方は1つ上のフォルダの 1-SETUP.bat / 2-POST.bat を使ってください）
# このファイルをダブルクリックすると、メルマガ自動投稿の準備が始まります。
# （「開発元が未確認」と出たら、右クリック →「開く」を選んでください）

cd "$(dirname "$0")/../.." || exit 1
clear

if ! command -v node >/dev/null 2>&1; then
  echo "================================================"
  echo "  Node.js（このしくみを動かす土台）が必要です"
  echo "================================================"
  echo
  echo "いまブラウザで配布ページを開きます。"
  echo "  1. 左側の「LTS」と書かれたボタンをクリック"
  echo "  2. ダウンロードされたファイルを開いて、画面の指示どおり進める"
  echo "  3. 終わったら、もう一度このファイルをダブルクリック"
  echo
  open "https://nodejs.org/ja/download" 2>/dev/null
  read -n 1 -s -r -p "何かキーを押すと閉じます。"
  exit 1
fi

node mailmag/src/setup.js

echo
read -n 1 -s -r -p "何かキーを押すと、このウィンドウを閉じます。"

#!/bin/bash
# Mac用（Windowsの方は1つ上のフォルダの 1-SETUP.bat / 2-POST.bat を使ってください）
# このファイルをダブルクリックすると、
# いちばん古い「投稿まちの原稿」をリザストに下書き保存します。
# （配信ボタンは押しません。最後の配信はリザストの画面でご自身で押してください）

cd "$(dirname "$0")/../.." || exit 1
clear

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js が見つかりません。先に「1-SETUP.command」を実行してください。"
  read -n 1 -s -r -p "何かキーを押すと閉じます。"
  exit 1
fi

echo "リザーブストックに下書きを保存します。ブラウザが自動で動きます。"
echo "（途中で止めたいときは、このウィンドウで control + C）"
echo

node mailmag/src/cli.js post --headed

echo
read -n 1 -s -r -p "何かキーを押すと、このウィンドウを閉じます。"

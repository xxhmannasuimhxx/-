#!/bin/sh
# 名刺の入稿用PDFとプレビュー画像を作り直す
# 使い方: sh meishi/build.sh   （meishi/ ディレクトリ内で実行）
set -e
CHROME="${CHROME:-/opt/pw-browsers/chromium}"   # 手元では Google Chrome のパスを指定
DIR="$(cd "$(dirname "$0")" && pwd)"

for v in "card.html:meishi_print.pdf" "card_rx.html:meishi_rx_print.pdf"; do
  html="${v%%:*}"; pdf="${v##*:}"
  "$CHROME" --headless --disable-gpu --no-sandbox --no-pdf-header-footer \
    --print-to-pdf="$DIR/$pdf" --virtual-time-budget=5000 "file://$DIR/$html"
done

python3 "$DIR/preview.py"

# 名刺 ／ 髙落 まどか（管理栄養士）

リーフレット「食で、人生を整える」と同じトーン（生成り＋明朝体＋ボタニカル、
オリーブ／オレンジ／ローズ／ティール）で作った名刺です。裏面違いで2種類あります。

| 種類 | ファイル | 裏面の内容 |
| --- | --- | --- |
| **A：お仕事のご依頼**（リーフレット準拠） | `card.html` → `meishi_print.pdf` | 4つの依頼カテゴリ＋実績＋連絡先＋QR |
| **B：おうちごはん処方箋** | `card_rx.html` → `meishi_rx_print.pdf` | その場で書き込める処方箋。名刺交換が小さな相談になる |

表面は2種類とも共通です。

- プレビュー：`preview.png`（A）／ `preview_rx.png`（B）／ 片面ずつは `preview_front.png` など
- スタイルは `card.css` に集約（色・サイズはすべてここ）

## 差し替えが必要なところ

1. **QRコード**（現在は仮の枠）
   `python3 make_qr.py <QRに入れるURL>` で `qr.png` を書き出し、
   `card.html` / `card_rx.html` の `<div class="qr-ph">…</div>` を
   `<img src="qr.png" alt="QR">` に置き換えてください。
   すでに画像がある場合は `meishi/qr.png` として置くだけで同じです。
2. **Instagram / LINE のID**
   リーフレットに載っていた `@smile.eiyoushi` をそのまま入れています。変更があれば `card.html` の `.contact` を修正。
   メールアドレスは `madoka.takaochi831@gmail.com` を入れています。

## 入稿仕様

- 仕上がり **91 × 55 mm**（日本の標準名刺サイズ）／ 塗り足し **3mm**（PDFは 97 × 61 mm・2ページ）
- 1ページ目＝表面、2ページ目＝裏面。トンボなし（ラクスル・プリントパック等の「塗り足し3mm」テンプレートにそのまま使えます）
- 文字は仕上がり線から 4mm 内側に収めています
- 用紙：**マットコート／上質紙**がおすすめ。B案は裏面にペンで書き込むため光沢紙は不可
- 書体：Zen Old Mincho・Noto Serif JP・Noto Sans JP（Google Fonts）。
  未インストールの環境では游明朝／ヒラギノ明朝にフォールバックします
- お名前の「**髙**」（はしごだか）は環境依存文字です。PDFにはフォントが埋め込まれているので
  そのまま入稿できますが、印刷所で組み直す場合は字形が変わっていないか必ず確認してください

## 作り直し方

```sh
sh meishi/build.sh                    # PDF とプレビュー画像をまとめて再生成
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" sh meishi/build.sh   # Mac の場合
```

Chrome で `card.html` を開いて「印刷 → PDFに保存 → 用紙サイズ:カスタム(97×61mm)・余白なし・背景のグラフィック ON」でも同じものが作れます。

> `card_rx.html` の表面は `card.html` からのコピーです。表面を直すときは両方のファイルを更新してください。

# 講座スライドを作るしくみ

オンライン講座のスライド（PowerPoint）を、**文章を書くだけ**で作れるようにしたものです。

---

## 使い方

### 1. 最初の1回だけ

```
npm install
```

### 2. スライドを作る

```
npm run build
```

`content/` に書いた中身から、`.pptx` ファイルが出てきます。

---

## ファイルの役割

```
content/     ← ★ 講座の中身（ここだけ書き換えます）
lib/         ← 見た目のしくみ（ふだんは触りません）
  theme.js     色・フォント・余白
  parts.js     カード・バッジなどの小さな部品
  layouts.js   スライド1枚の型
  deck.js      PowerPointファイル本体
build.js     ← 「どの回を作るか」の指定
```

**中身を直すときは `content/` の中だけ。**
色やデザインを変えたくなったときだけ `lib/theme.js` を触ります。

---

## 次の回のスライドを作るには

1. `content/` の中のファイルをコピーして、名前を変える
   例）`content/2026-09-XX_第3回_〇〇.js`
2. コピーしたファイルの中の文章を書き換える
3. 先頭の `meta.fileName` を、新しいファイル名にする
4. `build.js` の `DECK =` の行を、新しいファイルに差し替える
5. `npm run build`

Claude Code に頼むなら、こう言えば通じます:

```
content/2026-08-17_第2回_食と生活リズムの整え方.js をコピーして、
第3回「〇〇」用の content ファイルを作ってください。
テーマは △△、日時は □月□日、全体で90分です。
構成は第2回と同じ流れ（ゴール→ふりかえり→アジェンダ→本編4章→ワーク→まとめ）でお願いします。
```

---

## スライドの型（layout）の一覧

`content/` の各スライドで `layout: "..."` として選びます。

### 表紙・区切り・まとめ

| 型 | 使いどころ | 主な項目 |
|---|---|---|
| `title` | 表紙 | `eyebrow` `title` `subtitle` `lead` `pill` |
| `divider` | 章の区切り（濃紺） | `num` `title` `items[]` |
| `summary` | 最後のまとめ（濃紺） | `items[{num,title,desc}]` `closing` |
| `closing` | 質疑・おわりに | `lead` `callToAction` `thanks` |

### 3つ並べる

| 型 | 使いどころ | 主な項目 |
|---|---|---|
| `cards3` | 3つのポイント（番号が上） | `items[{badge,title,desc}]` `badgeTone` |
| `cards3Chip` | 3つの視点＋「こんな症状」の囲み | `items[{title,desc,chip,tone}]` |
| `levels3` | LEVEL 1／2／3 のような段階 | `items[{label,title,list[],foot,tone}]` |
| `work3` | 記入式のワーク（書き込み欄つき） | `items[{badge,title,desc,blank,tone}]` |
| `rows3Pill` | 全幅の横長カード3本 | `items[{label,title,desc,tone}]` |
| `levers3WithFlow` | 3つの短いカード＋下に流れの帯 | `items[]` `flow{lead,steps[]}` |

### 左にリスト＋右にパネル

| 型 | 使いどころ | 主な項目 |
|---|---|---|
| `list3WithNote` | ふりかえりなど＋右に「今回やること」 | `items[]` `aside{label,body,sub,tone}` |
| `steps3WithNote` | STEP 1・2・3＋右に濃紺の補足 | `items[]` `aside{label,body}` |
| `list3WithAlert` | 3つのコツ＋右に「こんなときは相談を」 | `items[]` `alert{heading,list[]}` |
| `list4WithStatement` | 4つの心得＋右に一番言いたいこと | `items[]` `aside{heading,body}` |

### 比較・一覧・その他

| 型 | 使いどころ | 主な項目 |
|---|---|---|
| `agenda` | 時間つきの進行表 | `rows[{num,label,time,tone}]` |
| `checklist2` | チェックボックスの2列リスト | `left[]` `right[]` |
| `compare2` | ○／× の左右比較 | `left{tone,badge,heading,items[]}` `right{...}` |
| `orderCompare` | 「うまくいく順番／いかない順番」の流れ図 | `left{...}` `right{...}` `statement` `lead` |
| `table` | 全幅の表 | `columns[]` `colW[]` `rows[][]` |
| `tableWithTips` | 表＋右に「コツ」パネル | `columns[]` `colW[]` `rows[][]` `tip` `aside` |
| `chartWithNotes` | 折れ線グラフ＋右に解説パネル | `series[]` `caption` `tip` `keyPoint` |
| `cols4Steps` | 4段階のステップ（矢印つき） | `items[{label,title,desc,tone}]` |
| `cols4List` | 4列のチェックリスト | `items[{label,list[],tone}]` |
| `grid4` | 2×2 のカード | `items[{title,desc}]` |

### どの型でも使える項目

| 項目 | 意味 |
|---|---|
| `eyebrow` | タイトルの上の小さな見出し |
| `title` | スライドのタイトル |
| `notes` | 発表者ノート（PowerPointの「ノート」欄） |
| `banner` | 下の帯。`{ text, tone, y, h }` |
| `note` | 下端の小さな注釈（※〜） |
| `tweak` | 昔の手作業の微調整。触らなくてOK |

`tone`（色の名前）に使えるもの:
`amber`（オレンジ）／`sage`（緑）／`rose`（赤）／`ink`（濃紺）／`plain`（グレー）

---

## 補足

- `tweak` は、以前 1枚ずつ手で微調整していた数値をそのまま残したものです。
  消しても壊れません。消すと、その型の標準の見た目になります。
- 以前の `build_deck.js`（1ファイルにまとまっていた版）は git の履歴に残っています。
  見たいときは `git show 8a49855:build_deck.js` で取り出せます。
- 分離のあとも、出力される `.pptx` は分離前と**1バイトも変わっていません**
  （30枚すべてのスライド・グラフ・発表者ノートで確認済み）。

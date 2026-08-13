# madoka-content-system

LINE に送ったメモを、発信用の原稿に整えて保存するシステム。

思いついたことを LINE で自分に送るだけで、内容に合った形式の原稿が
リポジトリ内のフォルダに溜まっていきます。

## 仕組み

```
LINE でメモを送る
      ↓
Webhook で受信（署名検証）
      ↓
① 受信原文をそのまま original/ に保管
      ↓
② Claude が分類先を判定し、その形式の原稿を生成
      ↓
③ 原稿を該当フォルダに書き出す
      ↓
④ 分類先と保存先を LINE に返信
```

②③で失敗しても①は済んでいるので、送ったメモが消えることはありません。

## フォルダ

| フォルダ | 中身 |
| --- | --- |
| `original/` | 受信したメモの原文。すべてここに残る |
| `ideas/` | まだ形になっていない着想・企画の種 |
| `reels/` | 30〜60秒のショート動画台本（フック／本編／締め） |
| `stories/` | ストーリーズ用の短文（3〜5枚構成） |
| `newsletter/` | メルマガ本文（件名＋600〜1200字） |
| `captions/` | フィード投稿のキャプション（＋ハッシュタグ） |

原稿には YAML フロントマター（`title` / `category` / `tags` / `summary` /
`source_note` / `status`）が付くので、後から検索・整理できます。

## 分類先を指定する

自動判定に任せず自分で決めたいときは、メモの先頭に付けてください。

```
#メルマガ 睡眠と朝食の関係について書きたい
```

使える指定: `#ネタ` `#リール` `#ストーリーズ` `#メルマガ` `#キャプション`
（英語表記 `#ideas` `#reels` `#stories` `#newsletter` `#captions` も可）

## セットアップ

### 1. 依存パッケージ

```bash
npm install
```

### 2. 認証情報

```bash
cp .env.example .env
```

`.env` に以下を記入します（`.env` は `.gitignore` 済みです）。

| 変数 | 取得場所 |
| --- | --- |
| `LINE_CHANNEL_SECRET` | LINE Developers > チャネル基本設定 |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Developers > Messaging API設定 > チャネルアクセストークン（長期） |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com/settings/keys |

### 3. 起動

```bash
npm start
```

### 4. LINE 側の設定

ローカルで動かす場合は、まず外から届く URL を用意します。

```bash
ngrok http 3000
```

LINE Developers コンソール > Messaging API設定 で:

1. **Webhook URL** に `https://<発行されたホスト>/line/webhook` を設定
2. **Webhook の利用** を ON
3. **応答メッセージ**（自動応答）を OFF ／ **あいさつメッセージ** は任意
4. 「検証」ボタンで疎通を確認

これで、LINE 公式アカウントにメモを送ると原稿が生成されます。

## 設定

| 変数 | 既定値 | 説明 |
| --- | --- | --- |
| `PORT` | `3000` | 待ち受けポート |
| `ANTHROPIC_MODEL` | `claude-opus-5` | 使用モデル |
| `CONTENT_ROOT` | リポジトリ直下 | 原稿の書き出し先ルート |

## 構成

```
server.js           Webhook の受け口（署名検証 → 即 200 → 非同期で処理）
src/config.js       環境変数の読み込みと検証
src/line.js         署名検証、返信／push 送信
src/categories.js   分類先の定義と #指定 の解析
src/classify.js     Claude による分類と原稿生成（構造化出力）
src/store.js        Markdown の書き出し
src/handler.js      イベント1件ぶんの処理の流れ
build_deck.js       講座スライドの生成（`npm run build:deck`）
```

## 動作のメモ

- **返信の仕組み**: 原稿生成に時間がかかりリプライトークンが失効した場合は、
  自動で push メッセージに切り替えます。push は無料プランだと月間上限があるため、
  通常は返信（無料・無制限）で届きます。
- **再送**: LINE は応答が遅いと同じイベントを再送します。`webhookEventId` で
  重複を判定し、二重に原稿を作りません。
- **テキスト以外**: 画像・音声などは受信記録だけ `original/` に残し、
  その旨を返信します（原稿は作りません）。
- **事実の扱い**: メモに書かれていない栄養情報・数値・エピソードは生成しません。
  裏付けが要る箇所は原稿中に `[要確認]` と入ります。

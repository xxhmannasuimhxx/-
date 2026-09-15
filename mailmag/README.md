# メルマガ自動投稿（リザーブストック連携）

Markdown で書いた原稿を、リザーブストック（リザスト）のメルマガ作成画面に
**下書きとして自動で保存する**しくみです。配信ボタンは押しません（安全のため）。

```
原稿(.md)  ─┐
            ├→ 件名 + 本文(HTML/テキスト) ─→ リザスト管理画面に自動入力 ─→ 下書き保存
講座スライド ─┘
```

## いちばんかんたんな始め方（パソコン操作だけ）

**準備（最初の1回だけ）**

1. GitHub のこのリポジトリのページで、緑色の **Code** ボタン →「**Download ZIP**」
2. ダウンロードされた ZIP をダブルクリックして展開
3. 中の `mailmag` フォルダを開き、
   - Windows … **`1-SETUP`（歯車のアイコン）をダブルクリック**
   - Mac … `mac` フォルダの中の **`1-SETUP.command` を右クリック →「開く」**
     （「開発元を確認できません」と出たら、もう一度「開く」を押す）
4. 黒い画面（ターミナル）が開くので、出てくる案内どおりに進めます
   - Node.js が入っていなければ、入手ページが自動で開きます（LTS を入れて、もう一度3へ）
   - リザストのメールアドレスとパスワードを聞かれます（このパソコンの中だけに保存されます）
   - ブラウザが開いたら、**ご自身でリザストにログイン**して、黒い画面に戻って Enter

**毎回の投稿**

1. `mailmag/drafts/` の中の `.md` ファイルに本文を書く（メモ帳・テキストエディットでOK）
2. `mailmag` フォルダの **`2-POST`**（Mac は `mac/2-POST.command`）をダブルクリック
3. ブラウザが自動で動いて、リザストに**下書き**が保存されます
4. リザストの画面で内容を見て、**配信ボタンはご自身で押す**

うまくいかないときは、黒い画面に出た文字と `mailmag/out/inspect/` の中の画像を
そのまま Claude に見せてください。設定を合わせます。

---

## しくみと、うまくいかない場合について

リザーブストックは外部向けのAPIを公開していません。そのため、この仕組みは
**ブラウザで管理画面を操作する**方式（Playwright）で作ってあります。

入力欄の名前が `mailmag/config/reservestock.json` の初期値と違っていても、
「件名」「本文」などのラベルの文字から**自動で入力欄を探す**ようにしてあります。
作成画面のURLが違う場合も、管理画面のメニュー（メルマガ → 新規作成）を
たどって自動で探します。それでも見つからないときだけ、設定ファイルを直します（下記）。

---

## セットアップ

```bash
npm install
npx playwright install chromium     # 初回のみ（ブラウザ本体の取得）

cp mailmag/.env.example mailmag/.env
# mailmag/.env にリザストのログインID（メールアドレス）とパスワードを書く
```

`mailmag/.env` と保存されたログインセッション（`mailmag/.auth/`）は
`.gitignore` 済みなので、GitHub には上がりません。

## 使い方

| コマンド | 内容 |
| --- | --- |
| `npm run mailmag:list` | 原稿の一覧と状態を表示 |
| `npm run mailmag:build` | 原稿を件名・本文に組み立てて `mailmag/out/` に出力（投稿しない） |
| `npm run mailmag:login` | ブラウザを開いて手動ログイン → セッションを保存 |
| `npm run mailmag:inspect` | 管理画面の入力欄・ボタンを調べて `mailmag/out/inspect/` に出力 |
| `npm run mailmag:post` | リザストに下書きとして保存 |
| `npm run mailmag:new` | 講座スライドから原稿のたたき台を作る |

よく使うオプション（`npm run mailmag:post -- --headed` のように付けます）

- `--file mailmag/drafts/xxx.md` … 原稿を指定する
- `--dry-run` … ブラウザを開かず、組み立てだけ確認する
- `--headed` … ブラウザ画面を表示して動きを見る
- `--keep-open` … 終了後もブラウザを閉じない（確認用）
- `--force` … 予定日がまだ先の原稿でも投稿する

## 原稿の書き方

`mailmag/drafts/` に `YYYY-MM-DD-なまえ.md` で置きます。

```markdown
---
subject: 2学期の朝ごはん、3つだけ決めませんか
date: 2026-09-20        # 投稿予定日（この日以降に post すると対象になる）
status: ready           # ready=投稿対象 / draft=まだ / posted=投稿済み
list: メルマガ読者       # 配信リスト名（省略可）
---

本文をふつうに書きます。**強調**、[リンク](https://example.com)、
箇条書き、番号付きリスト、> 引用 が使えます。
```

- `subject` を省くと、本文の最初の `# 見出し` が件名になります。
- あいさつ文と署名は `mailmag/config/template.json` で共通管理しています。
- 投稿に成功すると `status: posted` と `posted_at` が原稿に自動で書き込まれ、
  同じ原稿が二重に投稿されないようになっています。

### 講座スライドから起こす

```bash
npm run mailmag:new -- --slides 20-26 --name 秋バテ --date 2026-09-21
```

`build_deck.js` のスライド内容（文字だけ）を抜き出して、原稿のたたき台を作ります。
そのままでは読み物になっていないので、文章を整えてから `status: ready` にしてください。

## 初回の画面合わせ（セレクタ調整）

1. `npm run mailmag:login` … ブラウザが開くので、ご自身でログインします
   （二段階認証や画像認証があってもここで通せます）。ログインできたらターミナルで Enter。
   これで `mailmag/.auth/reservestock.json` にセッションが保存され、以後は自動で通ります。
2. `npm run mailmag:inspect` … メルマガ作成画面の入力欄とボタンの一覧が表示され、
   `mailmag/out/inspect/02-composer.json` とスクリーンショットが保存されます。
3. その結果を見て `mailmag/config/reservestock.json` を直します。
   - `composerUrl` … メルマガ作成画面のURL
   - `composer.subject` … 件名欄の `name` / `id`（例 `input[name="subject"]`）
   - `composer.bodyFrame` / `composer.body` … 本文欄。リッチエディタなら iframe のクラス名
   - `composer.saveDraftPattern` … 「下書き保存」ボタンの文言
   - `composer.sendPattern` … **絶対に押してほしくない**ボタンの文言（配信・送信など）
4. `npm run mailmag:post -- --headed --dry-run` で組み立てを確認 → `--dry-run` を外して実行。

## 安全のための決まりごと

- **配信ボタンは押しません。** 押すのは `saveDraftPattern` に一致し、かつ
  `sendPattern`（送信・配信・予約・削除）に一致しないボタンだけです。
  最終的な配信は、リザストの画面でご自身で確認してから押してください。
- パスワードはコードに書かず `.env`（または CI の Secrets）から読みます。
- 実行のたびに入力直前・保存後のスクリーンショットを `mailmag/out/inspect/` に残すので、
  あとから「何が入力されたか」を確認できます。

## 定期実行したくなったら

今は「下書き保存までを手動コマンドで実行」する構成です。毎週決まった時間に走らせたい場合は、
ご自身のPCの cron（Mac なら launchd）で

```
0 21 * * 1  cd /path/to/リポジトリ && npm run mailmag:post >> mailmag/out/cron.log 2>&1
```

のように登録するのが簡単です。GitHub Actions で動かすことも可能ですが、
ログイン情報を GitHub に預けることになり、二段階認証や不審ログイン検知にも
引っかかりやすいので、まずは手元での定期実行をおすすめします。

## 注意

ブラウザ自動操作は、リザーブストック側の画面変更で動かなくなることがあります
（そのときは `inspect` → `config` 修正で追随できます）。
また、自動操作の利用可否はサービスの利用規約に従ってください。

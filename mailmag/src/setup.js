#!/usr/bin/env node
/**
 * はじめての準備を、これ1つで終わらせるスクリプト。
 *
 *   1. 必要な部品のインストール
 *   2. ブラウザ（Chromium）の用意
 *   3. リザストのログイン情報を mailmag/.env に保存
 *   4. ブラウザを開いて1回だけ手動ログイン → セッション保存
 *   5. メルマガ作成画面を調べて、結果を out/inspect/ に保存
 *
 * Windows は mailmag/1-SETUP.bat、Mac は mailmag/mac/1-SETUP.command から呼ばれる。
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { ENV_FILE, AUTH_FILE } = require("./paths");
const { prompt } = require("./prompt");

const ROOT = path.join(__dirname, "..");        // mailmag/
const REPO = path.join(ROOT, "..");             // リポジトリ直下
const CLI = path.join(__dirname, "cli.js");

const say = (msg = "") => console.log(msg);
const step = (n, msg) => say(`\n[${n}/5] ${msg}`);

/**
 * 子プロセスの実行。
 *
 * Windows で shell:true を使うと "C:\Program Files\nodejs\node.exe" のような
 * 空白入りのパスが途中で切れてしまうため、
 *   ・node 自体は shell なしで直接起動する
 *   ・npm / npx は .cmd を引用符付きの1行コマンドとして渡す
 * という形にしている。
 */
function runNode(args) {
  const result = spawnSync(process.execPath, args, { stdio: "inherit", cwd: REPO });
  return result.status === 0;
}

function runTool(tool, args) {
  const isWin = process.platform === "win32";
  if (!isWin) {
    const result = spawnSync(tool, args, { stdio: "inherit", cwd: REPO });
    return result.status === 0;
  }
  // node.exe と同じフォルダにある npm.cmd / npx.cmd を使う
  const exe = path.join(path.dirname(process.execPath), `${tool}.cmd`);
  const command = fs.existsSync(exe) ? `"${exe}"` : tool;
  const result = spawnSync(`${command} ${args.join(" ")}`, {
    stdio: "inherit",
    cwd: REPO,
    shell: true,
  });
  return result.status === 0;
}

// ---------- 1. 部品 ----------
function ensureDependencies() {
  step(1, "必要な部品を確認しています…");
  try {
    require.resolve("playwright", { paths: [REPO] });
    say("  すでに入っています。OK");
    return true;
  } catch {
    say("  インストールします（数分かかることがあります）");
    return runTool("npm", ["install"]);
  }
}

// ---------- 2. ブラウザ ----------
function ensureBrowser() {
  step(2, "ブラウザ（Chromium）を確認しています…");
  try {
    const { chromium } = require(require.resolve("playwright", { paths: [REPO] }));
    const exe = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || chromium.executablePath();
    if (fs.existsSync(exe)) {
      say("  すでにあります。OK");
      return true;
    }
  } catch {
    /* 下でインストールする */
  }
  say("  ダウンロードします（初回だけ・数分かかります）");
  return runTool("npx", ["playwright", "install", "chromium"]);
}

// ---------- 3. ログイン情報 ----------
async function ensureEnv() {
  step(3, "リザーブストックのログイン情報を確認しています…");
  const current = fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, "utf8") : "";
  const hasEmail = /^RESERVESTOCK_EMAIL=.+$/m.test(current);
  const hasPassword = /^RESERVESTOCK_PASSWORD=.+$/m.test(current);

  if (hasEmail && hasPassword) {
    say(`  保存済みです（${ENV_FILE}）。OK`);
    return;
  }
  // パスワードを保存しない選択をした場合は、ログイン状態が残っている限り聞き直さない
  if (hasEmail && fs.existsSync(AUTH_FILE)) {
    say("  パスワードは保存していませんが、ログイン状態が残っているので進みます。OK");
    say(`  （保存し直したいときは ${ENV_FILE} を削除してから 1-SETUP を実行）`);
    return;
  }
  say("  リザストにログインするときの情報を入力してください。");
  say("  ※ このパソコンの中のファイルに保存されるだけで、どこにも送信されません。");
  say("  ※ 入力せずに Enter を押すと、毎回ブラウザで手入力する形になります。");
  const email = await prompt("  メールアドレス（ログインID）: ");
  const password = email
    ? await prompt("  パスワード（打っても画面には出ませんが入力されています）: ", true)
    : "";

  fs.mkdirSync(path.dirname(ENV_FILE), { recursive: true });
  fs.writeFileSync(
    ENV_FILE,
    [
      "# リザーブストック ログイン情報（このファイルは GitHub には上がりません）",
      `RESERVESTOCK_EMAIL=${email}`,
      `RESERVESTOCK_PASSWORD=${password}`,
      "",
    ].join("\n"),
    { mode: 0o600 }
  );
  say(`  保存しました: ${ENV_FILE}`);
}

// ---------- 4. 手動ログイン ----------
function doLogin() {
  step(4, "ブラウザを開きます。出てきた画面でリザストにログインしてください。");
  say("  ・自動でログインできることもあります。その場合はそのままお待ちください。");
  say("  ・ログインし終わったら、この黒い画面に戻って Enter キーを押してください。");
  return runNode([CLI, "login", "--headed", "--manual"]);
}

// ---------- 5. 画面しらべ ----------
function doInspect() {
  step(5, "メルマガ作成画面のつくりを調べています…");
  return runNode([CLI, "inspect"]);
}

function fail(message) {
  say(`\n${message}`);
  say("この画面の文字をそのまま Claude に貼り付けていただければ、原因を調べます。");
  process.exitCode = 1;
}

async function main() {
  say("=========================================");
  say("  メルマガ自動投稿 かんたん準備");
  say("=========================================");

  if (!ensureDependencies()) return fail("部品のインストールに失敗しました。");
  if (!ensureBrowser()) return fail("ブラウザの準備に失敗しました。");
  await ensureEnv();
  if (!doLogin()) return fail("ログインが完了しませんでした。もう一度実行してみてください。");
  doInspect(); // 失敗しても結果を見たいので、ここでは止めない

  say("\n=========================================");
  say("  準備おわり！");
  say("=========================================");
  say("このあとの使い方:");
  say("  ・原稿を書く       … mailmag/drafts/ の .md ファイルを編集");
  say("  ・下書きを投稿する … mailmag フォルダの 2-POST（Mac は mac/2-POST.command）をダブルクリック");
  say("");
  say("うまくいかないときは、この画面の文字と");
  say(`  ${path.join("mailmag", "out", "inspect")} の中の画像`);
  say("をそのまま Claude に見せてください。設定を合わせます。");
}

main();

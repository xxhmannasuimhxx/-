#!/usr/bin/env node
/**
 * 自動実行の登録・解除（Windows のタスクスケジューラ）。
 *
 * 決まった時刻に auto-post.bat を動かし、投稿まちの原稿があれば
 * リザストに下書きとして保存する。配信は行わない。
 *
 * 3-AUTO.bat から呼ばれる。
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { prompt } = require("./prompt");

const ROOT = path.join(__dirname, "..");                 // mailmag/
const RUNNER = path.join(ROOT, "auto-post.bat");
const TASK_NAME = "mailmag-auto-post";

const say = (msg = "") => console.log(msg);

function schtasks(args) {
  return spawnSync("schtasks", args, { encoding: "utf8", windowsHide: true });
}

/** 登録済みかどうか */
function isRegistered() {
  const result = schtasks(["/Query", "/TN", TASK_NAME]);
  return result.status === 0;
}

/** 時刻の入力を HH:MM に整える（例: 7 → 07:00、730 → 07:30） */
function normalizeTime(input) {
  const text = String(input || "").trim();
  if (!text) return "07:00";
  const m = /^(\d{1,2})\s*[:時]?\s*(\d{1,2})?/.exec(text);
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2] || 0);
  if (hour > 23 || minute > 59) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

async function register() {
  say("毎日きまった時刻に、投稿まちの原稿を自動で下書き保存します。");
  say("（下書きに入れるだけです。配信は行いません）");
  say("");
  const answer = await prompt("何時に実行しますか？（例: 7 または 21:30／そのまま Enter で 7:00）: ");
  const time = normalizeTime(answer);
  if (!time) {
    say("時刻が読み取れませんでした。もう一度実行してください。");
    return false;
  }

  const result = schtasks([
    "/Create",
    "/TN", TASK_NAME,
    "/TR", `"${RUNNER}"`,
    "/SC", "DAILY",
    "/ST", time,
    "/F",
  ]);

  if (result.status !== 0) {
    say("登録できませんでした。");
    say((result.stderr || result.stdout || "").trim());
    return false;
  }

  say("");
  say(`登録しました。毎日 ${time} に自動で下書きが入ります。`);
  say("");
  say("・パソコンの電源が入っていて、サインインしている必要があります");
  say("・その時刻にパソコンが消えていた場合は、次に起動したときに実行されます");
  say(`・結果は ${path.join(ROOT, "out", "auto-post.log")} に記録されます`);
  say("・やめたいときは、もう一度 3-AUTO をダブルクリックしてください");
  return true;
}

function unregister() {
  const result = schtasks(["/Delete", "/TN", TASK_NAME, "/F"]);
  if (result.status !== 0) {
    say("解除できませんでした。");
    say((result.stderr || result.stdout || "").trim());
    return false;
  }
  say("自動実行をやめました。今後は 2-POST を押したときだけ下書きが入ります。");
  return true;
}

async function main() {
  say("=========================================");
  say("  メルマガ 自動下書きの設定");
  say("=========================================");
  say("");

  if (process.platform !== "win32") {
    say("このスクリプトは Windows 用です。");
    say("Mac の場合は、ターミナルで crontab -e に次の行を追加してください（毎朝7時の例）:");
    say(`  0 7 * * *  cd "${path.join(ROOT, "..")}" && node mailmag/src/cli.js post --auto`);
    return;
  }

  if (!fs.existsSync(RUNNER)) {
    say(`自動実行用のファイルが見つかりません: ${RUNNER}`);
    return;
  }

  if (isRegistered()) {
    say("いまは「自動で下書きに入る」設定が有効になっています。");
    const answer = await prompt("解除しますか？（やめる: y / このままにする: n）: ");
    if (/^(y|yes|は|はい)/i.test(answer)) unregister();
    else say("そのままにします。");
    return;
  }

  await register();
}

main().catch((err) => {
  console.error(`\n${String(err.message || err).split("\n")[0]}`);
  process.exitCode = 1;
});

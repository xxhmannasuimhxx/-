#!/usr/bin/env node
/**
 * GitHub Actions 用：今回リザストに入れる原稿を決めて、1行に1ファイルずつ出力する。
 * スマホから（Claude アプリ／GitHub アプリ）動かすための入口。配信はしない。
 *
 *   node mailmag/src/ci-targets.js push <変更されたファイル...>
 *       … 今回の push で追加・変更された原稿のうち、status: ready で予定日が来ているもの
 *   node mailmag/src/ci-targets.js schedule
 *       … 予定日（date:）が今日以前で、status: ready のもの（予定日の無い原稿は対象外）
 *   node mailmag/src/ci-targets.js manual [原稿ファイル]
 *       … 指定があればそれ。無ければ次に投稿まちの1件
 *
 * 予定日がまだ先の原稿は、ここでは選ばない（その日の朝の定期実行で入る）。
 */

const fs = require("fs");
const path = require("path");
const { loadDraft, listDrafts, pickDraft, DRAFT_DIR } = require("./draft");

const today = process.env.MAILMAG_TODAY ||
  new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });   // YYYY-MM-DD（日本時間）

const isDue = (d) => d.status === "ready" && (!d.date || String(d.date) <= today);
const rel = (f) => path.relative(process.cwd(), f);

function fromPush(files) {
  return files
    .filter((f) => /^mailmag\/drafts\/[^/]+\.md$/.test(f) && fs.existsSync(f))
    .map((f) => loadDraft(path.resolve(f)))
    .filter((d) => {
      if (d.status !== "ready") return false;
      if (!isDue(d)) {
        console.error(`予定日 ${d.date} の原稿なので、その日の朝に入れます: ${d.name}`);
        return false;
      }
      return true;
    });
}

function fromSchedule() {
  return listDrafts().filter((d) => d.date && isDue(d));
}

function fromManual(file) {
  if (file) {
    const f = path.isAbsolute(file) ? file
      : fs.existsSync(file) ? file : path.join(DRAFT_DIR, path.basename(file));
    return [loadDraft(path.resolve(f))];
  }
  const next = pickDraft({ today });
  return next ? [next] : [];
}

const [mode, ...rest] = process.argv.slice(2);
const picked =
  mode === "push" ? fromPush(rest) :
  mode === "schedule" ? fromSchedule() :
  mode === "manual" ? fromManual(rest[0]) :
  (() => { throw new Error(`使い方: ci-targets.js <push|schedule|manual> ...`); })();

for (const d of picked) console.log(rel(d.file));

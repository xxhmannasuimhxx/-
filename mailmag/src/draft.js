/**
 * メルマガ原稿（Markdown）の読み込み・選択。
 *
 * 原稿は mailmag/drafts/*.md に置く。先頭に YAML 風のフロントマターを書ける。
 *
 *   ---
 *   subject: 【スマイルおうち栄養士】9月の朝ごはん
 *   date: 2026-09-20         # 投稿予定日（省略可）
 *   status: ready            # ready / draft / posted
 *   list: メルマガ読者        # リザストの配信リスト名（省略可）
 *   ---
 */

const fs = require("fs");
const path = require("path");

const DRAFT_DIR = path.join(__dirname, "..", "drafts");

/** フロントマター付き Markdown を { meta, body } に分解する */
function parseFrontMatter(raw) {
  const text = String(raw).replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!m) return { meta: {}, body: text.trim() + "\n" };

  const meta = {};
  for (const line of m[1].split("\n")) {
    const kv = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line.trim());
    if (!kv) continue;
    let value = kv[2].replace(/\s+#\s.*$/, "").trim()   // 行末コメントを落とす
      .replace(/^["'](.*)["']$/, "$1");
    if (value.startsWith("[") && value.endsWith("]")) {
      value = value.slice(1, -1).split(",").map((v) => v.trim()).filter(Boolean);
    }
    meta[kv[1]] = value;
  }
  return { meta, body: text.slice(m[0].length).trim() + "\n" };
}

/** 1ファイルを読み込む */
function loadDraft(file) {
  const { meta, body } = parseFrontMatter(fs.readFileSync(file, "utf8"));
  // subject が無ければ本文の最初の見出し、それも無ければファイル名を使う
  const firstHeading = /^#\s+(.+)$/m.exec(body);
  const subject = meta.subject || (firstHeading && firstHeading[1].trim()) ||
    path.basename(file, ".md");
  return {
    file,
    name: path.basename(file),
    meta,
    subject,
    body: firstHeading && !meta.subject
      ? body.replace(/^#\s+.+\n+/m, "")   // 件名に使った見出しは本文から外す
      : body,
    status: (meta.status || "ready").toLowerCase(),
    date: meta.date || null,
  };
}

/** drafts/ の全原稿を日付（無ければファイル名）順で返す */
function listDrafts(dir = DRAFT_DIR) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => loadDraft(path.join(dir, f)))
    .sort((a, b) => String(a.date || a.name).localeCompare(String(b.date || b.name)));
}

/**
 * 投稿対象の原稿を1件選ぶ。
 * @param {object} opts
 * @param {string} [opts.file]  明示指定されたファイル
 * @param {string} [opts.today] 判定基準日（YYYY-MM-DD、既定は本日）
 * @param {boolean} [opts.respectDate=true] 予定日が未来の原稿を除外するか
 */
function pickDraft(opts = {}) {
  if (opts.file) {
    const file = path.isAbsolute(opts.file) ? opts.file : path.resolve(opts.file);
    if (!fs.existsSync(file)) throw new Error(`原稿が見つかりません: ${file}`);
    return loadDraft(file);
  }
  const today = opts.today || new Date().toISOString().slice(0, 10);
  const ready = listDrafts().filter((d) => d.status === "ready");
  if (opts.respectDate === false) return ready[0] || null;
  // 予定日が来ているもの（日付なしは常に対象）のうち、いちばん古いもの
  const due = ready.filter((d) => !d.date || String(d.date) <= today);
  return due[0] || null;
}

/** 投稿済みフラグを原稿に書き戻す */
function markPosted(draft, note) {
  const raw = fs.readFileSync(draft.file, "utf8");
  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  const line = `posted_at: ${stamp}${note ? ` (${note})` : ""}`;
  let next;
  if (/^---\n[\s\S]*?\n---\n?/.test(raw)) {
    next = /^status\s*:/m.test(raw.split("---")[1] || "")
      ? raw.replace(/^status\s*:.*$/m, "status: posted")
      : raw.replace(/^---\n/, "---\nstatus: posted\n");
    next = /^posted_at\s*:/m.test(next)
      ? next.replace(/^posted_at\s*:.*$/m, line)
      : next.replace(/^status\s*:.*$/m, (s) => `${s}\n${line}`);
  } else {
    next = `---\nstatus: posted\n${line}\n---\n\n${raw}`;
  }
  fs.writeFileSync(draft.file, next);
}

module.exports = { DRAFT_DIR, parseFrontMatter, loadDraft, listDrafts, pickDraft, markPosted };

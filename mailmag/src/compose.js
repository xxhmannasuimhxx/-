/**
 * 原稿（Markdown）→ 実際に投稿する件名・本文（HTML / テキスト）の組み立て。
 *
 * 定型のあいさつ・署名は mailmag/config/template.json で差し替えられる。
 * 配信解除リンクはリザーブストック側で自動付与されるため、ここでは入れない。
 */

const fs = require("fs");
const path = require("path");
const { render } = require("./markdown");

const TEMPLATE_FILE = path.join(__dirname, "..", "config", "template.json");

function loadTemplate() {
  const fallback = { greeting: "", signature: "", subjectPrefix: "" };
  if (!fs.existsSync(TEMPLATE_FILE)) return fallback;
  return { ...fallback, ...JSON.parse(fs.readFileSync(TEMPLATE_FILE, "utf8")) };
}

/**
 * @param {{subject:string, body:string, meta?:object}} draft
 * @returns {{subject:string, html:string, text:string}}
 */
function compose(draft) {
  const tpl = loadTemplate();
  const meta = draft.meta || {};
  const prefix = meta.subject_prefix != null ? meta.subject_prefix : tpl.subjectPrefix;
  const subject = `${prefix || ""}${draft.subject}`.trim();

  const parts = [];
  if (tpl.greeting) parts.push(tpl.greeting.trim());
  parts.push(draft.body.trim());
  if (tpl.signature) parts.push("---", tpl.signature.trim());

  const md = parts.join("\n\n");
  const { html, text } = render(md);

  return {
    subject,
    html: `<div style="max-width:640px;margin:0 auto;font-family:'Hiragino Sans','Meiryo',sans-serif;">\n${html}\n</div>`,
    text,
  };
}

/** 組み立て結果を out/ に書き出してプレビューできるようにする */
function writeOutput(composed, outDir, baseName) {
  fs.mkdirSync(outDir, { recursive: true });
  const base = baseName.replace(/\.md$/, "");
  const files = {
    subject: path.join(outDir, `${base}.subject.txt`),
    html: path.join(outDir, `${base}.html`),
    text: path.join(outDir, `${base}.txt`),
  };
  fs.writeFileSync(files.subject, composed.subject + "\n");
  fs.writeFileSync(files.html, composed.html + "\n");
  fs.writeFileSync(files.text, composed.text);
  return files;
}

module.exports = { compose, writeOutput, loadTemplate, TEMPLATE_FILE };

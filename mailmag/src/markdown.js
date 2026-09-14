/**
 * 最小限の Markdown → メール用 HTML / プレーンテキスト変換。
 * 外部依存を増やさないため、メルマガで使う記法だけに絞っている。
 *
 * 対応記法: 見出し(#〜###) / 箇条書き(- *) / 番号付き(1.) / 引用(>) /
 *           水平線(---) / 強調(**) / リンク([text](url)) / 段落
 */

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ESCAPES[c]);
}

/** 行内記法（強調・リンク）を HTML に変換する */
function inline(s) {
  let out = escapeHtml(s);
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" style="color:#D9822B;">$1</a>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  return out;
}

/** 行内記法をプレーンテキスト向けに落とす */
function inlineText(s) {
  return String(s)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1（$2）")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1$2");
}

const P  = 'style="margin:0 0 1em;line-height:1.8;font-size:15px;color:#1E3A5F;"';
const H  = (size) => `style="margin:1.6em 0 0.6em;font-size:${size}px;line-height:1.5;color:#13273F;"`;
const LI = 'style="margin:0 0 0.4em;line-height:1.8;font-size:15px;color:#1E3A5F;"';

/**
 * Markdown 本文を { html, text } に変換する。
 * @param {string} md
 */
function render(md) {
  const lines = String(md).replace(/\r\n?/g, "\n").split("\n");
  const html = [];
  const text = [];
  let list = null;            // "ul" | "ol" | null
  let olIndex = 0;            // 番号付きリストの連番（プレーンテキスト用）
  let para = [];
  let quote = [];

  const flushPara = () => {
    if (!para.length) return;
    html.push(`<p ${P}>${para.map(inline).join("<br>")}</p>`);
    text.push(para.map(inlineText).join("\n"), "");
    para = [];
  };
  const flushList = () => {
    if (!list) return;
    html.push(`</${list}>`);
    text.push("");
    list = null;
    olIndex = 0;
  };
  const flushQuote = () => {
    if (!quote.length) return;
    html.push(
      '<blockquote style="margin:0 0 1em;padding:0.8em 1em;border-left:4px solid #D9822B;' +
      'background:#FBEAD6;color:#13273F;font-size:15px;line-height:1.8;">' +
      quote.map(inline).join("<br>") + "</blockquote>"
    );
    text.push(quote.map((q) => "> " + inlineText(q)).join("\n"), "");
    quote = [];
  };
  const flushAll = () => { flushPara(); flushList(); flushQuote(); };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");

    if (!line.trim()) { flushAll(); continue; }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      flushAll();
      const level = heading[1].length;
      const size = [24, 19, 17][level - 1];
      html.push(`<h${level} ${H(size)}>${inline(heading[2])}</h${level}>`);
      text.push(inlineText(heading[2]), "─".repeat(Math.max(6, heading[2].length)), "");
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      flushAll();
      html.push('<hr style="border:none;border-top:1px solid #D9E2EA;margin:2em 0;">');
      text.push("──────────────", "");
      continue;
    }

    const quoted = /^>\s?(.*)$/.exec(line);
    if (quoted) { flushPara(); flushList(); quote.push(quoted[1]); continue; }

    const ul = /^\s*[-*]\s+(.*)$/.exec(line);
    const ol = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (ul || ol) {
      flushPara(); flushQuote();
      const want = ul ? "ul" : "ol";
      if (list !== want) {
        flushList();
        list = want;
        html.push(`<${want} style="margin:0 0 1em;padding-left:1.4em;">`);
      }
      const item = (ul || ol)[1];
      html.push(`<li ${LI}>${inline(item)}</li>`);
      text.push(ul ? `・${inlineText(item)}` : `${++olIndex}. ${inlineText(item)}`);
      continue;
    }

    flushList(); flushQuote();
    para.push(line);
  }
  flushAll();

  return {
    html: html.join("\n"),
    text: text.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n",
  };
}

module.exports = { render, escapeHtml };

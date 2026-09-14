/**
 * 講座スライド（build_deck.js）からメルマガの下書きを起こすためのモジュール。
 *
 * build_deck.js は pptxgenjs でスライドを組み立てるスクリプトなので、
 * pptxgenjs を差し替えて読み込み、addText に渡された文字列を回収する。
 * （PPTX ファイルは書き出さない）
 */

const Module = require("module");
const path = require("path");

/** テキスト引数（文字列 / {text} / 配列）を1本の文字列にする */
function toText(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(toText).join("");
  if (typeof value === "object" && "text" in value) return toText(value.text);
  return String(value);
}

/** 何にでも応答するダミー（ShapeType など） */
const anyProp = new Proxy({}, { get: (_t, key) => (typeof key === "string" ? key : undefined) });

class FakeSlide {
  constructor(index) {
    this.index = index;
    this.texts = [];   // { text, size, bold }
    this.notes = "";
    this.background = null;
  }
  addText(value, opts = {}) {
    const text = toText(value).trim();
    if (text) this.texts.push({ text, size: opts.fontSize || 0, bold: !!opts.bold });
    return this;
  }
  addNotes(note) { this.notes = String(note || "").trim(); return this; }
  addShape() { return this; }
  addImage() { return this; }
  addTable(rows) {
    for (const row of rows || []) {
      for (const cell of row || []) this.addText(cell, { fontSize: 12 });
    }
    return this;
  }
  addChart() { return this; }
}

// then() が何もしない thenable。await されないので処理は止まらない。
const noopThenable = { then() { return noopThenable; }, catch() { return noopThenable; } };

function makeFakePptxGen(collected) {
  class FakePptxGenJS {
    constructor() {
      this.layout = "";
      this.author = "";
      this.title = "";
      // ShapeType / ChartType など未知の列挙型にも応答できるようにしておく
      return new Proxy(this, {
        get(target, key, receiver) {
          if (key in target) return Reflect.get(target, key, receiver);
          return typeof key === "string" ? anyProp : undefined;
        },
      });
    }
    defineLayout() {}
    defineSlideMaster() {}
    addSlide() {
      const slide = new FakeSlide(collected.slides.length + 1);
      collected.slides.push(slide);
      return slide;
    }
    // 呼ばれても何もしない thenable を返す（build_deck.js 側の .then(...) を走らせない）
    writeFile() {
      collected.meta = { author: this.author, title: this.title };
      return noopThenable;
    }
    write() { return noopThenable; }
    stream() { return noopThenable; }
  }
  return FakePptxGenJS;
}

/**
 * build_deck.js を読み込んでスライド内容を抽出する。
 * @param {string} deckFile
 * @returns {{ meta: object, slides: Array }}
 */
function extractDeck(deckFile) {
  const file = path.resolve(deckFile);
  const collected = { meta: {}, slides: [] };
  const fake = makeFakePptxGen(collected);

  const originalLoad = Module._load;
  const originalLog = console.log;   // build_deck.js の書き出しログを抑止する
  console.log = () => {};
  Module._load = function (request, parent, isMain) {
    if (request === "pptxgenjs") return fake;
    return originalLoad.call(this, request, parent, isMain);
  };
  try {
    delete require.cache[file];
    require(file);
  } finally {
    Module._load = originalLoad;
    console.log = originalLog;
    delete require.cache[file];
  }
  return collected;
}

/** "3-8,12" のような指定を slide 番号の集合にする */
function parseRange(spec, max) {
  if (!spec) return null;
  const wanted = new Set();
  for (const part of String(spec).split(",")) {
    const range = /^(\d+)\s*-\s*(\d+)$/.exec(part.trim());
    if (range) {
      for (let i = Number(range[1]); i <= Math.min(Number(range[2]), max); i++) wanted.add(i);
    } else if (/^\d+$/.test(part.trim())) {
      wanted.add(Number(part.trim()));
    }
  }
  return wanted;
}

/**
 * スライドからメルマガ原稿（Markdown）のたたき台を作る。
 * そのまま配信するものではなく、手を入れる前提の下書き。
 */
function deckToMarkdown(deckFile, opts = {}) {
  const { meta, slides } = extractDeck(deckFile);
  const wanted = parseRange(opts.slides, slides.length);
  const picked = slides.filter((s) => (wanted ? wanted.has(s.index) : true) && s.texts.length);

  const lines = [];
  for (const slide of picked) {
    const sorted = [...slide.texts].sort((a, b) => b.size - a.size);
    const head = sorted[0];
    const rest = slide.texts.filter((t) => t !== head);
    lines.push(`## ${head.text.replace(/\n+/g, " ")}`, "");
    for (const t of rest) {
      const body = t.text.split("\n").map((l) => l.trim()).filter(Boolean);
      if (!body.length) continue;
      if (body.length > 1 && body.every((l) => l.length <= 40)) {
        lines.push(...body.map((l) => `- ${l}`), "");
      } else {
        lines.push(body.join("\n"), "");
      }
    }
    if (opts.notes && slide.notes) lines.push(`> ${slide.notes}`, "");
  }

  return {
    title: meta.title || path.basename(deckFile),
    author: meta.author || "",
    slideCount: slides.length,
    usedSlides: picked.map((s) => s.index),
    markdown: lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n",
  };
}

module.exports = { extractDeck, deckToMarkdown, parseRange };

/**
 * 女性のための栄養学 〜月経編・更年期編〜　第1回「からだの地図を持つ」（全2回・120分）
 *
 * 原稿：company/04_contents/女性のための栄養学_第1回_台本.md
 * 配布：company/04_contents/女性のための栄養学_第1回_配布シート原稿.md
 *
 * ※ 既存の build_deck.js（夏休み講座）は書き換えず、デザイントークンだけ踏襲した新規スクリプト。
 * ※ このシリーズのアクセントは ROSE。AMBER に戻したいときは ACCENT を差し替えるだけで全体が変わります。
 */
const PptxGenJS = require("pptxgenjs");

// ---------- Design tokens（build_deck.js と共通） ----------
const INK       = "1E3A5F";
const INK_DEEP  = "13273F";
const INK_SOFT  = "35557D";
const AMBER     = "D9822B";
const AMBER_LT  = "FBEAD6";
const SAGE      = "3F8A72";
const SAGE_LT   = "E3EFEA";
const ROSE      = "B4544F";
const ROSE_LT   = "F8E7E4";
const CARD      = "F1F5F9";
const LINE      = "D9E2EA";
const GRAY      = "5C6E80";
const LIGHT     = "C7D6E6";
const DIM       = "9FB4CC";
const W         = "FFFFFF";

// このシリーズのアクセント
const ACCENT    = ROSE;
const ACCENT_LT = ROSE_LT;
const ACCENT_TX = "7E3430";

const JP = "Meiryo";

const SW = 13.333, SH = 7.5;
const M = 0.7;
const CW = SW - M * 2;

const sh = () => ({ type: "outer", color: "1E3A5F", blur: 10, offset: 2, angle: 90, opacity: 0.10 });

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "髙落まどか";
pptx.title = "女性のための栄養学 〜月経編・更年期編〜 第1回";
pptx.subject = "からだの地図を持つ";

// ---------- helpers ----------
function newSlide(dark) {
  const s = pptx.addSlide();
  s.background = { color: dark ? INK_DEEP : W };
  return s;
}

function header(s, eyebrow, title) {
  s.addText(eyebrow, {
    x: M, y: 0.40, w: CW, h: 0.28, fontFace: JP, fontSize: 12, bold: true,
    color: ACCENT, margin: 0, valign: "middle",
  });
  s.addText(title, {
    x: M, y: 0.70, w: CW, h: 0.62, fontFace: JP, fontSize: 27, bold: true,
    color: INK, margin: 0, valign: "middle",
  });
  return 1.55;
}

function badge(s, x, y, d, label, fill, txtColor, fs) {
  s.addShape(pptx.ShapeType.ellipse, {
    x, y, w: d, h: d, fill: { color: fill || ACCENT }, line: { width: 0 },
  });
  s.addText(label, {
    x, y, w: d, h: d, fontFace: JP, fontSize: fs || 15, bold: true,
    color: txtColor || W, align: "center", valign: "middle", margin: 0,
  });
}

function card(s, x, y, w, h, fill) {
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.09,
    fill: { color: fill || CARD }, line: { color: fill || CARD, width: 0 },
    shadow: sh(),
  });
}

function pill(s, x, y, w, h, text, fill, fs, txtColor) {
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: h / 2, fill: { color: fill }, line: { width: 0 },
  });
  s.addText(text, {
    x, y, w, h, fontFace: JP, fontSize: fs || 12, bold: true,
    color: txtColor || W, align: "center", valign: "middle", margin: 0,
  });
}

function note(s, text, color) {
  s.addText(text, {
    x: M, y: 6.72, w: CW, h: 0.4, fontFace: JP, fontSize: 12,
    color: color || GRAY, margin: 0, valign: "middle",
  });
}

function banner(s, y, text, fill, textColor, h, fs) {
  card(s, M, y, CW, h || 0.85, fill);
  s.addText(text, {
    x: M + 0.5, y, w: CW - 1.0, h: h || 0.85, fontFace: JP, fontSize: fs || 16, bold: true,
    color: textColor, margin: 0, valign: "middle",
  });
}

// 記入欄に見える白いボックス（配布シートと同じ役割を画面上でも示す）
function blank(s, x, y, w, h, placeholder) {
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.07,
    fill: { color: W }, line: { color: "C3D0DC", width: 1, dashType: "dash" },
  });
  if (placeholder) {
    s.addText(placeholder, {
      x: x + 0.15, y, w: w - 0.3, h, fontFace: JP, fontSize: 11.5,
      color: "9AA9B8", margin: 0, valign: "middle",
    });
  }
}

// 章扉
function divider(num, title, sub, items) {
  const s = newSlide(true);
  s.addShape(pptx.ShapeType.ellipse, {
    x: 9.55, y: 1.55, w: 3.4, h: 3.4, fill: { color: INK }, line: { width: 0 },
  });
  s.addShape(pptx.ShapeType.ellipse, {
    x: 9.85, y: 1.85, w: 2.8, h: 2.8, fill: { color: ACCENT }, line: { width: 0 },
  });
  s.addText(num, {
    x: 9.85, y: 1.85, w: 2.8, h: 2.8, fontFace: JP, fontSize: 96, bold: true,
    color: W, align: "center", valign: "middle", margin: 0,
  });

  s.addText(sub, {
    x: M, y: 1.95, w: 8.4, h: 0.4, fontFace: JP, fontSize: 14, bold: true,
    color: ACCENT, margin: 0, valign: "middle",
  });
  s.addText(title, {
    x: M, y: 2.5, w: 8.4, h: 1.6, fontFace: JP, fontSize: 34, bold: true,
    color: W, margin: 0, valign: "top", lineSpacingMultiple: 1.25,
  });
  const startY = 4.75;
  (items || []).forEach((t, i) => {
    s.addShape(pptx.ShapeType.ellipse, {
      x: M + 0.02, y: startY + i * 0.5 + 0.13, w: 0.13, h: 0.13,
      fill: { color: ACCENT }, line: { width: 0 },
    });
    s.addText(t, {
      x: M + 0.32, y: startY + i * 0.5, w: 8.6, h: 0.4, fontFace: JP, fontSize: 14,
      color: LIGHT, margin: 0, valign: "middle",
    });
  });
  return s;
}

// 1枚まるごとメッセージ（◆ 言い方を変えない一言）
function statement(main, sub, accent) {
  const s = newSlide(true);
  const col = accent || ACCENT;
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 2.0, w: 0.22, h: 3.5, fill: { color: col }, line: { width: 0 },
  });
  s.addText(main, {
    x: 1.1, y: 2.2, w: 11.3, h: 2.2, fontFace: JP, fontSize: 38, bold: true,
    color: W, margin: 0, valign: "middle", lineSpacingMultiple: 1.3,
  });
  if (sub) {
    s.addText(sub, {
      x: 1.1, y: 4.6, w: 11.3, h: 1.0, fontFace: JP, fontSize: 16,
      color: LIGHT, margin: 0, valign: "top", lineSpacingMultiple: 1.45,
    });
  }
  return s;
}

// ワークスライド（SAGE＝手を動かす時間、と色で覚えてもらう）
function workHeader(s, title, minutes) {
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: SW, h: 0.16, fill: { color: SAGE }, line: { width: 0 } });
  s.addText("WORK", {
    x: M, y: 0.42, w: 3, h: 0.3, fontFace: JP, fontSize: 12, bold: true,
    color: SAGE, margin: 0, valign: "middle",
  });
  s.addText(title, {
    x: M, y: 0.74, w: CW - 2.2, h: 0.62, fontFace: JP, fontSize: 27, bold: true,
    color: INK, margin: 0, valign: "middle",
  });
  pill(s, SW - M - 1.9, 0.80, 1.9, 0.5, minutes, SAGE, 14);
  return 1.6;
}

// ============================================================
// 1. タイトル
// ============================================================
{
  const s = newSlide(true);
  s.addShape(pptx.ShapeType.ellipse, {
    x: 9.1, y: -1.55, w: 5.9, h: 5.9, fill: { color: INK }, line: { width: 0 },
  });
  s.addShape(pptx.ShapeType.ellipse, {
    x: 10.35, y: -0.3, w: 3.4, h: 3.4, fill: { color: ACCENT }, line: { width: 0 },
  });

  s.addText("全2回オンライン講座 ／ 第1回", {
    x: M, y: 1.62, w: 8.5, h: 0.35, fontFace: JP, fontSize: 14, bold: true,
    color: ACCENT, margin: 0, valign: "middle",
  });
  s.addText("女性のための栄養学", {
    x: M, y: 2.1, w: 9.2, h: 1.0, fontFace: JP, fontSize: 46, bold: true,
    color: W, margin: 0, valign: "middle",
  });
  s.addText("〜 月経編・更年期編 〜", {
    x: M, y: 3.17, w: 9.2, h: 0.6, fontFace: JP, fontSize: 24,
    color: LIGHT, margin: 0, valign: "middle",
  });
  s.addText("第1回　からだの地図を持つ", {
    x: M, y: 3.9, w: 9.2, h: 0.5, fontFace: JP, fontSize: 18, bold: true,
    color: W, margin: 0, valign: "middle",
  });
  s.addText("初経から、閉経まで。ひとつながりで見てみます。", {
    x: M, y: 4.4, w: 9.2, h: 0.4, fontFace: JP, fontSize: 14,
    color: DIM, margin: 0, valign: "middle",
  });

  s.addShape(pptx.ShapeType.roundRect, {
    x: M, y: 5.05, w: 5.55, h: 0.62, rectRadius: 0.31,
    fill: { color: INK }, line: { color: INK_SOFT, width: 1 },
  });
  s.addText("◯月◯日（◯）◯◯:◯◯ 〜（120分）", {
    x: M, y: 5.05, w: 5.55, h: 0.62, fontFace: JP, fontSize: 14, bold: true,
    color: W, align: "center", valign: "middle", margin: 0,
  });

  s.addText("スマイルおうち栄養士／管理栄養士　髙落 まどか", {
    x: M, y: 6.05, w: 8.0, h: 0.4, fontFace: JP, fontSize: 15, bold: true,
    color: W, margin: 0, valign: "middle",
  });

  s.addNotes(
    "★ あいさつは代表の言葉で。\n" +
    "日時は確定後に差し替え。120分・休憩1回あり・チャット歓迎であることを伝える。\n" +
    "次のスライドで「今日の約束3つ」を必ず言う。ここを飛ばすと、受講生が全部メモしようとして最後のワークで力尽きます。"
  );
}

// ============================================================
// 2. プロフィール
// ============================================================
{
  const s = newSlide();
  header(s, "PROFILE", "自己紹介");

  card(s, M, 1.68, 5.4, 4.3, INK);
  s.addText("スマイルおうち栄養士／管理栄養士", {
    x: M + 0.5, y: 2.15, w: 4.4, h: 0.4, fontFace: JP, fontSize: 13, bold: true,
    color: ACCENT, margin: 0, valign: "middle",
  });
  s.addText("髙落 まどか", {
    x: M + 0.5, y: 2.65, w: 4.4, h: 0.8, fontFace: JP, fontSize: 32, bold: true,
    color: W, margin: 0, valign: "middle",
  });
  s.addText("「わが家の正解」を、自分で決められるように。\nおうちごはんの整え方をお伝えしています。", {
    x: M + 0.5, y: 3.7, w: 4.4, h: 1.2, fontFace: JP, fontSize: 13,
    color: LIGHT, margin: 0, valign: "top", lineSpacingMultiple: 1.4,
  });

  const slots = [
    ["これまでのこと", "経歴・資格・お仕事のことなど"],
    ["この講座をひらく理由", "なぜ、女性の体と栄養なのか"],
    ["ふだんの発信", "SNS・メルマガ・講座のご案内"],
  ];
  slots.forEach((sl, i) => {
    const y = 1.68 + i * 1.5;
    card(s, 6.45, y, 6.18, 1.28, CARD);
    s.addText(sl[0], {
      x: 6.8, y: y + 0.16, w: 5.5, h: 0.4, fontFace: JP, fontSize: 14, bold: true,
      color: SAGE, margin: 0, valign: "middle",
    });
    blank(s, 6.8, y + 0.6, 5.48, 0.52, sl[1]);
  });

  note(s, "※ 右側は当日のご紹介内容にあわせて書き換えてください。");
  s.addNotes("★ 1〜2分で。どんな立場で話しているかだけ伝われば十分です。");
}

// ============================================================
// 3. 今日の約束（◆ ここは言い方を変えない）
// ============================================================
{
  const s = newSlide();
  header(s, "PROMISE", "はじめに、今日の約束を3つ");

  const promises = [
    ["01", "今日は、全部はお話ししません", "お配りした冊子に入っています。\nあとで読んでいただければ大丈夫です。", ACCENT],
    ["02", "正解を覚える時間ではありません", "「わが家はこうする」を\n決めて帰る時間です。", AMBER],
    ["03", "書けなくても大丈夫です", "書けない日があっていい前提で、\n全部つくってあります。", SAGE],
  ];
  const cw = 3.71, gap = 0.4;
  promises.forEach((p, i) => {
    const x = M + i * (cw + gap);
    card(s, x, 1.75, cw, 3.5, CARD);
    badge(s, x + 0.35, 2.1, 0.68, p[0], p[3], W, 17);
    s.addText(p[1], {
      x: x + 0.35, y: 2.95, w: cw - 0.7, h: 0.9, fontFace: JP, fontSize: 17, bold: true,
      color: INK, margin: 0, valign: "top", lineSpacingMultiple: 1.25,
    });
    s.addText(p[2], {
      x: x + 0.35, y: 3.95, w: cw - 0.7, h: 1.1, fontFace: JP, fontSize: 12.5,
      color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.4,
    });
  });

  banner(s, 5.6, "この3つが、この講座の設計そのものです。安心して、手ぶらで聞いてください。", ACCENT_LT, ACCENT_TX, 0.8, 15);
  s.addNotes(
    "◆ この3つは言い方を変えないでください。\n" +
    "ここを言わずに始めると「全部メモしなきゃ」になり、最後の受診ラインのワークで力尽きます。\n" +
    "2回しかない講座なので、この宣言が設計の要です。"
  );
}

// ============================================================
// 4. 今日のゴール ＋ 流れ
// ============================================================
{
  const s = newSlide();
  header(s, "GOAL & AGENDA", "この120分で持ち帰っていただくもの");

  const goals = [
    ["01", "記録する3項目", "自分の「いつも」を測る道具"],
    ["02", "わたしの受診ライン", "迷わないための、自分の線"],
  ];
  goals.forEach((g, i) => {
    const y = 1.68 + i * 1.35;
    card(s, M, y, 5.5, 1.15, CARD);
    badge(s, M + 0.3, y + 0.27, 0.6, g[0], ACCENT, W, 15);
    s.addText(g[1], {
      x: M + 1.08, y: y + 0.16, w: 4.2, h: 0.45, fontFace: JP, fontSize: 16.5, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(g[2], {
      x: M + 1.08, y: y + 0.62, w: 4.2, h: 0.38, fontFace: JP, fontSize: 12,
      color: GRAY, margin: 0, valign: "middle",
    });
  });

  card(s, M, 4.45, 5.5, 1.85, INK);
  s.addText("どちらも「知識」ではなく「決めごと」です。", {
    x: M + 0.42, y: 4.7, w: 4.7, h: 0.45, fontFace: JP, fontSize: 15, bold: true,
    color: ACCENT, margin: 0, valign: "middle",
  });
  s.addText("今日は、不調を解決する日ではありません。\n自分を測る道具を持って帰る日です。", {
    x: M + 0.42, y: 5.2, w: 4.7, h: 0.9, fontFace: JP, fontSize: 13,
    color: LIGHT, margin: 0, valign: "top", lineSpacingMultiple: 1.4,
  });

  card(s, 6.55, 1.68, 6.08, 4.62, "F8FAFC");
  s.addText("今日の流れ", {
    x: 6.9, y: 1.9, w: 5.4, h: 0.4, fontFace: JP, fontSize: 15, bold: true,
    color: INK, margin: 0, valign: "middle",
  });
  const agenda = [
    ["0", "からだのリズム地図", "10分", ACCENT],
    ["1", "「わたしだけかな」と思っていたこと", "15分", ACCENT],
    ["2", "「正常」には幅がある／痛みのしくみ", "30分", ACCENT],
    ["3", "気分の波の正体", "25分", ACCENT],
    ["", "休憩", "5分", GRAY],
    ["4", "ゆらぎ期は、怖くない", "25分", ACCENT],
    ["5", "受診ラインを、自分で決める", "10分", SAGE],
  ];
  agenda.forEach((r, i) => {
    const y = 2.45 + i * 0.52;
    if (r[0]) {
      badge(s, 6.92, y + 0.08, 0.32, r[0], r[3], W, 11);
    } else {
      s.addShape(pptx.ShapeType.ellipse, {
        x: 7.0, y: y + 0.19, w: 0.12, h: 0.12, fill: { color: "AAB8C6" }, line: { width: 0 },
      });
    }
    s.addText(r[1], {
      x: 7.4, y, w: 4.0, h: 0.48, fontFace: JP, fontSize: 13,
      bold: !!r[0], color: r[0] ? INK : GRAY, margin: 0, valign: "middle",
    });
    s.addText(r[2], {
      x: 11.45, y, w: 0.9, h: 0.48, fontFace: JP, fontSize: 11.5, bold: true,
      color: r[3], align: "right", margin: 0, valign: "middle",
    });
  });

  note(s, "※ 次回は「わが家の形に変える」時間です。今日の記録が、次回の材料になります。");
  s.addNotes(
    "ゴールと流れを一緒に見せる。ワークが2回あることを予告しておくと、聞き方が変わります。\n" +
    "「知識を増やす会ではなく、決める会です」と一言。"
  );
}

// ============================================================
// 5. 章0 扉
// ============================================================
divider("0", "からだのリズム地図", "CHAPTER 0 ／ 10分", [
  "初経から閉経まで、ひとつながりで見る",
  "今日と次回、毎回この1枚から始めます",
]).addNotes("地図は指さすだけ。中身の説明はこのあと全部やります。詳しく話しすぎないこと。");

// ============================================================
// 6. からだのリズム地図
// ============================================================
{
  const s = newSlide();
  header(s, "MAP", "からだのリズム地図");

  const cols = [
    ["成長期", "【年代は代表が確定】", AMBER],
    ["安定期", "【年代は代表が確定】", SAGE],
    ["ゆらぎ期", "【年代は代表が確定】", ACCENT],
    ["その先", "【年代は代表が確定】", INK_SOFT],
  ];
  const cw2 = 2.78, gap2 = 0.27;
  cols.forEach((c, i) => {
    const x = M + i * (cw2 + gap2);
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 1.7, w: cw2, h: 0.72, rectRadius: 0.09,
      fill: { color: c[2] }, line: { width: 0 },
    });
    s.addText(c[0], {
      x, y: 1.7, w: cw2, h: 0.46, fontFace: JP, fontSize: 17, bold: true,
      color: W, align: "center", valign: "middle", margin: 0,
    });
    s.addText(c[1], {
      x, y: 2.08, w: cw2, h: 0.3, fontFace: JP, fontSize: 10,
      color: W, align: "center", valign: "middle", margin: 0,
    });
  });

  const rows = ["からだに起きること", "よくあるゆれ", "この時期の土台"];
  rows.forEach((r, ri) => {
    const y = 2.87 + ri * 1.16;
    s.addText(r, {
      x: M, y: y - 0.34, w: 3, h: 0.3, fontFace: JP, fontSize: 11.5, bold: true,
      color: GRAY, margin: 0, valign: "middle",
    });
    cols.forEach((c, i) => {
      blank(s, M + i * (cw2 + gap2), y, cw2, 0.88);
    });
  });

  s.addShape(pptx.ShapeType.line, {
    x: M, y: 6.3, w: CW, h: 0, line: { color: LINE, width: 2 },
  });
  s.addText("▲ いま、わたしはこのあたり", {
    x: M, y: 6.38, w: 5, h: 0.35, fontFace: JP, fontSize: 13, bold: true,
    color: ACCENT, margin: 0, valign: "middle",
  });
  note(s, "※ マスは空欄のまま。話しながら、お手元のシートに書き込んでいただきます。");
  s.addNotes(
    "空欄のまま印刷したシートを配り、話しながら受講生が埋めます。手が動くほど持ち帰ります。\n" +
    "【数字は代表が確定】年代の区切りは、言い切れるものだけ入れてください。"
  );
}

// ============================================================
// 7. ワーク：いまどこにいるか（30秒）
// ============================================================
{
  const s = newSlide();
  workHeader(s, "いま、自分がいるあたりに ↑ を", "30秒");

  card(s, M, 1.9, CW, 3.3, SAGE_LT);
  s.addText("お手元の「からだのリズム地図」に、\n矢印をひとつ書き入れてください。", {
    x: M + 0.8, y: 2.3, w: CW - 1.6, h: 1.4, fontFace: JP, fontSize: 24, bold: true,
    color: INK, margin: 0, valign: "middle", lineSpacingMultiple: 1.35,
  });
  s.addText("正確でなくて大丈夫です。だいたいで構いません。", {
    x: M + 0.8, y: 3.9, w: CW - 1.6, h: 0.5, fontFace: JP, fontSize: 14,
    color: GRAY, margin: 0, valign: "middle",
  });

  banner(s, 5.5, "この地図は、次回も使います。捨てないでください。", CARD, INK, 0.8, 15);
  s.addNotes(
    "最初のワークは30秒で終わるものにする。「書く講座だ」と体に入れるのが目的で、内容は問いません。\n" +
    "ここで書いてもらえると、このあとのワークの手が動きます。"
  );
}

// ============================================================
// 8. 章1 扉
// ============================================================
divider("1", "「わたしだけかな」\nと思っていたこと", "CHAPTER 1 ／ 15分", [
  "よく伺うお声",
  "いま気になっていることに○をつける",
]).addNotes("★ この章は、代表ご自身の経験を1つ入れてください。短くて大丈夫です。わたしが書いた文章より100倍強い場所です。");

// ============================================================
// 9. よく伺うお声（共感）
// ============================================================
{
  const s = newSlide();
  header(s, "EMPATHY", "こんなこと、ありませんか");

  const voices = [
    "つらいのに、検査では何も出ない",
    "「みんな同じだよ」と言われて終わってしまった",
    "毎月のことだから、と言わずにきた",
    "自分の体のことを、後回しにしてきた",
  ];
  voices.forEach((v, i) => {
    const y = 1.75 + i * 1.08;
    card(s, M, y, 8.6, 0.88, CARD);
    s.addText("“", {
      x: M + 0.3, y: y + 0.05, w: 0.5, h: 0.7, fontFace: JP, fontSize: 30, bold: true,
      color: ACCENT, margin: 0, valign: "middle",
    });
    s.addText(v, {
      x: M + 0.95, y, w: 7.4, h: 0.88, fontFace: JP, fontSize: 16,
      color: INK, margin: 0, valign: "middle",
    });
  });

  card(s, 9.55, 1.75, 3.08, 4.21, INK);
  s.addText("とても\n多いです", {
    x: 9.9, y: 2.2, w: 2.5, h: 1.1, fontFace: JP, fontSize: 24, bold: true,
    color: ACCENT, margin: 0, valign: "top", lineSpacingMultiple: 1.25,
  });
  s.addText("同じことを\n感じてきた方に、\nたくさんお会い\nしてきました。", {
    x: 9.9, y: 3.6, w: 2.5, h: 2.0, fontFace: JP, fontSize: 13,
    color: LIGHT, margin: 0, valign: "top", lineSpacingMultiple: 1.5,
  });

  s.addNotes("★ ここで代表の実体験を1つ。「わたしも◯◯だった」「相談したけど◯◯と言われた」。長く話すより、1つを具体的に。");
}

// ============================================================
// 10. ◆ 引き受ける一言
// ============================================================
statement(
  "がまんが足りないわけでも、\n気持ちの問題でもありません。",
  "○がついたことの多くは、このあと出てくる「からだのしくみ」で説明がつきます。"
).addNotes("◆ この一言は変えないでください。ここで心が開かないと、このあとの40分が素通りします。\n励まし（「大丈夫ですよ」）で閉じないこと。「説明がつきます」で開いたまま次へ。");

// ============================================================
// 11. ワーク：いま気になっていること
// ============================================================
{
  const s = newSlide();
  workHeader(s, "いま、気になっていることに ○ を", "3分");

  const items = [
    "疲れが抜けない", "冷えが気になる", "眠りが浅い",
    "頭が重い", "気分の波がある", "肌や髪の変化",
    "おなかが痛い", "量がいつもと違う", "周期が気になる",
  ];
  const cw3 = 3.71, gap3 = 0.4;
  items.forEach((it, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = M + col * (cw3 + gap3);
    const y = 1.8 + row * 0.85;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w: cw3, h: 0.68, rectRadius: 0.09,
      fill: { color: CARD }, line: { width: 0 },
    });
    s.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.28, y: y + 0.19, w: 0.3, h: 0.3,
      fill: { color: W }, line: { color: ACCENT, width: 1.5 },
    });
    s.addText(it, {
      x: x + 0.75, y, w: cw3 - 1.0, h: 0.68, fontFace: JP, fontSize: 13.5,
      color: INK, margin: 0, valign: "middle",
    });
  });

  s.addText("いくつでも、ゼロでもかまいません。", {
    x: M, y: 4.45, w: CW, h: 0.4, fontFace: JP, fontSize: 14,
    color: GRAY, margin: 0, valign: "middle",
  });

  banner(s, 5.05, "この紙は、点数をつけるものでも、何かを判定するものでもありません。", ACCENT_LT, ACCENT_TX, 0.85, 16);
  s.addText("「いまの自分は、ここが気になっている」——それを自分で見えるようにするための紙です。", {
    x: M, y: 6.05, w: CW, h: 0.45, fontFace: JP, fontSize: 13.5,
    color: GRAY, margin: 0, valign: "middle",
  });

  s.addNotes(
    "◆「点数をつけるものでも、判定するものでもありません」は必ず言う。\n" +
    "判定・診断に見えた瞬間に、講座が医療行為の領域に入ります。チェックの数を数えさせないこと。"
  );
}

// ============================================================
// 12. 章2 扉
// ============================================================
divider("2", "「正常」には幅がある", "CHAPTER 2 ／ 30分", [
  "「普通の生理」ってなんだろう",
  "痛みが起きるしくみ",
  "ワーク：わたしの周期を書く",
]).addNotes("この章でいちばん効く一言は「基準は、自分のいつも」。新しく入れる概念は2つだけ（正常の幅／痛みのしくみ）。");

// ============================================================
// 13. 問いかけ
// ============================================================
{
  const s = newSlide(true);
  s.addText("QUESTION", {
    x: M, y: 2.5, w: CW, h: 0.35, fontFace: JP, fontSize: 13, bold: true,
    color: ACCENT, margin: 0, valign: "middle",
  });
  s.addText("「普通の生理」って、\nどんなものだと思いますか？", {
    x: M, y: 3.0, w: 10.5, h: 1.8, fontFace: JP, fontSize: 40, bold: true,
    color: W, margin: 0, valign: "middle", lineSpacingMultiple: 1.3,
  });
  s.addText("チャットに書いていただいても、思い浮かべるだけでも大丈夫です。", {
    x: M, y: 5.0, w: 10.5, h: 0.5, fontFace: JP, fontSize: 15,
    color: LIGHT, margin: 0, valign: "middle",
  });
  s.addNotes("答えを求めない問いかけ。30秒ほど間をとってから次へ。");
}

// ============================================================
// 14. 正常とされる幅
// ============================================================
{
  const s = newSlide();
  header(s, "RANGE", "実は、かなり幅があります");

  const ranges = [
    ["周期", "【数字は代表が確定】", "日ごと"],
    ["続く日数", "【数字は代表が確定】", "日くらい"],
    ["量", "【数字は代表が確定】", ""],
  ];
  ranges.forEach((r, i) => {
    const y = 1.8 + i * 1.3;
    card(s, M, y, 8.6, 1.1, CARD);
    s.addText(r[0], {
      x: M + 0.45, y, w: 1.8, h: 1.1, fontFace: JP, fontSize: 17, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addShape(pptx.ShapeType.roundRect, {
      x: M + 2.3, y: y + 0.28, w: 4.6, h: 0.54, rectRadius: 0.27,
      fill: { color: ACCENT_LT }, line: { width: 0 },
    });
    s.addText(r[1], {
      x: M + 2.3, y: y + 0.28, w: 4.6, h: 0.54, fontFace: JP, fontSize: 13, bold: true,
      color: ACCENT_TX, align: "center", valign: "middle", margin: 0,
    });
    s.addText(r[2], {
      x: M + 7.05, y, w: 1.4, h: 1.1, fontFace: JP, fontSize: 13,
      color: GRAY, margin: 0, valign: "middle",
    });
  });

  card(s, 9.55, 1.8, 3.08, 3.9, INK);
  s.addText("ぴったり\n同じ人のほうが\n少ないくらい\nです", {
    x: 9.9, y: 2.3, w: 2.5, h: 2.2, fontFace: JP, fontSize: 17, bold: true,
    color: W, margin: 0, valign: "top", lineSpacingMultiple: 1.45,
  });
  s.addText("だから、人と\n比べる基準には\nなりません。", {
    x: 9.9, y: 4.5, w: 2.5, h: 1.0, fontFace: JP, fontSize: 12.5,
    color: LIGHT, margin: 0, valign: "top", lineSpacingMultiple: 1.45,
  });

  note(s, "※【数字は代表が確定】管理栄養士として言い切れる数字だけを入れてください。");
  s.addNotes("数字は代表が確定。言い切れないものは「幅があります」だけで十分に伝わります。");
}

// ============================================================
// 15. ◆ 基準は「自分のいつも」（この講座の背骨）
// ============================================================
statement(
  "基準は、人と比べた平均ではありません。\n「自分のいつも」です。",
  "いつもの自分と比べて、変わったかどうか。ここを見られるようになると、情報に振り回されなくなります。"
).addNotes("◆ この講座の背骨です。スライド1枚を丸ごとこの言葉に使ってください。\n急がず、ゆっくり読んでから間をとる。");

// ============================================================
// 16. ワーク：わたしの周期
// ============================================================
{
  const s = newSlide();
  workHeader(s, "わたしの周期を書いてみる", "5分");

  const fields = [
    ["だいたいの周期", "［　　　］日ごと"],
    ["続く日数", "［　　　］日くらい"],
    ["いちばんつらい日", "［　　　　　　　　　］"],
    ["いつもと違うと感じること", ""],
  ];
  fields.forEach((f, i) => {
    const y = 1.85 + i * 1.0;
    s.addText(f[0], {
      x: M, y, w: 3.6, h: 0.72, fontFace: JP, fontSize: 15, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    blank(s, M + 3.7, y, 5.2, 0.72, f[1]);
  });

  card(s, 9.55, 1.85, 3.08, 3.87, SAGE_LT);
  s.addText("わからない欄は\n空けたままで\n大丈夫です", {
    x: 9.85, y: 2.3, w: 2.5, h: 1.6, fontFace: JP, fontSize: 16, bold: true,
    color: SAGE, margin: 0, valign: "top", lineSpacingMultiple: 1.4,
  });
  s.addText("覚えている範囲で\n構いません。\n\nこのあとの記録で、\n少しずつわかって\nいきます。", {
    x: 9.85, y: 3.9, w: 2.5, h: 1.7, fontFace: JP, fontSize: 12,
    color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.45,
  });

  banner(s, 6.0, "あと3分　／　書く時間です。わたしは静かにしています。", CARD, GRAY, 0.6, 13);
  s.addNotes(
    "ここで沈黙を5分つくるのを怖がらないでください。オンラインだと埋めたくなりますが、\n" +
    "書く時間を削ると持ち帰りがなくなります。BGMを流すか、残り時間を声でアナウンスすると待ちやすいです。"
  );
}

// ============================================================
// 17. 痛みが起きるしくみ
// ============================================================
{
  const s = newSlide();
  header(s, "MECHANISM", "痛みが起きるしくみ");

  const steps = [
    ["01", "内膜がはがれる", "毎月、用意された内膜が\n役目を終えます"],
    ["02", "子宮が収縮する", "はがれたものを\n外に押し出す動きです"],
    ["03", "痛みとして感じる", "収縮に関わる物質の量で、\n感じ方が変わると言われています"],
  ];
  const cw4 = 3.71, gap4 = 0.4;
  steps.forEach((st, i) => {
    const x = M + i * (cw4 + gap4);
    card(s, x, 1.8, cw4, 2.85, CARD);
    badge(s, x + 0.35, 2.12, 0.62, st[0], ACCENT, W, 16);
    s.addText(st[1], {
      x: x + 1.1, y: 2.12, w: cw4 - 1.45, h: 0.62, fontFace: JP, fontSize: 16, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(st[2], {
      x: x + 0.35, y: 2.95, w: cw4 - 0.7, h: 1.4, fontFace: JP, fontSize: 12.5,
      color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.4,
    });
    if (i < 2) {
      s.addText("▶", {
        x: x + cw4 + 0.02, y: 1.8, w: 0.36, h: 2.85, fontFace: JP, fontSize: 16,
        color: "AAB8C6", align: "center", valign: "middle", margin: 0,
      });
    }
  });

  banner(s, 5.0, "痛みには、ちゃんと理由があります。気のせいでも、心の弱さでもありません。", ACCENT_LT, ACCENT_TX, 0.9, 17);
  s.addText("そして、感じ方には個人差があります。強く出る方は、それだけの理由が体の中にあります。", {
    x: M, y: 6.1, w: CW, h: 0.45, fontFace: JP, fontSize: 14,
    color: GRAY, margin: 0, valign: "middle",
  });

  s.addNotes(
    "◆「痛みには理由があります」は変えない。\n" +
    "専門用語は1つまで。言い切れない表現は「〜と言われています」で止める。\n" +
    "「◯◯すれば治ります」は使わない（→「変化を感じる方が多いです」）。"
  );
}

// ============================================================
// 18. 今日は解決しません（正直に言う）
// ============================================================
{
  const s = newSlide(true);
  s.addShape(pptx.ShapeType.ellipse, {
    x: 9.3, y: 1.3, w: 4.6, h: 4.6, fill: { color: INK }, line: { width: 0 },
  });
  s.addText("NEXT", {
    x: M, y: 2.2, w: 8.4, h: 0.35, fontFace: JP, fontSize: 13, bold: true,
    color: ACCENT, margin: 0, valign: "middle",
  });
  s.addText("では、どうすれば軽くなるのか。", {
    x: M, y: 2.7, w: 8.4, h: 0.7, fontFace: JP, fontSize: 28, bold: true,
    color: W, margin: 0, valign: "middle",
  });
  s.addText("それは次回、まるごと2時間かけてやります。", {
    x: M, y: 3.5, w: 8.4, h: 0.7, fontFace: JP, fontSize: 24, bold: true,
    color: ACCENT, margin: 0, valign: "middle",
  });
  s.addText("今日は、理由を知るところまで。\n理由がわかっていないと、対策を選べないからです。", {
    x: M, y: 4.4, w: 8.4, h: 1.0, fontFace: JP, fontSize: 15,
    color: LIGHT, margin: 0, valign: "top", lineSpacingMultiple: 1.45,
  });
  s.addNotes("「今日は解決しない」と先に言うと、受講生は安心します。隠すと「結局どうすれば？」で終わります。");
}

// ============================================================
// 19. 章3 扉
// ============================================================
divider("3", "気分の波の正体", "CHAPTER 3 ／ 25分", [
  "からだの中で起きている波",
  "食べ方でできる、もうひとつの波",
  "ワーク：直近3日の朝ごはん",
]).addNotes("この章のゴールは「性格の問題だと思っていた」を解除すること。新概念は2つ（ホルモンの波／血糖の波）。");

// ============================================================
// 20. 共感 → ◆ 解除の一言
// ============================================================
{
  const s = newSlide();
  header(s, "EMPATHY", "生理前になると");

  card(s, M, 1.8, 6.0, 3.4, CARD);
  s.addText("“", {
    x: M + 0.4, y: 2.0, w: 0.6, h: 0.8, fontFace: JP, fontSize: 36, bold: true,
    color: ACCENT, margin: 0, valign: "middle",
  });
  s.addText("家族に強く当たってしまう。\nあとで自己嫌悪になる。\n\n毎月、同じことを\n繰り返してしまう。", {
    x: M + 0.5, y: 2.6, w: 5.0, h: 2.3, fontFace: JP, fontSize: 17,
    color: INK, margin: 0, valign: "top", lineSpacingMultiple: 1.5,
  });

  card(s, 7.1, 1.8, 5.53, 3.4, INK);
  s.addText("あれは、性格では\nありません。", {
    x: 7.55, y: 2.25, w: 4.7, h: 1.2, fontFace: JP, fontSize: 25, bold: true,
    color: W, margin: 0, valign: "top", lineSpacingMultiple: 1.3,
  });
  s.addText("体の中で起きている、\n波です。", {
    x: 7.55, y: 3.6, w: 4.7, h: 1.0, fontFace: JP, fontSize: 19, bold: true,
    color: ACCENT, margin: 0, valign: "top", lineSpacingMultiple: 1.35,
  });

  banner(s, 5.55, "波には、2つあります。ひとつは「からだの波」、もうひとつは「食べ方でできる波」。", CARD, INK, 0.85, 16);
  s.addNotes("◆「あれは性格ではありません」は変えない一言。ここが解除の瞬間です。");
}

// ============================================================
// 21. ホルモンの波
// ============================================================
{
  const s = newSlide();
  header(s, "WAVE 1", "からだの波");

  const phases = [
    ["生理", "1F4E6B"],
    ["そのあと", "3F8A72"],
    ["排卵", AMBER],
    ["生理前", ACCENT],
  ];
  const pw = 2.78, pgap = 0.27;
  const heights = [0.9, 1.9, 2.5, 1.3];
  phases.forEach((p, i) => {
    const x = M + i * (pw + pgap);
    const h = heights[i];
    s.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.3, y: 4.5 - h, w: pw - 0.6, h: h, rectRadius: 0.08,
      fill: { color: p[1] }, line: { width: 0 },
    });
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 4.65, w: pw, h: 0.55, rectRadius: 0.09,
      fill: { color: CARD }, line: { width: 0 },
    });
    s.addText(p[0], {
      x, y: 4.65, w: pw, h: 0.55, fontFace: JP, fontSize: 14, bold: true,
      color: INK, align: "center", valign: "middle", margin: 0,
    });
  });

  s.addText("↓ この下り坂", {
    x: M + 3 * (pw + pgap), y: 2.62, w: pw, h: 0.5, fontFace: JP, fontSize: 15, bold: true,
    color: ACCENT, align: "center", valign: "middle", margin: 0,
  });
  s.addText("※ 高さはイメージです。実際の量を表したものではありません。", {
    x: M, y: 5.3, w: CW, h: 0.35, fontFace: JP, fontSize: 11,
    color: "9AA9B8", margin: 0, valign: "middle",
  });

  banner(s, 5.75, "排卵のあとの「下り坂」で、気分や体調に影響が出やすいと言われています。", ACCENT_LT, ACCENT_TX, 0.9, 16);
  s.addNotes(
    "ホルモン名を並べないこと。図を指さして「この下り坂」と言うほうが伝わります。\n" +
    "高さはイメージである旨を必ず添える（数値を示したものではない）。"
  );
}

// ============================================================
// 22. 血糖の波
// ============================================================
{
  const s = newSlide();
  header(s, "WAVE 2", "食べ方でできる波");

  const flow = [
    ["空腹が続く", "朝を抜く／時間が空く", GRAY],
    ["甘いものを食べる", "手軽に元気が出る", AMBER],
    ["ぐっと上がる", "", ACCENT],
    ["急に下がる", "イライラ・だるさが出やすい", ACCENT],
  ];
  flow.forEach((f, i) => {
    const y = 1.8 + i * 1.08;
    card(s, M, y, 8.6, 0.9, i >= 2 ? ACCENT_LT : CARD);
    badge(s, M + 0.3, y + 0.16, 0.58, String(i + 1), f[2], W, 14);
    s.addText(f[0], {
      x: M + 1.1, y, w: 3.4, h: 0.9, fontFace: JP, fontSize: 16, bold: true,
      color: i >= 2 ? ACCENT_TX : INK, margin: 0, valign: "middle",
    });
    s.addText(f[1], {
      x: M + 4.5, y, w: 3.9, h: 0.9, fontFace: JP, fontSize: 12.5,
      color: GRAY, margin: 0, valign: "middle",
    });
  });

  card(s, 9.55, 1.8, 3.08, 4.18, INK);
  s.addText("この\n下がるところ", {
    x: 9.9, y: 2.3, w: 2.5, h: 1.1, fontFace: JP, fontSize: 19, bold: true,
    color: ACCENT, margin: 0, valign: "top", lineSpacingMultiple: 1.3,
  });
  s.addText("気分の波として\n感じやすい\nタイミングです。\n\n「性格」ではなく\n「タイミング」\nの話です。", {
    x: 9.9, y: 3.6, w: 2.5, h: 2.2, fontFace: JP, fontSize: 12.5,
    color: LIGHT, margin: 0, valign: "top", lineSpacingMultiple: 1.5,
  });

  s.addNotes("押しているときは、この章の詳細を切ってOK。ただし次のワーク（3分）は残すこと。");
}

// ============================================================
// 23. ◆ 減らすより、足す
// ============================================================
statement(
  "「甘いものをやめましょう」\nとは言いません。",
  "減らすより先に、足すほうが続きます。何を足すかは、次回、わが家の形で決めます。",
  AMBER
).addNotes("◆ NG回避：「甘いもの＝悪」の構図をつくらない。禁止・断罪の言い方をしないこと。");

// ============================================================
// 24. ワーク：直近3日の朝ごはん
// ============================================================
{
  const s = newSlide();
  workHeader(s, "直近3日の朝ごはんを書いてみる", "3分");

  ["1日前", "2日前", "3日前"].forEach((d, i) => {
    const y = 1.9 + i * 1.1;
    s.addText(d, {
      x: M, y, w: 1.5, h: 0.8, fontFace: JP, fontSize: 15, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    blank(s, M + 1.6, y, 7.3, 0.8);
  });

  card(s, 9.55, 1.9, 3.08, 3.2, SAGE_LT);
  s.addText("食べていない日は\n「なし」で\n大丈夫です", {
    x: 9.85, y: 2.3, w: 2.5, h: 1.5, fontFace: JP, fontSize: 15, bold: true,
    color: SAGE, margin: 0, valign: "top", lineSpacingMultiple: 1.4,
  });
  s.addText("これも、良い悪いを\n判定する紙では\nありません。", {
    x: 9.85, y: 3.8, w: 2.5, h: 1.1, fontFace: JP, fontSize: 12,
    color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.45,
  });

  banner(s, 5.4, "この波をゆるやかにする「朝の一手」を、次回、わが家の形で決めます。", CARD, INK, 0.85, 16);
  s.addNotes("◆「良い悪いを判定する紙ではありません」を必ず添える。書かせて終わり、で大丈夫です。");
}

// ============================================================
// 25. 休憩
// ============================================================
{
  const s = newSlide(true);
  s.addShape(pptx.ShapeType.ellipse, {
    x: 9.6, y: 1.9, w: 3.4, h: 3.4, fill: { color: INK }, line: { width: 0 },
  });
  s.addText("BREAK", {
    x: M, y: 2.6, w: 8.4, h: 0.4, fontFace: JP, fontSize: 14, bold: true,
    color: ACCENT, margin: 0, valign: "middle",
  });
  s.addText("休憩　5分", {
    x: M, y: 3.1, w: 8.4, h: 1.0, fontFace: JP, fontSize: 44, bold: true,
    color: W, margin: 0, valign: "middle",
  });
  s.addText("お手洗い・お飲みものをどうぞ。カメラはオフにしていただいて大丈夫です。", {
    x: M, y: 4.3, w: 8.4, h: 0.5, fontFace: JP, fontSize: 15,
    color: LIGHT, margin: 0, valign: "middle",
  });

  s.addShape(pptx.ShapeType.roundRect, {
    x: M, y: 5.1, w: 7.4, h: 0.95, rectRadius: 0.1,
    fill: { color: INK }, line: { width: 0 },
  });
  s.addText("このあと　—　ゆらぎ期は、怖くない", {
    x: M + 0.45, y: 5.1, w: 6.5, h: 0.95, fontFace: JP, fontSize: 18, bold: true,
    color: ACCENT, margin: 0, valign: "middle",
  });
  s.addNotes("休憩中はこの画面のまま。次の章タイトルが目に入っているのが効きます。");
}

// ============================================================
// 26. 章4 扉
// ============================================================
divider("4", "ゆらぎ期は、怖くない", "CHAPTER 4 ／ 25分", [
  "何が起きているのか",
  "出方には、大きな個人差があります",
  "ワーク：ゆらぎ期の年表",
]).addNotes("恐怖から入らない。「知らないから怖い。知れば準備ができる」で開く。\n「いまケアしないと大変なことに」は禁止（煽り）。");

// ============================================================
// 27. 問いかけ
// ============================================================
{
  const s = newSlide(true);
  s.addText("QUESTION", {
    x: M, y: 2.5, w: CW, h: 0.35, fontFace: JP, fontSize: 13, bold: true,
    color: ACCENT, margin: 0, valign: "middle",
  });
  s.addText("「更年期」と聞いて、\nどんなイメージがありますか？", {
    x: M, y: 3.0, w: 10.8, h: 1.8, fontFace: JP, fontSize: 38, bold: true,
    color: W, margin: 0, valign: "middle", lineSpacingMultiple: 1.3,
  });
  s.addText("あまり良いイメージがない、という方が多いかもしれません。", {
    x: M, y: 5.0, w: 10.8, h: 0.5, fontFace: JP, fontSize: 15,
    color: LIGHT, margin: 0, valign: "middle",
  });
  s.addNotes("否定しない。「そう思いますよね」で受けてから次のスライドへ。");
}

// ============================================================
// 28. ◆ 知らないから怖い
// ============================================================
statement(
  "知らないから、怖い。\n知っていれば、準備ができます。",
  "今日はその準備のための地図をお渡しします。対策は、次回。"
).addNotes("◆ この一言は変えない。この章は全部「なるほど」側で話す。\n読んだあとに残るのが「なるほど」なら問題提起、「怖い」なら煽りです。");

// ============================================================
// 29. 何が起きているのか
// ============================================================
{
  const s = newSlide();
  header(s, "MECHANISM", "からだで起きていること");

  card(s, M, 1.8, 8.6, 2.0, CARD);
  s.addText("閉経の前後に、女性ホルモンが減っていく時期があります。", {
    x: M + 0.5, y: 2.05, w: 7.6, h: 0.5, fontFace: JP, fontSize: 17, bold: true,
    color: INK, margin: 0, valign: "middle",
  });
  s.addText("減りきったあとではなく、\n減っていく「途中」の、ゆらいでいる時期に、体調の変化が出やすいと言われています。", {
    x: M + 0.5, y: 2.6, w: 7.6, h: 1.0, fontFace: JP, fontSize: 13.5,
    color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.45,
  });

  const bars = [
    ["これまで", 1.6, SAGE],
    ["ゆらぎ期", 1.0, ACCENT],
    ["そのあと", 0.5, INK_SOFT],
  ];
  bars.forEach((b, i) => {
    const x = M + i * 2.95;
    s.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.3, y: 5.5 - b[1], w: 2.3, h: b[1], rectRadius: 0.08,
      fill: { color: b[2] }, line: { width: 0 },
    });
    s.addText(b[0], {
      x, y: 5.6, w: 2.9, h: 0.45, fontFace: JP, fontSize: 13.5, bold: true,
      color: INK, align: "center", valign: "middle", margin: 0,
    });
  });
  s.addText("↓ ここが「ゆらいでいる」時期", {
    x: M + 2.95, y: 4.1, w: 2.9, h: 0.4, fontFace: JP, fontSize: 12, bold: true,
    color: ACCENT, align: "center", valign: "middle", margin: 0,
  });

  card(s, 9.55, 1.8, 3.08, 4.25, INK);
  s.addText("年代の目安", {
    x: 9.9, y: 2.1, w: 2.5, h: 0.4, fontFace: JP, fontSize: 14, bold: true,
    color: ACCENT, margin: 0, valign: "middle",
  });
  blank(s, 9.9, 2.6, 2.5, 0.75, "【数字は代表が確定】");
  s.addText("閉経の年齢にも\n幅があります。\n\n早い方も、\nゆっくりな方も\nいます。", {
    x: 9.9, y: 3.6, w: 2.5, h: 2.2, fontFace: JP, fontSize: 12.5,
    color: LIGHT, margin: 0, valign: "top", lineSpacingMultiple: 1.5,
  });

  s.addText("※ 図は変化のイメージです。実際の量を表したものではありません。", {
    x: M, y: 6.2, w: 8.6, h: 0.35, fontFace: JP, fontSize: 11,
    color: "9AA9B8", margin: 0, valign: "middle",
  });
  s.addNotes("【数字は代表が確定】年代・閉経年齢は、言い切れるものだけ。\n断定を避ける表現（〜と言われています）で統一。");
}

// ============================================================
// 30. ◆ 個人差の幅を、症状より先に見せる
// ============================================================
{
  const s = newSlide();
  header(s, "RANGE", "いちばん大事なことをお伝えします");

  banner(s, 1.72, "出方には、とても大きな個人差があります。", ACCENT_LT, ACCENT_TX, 1.0, 22);

  const three = [
    ["ほとんど気にならない", "そのまま過ぎていく方も\nいらっしゃいます", SAGE],
    ["少し感じる", "「これかな」と思いながら\n過ごす方もいます", AMBER],
    ["日常生活に支障が出る", "この場合に、医療の場で\n「更年期障害」と呼ばれます", ACCENT],
  ];
  const cw5 = 3.71, gap5 = 0.4;
  three.forEach((t, i) => {
    const x = M + i * (cw5 + gap5);
    card(s, x, 3.0, cw5, 2.5, CARD);
    s.addShape(pptx.ShapeType.rect, {
      x, y: 3.0, w: cw5, h: 0.1, fill: { color: t[2] }, line: { width: 0 },
    });
    s.addText(t[0], {
      x: x + 0.35, y: 3.3, w: cw5 - 0.7, h: 0.8, fontFace: JP, fontSize: 16, bold: true,
      color: INK, margin: 0, valign: "middle", lineSpacingMultiple: 1.25,
    });
    s.addText(t[1], {
      x: x + 0.35, y: 4.2, w: cw5 - 0.7, h: 1.1, fontFace: JP, fontSize: 12.5,
      color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.4,
    });
  });

  s.addText("どれが正しい、という話ではありません。自分がどのあたりかを知っておくだけで、慌てずにすみます。", {
    x: M, y: 5.75, w: CW, h: 0.5, fontFace: JP, fontSize: 14,
    color: GRAY, margin: 0, valign: "middle",
  });

  s.addNotes(
    "◆ 順番が命です。幅 → 症状 → 相談先。\n" +
    "症状リストを先に出すと全員が「わたしもだ」になります（恐怖）。幅を先に見せると「自分はどのあたりかな」になります（準備）。"
  );
}

// ============================================================
// 31. ワーク：ゆらぎ期の年表
// ============================================================
{
  const s = newSlide();
  workHeader(s, "ゆらぎ期の年表に、自分と家族を置く", "7分");

  const ages = ["10代", "20代", "30代", "40代", "50代", "60代"];
  const colW = 1.78;
  ages.forEach((a, i) => {
    const x = M + 1.9 + i * colW;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 1.85, w: colW - 0.08, h: 0.48, rectRadius: 0.08,
      fill: { color: INK }, line: { width: 0 },
    });
    s.addText(a, {
      x, y: 1.85, w: colW - 0.08, h: 0.48, fontFace: JP, fontSize: 12.5, bold: true,
      color: W, align: "center", valign: "middle", margin: 0,
    });
  });

  const rows = [
    ["わたし", ACCENT],
    ["家族（　　）", GRAY],
    ["家族（　　）", GRAY],
    ["家族（　　）", GRAY],
  ];
  rows.forEach((r, i) => {
    const y = 2.5 + i * 0.78;
    s.addText(r[0], {
      x: M, y, w: 1.85, h: 0.66, fontFace: JP, fontSize: 13.5, bold: i === 0,
      color: r[1], margin: 0, valign: "middle",
    });
    for (let c = 0; c < 6; c++) {
      blank(s, M + 1.9 + c * colW, y, colW - 0.08, 0.66);
    }
  });

  banner(s, 5.75, "同じ紙に、娘さんの初経と、ご自身のゆらぎ期が並ぶ方もいらっしゃると思います。", ACCENT_LT, ACCENT_TX, 0.85, 15);
  s.addNotes(
    "★ 最後の一行は代表の言葉で。\n" +
    "この講座の差別化が、この1枚に出ます。母と娘の体の変化が同じ紙に並ぶ体験は、他の栄養講座にはありません。時間をかけてよい場所です。\n" +
    "家族欄は空欄にしてあります（お子さんがいない方が疎外されないため）。"
  );
}

// ============================================================
// 32. 相談できる場所
// ============================================================
{
  const s = newSlide();
  header(s, "SUPPORT", "相談できる場所を、知っておく");

  const places = [
    ["01", "かかりつけ", "まずは、いつも行くところで\n相談してみる"],
    ["02", "婦人科", "women's health を扱う科。\n探し方は【内容は代表が確定】"],
    ["03", "健康診断", "見てもらえること\n【内容は代表が確定】"],
  ];
  const cw6 = 3.71, gap6 = 0.4;
  places.forEach((p, i) => {
    const x = M + i * (cw6 + gap6);
    card(s, x, 1.8, cw6, 2.7, CARD);
    badge(s, x + 0.35, 2.12, 0.62, p[0], SAGE, W, 16);
    s.addText(p[1], {
      x: x + 1.1, y: 2.12, w: cw6 - 1.45, h: 0.62, fontFace: JP, fontSize: 16.5, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(p[2], {
      x: x + 0.35, y: 2.95, w: cw6 - 0.7, h: 1.3, fontFace: JP, fontSize: 12.5,
      color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.4,
    });
  });

  banner(s, 4.85, "判断は、お医者さんと一緒にするものです。今日は、相談する先を知っておくところまで。", CARD, INK, 0.9, 16);
  s.addText("お薬やホルモンのお話は「選択肢としてあります」まで。合うかどうかは、お医者さんと相談して決めるものです。", {
    x: M, y: 5.95, w: CW, h: 0.5, fontFace: JP, fontSize: 13,
    color: GRAY, margin: 0, valign: "middle",
  });

  s.addNotes(
    "◆ 判断は医師と、で統一。\n" +
    "ピル・ホルモン補充の質問が出たら「選択肢としてあります。合うかどうかはお医者さんと相談して決めるものです」で止める。是非は語らない。"
  );
}

// ============================================================
// 33. 章5 扉
// ============================================================
divider("5", "受診ラインを、\n自分で決める", "CHAPTER 5 ／ 10分", [
  "この10分が、今日の持ち帰りです",
]).addNotes("絶対に削らない10分。ここを削ると「聞いて終わり」の講座になります。");

// ============================================================
// 34. なぜ決めるのか
// ============================================================
{
  const s = newSlide();
  header(s, "WHY", "「これくらいで行っていいのかな」");

  card(s, M, 1.8, 8.6, 1.5, CARD);
  s.addText("迷っているうちに、何年も過ぎてしまう方が、とても多いです。", {
    x: M + 0.5, y: 1.8, w: 7.6, h: 1.5, fontFace: JP, fontSize: 18, bold: true,
    color: INK, margin: 0, valign: "middle",
  });

  card(s, M, 3.55, 8.6, 1.5, ACCENT_LT);
  s.addText("迷う理由は、自分の中に「線」がないからです。", {
    x: M + 0.5, y: 3.55, w: 7.6, h: 1.5, fontFace: JP, fontSize: 18, bold: true,
    color: ACCENT_TX, margin: 0, valign: "middle",
  });

  card(s, M, 5.3, 8.6, 1.2, INK);
  s.addText("だから今日、その線をご自分で決めてしまいます。", {
    x: M + 0.5, y: 5.3, w: 7.6, h: 1.2, fontFace: JP, fontSize: 18, bold: true,
    color: W, margin: 0, valign: "middle",
  });

  card(s, 9.55, 1.8, 3.08, 4.7, CARD);
  s.addText("決めておくと", {
    x: 9.9, y: 2.1, w: 2.5, h: 0.4, fontFace: JP, fontSize: 14, bold: true,
    color: SAGE, margin: 0, valign: "middle",
  });
  s.addText("・迷う時間が減る\n\n・我慢しすぎない\n\n・家族にも\n　伝えられる\n\n・「そのとき」に\n　動ける", {
    x: 9.9, y: 2.65, w: 2.5, h: 3.5, fontFace: JP, fontSize: 13,
    color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.4,
  });

  s.addNotes("◆「迷う理由は、自分の中に線がないから」は変えない。ここが次のワークの動機になります。");
}

// ============================================================
// 35. ワーク：受診ラインを書く
// ============================================================
{
  const s = newSlide();
  workHeader(s, "わたしは、こうなったら相談に行きます", "5分");

  blank(s, M, 1.9, 8.6, 0.95);
  blank(s, M, 3.0, 8.6, 0.95);

  s.addText("（書き方の例）", {
    x: M, y: 4.15, w: 3, h: 0.4, fontFace: JP, fontSize: 12.5, bold: true,
    color: GRAY, margin: 0, valign: "middle",
  });
  const examples = [
    "「◯ヶ月続いたら、行く」",
    "「◯日寝込んだら、行く」",
    "「いつもの対処が効かなくなったら、行く」",
  ];
  examples.forEach((e, i) => {
    const y = 4.6 + i * 0.55;
    s.addShape(pptx.ShapeType.ellipse, {
      x: M + 0.05, y: y + 0.17, w: 0.13, h: 0.13, fill: { color: SAGE }, line: { width: 0 },
    });
    s.addText(e, {
      x: M + 0.4, y, w: 8.2, h: 0.45, fontFace: JP, fontSize: 14,
      color: INK, margin: 0, valign: "middle",
    });
  });

  card(s, 9.55, 1.9, 3.08, 4.35, SAGE_LT);
  s.addText("正解は\nありません", {
    x: 9.85, y: 2.3, w: 2.5, h: 1.1, fontFace: JP, fontSize: 20, bold: true,
    color: SAGE, margin: 0, valign: "top", lineSpacingMultiple: 1.3,
  });
  s.addText("あなたが決めた線が、\nあなたの正解です。\n\n決めた線を、\nご家族にひとりだけ\n伝えておくと、\nもっと効きます。", {
    x: 9.85, y: 3.6, w: 2.5, h: 2.5, fontFace: JP, fontSize: 12.5,
    color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.5,
  });

  s.addNotes(
    "⚠ 例の「◯」は空欄のまま。代表が数字を言うと、それが正解になってしまいます。\n" +
    "「わたしはこう決めています」とご自身の例として話すのはOK。受講生への指示にはしないこと。\n" +
    "◆「あなたが決めた線が、あなたの正解です」は変えない一言。"
  );
}

// ============================================================
// 36. 今日の持ち帰り
// ============================================================
{
  const s = newSlide();
  header(s, "TAKE HOME", "今日、持って帰っていただくもの");

  const takes = [
    ["01", "記録する3項目", "自分の「いつも」を測る道具。\n続けるほど精度が上がります。", ACCENT],
    ["02", "わたしの受診ライン", "迷わないための、自分の線。\nご家族にひとりだけ伝えてみてください。", SAGE],
  ];
  takes.forEach((t, i) => {
    const x = M + i * 6.17;
    card(s, x, 1.8, 5.77, 2.6, CARD);
    badge(s, x + 0.4, 2.15, 0.7, t[0], t[3], W, 18);
    s.addText(t[1], {
      x: x + 1.3, y: 2.15, w: 4.1, h: 0.7, fontFace: JP, fontSize: 19, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(t[2], {
      x: x + 0.4, y: 3.1, w: 5.0, h: 1.1, fontFace: JP, fontSize: 13,
      color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.45,
    });
  });

  banner(s, 4.7, "この2つは「知識」ではありません。あなたが決めた「決めごと」です。", ACCENT_LT, ACCENT_TX, 0.9, 17);

  card(s, M, 5.8, CW, 0.95, INK);
  s.addText("次回は、これを「わが家の形」に変える時間です。", {
    x: M + 0.5, y: 5.8, w: CW - 1.0, h: 0.95, fontFace: JP, fontSize: 16, bold: true,
    color: W, margin: 0, valign: "middle",
  });

  s.addNotes("★ 締めの言葉は代表の言葉で。入れてほしい要素は3つ：持ち帰りは2つだけ／書けない日があっていい／次回はわが家の形に変える。");
}

// ============================================================
// 37. 宿題
// ============================================================
{
  const s = newSlide();
  header(s, "HOMEWORK", "次回まで、1日3分だけ");

  card(s, M, 1.8, 8.6, 2.3, CARD);
  s.addText("決めた3項目を、毎日書いてみてください。", {
    x: M + 0.5, y: 2.05, w: 7.6, h: 0.55, fontFace: JP, fontSize: 19, bold: true,
    color: INK, margin: 0, valign: "middle",
  });
  s.addText("○△× でも、数字でも、ひとことでも。書き方は自由です。\nスマホのメモ帳でも大丈夫です（テンプレをお送りします）。", {
    x: M + 0.5, y: 2.7, w: 7.6, h: 1.1, fontFace: JP, fontSize: 13.5,
    color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.45,
  });

  banner(s, 4.3, "書けない日は、空けたままで大丈夫です。それも記録です。", SAGE_LT, "1F5B49", 1.0, 20);

  card(s, M, 5.55, CW, 1.1, INK);
  s.addText("その紙が、次回のワークの材料になります。開いた状態でお持ちください。", {
    x: M + 0.5, y: 5.55, w: CW - 1.0, h: 1.1, fontFace: JP, fontSize: 16, bold: true,
    color: W, margin: 0, valign: "middle",
  });

  s.addNotes(
    "⚠ 宿題に「必ず」「毎日きちんと」をつけない。迷う理由の1位が「時間が取れるか」です。\n" +
    "◆「空けたままで大丈夫」は毎回言う。これが継続率に直結します。"
  );
}

// ============================================================
// 38. 次回予告
// ============================================================
{
  const s = newSlide(true);
  s.addShape(pptx.ShapeType.ellipse, {
    x: 9.3, y: 1.2, w: 4.6, h: 4.6, fill: { color: INK }, line: { width: 0 },
  });
  s.addText("NEXT ／ 第2回", {
    x: M, y: 1.9, w: 8.4, h: 0.4, fontFace: JP, fontSize: 14, bold: true,
    color: ACCENT, margin: 0, valign: "middle",
  });
  s.addText("わが家の形に変える", {
    x: M, y: 2.4, w: 8.4, h: 0.9, fontFace: JP, fontSize: 36, bold: true,
    color: W, margin: 0, valign: "middle",
  });

  const next = [
    "土台は4つしかない（たんぱく質・脂質・主食・光と体温）",
    "血をつくる（鉄と、吸収のさせ方）",
    "一生ものの土台（骨と筋肉／子ども時代の食）",
    "娘に、何をどう伝えるか",
    "わが家の設計シートを完成させる",
  ];
  next.forEach((n, i) => {
    const y = 3.5 + i * 0.52;
    s.addShape(pptx.ShapeType.ellipse, {
      x: M + 0.02, y: y + 0.17, w: 0.13, h: 0.13, fill: { color: ACCENT }, line: { width: 0 },
    });
    s.addText(n, {
      x: M + 0.35, y, w: 8.1, h: 0.45, fontFace: JP, fontSize: 14,
      color: LIGHT, margin: 0, valign: "middle",
    });
  });

  s.addText("◯月◯日（◯）◯◯:◯◯ 〜（120分）", {
    x: M, y: 6.3, w: 8.4, h: 0.45, fontFace: JP, fontSize: 14, bold: true,
    color: W, margin: 0, valign: "middle",
  });
  s.addNotes("次回日程を差し替え。記録シートを持参（開いておく）ことを伝える。");
}

// ============================================================
// 39. Q&A・おわりに
// ============================================================
{
  const s = newSlide(true);
  s.addShape(pptx.ShapeType.ellipse, {
    x: 9.0, y: 1.9, w: 5.9, h: 5.9, fill: { color: INK }, line: { width: 0 },
  });
  s.addShape(pptx.ShapeType.ellipse, {
    x: 10.25, y: 3.15, w: 3.4, h: 3.4, fill: { color: ACCENT }, line: { width: 0 },
  });

  s.addText("Q & A", {
    x: M, y: 2.15, w: 8.0, h: 0.35, fontFace: JP, fontSize: 13, bold: true,
    color: ACCENT, margin: 0, valign: "middle",
  });
  s.addText("ご質問をどうぞ", {
    x: M, y: 2.6, w: 8.0, h: 0.9, fontFace: JP, fontSize: 40, bold: true,
    color: W, margin: 0, valign: "middle",
  });
  s.addText("チャットでも、お声でも大丈夫です。\n「うちの場合はどうしたら」が、いちばん役に立ちます。", {
    x: M, y: 3.65, w: 8.0, h: 0.9, fontFace: JP, fontSize: 15,
    color: LIGHT, margin: 0, valign: "top", lineSpacingMultiple: 1.4,
  });

  s.addShape(pptx.ShapeType.roundRect, {
    x: M, y: 4.85, w: 7.4, h: 1.1, rectRadius: 0.1,
    fill: { color: INK }, line: { width: 0 },
  });
  s.addText("今日持ち帰るのは、3項目と、1本の線だけ。\nそれだけで、十分です。", {
    x: M + 0.45, y: 4.85, w: 6.5, h: 1.1, fontFace: JP, fontSize: 14, bold: true,
    color: W, margin: 0, valign: "middle", lineSpacingMultiple: 1.35,
  });

  s.addText("ご参加ありがとうございました。", {
    x: M, y: 6.15, w: 8.0, h: 0.45, fontFace: JP, fontSize: 15,
    color: DIM, margin: 0, valign: "middle",
  });
  s.addNotes("答えきれない質問は、後日まとめて共有する旨を伝えて終了。\n当日中にアーカイブURLと配布シートPDFを送付（ハル）。");
}

const out = "女性のための栄養学_第1回_からだの地図を持つ.pptx";
pptx.writeFile({ fileName: out }).then(() => console.log("written:", out));

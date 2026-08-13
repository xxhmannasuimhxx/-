/**
 * 第2回「夏休みの終わり 〜食と生活リズムの整え方〜」講座スライド（統合版・全41枚）
 * 2026/08/17(月) 21:30-23:00 (90分)
 * 既存構成 ＋ 2024年版「夏休みごはん対策講座 第2回」資料の内容を統合
 */
const PptxGenJS = require("pptxgenjs");

// ---------- Design tokens ----------
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
const W         = "FFFFFF";

const JP = "Meiryo";

const SW = 13.333, SH = 7.5;
const M = 0.7;
const CW = SW - M * 2;   // 11.933

const sh = () => ({ type: "outer", color: "1E3A5F", blur: 10, offset: 2, angle: 90, opacity: 0.10 });

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "髙落まどか";
pptx.title = "夏休みの終わり 〜食と生活リズムの整え方〜 第2回";

// ---------- helpers ----------
function newSlide(dark) {
  const s = pptx.addSlide();
  s.background = { color: dark ? INK_DEEP : W };
  return s;
}

function header(s, eyebrow, title) {
  s.addText(eyebrow, {
    x: M, y: 0.40, w: CW, h: 0.28, fontFace: JP, fontSize: 12, bold: true,
    color: AMBER, margin: 0, valign: "middle",
  });
  s.addText(title, {
    x: M, y: 0.70, w: CW, h: 0.62, fontFace: JP, fontSize: 27, bold: true,
    color: INK, margin: 0, valign: "middle",
  });
  return 1.55;
}

function badge(s, x, y, d, label, fill, txtColor, fs) {
  s.addShape(pptx.ShapeType.ellipse, {
    x, y, w: d, h: d, fill: { color: fill || AMBER }, line: { width: 0 },
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

function pill(s, x, y, w, h, text, fill, fs) {
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: h / 2, fill: { color: fill }, line: { width: 0 },
  });
  s.addText(text, {
    x, y, w, h, fontFace: JP, fontSize: fs || 12, bold: true,
    color: W, align: "center", valign: "middle", margin: 0,
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

// 章扉（朝／昼／夜の漢字バッジつき）
function divider(num, kanji, title, items) {
  const s = newSlide(true);
  s.addShape(pptx.ShapeType.ellipse, {
    x: 9.55, y: 1.55, w: 3.4, h: 3.4, fill: { color: INK }, line: { width: 0 },
  });
  s.addShape(pptx.ShapeType.ellipse, {
    x: 9.85, y: 1.85, w: 2.8, h: 2.8, fill: { color: AMBER }, line: { width: 0 },
  });
  s.addText(kanji, {
    x: 9.85, y: 1.85, w: 2.8, h: 2.8, fontFace: JP, fontSize: 96, bold: true,
    color: W, align: "center", valign: "middle", margin: 0,
  });

  s.addText(num, {
    x: M, y: 1.5, w: 3, h: 1.3, fontFace: JP, fontSize: 76, bold: true,
    color: AMBER, margin: 0, valign: "middle",
  });
  s.addText(title, {
    x: M, y: 2.95, w: 8.4, h: 1.6, fontFace: JP, fontSize: 30, bold: true,
    color: W, margin: 0, valign: "top", lineSpacingMultiple: 1.25,
  });
  const startY = 4.95;
  items.forEach((t, i) => {
    s.addShape(pptx.ShapeType.ellipse, {
      x: M + 0.02, y: startY + i * 0.5 + 0.13, w: 0.13, h: 0.13,
      fill: { color: AMBER }, line: { width: 0 },
    });
    s.addText(t, {
      x: M + 0.32, y: startY + i * 0.5, w: 8.6, h: 0.4, fontFace: JP, fontSize: 14,
      color: "C7D6E6", margin: 0, valign: "middle",
    });
  });
  return s;
}

// 3カード横並びの汎用レイアウト（見出し＋本文）
function threeCards(s, y, h, items, opts) {
  const o = opts || {};
  const cw = 3.71, gap = 0.4;
  items.forEach((it, i) => {
    const x = M + i * (cw + gap);
    card(s, x, y, cw, h, o.fill || CARD);
    badge(s, x + 0.35, y + 0.33, 0.62, it.badge || String(i + 1), it.color || AMBER, W, it.badgeFs || 17);
    s.addText(it.title, {
      x: x + 1.1, y: y + 0.33, w: cw - 1.45, h: 0.62, fontFace: JP, fontSize: o.titleFs || 17, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(it.body, {
      x: x + 0.35, y: y + 1.15, w: cw - 0.7, h: h - 1.5, fontFace: JP, fontSize: o.bodyFs || 12.5,
      color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.4,
    });
  });
}

// ============================================================
// 1. Title
// ============================================================
{
  const s = newSlide(true);
  s.addShape(pptx.ShapeType.ellipse, {
    x: 9.1, y: -1.55, w: 5.9, h: 5.9, fill: { color: INK }, line: { width: 0 },
  });
  s.addShape(pptx.ShapeType.ellipse, {
    x: 10.35, y: -0.3, w: 3.4, h: 3.4, fill: { color: AMBER }, line: { width: 0 },
  });

  s.addText("全2回オンライン講座 ／ 第2回", {
    x: M, y: 1.72, w: 8.5, h: 0.35, fontFace: JP, fontSize: 14, bold: true,
    color: AMBER, margin: 0, valign: "middle",
  });
  s.addText("夏休みの終わり", {
    x: M, y: 2.2, w: 9.2, h: 1.0, fontFace: JP, fontSize: 46, bold: true,
    color: W, margin: 0, valign: "middle",
  });
  s.addText("〜 食と生活リズムの整え方 〜", {
    x: M, y: 3.27, w: 9.2, h: 0.6, fontFace: JP, fontSize: 24,
    color: "C7D6E6", margin: 0, valign: "middle",
  });
  s.addText("2学期に向けて、朝・食事・夜の過ごし方をどう戻していくか", {
    x: M, y: 4.0, w: 9.2, h: 0.4, fontFace: JP, fontSize: 14,
    color: "9FB4CC", margin: 0, valign: "middle",
  });

  s.addShape(pptx.ShapeType.roundRect, {
    x: M, y: 4.85, w: 5.55, h: 0.62, rectRadius: 0.31,
    fill: { color: INK }, line: { color: INK_SOFT, width: 1 },
  });
  s.addText("8月17日（月）21:30 〜 23:00（90分）", {
    x: M, y: 4.85, w: 5.55, h: 0.62, fontFace: JP, fontSize: 14, bold: true,
    color: W, align: "center", valign: "middle", margin: 0,
  });

  s.addText("スマイルおうち栄養士／管理栄養士　髙落 まどか", {
    x: M, y: 5.9, w: 8.0, h: 0.4, fontFace: JP, fontSize: 15, bold: true,
    color: W, margin: 0, valign: "middle",
  });

  s.addNotes(
    "開始のあいさつ。今日は第2回。前回は「食事の考え方」、今回はそれを2学期に向けた一日の流れに落とし込みます。\n" +
    "21:30スタート、23:00終了。途中でチャットに書き込んでいただいてOKであることを伝える。"
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
    color: AMBER, margin: 0, valign: "middle",
  });
  s.addText("髙落 まどか", {
    x: M + 0.5, y: 2.65, w: 4.4, h: 0.8, fontFace: JP, fontSize: 32, bold: true,
    color: W, margin: 0, valign: "middle",
  });
  s.addText("「夏休みごはん対策講座」\n主催", {
    x: M + 0.5, y: 3.65, w: 4.4, h: 0.9, fontFace: JP, fontSize: 14,
    color: "C7D6E6", margin: 0, valign: "top", lineSpacingMultiple: 1.35,
  });
  s.addText("忙しい毎日でも続けられる、\nおうちごはんの整え方をお伝えしています。", {
    x: M + 0.5, y: 4.75, w: 4.4, h: 0.9, fontFace: JP, fontSize: 12.5,
    color: "9FB4CC", margin: 0, valign: "top", lineSpacingMultiple: 1.35,
  });

  const slots = [
    ["これまでのこと", "経歴・資格・お仕事のことなど"],
    ["この講座への想い", "なぜこの講座をひらいているか"],
    ["ふだんの発信", "SNS・ブログ・お教室など"],
  ];
  slots.forEach((sl, i) => {
    const y = 1.68 + i * 1.5;
    card(s, 6.45, y, 6.18, 1.28, CARD);
    s.addText(sl[0], {
      x: 6.8, y: y + 0.16, w: 5.5, h: 0.4, fontFace: JP, fontSize: 14, bold: true,
      color: SAGE, margin: 0, valign: "middle",
    });
    s.addShape(pptx.ShapeType.roundRect, {
      x: 6.8, y: y + 0.6, w: 5.48, h: 0.52, rectRadius: 0.08,
      fill: { color: W }, line: { color: "C3D0DC", width: 1 },
    });
    s.addText(sl[1], {
      x: 6.95, y: y + 0.6, w: 5.2, h: 0.52, fontFace: JP, fontSize: 11.5,
      color: "9AA9B8", margin: 0, valign: "middle",
    });
  });

  note(s, "※ 右側は当日のご紹介内容にあわせて書き換えてください。");

  s.addNotes(
    "自己紹介は1〜2分で。初参加の方に向けて、どんな立場で話しているかだけ伝われば十分。\n" +
    "右のカードは当日の内容に差し替えて使う。"
  );
}

// ============================================================
// 3. 今日のゴール ＋ 今日の流れ
// ============================================================
{
  const s = newSlide();
  header(s, "GOAL & AGENDA", "この90分で持ち帰っていただくこと");

  const goals = [
    ["01", "朝から戻す手順がわかる", "「夜を早める」ではうまくいきません"],
    ["02", "不調を食事から見る視点", "性格ではなく、食事から見てみます"],
    ["03", "わが家の作戦が3つ決まる", "最後にワークがあります"],
  ];
  goals.forEach((g, i) => {
    const y = 1.62 + i * 1.32;
    card(s, M, y, 5.5, 1.12, CARD);
    badge(s, M + 0.3, y + 0.26, 0.6, g[0], AMBER, W, 15);
    s.addText(g[1], {
      x: M + 1.08, y: y + 0.16, w: 4.2, h: 0.42, fontFace: JP, fontSize: 15.5, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(g[2], {
      x: M + 1.08, y: y + 0.6, w: 4.2, h: 0.38, fontFace: JP, fontSize: 12,
      color: GRAY, margin: 0, valign: "middle",
    });
  });

  card(s, 6.55, 1.62, 6.08, 4.72, "F8FAFC");
  s.addText("今日の流れ", {
    x: 6.9, y: 1.85, w: 5.4, h: 0.4, fontFace: JP, fontSize: 15, bold: true,
    color: INK, margin: 0, valign: "middle",
  });
  const agenda = [
    ["", "はじめに ／ 今の体の状態を知る", "8分", GRAY],
    ["1", "いま体に起きていること（秋バテ）", "12分", AMBER],
    ["2", "朝 — 一日と夜を決める時間", "15分", AMBER],
    ["3", "昼 — 食事の見方と注意すること", "13分", AMBER],
    ["4", "夜 — 入浴と睡眠で整える", "13分", AMBER],
    ["5", "胃腸を整える食べ方と旬の食材", "10分", AMBER],
    ["6", "2学期に向けた準備", "5分", AMBER],
    ["7", "わが家のスタート作戦（ワーク）", "8分", SAGE],
    ["", "まとめ ／ おしらせ ／ 質疑", "6分", GRAY],
  ];
  agenda.forEach((r, i) => {
    const y = 2.35 + i * 0.44;
    if (r[0]) {
      badge(s, 6.92, y + 0.06, 0.3, r[0], r[3], W, 10);
    } else {
      s.addShape(pptx.ShapeType.ellipse, {
        x: 7.0, y: y + 0.16, w: 0.11, h: 0.11, fill: { color: "AAB8C6" }, line: { width: 0 },
      });
    }
    s.addText(r[1], {
      x: 7.38, y, w: 4.1, h: 0.42, fontFace: JP, fontSize: 12.5,
      bold: !!r[0], color: r[0] ? INK : GRAY, margin: 0, valign: "middle",
    });
    s.addText(r[2], {
      x: 11.5, y, w: 0.85, h: 0.42, fontFace: JP, fontSize: 11.5, bold: true,
      color: r[3], align: "right", margin: 0, valign: "middle",
    });
  });

  banner(s, 6.5, "正解を覚える時間ではありません。「わが家はこうする」を決めて帰る時間です。", AMBER_LT, "8A4E13", 0.78, 15);

  s.addNotes(
    "ゴールと流れを一緒に見せる。ワークが後半にあることをここで予告しておくと、聞き方が変わる。\n" +
    "「知識を増やす会ではなく、決める会です」と一言添える。"
  );
}

// ============================================================
// 4. 前回のおさらい＆報告
// ============================================================
{
  const s = newSlide();
  header(s, "LOOK BACK", "前回（第1回）のおさらい＆報告");

  const items = [
    ["12種類の食材と2種類のたんぱく質", "むずかしく考えず、地味に栄養をプラスする。これが前回のいちばんの話でした。"],
    ["食事は「足し算」で考える", "減らす・やめさせるより、1品足すほうが早くて続きます。"],
    ["完璧な食事より、続く食事", "週の半分できていれば十分。ゼロか100かにしない。"],
  ];
  items.forEach((it, i) => {
    const y = 1.68 + i * 1.5;
    card(s, M, y, 7.9, 1.28, CARD);
    badge(s, M + 0.3, y + 0.34, 0.62, String(i + 1), INK, W, 15);
    s.addText(it[0], {
      x: M + 1.12, y: y + 0.24, w: 6.6, h: 0.42, fontFace: JP, fontSize: 16, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(it[1], {
      x: M + 1.12, y: y + 0.68, w: 6.6, h: 0.4, fontFace: JP, fontSize: 12.5,
      color: GRAY, margin: 0, valign: "middle",
    });
  });

  card(s, 8.95, 1.68, 3.68, 4.28, SAGE_LT);
  s.addText("今回やること", {
    x: 9.25, y: 2.05, w: 3.1, h: 0.35, fontFace: JP, fontSize: 13, bold: true,
    color: SAGE, margin: 0, valign: "middle",
  });
  s.addText("この3つを、\n2学期に向けた\n「一日の時間割」に\n落とし込みます。", {
    x: 9.25, y: 2.6, w: 3.1, h: 1.7, fontFace: JP, fontSize: 16, bold: true,
    color: INK, margin: 0, valign: "top", lineSpacingMultiple: 1.35,
  });
  s.addText("朝 → 昼 → 夜 の順に\n見ていきます。", {
    x: 9.25, y: 4.6, w: 3.1, h: 0.85, fontFace: JP, fontSize: 12.5,
    color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.3,
  });

  note(s, "※ 第1回に参加されていない方も、今日だけで完結する内容です。");

  s.addNotes(
    "前回の内容を3点だけ短く復習。3分程度で。\n" +
    "「12種類の食材と2種類のたんぱく質」は前回のキーワードなので、覚えている方に手を挙げてもらうと場が温まる。"
  );
}

// ============================================================
// 5. 今の体の状態を知る（親子チェック）
// ============================================================
{
  const s = newSlide();
  header(s, "はじめに", "今の「あなた」と「お子さん」の体は、どんな状態でしょうか");

  const grown = [
    "朝から体が重い、起きるのがつらい",
    "冷房で手足が冷える／肩がこる",
    "冷たいもの・甘いものが増えた",
    "寝ても疲れが抜けない",
  ];
  const kids = [
    "寝る時間が1〜2時間おそくなった",
    "朝は10時、11時まで起きてこない",
    "朝ごはんが菓子パンだけ／食べない",
    "ちょっとしたことでイライラ・グズグズ",
  ];

  [["大人（あなた）", grown, AMBER], ["子ども", kids, SAGE]].forEach((col, ci) => {
    const x = M + ci * 6.17;
    card(s, x, 1.62, 5.76, 4.35, CARD);
    pill(s, x + 0.35, 1.9, 1.85, 0.42, col[0], col[2], 12);
    col[1].forEach((t, i) => {
      const y = 2.55 + i * 0.78;
      s.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.38, y: y + 0.1, w: 0.3, h: 0.3, rectRadius: 0.05,
        fill: { color: W }, line: { color: "B9C7D4", width: 1 },
      });
      s.addText(t, {
        x: x + 0.85, y, w: 4.6, h: 0.5, fontFace: JP, fontSize: 13.5,
        color: INK, margin: 0, valign: "middle",
      });
    });
  });

  banner(s, 6.15, "意外と気づいていないのが、自分の体。まず「今」を知るところから始めます。", AMBER_LT, "8A4E13", 0.85, 16);

  s.addNotes(
    "共感パート。チャットで「いくつ当てはまりましたか？」と聞くと参加感が出る。\n" +
    "大人側にもチェックがあることが今回のポイント。親が疲れていると、子どもの生活リズムは戻せない。"
  );
}

// ============================================================
// 6. 夏バテだけじゃない、秋バテもある
// ============================================================
{
  const s = newSlide();
  header(s, "1. いま体に起きていること", "夏バテだけじゃない…「秋バテ」だってあります");

  card(s, M, 1.62, 7.6, 2.5, CARD);
  s.addText("夏に起こる体のさまざまな不調は「夏バテ」と言われています。", {
    x: M + 0.45, y: 1.9, w: 6.8, h: 0.45, fontFace: JP, fontSize: 14,
    color: INK, margin: 0, valign: "middle",
  });
  s.addText("でも、夏が終わったとしても、夏の疲れが癒えないまま引きずってしまう。", {
    x: M + 0.45, y: 2.42, w: 6.8, h: 0.45, fontFace: JP, fontSize: 14,
    color: INK, margin: 0, valign: "middle",
  });
  s.addText("それが『秋バテ』です。", {
    x: M + 0.45, y: 3.1, w: 6.8, h: 0.6, fontFace: JP, fontSize: 22, bold: true,
    color: AMBER, margin: 0, valign: "middle",
  });

  // タイムライン
  card(s, M, 4.35, 7.6, 1.75, "F8FAFC");
  const months = [
    ["7月・8月", "夏バテ", AMBER],
    ["8月後半", "疲れが残る", "C77E3A"],
    ["9月・10月", "秋バテ", ROSE],
  ];
  months.forEach((m, i) => {
    const x = M + 0.42 + i * 2.42;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 4.72, w: 2.0, h: 1.0, rectRadius: 0.1,
      fill: { color: W }, line: { color: LINE, width: 1 },
    });
    s.addText(m[0], {
      x, y: 4.82, w: 2.0, h: 0.35, fontFace: JP, fontSize: 11.5,
      color: GRAY, align: "center", valign: "middle", margin: 0,
    });
    s.addText(m[1], {
      x, y: 5.15, w: 2.0, h: 0.45, fontFace: JP, fontSize: 15, bold: true,
      color: m[2], align: "center", valign: "middle", margin: 0,
    });
    if (i < 2) {
      s.addText("▶", {
        x: x + 2.0, y: 4.72, w: 0.42, h: 1.0, fontFace: JP, fontSize: 12,
        color: "AAB8C6", align: "center", valign: "middle", margin: 0,
      });
    }
  });

  card(s, 8.6, 1.62, 4.03, 4.48, INK);
  s.addText("ここが今日の入口", {
    x: 8.95, y: 1.95, w: 3.35, h: 0.4, fontFace: JP, fontSize: 13, bold: true,
    color: AMBER, margin: 0, valign: "middle",
  });
  s.addText("「2学期が始まってから\n崩れる」のは、\n気持ちの問題では\nありません。", {
    x: 8.95, y: 2.5, w: 3.35, h: 1.8, fontFace: JP, fontSize: 17, bold: true,
    color: W, margin: 0, valign: "top", lineSpacingMultiple: 1.35,
  });
  s.addText("夏のあいだにたまった疲れが、\n季節の変わり目に\n出てくるからです。\n\nだから、9月ではなく\n「今」から整えます。", {
    x: 8.95, y: 4.35, w: 3.35, h: 1.6, fontFace: JP, fontSize: 12.5,
    color: "C7D6E6", margin: 0, valign: "top", lineSpacingMultiple: 1.35,
  });

  s.addNotes(
    "「秋バテ」という言葉を知らない方が多いので、ここで丁寧に。\n" +
    "2学期に崩れるのは9月の問題ではなく、8月にたまった疲れが原因、という因果をつなげる。"
  );
}

// ============================================================
// 7. 秋バテの3大疲れ
// ============================================================
{
  const s = newSlide();
  header(s, "1. いま体に起きていること", "秋バテが起こるのは「3大疲れ」が原因");

  threeCards(s, 1.62, 3.95, [
    {
      badge: "1", color: AMBER, title: "冷房疲れ",
      body: "室内外の気温差で、体温を調整する力が消耗します。\n\n手足の冷え、肩こり、だるさ、寝つきの悪さとして出ます。",
    },
    {
      badge: "2", color: ROSE, title: "胃腸疲れ",
      body: "冷たいもの・そうめん中心の食生活の乱れで、胃腸が弱ります。\n\n食欲が出ない、お腹の調子が悪い、栄養が入らない。",
    },
    {
      badge: "3", color: SAGE, title: "水分不足",
      body: "汗をかいた分を、うっかり補えていないことが多いです。\n\n頭痛、集中が続かない、朝から元気がない。",
    },
  ]);

  banner(s, 5.78, "3つとも、8月後半の今がいちばんたまっている時期です。", INK, W, 0.85, 16);

  s.addNotes(
    "3つのうちどれが当てはまりそうか、チャットで聞いてもいい。\n" +
    "次のスライドで「胃腸疲れ」を掘り下げるので、2番につなげる言い方をしておく。"
  );
}

// ============================================================
// 8. 胃腸が弱ると、腸内環境も気分も落ちる
// ============================================================
{
  const s = newSlide();
  header(s, "1. いま体に起きていること", "胃腸が弱ると、腸内環境も気分も落ちていきます");

  const chain = [
    "胃腸の働きが落ちる",
    "腸内環境が悪くなる",
    "食べても、うまく吸収できない",
    "気分まで落ちて、悪循環に",
  ];
  chain.forEach((t, i) => {
    const y = 1.68 + i * 1.05;
    card(s, M, y, 6.5, 0.88, i === 3 ? ROSE_LT : CARD);
    badge(s, M + 0.28, y + 0.16, 0.56, String(i + 1), i === 3 ? ROSE : INK, W, 14);
    s.addText(t, {
      x: M + 1.02, y, w: 5.2, h: 0.88, fontFace: JP, fontSize: 15, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    if (i < 3) {
      s.addText("▼", {
        x: M + 0.42, y: y + 0.88, w: 0.28, h: 0.17, fontFace: JP, fontSize: 8,
        color: "AAB8C6", align: "center", valign: "middle", margin: 0,
      });
    }
  });

  card(s, 7.55, 1.68, 5.08, 4.25, SAGE_LT);
  s.addText("逆に、腸内環境が整うと", {
    x: 7.9, y: 2.0, w: 4.4, h: 0.4, fontFace: JP, fontSize: 14, bold: true,
    color: SAGE, margin: 0, valign: "middle",
  });
  s.addText([
    { text: "免疫力が上がる", options: { bullet: true, breakLine: true } },
    { text: "便通がよくなる", options: { bullet: true, breakLine: true } },
    { text: "ストレスがやわらぐ", options: { bullet: true, breakLine: true } },
    { text: "疲れにくくなる", options: { bullet: true, breakLine: false } },
  ], {
    x: 7.95, y: 2.6, w: 4.3, h: 2.0, fontFace: JP, fontSize: 15, bold: true,
    color: INK, margin: 0, valign: "top", paraSpaceAfter: 14,
  });
  s.addText("腸と脳はおたがいに情報を送りあっていて、\n気分とのつながりが注目されている分野です。", {
    x: 7.95, y: 4.85, w: 4.3, h: 0.85, fontFace: JP, fontSize: 12,
    color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.35,
  });

  note(s, "※ 腸内環境と気分の関係は研究が進んでいる分野です。ここでは「つながりがある」という視点としてお話ししています。");

  s.addNotes(
    "腸脳相関の話。断定しすぎないこと。\n" +
    "「腸のセロトニンがそのまま脳に届く」という言い方は正確ではないので避ける。"
  );
}

// ============================================================
// 9. 疲労感を出しているのは「脳」
// ============================================================
{
  const s = newSlide();
  header(s, "1. いま体に起きていること", "「疲労」は、体だけの問題なのでしょうか");

  card(s, M, 1.62, CW, 1.05, INK);
  s.addText("A. 疲労感を出しているのは、じつは「脳」です。", {
    x: M + 0.5, y: 1.62, w: CW - 1.0, h: 1.05, fontFace: JP, fontSize: 22, bold: true,
    color: W, margin: 0, valign: "middle",
  });

  card(s, M, 2.95, 5.76, 2.95, SAGE_LT);
  pill(s, M + 0.35, 3.25, 1.9, 0.42, "元気なとき", SAGE, 12);
  s.addText("昼は交感神経、夜は副交感神経。\n一日のなかで、しっかり切り替わっています。", {
    x: M + 0.4, y: 3.85, w: 5.0, h: 1.0, fontFace: JP, fontSize: 14,
    color: INK, margin: 0, valign: "top", lineSpacingMultiple: 1.35,
  });
  s.addText("活動 → 休息 のリズムができている状態", {
    x: M + 0.4, y: 5.1, w: 5.0, h: 0.5, fontFace: JP, fontSize: 12.5, bold: true,
    color: SAGE, margin: 0, valign: "middle",
  });

  card(s, 7.27, 2.95, 5.76, 2.95, ROSE_LT);
  pill(s, 7.62, 3.25, 2.7, 0.42, "なんとなく不調のとき", ROSE, 12);
  s.addText("交感神経が優位な状態が、\n長く続いている可能性があります。", {
    x: 7.67, y: 3.85, w: 5.0, h: 1.0, fontFace: JP, fontSize: 14,
    color: INK, margin: 0, valign: "top", lineSpacingMultiple: 1.35,
  });
  s.addText("休息に切り替われず、疲れが抜けない状態", {
    x: 7.67, y: 5.1, w: 5.0, h: 0.5, fontFace: JP, fontSize: 12.5, bold: true,
    color: ROSE, margin: 0, valign: "middle",
  });

  banner(s, 6.05, "だからこそ、睡眠の質を意識した「一日の過ごし方」がポイントになります。", AMBER_LT, "8A4E13", 0.85, 16);

  s.addNotes(
    "「気合が足りない」ではなく、自律神経の切り替えの問題として説明する。\n" +
    "ここが朝・昼・夜の3章につながる導入になる。"
  );
}

// ============================================================
// 10. 一気戻しは効かない／動かすのは朝
// ============================================================
{
  const s = newSlide();
  header(s, "1. いま体に起きていること", "だから「直前に一気に戻す」はうまくいきません");

  const reasons = [
    ["体内時計は一気に動かない", "ずらせるのは1日15〜30分ほど"],
    ["「早く寝なさい」では眠くならない", "眠気は起きた時刻と光で決まる"],
    ["3つ同時に言われても動けない", "寝ろ・起きろ・食べろが一度に来る"],
  ];
  reasons.forEach((r, i) => {
    const x = M + i * 4.11;
    card(s, x, 1.62, 3.71, 1.75, CARD);
    badge(s, x + 0.32, 1.9, 0.5, "×", ROSE, W, 16);
    s.addText(r[0], {
      x: x + 0.32, y: 2.5, w: 3.07, h: 0.42, fontFace: JP, fontSize: 14, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(r[1], {
      x: x + 0.32, y: 2.9, w: 3.07, h: 0.4, fontFace: JP, fontSize: 11.5,
      color: GRAY, margin: 0, valign: "middle",
    });
  });

  card(s, M, 3.62, CW, 2.35, INK);
  s.addText("動かすのは「夜」ではなく、「朝」だけ。", {
    x: M + 0.6, y: 3.85, w: CW - 1.2, h: 0.5, fontFace: JP, fontSize: 24, bold: true,
    color: W, margin: 0, valign: "middle",
  });

  const flow = ["朝、起こす", "光を浴びる", "朝ごはん", "夜が早まる"];
  flow.forEach((t, i) => {
    const x = M + 0.6 + i * 2.75;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 4.55, w: 2.4, h: 0.7, rectRadius: 0.1,
      fill: { color: INK_SOFT }, line: { width: 0 },
    });
    s.addText(t, {
      x, y: 4.55, w: 2.4, h: 0.7, fontFace: JP, fontSize: 13.5, bold: true,
      color: W, align: "center", valign: "middle", margin: 0,
    });
    if (i < 3) {
      s.addText("▶", {
        x: x + 2.4, y: 4.55, w: 0.35, h: 0.7, fontFace: JP, fontSize: 11,
        color: AMBER, align: "center", valign: "middle", margin: 0,
      });
    }
  });
  s.addText("起きる時間が前に動けば、眠くなる時間も自然と前に動きます。夜は「結果」であって、「原因」ではありません。", {
    x: M + 0.6, y: 5.4, w: CW - 1.2, h: 0.45, fontFace: JP, fontSize: 13,
    color: "C7D6E6", margin: 0, valign: "middle",
  });

  note(s, "今日いちばん覚えて帰っていただきたいのは、この1枚です。", AMBER);

  s.addNotes(
    "今日の中心メッセージ。ここは時間をかけてゆっくり話す。\n" +
    "「夜は結果、朝が原因」という言い方を繰り返す。この後の3章すべてがここに戻る。"
  );
}

// ============================================================
// 11. 章扉【朝】
// ============================================================
divider("02", "朝", "目覚めてからの行動が、\nその日と夜を決める", [
  "起きる時間の決め方と、15分ずつの前倒し",
  "光と朝ごはんという2つのスイッチ",
  "朝食におすすめの食材（トリプトファン × ビタミンB6）",
]).addNotes("ここから15分。朝パート。「一日は朝で決まる」を宣言してから入る。");

// ============================================================
// 12. 朝を戻す3ステップ
// ============================================================
{
  const s = newSlide();
  header(s, "2. 朝", "朝を戻す3ステップ");

  const steps = [
    ["起きる時間を先に決める", "寝る時間ではなく、起きる時間から決めます。2学期の起床時刻を、家族で1つに。まずは紙に書いて貼るところから。"],
    ["起きて30分以内に光を浴びる", "セロトニンが分泌されて交感神経が優位に切り替わり、活動スイッチが入ります。カーテンを開けるだけでOK。"],
    ["朝ごはんを食べる", "食べると内臓の時計が動きはじめます。トリプトファンとビタミンB6を含む食品がおすすめです。"],
  ];
  steps.forEach((st, i) => {
    const y = 1.62 + i * 1.55;
    card(s, M, y, 8.55, 1.38, CARD);
    badge(s, M + 0.35, y + 0.32, 0.74, "STEP\n" + (i + 1), AMBER, W, 10);
    s.addText(st[0], {
      x: M + 1.32, y: y + 0.2, w: 7.0, h: 0.42, fontFace: JP, fontSize: 17, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(st[1], {
      x: M + 1.32, y: y + 0.66, w: 7.0, h: 0.6, fontFace: JP, fontSize: 13,
      color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.3,
    });
  });

  card(s, 9.55, 1.62, 3.08, 4.55, INK);
  s.addText("順番が大事", {
    x: 9.85, y: 1.95, w: 2.5, h: 0.4, fontFace: JP, fontSize: 15, bold: true,
    color: AMBER, margin: 0, valign: "middle",
  });
  s.addText("①→②→③の順に\nやってください。\n\n③だけを先に頑張ると、\n「食べない」で\nもめて終わります。\n\n①が決まらないうちは、\n②も③も動きません。", {
    x: 9.85, y: 2.5, w: 2.5, h: 3.4, fontFace: JP, fontSize: 12.5,
    color: "C7D6E6", margin: 0, valign: "top", lineSpacingMultiple: 1.35,
  });

  s.addNotes(
    "3ステップの順番を強調。特に「朝ごはんから始めない」こと。\n" +
    "起床時刻が決まっていないのに朝食を頑張ると、必ず食卓でもめる。"
  );
}

// ============================================================
// 13. 15分前倒し作戦
// ============================================================
{
  const s = newSlide();
  header(s, "2. 朝", "15分ずつ前倒し作戦（例：9:30 → 6:45）");

  const rows = [
    [
      { text: "日にち", options: { fill: { color: INK }, color: W, bold: true } },
      { text: "起きる時間", options: { fill: { color: INK }, color: W, bold: true } },
      { text: "この日のねらい", options: { fill: { color: INK }, color: W, bold: true } },
    ],
    ["8/18（火）〜19（水）", "9:15", "まずは15分だけ。起きたらカーテンを開ける"],
    ["8/20（木）〜21（金）", "8:45", "朝ごはんを一口。飲みものだけでもOK"],
    ["8/22（土）〜23（日）", "8:15", "土日も同じ時間で。ここが最大の山場"],
    ["8/24（月）〜25（火）", "7:45", "朝ごはんを2品に（主食＋たんぱく質）"],
    ["8/26（水）〜27（木）", "7:15", "着替え・支度まで通しで練習"],
    ["8/28（金）〜31（月）", "6:45", "学校と同じ時間で通し運転"],
  ];
  s.addTable(rows, {
    x: M, y: 1.62, w: 8.55, colW: [2.55, 1.5, 4.5],
    fontFace: JP, fontSize: 13, color: INK, valign: "middle",
    rowH: 0.62, border: { type: "solid", color: LINE, pt: 1 },
    fill: { color: W }, align: "left", margin: [4, 10, 4, 10],
  });

  card(s, 9.55, 1.62, 3.08, 3.6, AMBER_LT);
  s.addText("コツ", {
    x: 9.85, y: 1.92, w: 2.5, h: 0.35, fontFace: JP, fontSize: 14, bold: true,
    color: "8A4E13", margin: 0, valign: "middle",
  });
  s.addText("・2日で15分ずつ\n・土日もそろえる\n・目標時刻から逆算\n・戻すのは「起床」だけ", {
    x: 9.85, y: 2.42, w: 2.5, h: 1.7, fontFace: JP, fontSize: 13, bold: true,
    color: "8A4E13", margin: 0, valign: "top", lineSpacingMultiple: 1.45,
  });
  s.addText("残り日数が少ないときは\n30分刻みでも大丈夫。\nゼロよりずっと違います。", {
    x: 9.85, y: 4.3, w: 2.5, h: 0.85, fontFace: JP, fontSize: 11.5,
    color: "8A4E13", margin: 0, valign: "top", lineSpacingMultiple: 1.3,
  });

  card(s, 9.55, 5.4, 3.08, 1.02, SAGE_LT);
  s.addText("寝る時間は\n決めなくてOK", {
    x: 9.85, y: 5.4, w: 2.5, h: 1.02, fontFace: JP, fontSize: 13.5, bold: true,
    color: "2A5F4E", margin: 0, valign: "middle", lineSpacingMultiple: 1.25,
  });

  note(s, "※ 起床時刻の一例です。ご家庭の「今の起床時刻」と「2学期の起床時刻」に合わせて刻んでください。");

  s.addNotes(
    "実際に手元のカレンダーに書き込んでもらう。\n" +
    "土日をそろえるのが一番の山場。ここで崩れると月曜が元に戻る。"
  );
}

// ============================================================
// 14. 朝ごはんの最低ライン3レベル
// ============================================================
{
  const s = newSlide();
  header(s, "2. 朝", "朝ごはんの「最低ライン」3レベル");

  const levels = [
    ["LEVEL 1", "まず水分＋一口", ["麦茶・牛乳・スープ", "バナナ／ヨーグルト", "一口サイズのおにぎり"],
      "「朝は食べられない」子は、ここからで十分です。", GRAY],
    ["LEVEL 2", "炭水化物＋たんぱく質", ["おにぎり＋ゆで卵", "パン＋チーズ", "ごはん＋納豆"],
      "ここまで来ると、午前中の集中がもちます。", AMBER],
    ["LEVEL 3", "＋汁物か果物", ["みそ汁・具だくさんスープ", "果物を1品", "野菜をひとつまみ"],
      "水分とミネラルも一緒に。毎日でなくて大丈夫。", SAGE],
  ];
  const cw = 3.71, gap = 0.4;
  levels.forEach((lv, i) => {
    const x = M + i * (cw + gap);
    card(s, x, 1.62, cw, 3.95, CARD);
    pill(s, x + 0.33, 1.9, 1.28, 0.36, lv[0], lv[4], 10.5);
    s.addText(lv[1], {
      x: x + 0.33, y: 2.42, w: cw - 0.66, h: 0.42, fontFace: JP, fontSize: 16.5, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(lv[2].map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < lv[2].length - 1 } })), {
      x: x + 0.4, y: 2.95, w: cw - 0.75, h: 1.35, fontFace: JP, fontSize: 13,
      color: INK, margin: 0, valign: "top", paraSpaceAfter: 6,
    });
    s.addText(lv[3], {
      x: x + 0.33, y: 4.45, w: cw - 0.66, h: 0.9, fontFace: JP, fontSize: 12,
      color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.3,
    });
  });

  banner(s, 5.8, "目指すのは LEVEL 2。毎日 LEVEL 3 でなくて大丈夫です。", AMBER_LT, "8A4E13", 0.82, 16);

  s.addNotes(
    "「朝ごはん＝きちんとした食卓」の思い込みを外す。\n" +
    "レベル1でも意味がある（内臓の時計が動く）ことを伝えると、親の気持ちが軽くなる。"
  );
}

// ============================================================
// 15. 朝食におすすめ（トリプトファン × ビタミンB6）
// ============================================================
{
  const s = newSlide();
  header(s, "2. 朝", "朝食におすすめ — トリプトファン × ビタミンB6");

  card(s, M, 1.62, CW, 0.85, INK);
  s.addText("セロトニンの材料が「トリプトファン」、その働きを助けるのが「ビタミンB6」です。", {
    x: M + 0.5, y: 1.62, w: CW - 1.0, h: 0.85, fontFace: JP, fontSize: 15, bold: true,
    color: W, margin: 0, valign: "middle",
  });

  const cols = [
    ["トリプトファンが多い", ["ヨーグルト・牛乳", "チーズ", "豆腐・納豆・味噌", "ピーナッツ・アーモンド", "ごま"], AMBER],
    ["ビタミンB6が多い", ["鶏肉・豚肉", "かつお・まぐろなどの青魚", "レバー", "にんにく・生姜", "玄米"], "C77E3A"],
    ["両方ふくむ食品", ["バナナ", "納豆", "豆腐・豆乳", "卵"], SAGE],
  ];
  const cw = 3.71, gap = 0.4;
  cols.forEach((c, i) => {
    const x = M + i * (cw + gap);
    card(s, x, 2.72, cw, 3.05, CARD);
    s.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.28, y: 3.0, w: cw - 0.56, h: 0.52, rectRadius: 0.09,
      fill: { color: c[2] }, line: { width: 0 },
    });
    s.addText(c[0], {
      x: x + 0.28, y: 3.0, w: cw - 0.56, h: 0.52, fontFace: JP, fontSize: 13.5, bold: true,
      color: W, align: "center", valign: "middle", margin: 0,
    });
    s.addText(c[1].map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < c[1].length - 1 } })), {
      x: x + 0.32, y: 3.72, w: cw - 0.6, h: 1.9, fontFace: JP, fontSize: 13,
      color: INK, margin: 0, valign: "top", paraSpaceAfter: 8,
    });
  });

  banner(s, 5.98, "むずかしく考えず「バナナ＋牛乳」「ごはん＋納豆」。これで両方そろいます。", SAGE_LT, "2A5F4E", 0.82, 16);

  s.addNotes(
    "前回資料ではビタミンB1と書かれていたが、トリプトファンからセロトニンをつくるのを助けるのはビタミンB6。\n" +
    "「覚えなくていいので、バナナ＋牛乳、ごはん＋納豆だけ覚えて帰ってください」と締める。"
  );
}

// ============================================================
// 16. 声かけ
// ============================================================
{
  const s = newSlide();
  header(s, "2. 朝", "しんどくなる声かけ／ラクになる声かけ");

  const ng = ["「早く食べなさい」", "「なんで起きられないの」", "「2学期どうするの」", "「もう○時だよ！」"];
  const ok = ["「おにぎりとパン、どっちにする？」", "「まずカーテンだけ開けよう」", "「明日は何時に起きてみる？」", "「起きられたね」"];

  card(s, M, 1.62, 5.76, 3.95, ROSE_LT);
  badge(s, M + 0.4, 1.92, 0.5, "×", ROSE, W, 17);
  s.addText("しんどくなる声かけ", {
    x: M + 1.05, y: 1.92, w: 4.3, h: 0.5, fontFace: JP, fontSize: 16, bold: true,
    color: ROSE, margin: 0, valign: "middle",
  });
  ng.forEach((t, i) => {
    s.addText(t, {
      x: M + 0.4, y: 2.65 + i * 0.66, w: 5.0, h: 0.55, fontFace: JP, fontSize: 14.5,
      color: INK, margin: 0, valign: "middle",
    });
  });

  card(s, 7.27, 1.62, 5.76, 3.95, SAGE_LT);
  badge(s, 7.67, 1.92, 0.5, "○", SAGE, W, 17);
  s.addText("ラクになる声かけ", {
    x: 8.32, y: 1.92, w: 4.3, h: 0.5, fontFace: JP, fontSize: 16, bold: true,
    color: SAGE, margin: 0, valign: "middle",
  });
  ok.forEach((t, i) => {
    s.addText(t, {
      x: 7.67, y: 2.65 + i * 0.66, w: 5.0, h: 0.55, fontFace: JP, fontSize: 14.5,
      color: INK, margin: 0, valign: "middle",
    });
  });

  banner(s, 5.78, "違いは「指示」か「選択肢」か。自分で決めたことのほうが、体は動きます。", INK, W, 0.85, 16);

  s.addNotes("声かけは今日から変えられる部分。実演するとわかりやすい。");
}

// ============================================================
// 17. 章扉【昼】
// ============================================================
divider("03", "昼", "起きられない、だるい、イライラ\nを食事から見る", [
  "血糖の波・たんぱく質と鉄・水分とミネラル",
  "昼に注意したいこと（カフェインと糖質）",
  "0円でできる、3つの習慣",
]).addNotes("ここから13分。昼パート。");

// ============================================================
// 18. 食事の見方 3視点
// ============================================================
{
  const s = newSlide();
  header(s, "3. 昼", "その不調、食事からのサインかもしれません");

  const views = [
    ["血糖の波", "菓子パンやジュース“だけ”の朝は、いったん上がって急に落ちます。落ちたときに出るのが、だるさ・眠気・イライラ。",
      "だるい・イライラ・急な眠気", AMBER],
    ["たんぱく質と鉄", "そうめん中心の夏は、どちらも不足しがち。とくに成長期と、生理のある女の子は減りやすい栄養素です。",
      "立ちくらみ・集中が続かない", ROSE],
    ["水分とミネラル", "汗で出たまま、麦茶だけで過ごしていませんか。水分だけでは足りず、塩分やミネラルも一緒に必要です。",
      "頭痛・食欲がない・元気が出ない", SAGE],
  ];
  const cw = 3.71, gap = 0.4;
  views.forEach((v, i) => {
    const x = M + i * (cw + gap);
    card(s, x, 1.62, cw, 3.85, CARD);
    badge(s, x + 0.35, 1.95, 0.62, String(i + 1), v[3], W, 17);
    s.addText(v[0], {
      x: x + 1.1, y: 1.95, w: cw - 1.45, h: 0.62, fontFace: JP, fontSize: 18, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(v[1], {
      x: x + 0.35, y: 2.78, w: cw - 0.7, h: 1.65, fontFace: JP, fontSize: 12.5,
      color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.4,
    });
    s.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.35, y: 4.5, w: cw - 0.7, h: 0.72, rectRadius: 0.08,
      fill: { color: W }, line: { color: LINE, width: 1 },
    });
    s.addText(v[2], {
      x: x + 0.45, y: 4.5, w: cw - 0.9, h: 0.72, fontFace: JP, fontSize: 12, bold: true,
      color: v[3], align: "center", valign: "middle", margin: 0, lineSpacingMultiple: 1.2,
    });
  });

  card(s, M, 5.68, CW, 0.9, "F8FAFC");
  s.addText("※ ここでお話しするのは「食事から見てみる」という視点です。症状が続くときや気になるときは、必ず医療機関にご相談ください。", {
    x: M + 0.45, y: 5.68, w: CW - 0.9, h: 0.9, fontFace: JP, fontSize: 12.5,
    color: GRAY, margin: 0, valign: "middle",
  });

  s.addNotes("医療的な診断ではないことを必ず明言する。");
}

// ============================================================
// 19. 血糖の波（チャート）
// ============================================================
{
  const s = newSlide();
  header(s, "3. 昼", "同じ「食べた」でも、午前中の体調は変わります");

  s.addChart(
    pptx.ChartType.line,
    [
      {
        name: "菓子パン・ジュースだけ",
        labels: ["朝食前", "食べた直後", "1〜2時間後", "午前なかば"],
        values: [95, 168, 74, 82],
      },
      {
        name: "ごはん＋卵＋みそ汁",
        labels: ["朝食前", "食べた直後", "1〜2時間後", "午前なかば"],
        values: [95, 126, 112, 102],
      },
    ],
    {
      x: M, y: 1.62, w: 7.9, h: 4.05,
      chartColors: [AMBER, SAGE],
      lineSize: 4, lineSmooth: true,
      showLegend: true, legendPos: "b", legendFontSize: 12, legendFontFace: JP, legendColor: INK,
      catAxisLabelFontFace: JP, catAxisLabelFontSize: 12, catAxisLabelColor: GRAY,
      valAxisLabelFontFace: JP, valAxisLabelFontSize: 11, valAxisLabelColor: GRAY,
      valAxisMinVal: 60, valAxisMaxVal: 190, valAxisHidden: true,
      valGridLine: { color: "EDF2F6", size: 1 },
      catGridLine: { style: "none" },
      showValue: false,
      dataBorder: { pt: 0, color: W },
    }
  );

  s.addText("※ 血糖の動きのイメージ図です（実測値ではありません）", {
    x: M, y: 5.72, w: 7.9, h: 0.3, fontFace: JP, fontSize: 10.5,
    color: "9AA9B8", margin: 0, valign: "middle",
  });

  card(s, 8.95, 1.62, 3.68, 2.15, AMBER_LT);
  s.addText("急に上がると、急に落ちる", {
    x: 9.28, y: 1.85, w: 3.05, h: 0.4, fontFace: JP, fontSize: 14.5, bold: true,
    color: "8A4E13", margin: 0, valign: "middle",
  });
  s.addText("落ちたタイミングで出るのが、\nだるさ・眠気・イライラ。\n「食べたのに元気がない」の\n正体はここにあります。", {
    x: 9.28, y: 2.35, w: 3.05, h: 1.3, fontFace: JP, fontSize: 12.5,
    color: "8A4E13", margin: 0, valign: "top", lineSpacingMultiple: 1.35,
  });

  card(s, 8.95, 3.95, 3.68, 2.3, INK);
  s.addText("覚えるのは1つだけ", {
    x: 9.28, y: 4.18, w: 3.05, h: 0.35, fontFace: JP, fontSize: 12.5, bold: true,
    color: AMBER, margin: 0, valign: "middle",
  });
  s.addText("単品にしない", {
    x: 9.28, y: 4.62, w: 3.05, h: 0.5, fontFace: JP, fontSize: 22, bold: true,
    color: W, margin: 0, valign: "middle",
  });
  s.addText("パンだけ・麺だけ・果物だけを\nやめて、何か1つ足す。\nそれだけで波はゆるやかに。", {
    x: 9.28, y: 5.2, w: 3.05, h: 0.95, fontFace: JP, fontSize: 12,
    color: "C7D6E6", margin: 0, valign: "top", lineSpacingMultiple: 1.3,
  });

  s.addNotes("図はイメージであることを口頭でも言う。キーワードは「単品にしない」。");
}

// ============================================================
// 20. 昼に注意すること（カフェイン／糖質過多）
// ============================================================
{
  const s = newSlide();
  header(s, "3. 昼", "注意すること — カフェインと糖質");

  card(s, M, 1.62, 5.76, 4.35, ROSE_LT);
  badge(s, M + 0.4, 1.95, 0.55, "!", ROSE, W, 18);
  s.addText("カフェイン摂取", {
    x: M + 1.1, y: 1.95, w: 4.3, h: 0.55, fontFace: JP, fontSize: 19, bold: true,
    color: ROSE, margin: 0, valign: "middle",
  });
  s.addText("夕方以降に飲むと、覚醒作用が夜まで続いてしまいます。", {
    x: M + 0.4, y: 2.75, w: 5.0, h: 0.5, fontFace: JP, fontSize: 13.5,
    color: INK, margin: 0, valign: "middle",
  });
  s.addShape(pptx.ShapeType.roundRect, {
    x: M + 0.4, y: 3.35, w: 5.0, h: 0.62, rectRadius: 0.1,
    fill: { color: W }, line: { color: "E4C3BF", width: 1 },
  });
  s.addText("15時以降は飲まないようにする", {
    x: M + 0.4, y: 3.35, w: 5.0, h: 0.62, fontFace: JP, fontSize: 15, bold: true,
    color: ROSE, align: "center", valign: "middle", margin: 0,
  });
  s.addText("子どもも同じです。エナジードリンク、\nコーヒー、濃い緑茶、コーラにも入っています。", {
    x: M + 0.4, y: 4.15, w: 5.0, h: 0.85, fontFace: JP, fontSize: 12.5,
    color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.35,
  });
  s.addText("夏休みは自由に飲めてしまうので、\n2学期前に「時間の約束」を決め直しておく。", {
    x: M + 0.4, y: 5.05, w: 5.0, h: 0.8, fontFace: JP, fontSize: 12.5,
    color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.35,
  });

  card(s, 7.27, 1.62, 5.76, 4.35, AMBER_LT);
  badge(s, 7.67, 1.95, 0.55, "!", AMBER, W, 18);
  s.addText("糖質の過多", {
    x: 8.37, y: 1.95, w: 4.3, h: 0.55, fontFace: JP, fontSize: 19, bold: true,
    color: "8A4E13", margin: 0, valign: "middle",
  });
  s.addText("血糖値の乱高下により、心と体の両方に不調が出ます。", {
    x: 7.67, y: 2.75, w: 5.0, h: 0.5, fontFace: JP, fontSize: 13.5,
    color: INK, margin: 0, valign: "middle",
  });
  s.addShape(pptx.ShapeType.roundRect, {
    x: 7.67, y: 3.35, w: 5.0, h: 0.62, rectRadius: 0.1,
    fill: { color: W }, line: { color: "EBD4B8", width: 1 },
  });
  s.addText("「単品で食べない」だけで変わる", {
    x: 7.67, y: 3.35, w: 5.0, h: 0.62, fontFace: JP, fontSize: 15, bold: true,
    color: "8A4E13", align: "center", valign: "middle", margin: 0,
  });
  s.addText("ジュース、菓子パン、アイス、そうめん。\n夏休みは単品で済ませる場面が増えます。", {
    x: 7.67, y: 4.15, w: 5.0, h: 0.85, fontFace: JP, fontSize: 12.5,
    color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.35,
  });
  s.addText("やめさせるのではなく、\nたんぱく質を1つ添える・時間を決める。", {
    x: 7.67, y: 5.05, w: 5.0, h: 0.8, fontFace: JP, fontSize: 12.5,
    color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.35,
  });

  note(s, "※ 禁止するほど反発が強くなります。「量」ではなく「時間」と「組み合わせ」で調整するのがコツです。");

  s.addNotes(
    "カフェインは子どもにも当てはまることを強調。エナジードリンクは中高生で要注意。\n" +
    "糖質は「減らす」より「単品にしない」で伝える。血糖の波のスライドとつながる。"
  );
}

// ============================================================
// 21. 夏ごはんあるある × ちょい足し
// ============================================================
{
  const s = newSlide();
  header(s, "3. 昼", "夏ごはんあるある × ちょい足し");

  const rows = [
    [
      { text: "よくある夏ごはん", options: { fill: { color: INK }, color: W, bold: true } },
      { text: "起きやすいこと", options: { fill: { color: INK }, color: W, bold: true } },
      { text: "ちょい足し", options: { fill: { color: INK }, color: W, bold: true } },
    ],
    ["そうめん・うどんだけ", "たんぱく質が足りず、だるい", "ゆで卵・ツナ・豚しゃぶ・納豆"],
    ["菓子パン・ジュースの朝", "血糖の波でイライラ・眠い", "牛乳・ヨーグルト・チーズ"],
    ["冷たいものばかり", "胃腸が疲れて食欲が落ちる", "温かい汁物を1品だけ"],
    ["アイス・お菓子が主食化", "夕食が入らなくなる", "時間を決める（食後・15時まで）"],
    ["麦茶だけで過ごす", "ミネラル不足で頭痛・だるさ", "みそ汁・スープ・果物"],
  ];
  s.addTable(rows, {
    x: M, y: 1.62, w: CW, colW: [3.6, 4.0, 4.333],
    fontFace: JP, fontSize: 14, color: INK, valign: "middle",
    rowH: 0.62, border: { type: "solid", color: LINE, pt: 1 },
    fill: { color: W }, align: "left", margin: [5, 12, 5, 12],
  });

  banner(s, 5.6, "献立を変えなくて大丈夫。いつものメニューに「1つ足す」だけで十分です。", SAGE_LT, "2A5F4E", 1.0, 16);

  s.addNotes("第1回の「足し算」の考え方がここに戻ってくる。");
}

// ============================================================
// 22. 取り入れたいこと（集中・深呼吸・笑う）
// ============================================================
{
  const s = newSlide();
  header(s, "3. 昼", "取り入れたほうがいいこと — 0円でできる3つ");

  threeCards(s, 1.62, 3.85, [
    {
      badge: "1", color: AMBER, title: "食べることに集中する",
      body: "テレビやスマホを見ながらの「ながら食べ」をやめてみる。\n\n食べた実感が出て、満足感も、消化も変わります。",
    },
    {
      badge: "2", color: ROSE, title: "深呼吸する",
      body: "ゆっくり吐くと、副交感神経に切り替わります。\n\n食事の前にひと呼吸。イライラしたときにも。",
    },
    {
      badge: "3", color: SAGE, title: "笑う",
      body: "作り笑いでも効果があると言われています。\n\n親が笑っている食卓は、それだけで子どもの体をゆるめます。",
    },
  ]);

  banner(s, 5.68, "どれもお金も時間もかかりません。今日の夕食から1つだけ試してみてください。", AMBER_LT, "8A4E13", 0.85, 16);

  s.addNotes(
    "重い話が続いたあとの、軽くなるスライド。\n" +
    "「ながら食べ」は夏休みに増えがちなので、そこに触れると刺さる。"
  );
}

// ============================================================
// 23. それでも「食べない」ときは
// ============================================================
{
  const s = newSlide();
  header(s, "3. 昼", "それでも「食べない」ときは");

  const tips = [
    ["量より、回数", "1回で食べきらせなくて大丈夫。朝に一口、登校前に一口、と分けるほうが体に入ります。"],
    ["食べやすい形にする", "冷たい・のどごしがいい・小さい。ゼリー、スープ、半分のおにぎりなど。"],
    ["理由をつけて責めない", "「食べないと動けないよ」ではなく「これなら食べられそう？」。食卓を戦場にしないことが最優先です。"],
  ];
  tips.forEach((t, i) => {
    const y = 1.62 + i * 1.62;
    card(s, M, y, 8.55, 1.42, CARD);
    badge(s, M + 0.35, y + 0.4, 0.62, String(i + 1), AMBER, W, 15);
    s.addText(t[0], {
      x: M + 1.2, y: y + 0.28, w: 7.15, h: 0.42, fontFace: JP, fontSize: 16.5, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(t[1], {
      x: M + 1.2, y: y + 0.74, w: 7.15, h: 0.5, fontFace: JP, fontSize: 12.5,
      color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.3,
    });
  });

  card(s, 9.55, 1.62, 3.08, 4.86, ROSE_LT);
  badge(s, 9.85, 2.0, 0.5, "!", ROSE, W, 17);
  s.addText("こんなときは\n相談を", {
    x: 9.85, y: 2.65, w: 2.5, h: 0.75, fontFace: JP, fontSize: 15, bold: true,
    color: ROSE, margin: 0, valign: "top", lineSpacingMultiple: 1.2,
  });
  s.addText([
    { text: "体重が減ってきた", options: { bullet: true, breakLine: true } },
    { text: "水分もとれない", options: { bullet: true, breakLine: true } },
    { text: "2週間以上つづく", options: { bullet: true, breakLine: true } },
    { text: "朝の頭痛・腹痛が毎日", options: { bullet: true, breakLine: false } },
  ], {
    x: 9.9, y: 3.6, w: 2.45, h: 2.4, fontFace: JP, fontSize: 12.5,
    color: "7A3733", margin: 0, valign: "top", paraSpaceAfter: 12,
  });

  note(s, "※ 迷ったら、かかりつけ医・学校の養護教諭・スクールカウンセラーへ。早いほど選択肢が多くなります。");

  s.addNotes("「食べない」に悩む保護者は多い。受診の目安を具体的に示すことで、抱え込みを防ぐ。");
}

// ============================================================
// 24. 章扉【夜】
// ============================================================
divider("04", "夜", "自律神経を整えるために\n『入浴』と『睡眠』は押さえたい", [
  "夕食の時間・中身・遅くなった日の対応",
  "入浴は38〜39度で、就寝の90分前まで",
  "必要な睡眠時間は、大人と子どもで違います",
]).addNotes("ここから13分。夜パート。");

// ============================================================
// 25. 夕食の3ポイント
// ============================================================
{
  const s = newSlide();
  header(s, "4. 夜", "夕食の3つのポイント");

  const pts = [
    ["時間", "寝る3時間前までに食べ終わる", "難しい日は、夕方に軽く食べておいて、帰宅後は軽めに。2回に分けるほうが体はラクです。", AMBER],
    ["中身", "主食＋たんぱく質＋野菜を1皿ずつ", "そろえるだけで十分。夜おそくなった日は、揚げ物と大盛りだけ避けてください。", SAGE],
    ["遅い日", "「抜く」より「軽く」", "おにぎり＋みそ汁、うどん＋卵。それで大丈夫です。抜くと、夜中に空腹で目が覚めます。", ROSE],
  ];
  pts.forEach((p, i) => {
    const y = 1.62 + i * 1.52;
    card(s, M, y, CW, 1.32, CARD);
    s.addShape(pptx.ShapeType.roundRect, {
      x: M + 0.32, y: y + 0.36, w: 1.15, h: 0.6, rectRadius: 0.09,
      fill: { color: p[3] }, line: { width: 0 },
    });
    s.addText(p[0], {
      x: M + 0.32, y: y + 0.36, w: 1.15, h: 0.6, fontFace: JP, fontSize: 15, bold: true,
      color: W, align: "center", valign: "middle", margin: 0,
    });
    s.addText(p[1], {
      x: M + 1.72, y: y + 0.2, w: 9.7, h: 0.45, fontFace: JP, fontSize: 17, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(p[2], {
      x: M + 1.72, y: y + 0.68, w: 9.7, h: 0.45, fontFace: JP, fontSize: 13,
      color: GRAY, margin: 0, valign: "middle",
    });
  });

  banner(s, 6.18, "夜にたくさん食べた翌朝は、朝ごはんが入りません。朝を守るために、夜を軽くします。", INK, W, 0.85, 16);

  s.addNotes("夜と朝がつながっていることを示すスライド。「朝食べない」の原因が夕食にあることは多い。");
}

// ============================================================
// 26. 入浴
// ============================================================
{
  const s = newSlide();
  header(s, "4. 夜", "入浴 — ぬるめのお湯で、じっくり温まる");

  card(s, M, 1.62, 6.5, 4.35, CARD);
  const bath = [
    ["お湯の温度", "38〜39度くらいの、ややぬるめ"],
    ["時 間", "10〜15分ほど。複数回に分けて出入りすると、血流が改善されやすくなります"],
    ["タイミング", "就寝の90分前までに湯船から出る"],
    ["シャワーの日", "湯船に入れない日は、いつもより少し早めに"],
  ];
  bath.forEach((b, i) => {
    const y = 1.95 + i * 1.02;
    s.addShape(pptx.ShapeType.roundRect, {
      x: M + 0.35, y, w: 1.55, h: 0.52, rectRadius: 0.09,
      fill: { color: AMBER }, line: { width: 0 },
    });
    s.addText(b[0], {
      x: M + 0.35, y, w: 1.55, h: 0.52, fontFace: JP, fontSize: 12, bold: true,
      color: W, align: "center", valign: "middle", margin: 0,
    });
    s.addText(b[1], {
      x: M + 2.1, y: y - 0.05, w: 4.2, h: 0.75, fontFace: JP, fontSize: 13,
      color: INK, margin: 0, valign: "middle", lineSpacingMultiple: 1.3,
    });
  });

  card(s, 7.55, 1.62, 5.08, 4.35, INK);
  s.addText("なぜ90分前なのか", {
    x: 7.9, y: 1.92, w: 4.4, h: 0.4, fontFace: JP, fontSize: 15, bold: true,
    color: AMBER, margin: 0, valign: "middle",
  });

  const steps = [
    ["お風呂で体温が上がる", INK_SOFT],
    ["上がった体温が下がりはじめる", INK_SOFT],
    ["下がるタイミングで眠くなる", AMBER],
  ];
  steps.forEach((st, i) => {
    const y = 2.55 + i * 0.95;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 7.9, y, w: 4.4, h: 0.68, rectRadius: 0.1,
      fill: { color: st[1] }, line: { width: 0 },
    });
    s.addText(st[0], {
      x: 7.9, y, w: 4.4, h: 0.68, fontFace: JP, fontSize: 13.5, bold: true,
      color: W, align: "center", valign: "middle", margin: 0,
    });
    if (i < 2) {
      s.addText("▼", {
        x: 9.85, y: y + 0.68, w: 0.5, h: 0.27, fontFace: JP, fontSize: 9,
        color: "7C93AE", align: "center", valign: "middle", margin: 0,
      });
    }
  });
  s.addText("熱すぎるお湯は、逆に交感神経を\n刺激して目が冴えてしまいます。", {
    x: 7.9, y: 5.35, w: 4.4, h: 0.75, fontFace: JP, fontSize: 12.5,
    color: "C7D6E6", margin: 0, valign: "top", lineSpacingMultiple: 1.35,
  });

  note(s, "※ 21時に寝かせたいなら、19時半にはお風呂から出ている計算になります。");

  s.addNotes(
    "「なぜ90分前か」を体温の話で説明すると納得感が出る。\n" +
    "熱いお湯が好きな家庭は多いので、38〜39度という具体的な数字を出す。"
  );
}

// ============================================================
// 27. 睡眠
// ============================================================
{
  const s = newSlide();
  header(s, "4. 夜", "睡眠 — 必要な時間は、大人と子どもで違います");

  const sleepers = [
    ["小学生", "9〜11時間", AMBER],
    ["中学生・高校生", "8〜10時間", "C77E3A"],
    ["大 人", "6〜7時間半", INK],
  ];
  sleepers.forEach((sp, i) => {
    const x = M + i * 4.11;
    card(s, x, 1.62, 3.71, 1.55, CARD);
    s.addText(sp[0], {
      x: x + 0.3, y: 1.85, w: 3.11, h: 0.4, fontFace: JP, fontSize: 14, bold: true,
      color: GRAY, align: "center", margin: 0, valign: "middle",
    });
    s.addText(sp[1], {
      x: x + 0.3, y: 2.3, w: 3.11, h: 0.6, fontFace: JP, fontSize: 26, bold: true,
      color: sp[2], align: "center", margin: 0, valign: "middle",
    });
  });

  card(s, M, 3.42, 6.5, 2.55, SAGE_LT);
  s.addText("時間の確保とあわせて、この3つ", {
    x: M + 0.4, y: 3.68, w: 5.7, h: 0.4, fontFace: JP, fontSize: 14, bold: true,
    color: SAGE, margin: 0, valign: "middle",
  });
  s.addText([
    { text: "起床直後に、しっかり光を浴びる", options: { bullet: true, breakLine: true } },
    { text: "寝る前1時間は、スマホ・PC・ゲームを控える", options: { bullet: true, breakLine: true } },
    { text: "好きな音楽やアロマでリラックスする", options: { bullet: true, breakLine: false } },
  ], {
    x: M + 0.45, y: 4.2, w: 5.6, h: 1.6, fontFace: JP, fontSize: 14,
    color: INK, margin: 0, valign: "top", paraSpaceAfter: 12,
  });

  card(s, 7.55, 3.42, 5.08, 2.55, INK);
  s.addText("6:45に起きるなら", {
    x: 7.9, y: 3.68, w: 4.4, h: 0.4, fontFace: JP, fontSize: 13, bold: true,
    color: AMBER, margin: 0, valign: "middle",
  });
  const back = [
    ["小学生", "20:45 〜 21:45 就寝"],
    ["中高生", "21:45 〜 22:45 就寝"],
  ];
  back.forEach((b, i) => {
    const y = 4.15 + i * 0.62;
    s.addText(b[0], {
      x: 7.9, y, w: 1.3, h: 0.52, fontFace: JP, fontSize: 13, bold: true,
      color: "C7D6E6", margin: 0, valign: "middle",
    });
    s.addText(b[1], {
      x: 9.15, y, w: 3.15, h: 0.52, fontFace: JP, fontSize: 15, bold: true,
      color: W, margin: 0, valign: "middle",
    });
  });
  s.addText("逆算すると、夕食とお風呂の時間も\n自然と決まってきます。", {
    x: 7.9, y: 5.4, w: 4.4, h: 0.55, fontFace: JP, fontSize: 12,
    color: "9FB4CC", margin: 0, valign: "top", lineSpacingMultiple: 1.3,
  });

  note(s, "※ 子どもの睡眠時間は目安です。朝すっきり起きられているかを、いちばんの基準にしてください。");

  s.addNotes(
    "大人の6〜7時間半をそのまま子どもに当てはめている家庭が多い。ここを分けて伝えるのが今回の追加ポイント。\n" +
    "逆算表を見せると「うちは無理」という声が出るので、まずは15分ずつ、と受け止める。"
  );
}

// ============================================================
// 28. 夜ふかしの巻き戻し方
// ============================================================
{
  const s = newSlide();
  header(s, "4. 夜", "もう夜ふかしになっている場合の戻し方");

  const doList = [
    "起きる時間を、先に15分早める",
    "昼寝は15時まで・20〜30分だけ",
    "夕方に体を動かす（散歩でOK）",
    "朝は明るく、夜は暗く、を分ける",
  ];
  const dontList = [
    "消灯だけ早くする（眠れず不安になる）",
    "昼寝を夕方までさせる",
    "夕方以降のカフェイン・エナジードリンク",
    "寝坊した日だけ叱る",
  ];

  card(s, M, 1.62, 5.76, 4.0, SAGE_LT);
  badge(s, M + 0.4, 1.92, 0.5, "○", SAGE, W, 17);
  s.addText("やること", {
    x: M + 1.05, y: 1.92, w: 4.3, h: 0.5, fontFace: JP, fontSize: 16, bold: true,
    color: SAGE, margin: 0, valign: "middle",
  });
  doList.forEach((t, i) => {
    s.addText(t, {
      x: M + 0.4, y: 2.68 + i * 0.68, w: 5.0, h: 0.58, fontFace: JP, fontSize: 14,
      color: INK, margin: 0, valign: "middle",
    });
  });

  card(s, 7.27, 1.62, 5.76, 4.0, ROSE_LT);
  badge(s, 7.67, 1.92, 0.5, "×", ROSE, W, 17);
  s.addText("やりがちなNG", {
    x: 8.32, y: 1.92, w: 4.3, h: 0.5, fontFace: JP, fontSize: 16, bold: true,
    color: ROSE, margin: 0, valign: "middle",
  });
  dontList.forEach((t, i) => {
    s.addText(t, {
      x: 7.67, y: 2.68 + i * 0.68, w: 5.0, h: 0.58, fontFace: JP, fontSize: 14,
      color: INK, margin: 0, valign: "middle",
    });
  });

  banner(s, 5.82, "眠くなる時間は、前の晩ではなく「その日の朝」に決まっています。", INK, W, 0.82, 16);

  s.addNotes("スライド10で話した「朝が原因」に戻る。ここで一貫性を出す。");
}

// ============================================================
// 29. 胃腸整え隊
// ============================================================
{
  const s = newSlide();
  header(s, "5. 胃腸と食材", "食事面からもアプローチ — “胃腸整え隊”の5人");

  const team = [
    ["白 湯", "内臓を直接あたためる"],
    ["よく噛む", "胃腸の働きを助ける"],
    ["決まった時間", "体内リズムが整う"],
    ["消化時間", "重いものを避ける"],
    ["砂糖を控える", "血糖の波を小さく"],
  ];
  const cw = 2.25, gap = 0.17;
  team.forEach((t, i) => {
    const x = M + i * (cw + gap);
    card(s, x, 1.72, cw, 3.5, CARD);
    badge(s, x + (cw - 0.85) / 2, 2.05, 0.85, String(i + 1), i < 3 ? AMBER : SAGE, W, 20);
    s.addText(t[0], {
      x: x + 0.15, y: 3.1, w: cw - 0.3, h: 0.85, fontFace: JP, fontSize: 15.5, bold: true,
      color: INK, align: "center", valign: "top", margin: 0, lineSpacingMultiple: 1.2,
    });
    s.addText(t[1], {
      x: x + 0.15, y: 4.05, w: cw - 0.3, h: 0.95, fontFace: JP, fontSize: 12,
      color: GRAY, align: "center", valign: "top", margin: 0, lineSpacingMultiple: 1.3,
    });
  });

  banner(s, 5.55, "胃腸の働きも、自律神経がコントロールしています。整えると、食べたものがちゃんと栄養になります。", AMBER_LT, "8A4E13", 1.0, 16);

  s.addNotes("5つを一気に見せて、次の2枚で中身に入る。全部やらなくていいことを先に言っておく。");
}

// ============================================================
// 30. 白湯／よく噛む／決まった時間
// ============================================================
{
  const s = newSlide();
  header(s, "5. 胃腸と食材", "白湯を飲む ／ よく噛む ／ 決まった時間に食べる");

  const items = [
    ["白湯を飲む", ["内臓を直接あたためられる", "体が温まり、血流がよくなる", "肩こりがラクになる"], AMBER],
    ["よく噛んで楽しく食べる", ["胃腸の働きを助ける", "脳が活性化する", "虫歯予防・食べすぎ防止"], "C77E3A"],
    ["決まった時間に食べる", ["体内のリズムが整う", "胃腸の調子が整いやすくなる", "空腹と満腹がはっきりする"], SAGE],
  ];
  const cw = 3.71, gap = 0.4;
  items.forEach((it, i) => {
    const x = M + i * (cw + gap);
    card(s, x, 1.62, cw, 3.9, CARD);
    s.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.28, y: 1.92, w: cw - 0.56, h: 0.62, rectRadius: 0.09,
      fill: { color: it[2] }, line: { width: 0 },
    });
    s.addText(it[0], {
      x: x + 0.28, y: 1.92, w: cw - 0.56, h: 0.62, fontFace: JP, fontSize: 14.5, bold: true,
      color: W, align: "center", valign: "middle", margin: 0,
    });
    s.addText(it[1].map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < it[1].length - 1 } })), {
      x: x + 0.3, y: 2.78, w: cw - 0.58, h: 2.5, fontFace: JP, fontSize: 13,
      color: INK, margin: 0, valign: "top", paraSpaceAfter: 12, lineSpacingMultiple: 1.25,
    });
  });

  banner(s, 5.7, "まずは1つ。朝の白湯か、夕食を同じ時間にするか、どちらかから。", SAGE_LT, "2A5F4E", 0.9, 16);

  s.addNotes("3つ全部やろうとすると続かない。1つ選ばせる言い方をする。");
}

// ============================================================
// 31. 消化時間 ＋ 砂糖を控える
// ============================================================
{
  const s = newSlide();
  header(s, "5. 胃腸と食材", "消化時間に注目 ／ 砂糖を控える");

  card(s, M, 1.62, 7.3, 4.35, CARD);
  s.addText("消化にかかる時間の目安", {
    x: M + 0.35, y: 1.88, w: 6.6, h: 0.4, fontFace: JP, fontSize: 15, bold: true,
    color: INK, margin: 0, valign: "middle",
  });

  const digest = [
    ["約1〜2時間", "すぐおなかがすく", "おかゆ・りんご・半熟卵・少量のごはん", SAGE],
    ["約2〜3時間", "ふつう", "牛乳・豆腐・煮魚・刺身・うどん・もち", AMBER],
    ["約3〜4時間", "はらもちがいい", "やきいも・アイスクリーム・脂の多い魚や肉", ROSE],
  ];
  digest.forEach((d, i) => {
    const y = 2.4 + i * 1.15;
    s.addShape(pptx.ShapeType.roundRect, {
      x: M + 0.35, y, w: 6.6, h: 0.98, rectRadius: 0.09,
      fill: { color: W }, line: { color: LINE, width: 1 },
    });
    s.addShape(pptx.ShapeType.roundRect, {
      x: M + 0.5, y: y + 0.22, w: 1.35, h: 0.54, rectRadius: 0.09,
      fill: { color: d[3] }, line: { width: 0 },
    });
    s.addText(d[0], {
      x: M + 0.5, y: y + 0.22, w: 1.35, h: 0.54, fontFace: JP, fontSize: 11.5, bold: true,
      color: W, align: "center", valign: "middle", margin: 0,
    });
    s.addText(d[1], {
      x: M + 2.0, y: y + 0.1, w: 4.8, h: 0.38, fontFace: JP, fontSize: 12.5, bold: true,
      color: d[3], margin: 0, valign: "middle",
    });
    s.addText(d[2], {
      x: M + 2.0, y: y + 0.48, w: 4.8, h: 0.4, fontFace: JP, fontSize: 12.5,
      color: INK, margin: 0, valign: "middle",
    });
  });

  card(s, 8.35, 1.62, 4.28, 4.35, ROSE_LT);
  s.addText("砂糖を控える", {
    x: 8.7, y: 1.92, w: 3.6, h: 0.45, fontFace: JP, fontSize: 18, bold: true,
    color: ROSE, margin: 0, valign: "middle",
  });
  s.addText([
    { text: "消化の負担が増える", options: { bullet: true, breakLine: true } },
    { text: "血糖値が急に上がって下がる", options: { bullet: true, breakLine: true } },
    { text: "腸内環境が乱れる", options: { bullet: true, breakLine: true } },
    { text: "そのぶん栄養が不足する", options: { bullet: true, breakLine: false } },
  ], {
    x: 8.75, y: 2.5, w: 3.5, h: 2.1, fontFace: JP, fontSize: 13,
    color: INK, margin: 0, valign: "top", paraSpaceAfter: 12,
  });
  s.addShape(pptx.ShapeType.roundRect, {
    x: 8.7, y: 4.72, w: 3.6, h: 1.05, rectRadius: 0.09,
    fill: { color: W }, line: { color: "E4C3BF", width: 1 },
  });
  s.addText("胃腸だけでなく、\n全身に影響します。", {
    x: 8.7, y: 4.72, w: 3.6, h: 1.05, fontFace: JP, fontSize: 13.5, bold: true,
    color: ROSE, align: "center", valign: "middle", margin: 0, lineSpacingMultiple: 1.3,
  });

  note(s, "※ 夜おそくなった日は「約1〜2時間」のものを選ぶと、翌朝の食欲が残ります。");

  s.addNotes(
    "消化時間は、夕食が遅くなった日の選び方に直結する実用的な話。\n" +
    "アイスクリームが3時間以上かかるのは意外に思われるので、そこを拾うと反応がいい。"
  );
}

// ============================================================
// 32. 旬の食材
// ============================================================
{
  const s = newSlide();
  header(s, "5. 胃腸と食材", "旬の食材を食べる — これからの季節におすすめ");

  const reasons = [
    ["栄養価が高い", AMBER],
    ["美味しさが増す", "C77E3A"],
    ["価格が安くなる", SAGE],
    ["その季節に必要な栄養素が摂れる", INK],
  ];
  reasons.forEach((r, i) => {
    const y = 1.68 + i * 0.85;
    card(s, M, y, 5.3, 0.7, CARD);
    badge(s, M + 0.25, y + 0.11, 0.48, String(i + 1), r[1], W, 13);
    s.addText(r[0], {
      x: M + 0.92, y, w: 4.2, h: 0.7, fontFace: JP, fontSize: 14, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
  });

  card(s, 6.35, 1.68, 6.28, 3.32, CARD);
  s.addText("これからが旬の食材", {
    x: 6.7, y: 1.95, w: 5.6, h: 0.4, fontFace: JP, fontSize: 15, bold: true,
    color: INK, margin: 0, valign: "middle",
  });
  const foods = [
    ["魚", "秋刀魚・鮭・いわし・さば・かつお"],
    ["野菜", "かぼちゃ・れんこん・青梗菜・人参"],
    ["きのこ", "生椎茸・舞茸・しめじ"],
    ["いも", "さつま芋・長芋・里芋"],
    ["果物", "梨・柿・栗・いちじく・ぶどう・りんご"],
  ];
  foods.forEach((f, i) => {
    const y = 2.5 + i * 0.48;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 6.7, y, w: 0.92, h: 0.38, rectRadius: 0.07,
      fill: { color: SAGE }, line: { width: 0 },
    });
    s.addText(f[0], {
      x: 6.7, y, w: 0.92, h: 0.38, fontFace: JP, fontSize: 11.5, bold: true,
      color: W, align: "center", valign: "middle", margin: 0,
    });
    s.addText(f[1], {
      x: 7.75, y, w: 4.6, h: 0.38, fontFace: JP, fontSize: 12.5,
      color: INK, margin: 0, valign: "middle",
    });
  });

  card(s, M, 5.15, CW, 1.35, SAGE_LT);
  s.addText("秋野菜には、夏の疲労を回復して体を温める働きがあります。", {
    x: M + 0.5, y: 5.3, w: CW - 1.0, h: 0.45, fontFace: JP, fontSize: 16, bold: true,
    color: "2A5F4E", margin: 0, valign: "middle",
  });
  s.addText("とくに根菜は夏野菜より水分が少なく、加熱すると甘みが増します。冷たいものを摂りすぎて弱った胃腸の回復や、便秘の解消にも。", {
    x: M + 0.5, y: 5.78, w: CW - 1.0, h: 0.45, fontFace: JP, fontSize: 13,
    color: "2A5F4E", margin: 0, valign: "middle",
  });

  s.addNotes(
    "旬のものは価格が下がるので、家計の話としても伝わる。\n" +
    "「冷たいそうめんから、温かい根菜へ」という切り替えのイメージを持ってもらう。"
  );
}

// ============================================================
// 33. 症状別の食材
// ============================================================
{
  const s = newSlide();
  header(s, "5. 胃腸と食材", "これから起こりやすい症状 × おすすめの食材");

  const cols = [
    ["風邪から守る", ["さつまいも", "きのこ類", "かぼちゃ"], AMBER],
    ["花粉症・喘息に", ["れんこん", "梨", "ぎんなん"], "C77E3A"],
    ["夏の疲れを癒やす", ["秋刀魚", "里芋", "かつお"], SAGE],
    ["乾燥からお肌を守る", ["栗", "柿", "カリフラワー"], INK],
  ];
  const cw = 2.87, gap = 0.315;
  cols.forEach((c, i) => {
    const x = M + i * (cw + gap);
    card(s, x, 1.62, cw, 3.6, CARD);
    s.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.24, y: 1.92, w: cw - 0.48, h: 0.6, rectRadius: 0.09,
      fill: { color: c[2] }, line: { width: 0 },
    });
    s.addText(c[0], {
      x: x + 0.24, y: 1.92, w: cw - 0.48, h: 0.6, fontFace: JP, fontSize: 13.5, bold: true,
      color: W, align: "center", valign: "middle", margin: 0,
    });
    c[1].forEach((f, k) => {
      const y = 2.75 + k * 0.72;
      s.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.3, y, w: cw - 0.6, h: 0.58, rectRadius: 0.08,
        fill: { color: W }, line: { color: LINE, width: 1 },
      });
      s.addText(f, {
        x: x + 0.3, y, w: cw - 0.6, h: 0.58, fontFace: JP, fontSize: 14, bold: true,
        color: INK, align: "center", valign: "middle", margin: 0,
      });
    });
  });

  banner(s, 5.42, "ビタミンC・B1・B2・K、そして食物繊維。秋の食材にまとめて入っています。", AMBER_LT, "8A4E13", 1.05, 16);

  s.addNotes(
    "献立の相談として使えるスライド。「今週これを1つ買ってみる」という宿題にしてもいい。\n" +
    "薬ではないので「効く」と断定せず、「おすすめ」の表現にとどめる。"
  );
}

// ============================================================
// 34. 逆算カレンダー
// ============================================================
{
  const s = newSlide();
  header(s, "6. 再開前の準備", "逆算カレンダー");

  const cols = [
    ["1週間前", ["起床時刻をほぼ通常に", "宿題の残りを数える", "夕食を30分早める", "土日も同じ時間で"], AMBER],
    ["3日前", ["提出物・持ち物の確認", "上履き・体操服の確認", "通学路を1度歩く", "髪と爪を切る"], "C77E3A"],
    ["前日", ["夕食とお風呂を早めに", "支度を玄関に置く", "期待を言いすぎない", "早めに部屋を暗く"], SAGE],
    ["当日の朝", ["10分早く起こす", "食べやすい朝ごはん", "送り出しは短く明るく", "予定を詰め込まない"], INK],
  ];
  const cw = 2.87, gap = 0.315;
  cols.forEach((c, i) => {
    const x = M + i * (cw + gap);
    card(s, x, 1.62, cw, 3.95, CARD);
    s.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.28, y: 1.92, w: cw - 0.56, h: 0.55, rectRadius: 0.09,
      fill: { color: c[2] }, line: { width: 0 },
    });
    s.addText(c[0], {
      x: x + 0.28, y: 1.92, w: cw - 0.56, h: 0.55, fontFace: JP, fontSize: 16, bold: true,
      color: W, align: "center", valign: "middle", margin: 0,
    });
    s.addText(c[1].map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < c[1].length - 1 } })), {
      x: x + 0.26, y: 2.72, w: cw - 0.48, h: 2.9, fontFace: JP, fontSize: 12,
      color: INK, margin: 0, valign: "top", paraSpaceAfter: 14, lineSpacingMultiple: 1.25,
    });
  });

  banner(s, 5.85, "全部やらなくて大丈夫。各列から1つずつ選ぶくらいで十分です。", AMBER_LT, "8A4E13", 0.9, 15.5);

  s.addNotes("始業日は自治体差があるので相対表現にしてある。参加者に自分の家の始業日を書いてもらう。");
}

// ============================================================
// 35. 「行きたくない」に備える
// ============================================================
{
  const s = newSlide();
  header(s, "6. 再開前の準備", "「行きたくない」と言われたときのために");

  const items = [
    ["理由を問い詰めない", "言葉にできないことのほうが多いです。「そっか」と、いったん受けとめるだけで十分。"],
    ["体の痛みは、本物として扱う", "頭痛や腹痛は「ウソ」ではありません。まず体調として受けとめてください。"],
    ["ハードルを段階に分ける", "「行く／行かない」ではなく、起きる → 着替える → 玄関まで → 校門まで、と分けます。"],
    ["早めに相談する", "担任、養護教諭、スクールカウンセラー、かかりつけ医。抱え込まないでください。"],
  ];
  items.forEach((it, i) => {
    const y = 1.62 + i * 1.1;
    card(s, M, y, 8.85, 0.95, CARD);
    badge(s, M + 0.32, y + 0.19, 0.57, String(i + 1), INK, W, 14);
    s.addText(it[0], {
      x: M + 1.08, y: y + 0.1, w: 7.55, h: 0.4, fontFace: JP, fontSize: 15.5, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(it[1], {
      x: M + 1.08, y: y + 0.5, w: 7.55, h: 0.36, fontFace: JP, fontSize: 12.5,
      color: GRAY, margin: 0, valign: "middle",
    });
  });

  card(s, 9.85, 1.62, 2.78, 4.4, INK);
  s.addText("親が\n先に不安に\nならない", {
    x: 10.15, y: 2.0, w: 2.2, h: 1.2, fontFace: JP, fontSize: 19, bold: true,
    color: W, margin: 0, valign: "top", lineSpacingMultiple: 1.25,
  });
  s.addText("子どもは、親の表情を\nよく見ています。\n\n「なんとかなる」と\n思っている大人が\nそばにいることが、\nいちばんの準備です。", {
    x: 10.15, y: 3.5, w: 2.2, h: 2.3, fontFace: JP, fontSize: 12.5,
    color: "C7D6E6", margin: 0, valign: "top", lineSpacingMultiple: 1.4,
  });

  s.addNotes("デリケートなパート。断定せず、選択肢を示す姿勢で。相談先を具体名で挙げることが一番の価値になる。");
}

// ============================================================
// 36. ワーク
// ============================================================
{
  const s = newSlide();
  header(s, "7. スタート作戦", "ワーク：わが家の「2学期スタート作戦」を3つ決める");

  const works = [
    ["起きる時間", "家族で1つに。土日もそろえられると、いちばんラクになります。", "＿＿ 時 ＿＿ 分", AMBER],
    ["朝ごはんの定番", "3つ決めて、まわします。考えなくていい状態にするのが目的です。", "1. ＿＿＿＿＿\n2. ＿＿＿＿＿\n3. ＿＿＿＿＿", SAGE],
    ["夜のスイッチ", "お風呂の時間／照明を落とす時間／スマホの置き場から、1つだけ。", "＿＿＿＿＿＿＿", INK],
  ];
  const cw = 3.71, gap = 0.4;
  works.forEach((wk, i) => {
    const x = M + i * (cw + gap);
    card(s, x, 1.62, cw, 4.15, CARD);
    badge(s, x + 0.35, 1.92, 0.6, ["①", "②", "③"][i], wk[3], W, 18);
    s.addText(wk[0], {
      x: x + 1.08, y: 1.92, w: cw - 1.43, h: 0.6, fontFace: JP, fontSize: 17, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(wk[1], {
      x: x + 0.35, y: 2.7, w: cw - 0.7, h: 1.0, fontFace: JP, fontSize: 12.5,
      color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.35,
    });
    s.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.35, y: 3.82, w: cw - 0.7, h: 1.65, rectRadius: 0.08,
      fill: { color: W }, line: { color: "C3D0DC", width: 1 },
    });
    s.addText(wk[2], {
      x: x + 0.45, y: 3.82, w: cw - 0.9, h: 1.65, fontFace: JP, fontSize: 14, bold: true,
      color: INK_SOFT, align: "center", valign: "middle", margin: 0, lineSpacingMultiple: 1.4,
    });
  });

  banner(s, 5.95, "決めるのは3つだけ。多いほど、続きません。", AMBER_LT, "8A4E13", 0.82, 16);

  s.addNotes(
    "5分ほど時間を取って、実際に書いてもらう。\n" +
    "書けた方はチャットに1つだけ書いてもらうと、他の家庭の例が参考になる。"
  );
}

// ============================================================
// 37. 続けるコツ
// ============================================================
{
  const s = newSlide();
  header(s, "7. スタート作戦", "続けるための4つのコツ");

  const tips = [
    ["全部やらない", "今日決めた3つ以外は、9月に入ってから。増やすのはいつでもできます。"],
    ["3日できたら合格", "7日連続を目標にすると、4日目に折れます。3日単位で数えてください。"],
    ["例外日を決めておく", "花火、帰省、お泊まり。「この日は崩れる」と決めておけば、翌日に戻れます。"],
    ["子どもに選ばせる", "選択肢は親が2つ出す。決めるのは本人。決めた人が、いちばん動きます。"],
  ];
  const cw = 5.76, gap = 0.41;
  tips.forEach((t, i) => {
    const x = M + (i % 2) * (cw + gap);
    const y = 1.68 + Math.floor(i / 2) * 2.15;
    card(s, x, y, cw, 1.9, CARD);
    badge(s, x + 0.38, y + 0.34, 0.72, String(i + 1), i % 2 === 0 ? AMBER : SAGE, W, 17);
    s.addText(t[0], {
      x: x + 1.32, y: y + 0.3, w: cw - 1.7, h: 0.45, fontFace: JP, fontSize: 18, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(t[1], {
      x: x + 1.32, y: y + 0.82, w: cw - 1.7, h: 0.85, fontFace: JP, fontSize: 13,
      color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.35,
    });
  });

  banner(s, 6.1, "うまくいかない日があって当たり前です。戻れることのほうが、ずっと大事。", SAGE_LT, "2A5F4E", 0.85, 16);

  s.addNotes("完璧主義をゆるめるパート。ここで安心して終われるようにする。");
}

// ============================================================
// 38. まとめ：3つの持ち帰り
// ============================================================
{
  const s = newSlide(true);
  s.addText("SUMMARY", {
    x: M, y: 0.5, w: CW, h: 0.3, fontFace: JP, fontSize: 12, bold: true,
    color: AMBER, margin: 0, valign: "middle",
  });
  s.addText("今日の3つの持ち帰り", {
    x: M, y: 0.85, w: CW, h: 0.62, fontFace: JP, fontSize: 30, bold: true,
    color: W, margin: 0, valign: "middle",
  });

  const sums = [
    ["01", "夜より先に、朝を動かす", "眠くなる時間は、その日の朝に決まります。起床を15分ずつ前へ。"],
    ["02", "食事は「単品にしない」だけで変わる", "パンだけ・麺だけをやめて、1つ足す。それで午前中がもちます。"],
    ["03", "決めるのは3つ。完璧より、わが家の型", "起きる時間・朝ごはんの定番・夜のスイッチ。まずはこの3つだけ。"],
  ];
  sums.forEach((sm, i) => {
    const y = 1.75 + i * 1.42;
    s.addShape(pptx.ShapeType.roundRect, {
      x: M, y, w: CW, h: 1.22, rectRadius: 0.09,
      fill: { color: INK }, line: { width: 0 },
    });
    s.addText(sm[0], {
      x: M + 0.4, y: y + 0.24, w: 1.0, h: 0.74, fontFace: JP, fontSize: 30, bold: true,
      color: AMBER, margin: 0, valign: "middle",
    });
    s.addText(sm[1], {
      x: M + 1.5, y: y + 0.2, w: 9.9, h: 0.45, fontFace: JP, fontSize: 19, bold: true,
      color: W, margin: 0, valign: "middle",
    });
    s.addText(sm[2], {
      x: M + 1.5, y: y + 0.68, w: 9.9, h: 0.4, fontFace: JP, fontSize: 13,
      color: "9FB4CC", margin: 0, valign: "middle",
    });
  });

  s.addText("2学期の朝が、少しだけラクになりますように。", {
    x: M, y: 6.25, w: CW, h: 0.5, fontFace: JP, fontSize: 17, bold: true, italic: true,
    color: AMBER, margin: 0, valign: "middle",
  });

  s.addNotes("3つに絞って言い切る。ここで参加者にメモを取ってもらう時間を10秒とる。");
}

// ============================================================
// 39. まとめ：ゆっくり秋へ
// ============================================================
{
  const s = newSlide();
  header(s, "まとめ", "いきなりギアチェンジをしないでください");

  const msgs = [
    ["季節の変わり目は、体に大きな負担がかかります", "夏から秋へ切り替わるこの時期は、大人も子どもも消耗しています。"],
    ["今年も夏の暑さが厳しかったことが、これからの不調につながります", "今の疲れは、9月・10月になってから体と心に出てきます。"],
    ["体に合わせて、ゆっくりと秋へシフトしてください", "一気に戻すのではなく、今日から少しずつ。それがいちばんの近道です。"],
  ];
  msgs.forEach((m, i) => {
    const y = 1.68 + i * 1.55;
    card(s, M, y, 8.85, 1.32, CARD);
    badge(s, M + 0.33, y + 0.35, 0.62, String(i + 1), [AMBER, "C77E3A", SAGE][i], W, 15);
    s.addText(m[0], {
      x: M + 1.15, y: y + 0.22, w: 7.5, h: 0.45, fontFace: JP, fontSize: 15.5, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(m[1], {
      x: M + 1.15, y: y + 0.7, w: 7.5, h: 0.42, fontFace: JP, fontSize: 12.5,
      color: GRAY, margin: 0, valign: "middle",
    });
  });

  card(s, 9.85, 1.68, 2.78, 4.62, INK);
  s.addText("急がなくて\n大丈夫", {
    x: 10.15, y: 2.1, w: 2.2, h: 1.0, fontFace: JP, fontSize: 21, bold: true,
    color: AMBER, margin: 0, valign: "top", lineSpacingMultiple: 1.25,
  });
  s.addText("今日決めた3つを、\n明日の朝から。\n\n1つできれば、\nそれで十分です。\n\nご家族のペースで\n進めてください。", {
    x: 10.15, y: 3.4, w: 2.2, h: 2.6, fontFace: JP, fontSize: 13,
    color: "C7D6E6", margin: 0, valign: "top", lineSpacingMultiple: 1.45,
  });

  s.addNotes("2024年版のまとめスライドを踏襲。やわらかく締める。");
}

// ============================================================
// 40. おしらせ
// ============================================================
{
  const s = newSlide();
  header(s, "INFORMATION", "最後におしらせ");

  const slots = [
    ["次回のご案内", "日時・テーマ・お申し込み方法"],
    ["個別のご相談について", "受付方法・料金・お問い合わせ先"],
    ["ふだんの発信", "SNS・ブログなど"],
  ];
  const cw = 3.71, gap = 0.4;
  slots.forEach((sl, i) => {
    const x = M + i * (cw + gap);
    card(s, x, 1.68, cw, 3.6, CARD);
    badge(s, x + 0.35, 2.0, 0.62, String(i + 1), AMBER, W, 16);
    s.addText(sl[0], {
      x: x + 1.1, y: 2.0, w: cw - 1.45, h: 0.62, fontFace: JP, fontSize: 16, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.35, y: 2.9, w: cw - 0.7, h: 2.05, rectRadius: 0.08,
      fill: { color: W }, line: { color: "C3D0DC", width: 1 },
    });
    s.addText(sl[1], {
      x: x + 0.45, y: 2.9, w: cw - 0.9, h: 2.05, fontFace: JP, fontSize: 12,
      color: "9AA9B8", align: "center", valign: "middle", margin: 0, lineSpacingMultiple: 1.35,
    });
  });

  banner(s, 5.5, "ここは当日の告知内容にあわせて書き換えてお使いください。", SAGE_LT, "2A5F4E", 0.9, 15.5);

  s.addNotes(
    "告知は最後にまとめて。話しすぎず、30秒から1分で。\n" +
    "白い枠のなかに、実際の日程・URL・QRコードなどを入れてください。"
  );
}

// ============================================================
// 41. 質疑・おわりに
// ============================================================
{
  const s = newSlide(true);
  s.addShape(pptx.ShapeType.ellipse, {
    x: 9.0, y: 1.9, w: 5.9, h: 5.9, fill: { color: INK }, line: { width: 0 },
  });
  s.addShape(pptx.ShapeType.ellipse, {
    x: 10.25, y: 3.15, w: 3.4, h: 3.4, fill: { color: AMBER }, line: { width: 0 },
  });

  s.addText("Q & A", {
    x: M, y: 2.15, w: 8.0, h: 0.35, fontFace: JP, fontSize: 13, bold: true,
    color: AMBER, margin: 0, valign: "middle",
  });
  s.addText("ご質問をどうぞ", {
    x: M, y: 2.6, w: 8.0, h: 0.9, fontFace: JP, fontSize: 40, bold: true,
    color: W, margin: 0, valign: "middle",
  });
  s.addText("チャットでも、お声でも大丈夫です。\n「うちの場合はどうしたら」が、いちばん役に立ちます。", {
    x: M, y: 3.65, w: 8.0, h: 0.9, fontFace: JP, fontSize: 15,
    color: "C7D6E6", margin: 0, valign: "top", lineSpacingMultiple: 1.4,
  });

  s.addShape(pptx.ShapeType.roundRect, {
    x: M, y: 4.85, w: 7.4, h: 1.1, rectRadius: 0.1,
    fill: { color: INK }, line: { width: 0 },
  });
  s.addText("今日決めた3つを、明日の朝から。\nまずは「起きる時間」ひとつで大丈夫です。", {
    x: M + 0.45, y: 4.85, w: 6.5, h: 1.1, fontFace: JP, fontSize: 14, bold: true,
    color: W, margin: 0, valign: "middle", lineSpacingMultiple: 1.35,
  });

  s.addText("ご参加ありがとうございました。", {
    x: M, y: 6.15, w: 8.0, h: 0.45, fontFace: JP, fontSize: 15,
    color: "9FB4CC", margin: 0, valign: "middle",
  });

  s.addNotes("質疑5分。答えきれない質問は後日まとめて共有する旨を伝えて終了。");
}

const out = "夏休みの終わり_第2回_食と生活リズムの整え方.pptx";
pptx.writeFile({ fileName: out }).then(() => console.log("written:", out));

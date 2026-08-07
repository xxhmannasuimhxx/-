/**
 * 第2回「夏休みの終わり 〜食と生活リズムの整え方〜」講座スライド
 * 2026/08/17(月) 21:30-23:00 (90分)
 */
const PptxGenJS = require("pptxgenjs");

// ---------- Design tokens ----------
const INK       = "1E3A5F"; // deep indigo (dominant)
const INK_DEEP  = "13273F";
const INK_SOFT  = "35557D";
const AMBER     = "D9822B"; // sunrise accent
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
const M = 0.7;                 // side margin
const CW = SW - M * 2;         // content width = 11.933

const sh = () => ({ type: "outer", color: "1E3A5F", blur: 10, offset: 2, angle: 90, opacity: 0.10 });

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "第2回 夏休みの終わり";
pptx.title = "夏休みの終わり 〜食と生活リズムの整え方〜 第2回";

// ---------- helpers ----------
function newSlide(dark) {
  const s = pptx.addSlide();
  s.background = { color: dark ? INK_DEEP : W };
  return s;
}

// content-slide header (eyebrow + title). Returns y where content may start.
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

// amber circle badge with a short label inside
function badge(s, x, y, d, label, fill, txtColor, fs) {
  s.addShape(pptx.ShapeType.ellipse, {
    x, y, w: d, h: d, fill: { color: fill || AMBER }, line: { color: fill || AMBER, width: 0 },
  });
  s.addText(label, {
    x, y, w: d, h: d, fontFace: JP, fontSize: fs || 15, bold: true,
    color: txtColor || W, align: "center", valign: "middle", margin: 0,
  });
}

// tinted rounded card
function card(s, x, y, w, h, fill) {
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.09,
    fill: { color: fill || CARD }, line: { color: fill || CARD, width: 0 },
    shadow: sh(),
  });
}

// footnote strip at bottom of a content slide
function note(s, text, color) {
  s.addText(text, {
    x: M, y: 6.72, w: CW, h: 0.4, fontFace: JP, fontSize: 12,
    color: color || GRAY, margin: 0, valign: "middle",
  });
}

// section divider
function divider(num, title, items) {
  const s = newSlide(true);
  s.addShape(pptx.ShapeType.ellipse, {
    x: 10.5, y: -1.5, w: 5.2, h: 5.2, fill: { color: INK, transparency: 30 }, line: { width: 0 },
  });
  s.addText(num, {
    x: M, y: 1.55, w: 3, h: 1.5, fontFace: JP, fontSize: 90, bold: true,
    color: AMBER, margin: 0, valign: "middle",
  });
  s.addText(title, {
    x: M, y: 3.15, w: 9.6, h: 1.5, fontFace: JP, fontSize: 32, bold: true,
    color: W, margin: 0, valign: "top", lineSpacingMultiple: 1.25,
  });
  const startY = 4.95;
  items.forEach((t, i) => {
    s.addShape(pptx.ShapeType.ellipse, {
      x: M + 0.02, y: startY + i * 0.5 + 0.13, w: 0.13, h: 0.13,
      fill: { color: AMBER }, line: { width: 0 },
    });
    s.addText(t, {
      x: M + 0.32, y: startY + i * 0.5, w: 9.2, h: 0.4, fontFace: JP, fontSize: 14,
      color: "C7D6E6", margin: 0, valign: "middle",
    });
  });
  return s;
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
    x: M, y: 1.85, w: 8.5, h: 0.35, fontFace: JP, fontSize: 14, bold: true,
    color: AMBER, margin: 0, valign: "middle",
  });
  s.addText("夏休みの終わり", {
    x: M, y: 2.35, w: 9.2, h: 1.0, fontFace: JP, fontSize: 46, bold: true,
    color: W, margin: 0, valign: "middle",
  });
  s.addText("〜 食と生活リズムの整え方 〜", {
    x: M, y: 3.42, w: 9.2, h: 0.6, fontFace: JP, fontSize: 24,
    color: "C7D6E6", margin: 0, valign: "middle",
  });
  s.addText("2学期に向けて、朝・食事・夜の過ごし方をどう戻していくか", {
    x: M, y: 4.15, w: 9.2, h: 0.4, fontFace: JP, fontSize: 14,
    color: "9FB4CC", margin: 0, valign: "middle",
  });

  s.addShape(pptx.ShapeType.roundRect, {
    x: M, y: 5.05, w: 5.55, h: 0.62, rectRadius: 0.31,
    fill: { color: INK }, line: { color: INK_SOFT, width: 1 },
  });
  s.addText("8月17日（月）21:30 〜 23:00（90分）", {
    x: M, y: 5.05, w: 5.55, h: 0.62, fontFace: JP, fontSize: 14, bold: true,
    color: W, align: "center", valign: "middle", margin: 0,
  });

  s.addNotes(
    "開始のあいさつ。今日は第2回。前回は「食事の考え方」、今回はそれを2学期に向けた1日の流れに落とし込みます。\n" +
    "21:30スタート、23:00終了。途中でチャットに書き込んでいただいてOKであることを伝える。"
  );
}

// ============================================================
// 2. 今日のゴール
// ============================================================
{
  const s = newSlide();
  header(s, "GOAL", "この90分で持ち帰っていただくこと");

  const goals = [
    ["01", "朝から戻す手順がわかる", "「夜を早める」ではうまくいきません。\n朝を動かすと、夜は後からついてきます。"],
    ["02", "不調を食事から見る視点", "起きられない・だるい・イライラを、\n「性格」ではなく「食事」から見てみます。"],
    ["03", "わが家の作戦が3つ決まる", "最後にワークがあります。\n決めるのは3つだけ。多いと続きません。"],
  ];
  const cw = 3.71, gap = 0.4;
  goals.forEach((g, i) => {
    const x = M + i * (cw + gap);
    card(s, x, 1.62, cw, 3.55, CARD);
    badge(s, x + 0.35, 1.95, 0.7, g[0], AMBER, W, 17);
    s.addText(g[1], {
      x: x + 0.35, y: 2.85, w: cw - 0.7, h: 0.75, fontFace: JP, fontSize: 16, bold: true,
      color: INK, margin: 0, valign: "top", lineSpacingMultiple: 1.2,
    });
    s.addText(g[2], {
      x: x + 0.35, y: 3.68, w: cw - 0.7, h: 1.2, fontFace: JP, fontSize: 13,
      color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.35,
    });
  });

  card(s, M, 5.42, CW, 1.05, AMBER_LT);
  s.addText("正解を覚える時間ではありません。「わが家はこうする」を決めて帰る時間です。", {
    x: M + 0.5, y: 5.42, w: CW - 1.0, h: 1.05, fontFace: JP, fontSize: 16, bold: true,
    color: "8A4E13", margin: 0, valign: "middle",
  });

  s.addNotes(
    "ゴールを先に共有する。特に3つめ(ワーク)があることを伝えておくと、聞き方が変わる。\n" +
    "「知識を増やす会ではなく、決める会です」と一言添える。"
  );
}

// ============================================================
// 3. 前回のふりかえり
// ============================================================
{
  const s = newSlide();
  header(s, "LOOK BACK", "前回（第1回）のふりかえり");

  const items = [
    ["食事は「足し算」で考える", "減らす・やめさせるより、1品足すほうが早くて続きます。"],
    ["体は、食べたものと眠った時間でできている", "どちらか片方だけを頑張っても、うまくいきません。"],
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
  s.addText("この3つを、\n2学期に向けた\n「1日の時間割」に\n落とし込みます。", {
    x: 9.25, y: 2.6, w: 3.1, h: 1.7, fontFace: JP, fontSize: 16, bold: true,
    color: INK, margin: 0, valign: "top", lineSpacingMultiple: 1.35,
  });
  s.addText("朝 → 食事 → 夜 の順に\n見ていきます。", {
    x: 9.25, y: 4.6, w: 3.1, h: 0.85, fontFace: JP, fontSize: 12.5,
    color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.3,
  });

  note(s, "※ 第1回に参加されていない方も、今日だけで完結する内容です。");

  s.addNotes(
    "1回目の内容を3点だけ短く復習。時間をかけすぎない(3分程度)。\n" +
    "初参加の方がいる可能性があるので、今日だけで完結すると必ず言う。"
  );
}

// ============================================================
// 4. 今日の流れ
// ============================================================
{
  const s = newSlide();
  header(s, "AGENDA", "今日の流れ（90分）");

  const rows = [
    ["", "はじめに ／ 夏休み後半に起きていること", "5分", GRAY],
    ["1", "2学期前に戻したい「朝のリズム」", "20分", AMBER],
    ["2", "起きられない、だるい、イライラへの「食事の見方」", "20分", AMBER],
    ["3", "夏休み後半から整える「夜ごはんと睡眠」", "20分", AMBER],
    ["4", "学校再開前に慌てないための準備", "10分", AMBER],
    ["5", "わが家の「2学期スタート作戦」（ワーク）", "10分", SAGE],
    ["", "まとめ ／ 質疑応答", "5分", GRAY],
  ];
  rows.forEach((r, i) => {
    const y = 1.62 + i * 0.72;
    card(s, M, y, CW, 0.6, i % 2 === 0 ? CARD : "F8FAFC");
    if (r[0]) {
      badge(s, M + 0.22, y + 0.11, 0.38, r[0], r[3], W, 12);
    } else {
      s.addShape(pptx.ShapeType.ellipse, {
        x: M + 0.35, y: y + 0.24, w: 0.12, h: 0.12, fill: { color: "AAB8C6" }, line: { width: 0 },
      });
    }
    s.addText(r[1], {
      x: M + 0.8, y: y, w: 9.2, h: 0.6, fontFace: JP, fontSize: 15,
      bold: !!r[0], color: r[0] ? INK : GRAY, margin: 0, valign: "middle",
    });
    s.addText(r[2], {
      x: M + CW - 1.5, y: y, w: 1.2, h: 0.6, fontFace: JP, fontSize: 13, bold: true,
      color: r[3], align: "right", margin: 0, valign: "middle",
    });
  });

  note(s, "※ 途中の質問はチャットへ。まとめて最後にお答えします。");

  s.addNotes("流れを見せて安心してもらう。ワークが後半にあることをここでも予告。");
}

// ============================================================
// 5. 夏休み後半のリアル（チェックリスト）
// ============================================================
{
  const s = newSlide();
  header(s, "はじめに", "夏休み後半、こんなことありませんか？");

  const left = [
    "寝る時間が1〜2時間おそくなった",
    "朝は10時、11時まで起きてこない",
    "朝ごはんが菓子パンだけ／食べない",
    "昼はそうめん・冷やし中華が続く",
  ];
  const right = [
    "冷たい飲み物とアイスが止まらない",
    "夕方から元気、夜がいちばん元気",
    "宿題が残っていて夜ふかし",
    "ちょっとしたことでイライラ・グズグズ",
  ];
  [left, right].forEach((col, ci) => {
    const x = M + ci * 6.17;
    col.forEach((t, i) => {
      const y = 1.65 + i * 0.82;
      card(s, x, y, 5.76, 0.66, CARD);
      s.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.28, y: y + 0.17, w: 0.32, h: 0.32, rectRadius: 0.05,
        fill: { color: W }, line: { color: "B9C7D4", width: 1 },
      });
      s.addText(t, {
        x: x + 0.78, y: y, w: 4.8, h: 0.66, fontFace: JP, fontSize: 14,
        color: INK, margin: 0, valign: "middle",
      });
    });
  });

  card(s, M, 5.15, CW, 1.25, AMBER_LT);
  s.addText("ひとつでも当てはまれば、今日の内容はそのまま使えます。", {
    x: M + 0.5, y: 5.3, w: CW - 1.0, h: 0.42, fontFace: JP, fontSize: 17, bold: true,
    color: "8A4E13", margin: 0, valign: "middle",
  });
  s.addText("これは「だらけている」からではありません。夏休みは、そうなるようにできています。", {
    x: M + 0.5, y: 5.76, w: CW - 1.0, h: 0.42, fontFace: JP, fontSize: 13,
    color: "8A4E13", margin: 0, valign: "middle",
  });

  s.addNotes(
    "共感パート。チャットで「いくつ当てはまりましたか？」と聞くと参加感が出る。\n" +
    "ここで大事なのは、親の責任・子の性格の問題にしないこと。"
  );
}

// ============================================================
// 6. なぜ直前の一気戻しはしんどいのか
// ============================================================
{
  const s = newSlide();
  header(s, "はじめに", "なぜ「直前に一気に戻す」とうまくいかないのか");

  const reasons = [
    ["体内時計は一気に動かない", "ずらせるのは1日15〜30分ほど。\n「3日で2時間戻す」には無理があります。"],
    ["「早く寝なさい」では眠くならない", "眠気は、起きた時刻と浴びた光で決まります。\n布団に入れても眠れず、親子で消耗。"],
    ["3つ同時に言われても動けない", "「寝ろ・起きろ・食べろ」が一度に来ると、\n子どもにできるのは反発だけになります。"],
  ];
  const cw = 3.71, gap = 0.4;
  reasons.forEach((r, i) => {
    const x = M + i * (cw + gap);
    card(s, x, 1.62, cw, 3.3, CARD);
    badge(s, x + 0.35, 1.92, 0.62, "×", ROSE, W, 20);
    s.addText(r[0], {
      x: x + 0.35, y: 2.72, w: cw - 0.7, h: 0.78, fontFace: JP, fontSize: 15.5, bold: true,
      color: INK, margin: 0, valign: "top", lineSpacingMultiple: 1.2,
    });
    s.addText(r[1], {
      x: x + 0.35, y: 3.58, w: cw - 0.7, h: 1.1, fontFace: JP, fontSize: 12.5,
      color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.35,
    });
  });

  card(s, M, 5.18, CW, 1.1, SAGE_LT);
  s.addText("だからこそ、8月の後半から「少しずつ」。今日がちょうどいいタイミングです。", {
    x: M + 0.5, y: 5.18, w: CW - 1.0, h: 1.1, fontFace: JP, fontSize: 16, bold: true,
    color: "2A5F4E", margin: 0, valign: "middle",
  });

  s.addNotes(
    "「うまくいかないのは、やり方の問題」と伝えるパート。親を責めない。\n" +
    "体内時計は1日にずらせる幅が限られている、という点だけ押さえてもらう。"
  );
}

// ============================================================
// 7. 順番を変える
// ============================================================
{
  const s = newSlide();
  header(s, "はじめに", "順番を変えるだけで、ぐっとラクになります");

  // NG flow
  card(s, M, 1.62, 5.76, 2.15, ROSE_LT);
  s.addText("うまくいかない順番", {
    x: M + 0.4, y: 1.8, w: 5.0, h: 0.35, fontFace: JP, fontSize: 13, bold: true,
    color: ROSE, margin: 0, valign: "middle",
  });
  const ngSteps = ["夜を\n早める", "朝\n起こす", "朝ごはんを\n食べさせる"];
  ngSteps.forEach((t, i) => {
    const x = M + 0.4 + i * 1.78;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 2.28, w: 1.5, h: 1.14, rectRadius: 0.08,
      fill: { color: W }, line: { color: "E4C3BF", width: 1 },
    });
    s.addText(t, {
      x, y: 2.28, w: 1.5, h: 1.14, fontFace: JP, fontSize: 12.5, bold: true,
      color: INK, align: "center", valign: "middle", margin: 0, lineSpacingMultiple: 1.2,
    });
    if (i < 2) {
      s.addText("▶", {
        x: x + 1.5, y: 2.28, w: 0.28, h: 1.14, fontFace: JP, fontSize: 11,
        color: ROSE, align: "center", valign: "middle", margin: 0,
      });
    }
  });

  // OK flow
  card(s, 7.27, 1.62, 5.76, 2.15, SAGE_LT);
  s.addText("うまくいく順番", {
    x: 7.67, y: 1.8, w: 5.0, h: 0.35, fontFace: JP, fontSize: 13, bold: true,
    color: SAGE, margin: 0, valign: "middle",
  });
  const okSteps = ["朝\n起こす", "光を浴びて\n朝ごはん", "夜が\n早まる"];
  okSteps.forEach((t, i) => {
    const x = 7.67 + i * 1.78;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 2.28, w: 1.5, h: 1.14, rectRadius: 0.08,
      fill: { color: W }, line: { color: "BCD8CC", width: 1 },
    });
    s.addText(t, {
      x, y: 2.28, w: 1.5, h: 1.14, fontFace: JP, fontSize: 12.5, bold: true,
      color: INK, align: "center", valign: "middle", margin: 0, lineSpacingMultiple: 1.2,
    });
    if (i < 2) {
      s.addText("▶", {
        x: x + 1.5, y: 2.28, w: 0.28, h: 1.14, fontFace: JP, fontSize: 11,
        color: SAGE, align: "center", valign: "middle", margin: 0,
      });
    }
  });

  card(s, M, 4.08, CW, 1.55, INK);
  s.addText("「夜」を動かそうとしない。動かすのは「朝」だけ。", {
    x: M + 0.6, y: 4.3, w: CW - 1.2, h: 0.5, fontFace: JP, fontSize: 24, bold: true,
    color: W, margin: 0, valign: "middle",
  });
  s.addText("起きる時間が前に動けば、眠くなる時間も自然と前に動きます。夜は「結果」であって、「原因」ではありません。", {
    x: M + 0.6, y: 4.86, w: CW - 1.2, h: 0.5, fontFace: JP, fontSize: 13.5,
    color: "C7D6E6", margin: 0, valign: "middle",
  });

  s.addText("今日いちばん覚えて帰っていただきたいのは、この1枚です。", {
    x: M, y: 5.85, w: CW, h: 0.45, fontFace: JP, fontSize: 14, bold: true,
    color: AMBER, margin: 0, valign: "middle",
  });

  s.addNotes(
    "今日の中心メッセージ。ここは時間をかけて、ゆっくり話す。\n" +
    "「夜は結果、朝が原因」という言い方を繰り返す。"
  );
}

// ============================================================
// 8. Section 1
// ============================================================
divider("01", "2学期前に戻したい\n「朝のリズム」", [
  "起きる時間の決め方",
  "光と朝ごはんという2つのスイッチ",
  "15分ずつ前倒しする具体的な進め方",
]).addNotes("ここから20分。朝パート。");

// ============================================================
// 9. 朝リズムの3ステップ
// ============================================================
{
  const s = newSlide();
  header(s, "1. 朝のリズム", "朝を戻す3ステップ");

  const steps = [
    ["起きる時間を先に決める", "寝る時間ではなく、起きる時間から決めます。2学期の起床時刻を、家族で1つに。まずは紙に書いて貼るところから。"],
    ["起きて30分以内に光を浴びる", "カーテンを開ける、ベランダに出る、それだけ。体内時計をリセットするいちばん強いスイッチは「光」です。"],
    ["朝ごはんで、体の中を起こす", "食べると内臓の時計が動きはじめます。量は問いません。まず一口、口に入れることから。"],
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
// 10. 15分前倒し作戦
// ============================================================
{
  const s = newSlide();
  header(s, "1. 朝のリズム", "15分ずつ前倒し作戦（例：9:30 → 6:45）");

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
// 11. 朝ごはんの最低ライン
// ============================================================
{
  const s = newSlide();
  header(s, "1. 朝のリズム", "朝ごはんの「最低ライン」3レベル");

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
    s.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.33, y: 1.9, w: 1.28, h: 0.36, rectRadius: 0.18,
      fill: { color: lv[4] }, line: { width: 0 },
    });
    s.addText(lv[0], {
      x: x + 0.33, y: 1.9, w: 1.28, h: 0.36, fontFace: JP, fontSize: 10.5, bold: true,
      color: W, align: "center", valign: "middle", margin: 0,
    });
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

  card(s, M, 5.8, CW, 0.82, AMBER_LT);
  s.addText("目指すのは LEVEL 2。毎日 LEVEL 3 でなくて大丈夫です。", {
    x: M + 0.5, y: 5.8, w: CW - 1.0, h: 0.82, fontFace: JP, fontSize: 16, bold: true,
    color: "8A4E13", margin: 0, valign: "middle",
  });

  s.addNotes(
    "「朝ごはん＝きちんとした食卓」の思い込みを外す。\n" +
    "レベル1でも意味がある(内臓の時計が動く)ことを伝えると、親の気持ちが軽くなる。"
  );
}

// ============================================================
// 12. 声かけを変える
// ============================================================
{
  const s = newSlide();
  header(s, "1. 朝のリズム", "しんどくなる声かけ／ラクになる声かけ");

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

  card(s, M, 5.78, CW, 0.85, INK);
  s.addText("違いは「指示」か「選択肢」か。自分で決めたことのほうが、体は動きます。", {
    x: M + 0.5, y: 5.78, w: CW - 1.0, h: 0.85, fontFace: JP, fontSize: 16, bold: true,
    color: W, margin: 0, valign: "middle",
  });

  s.addNotes(
    "声かけは今日から変えられる部分。実演するとわかりやすい。\n" +
    "「起きられたね」は結果ではなく行動をほめる例。"
  );
}

// ============================================================
// 13. Section 2
// ============================================================
divider("02", "起きられない、だるい、\nイライラへの「食事の見方」", [
  "その不調は、性格ではなくサインかもしれません",
  "血糖の波・たんぱく質と鉄・水分とミネラル",
  "夏ごはんへの「ちょい足し」",
]).addNotes("ここから20分。食事パート。");

// ============================================================
// 14. 3つの視点
// ============================================================
{
  const s = newSlide();
  header(s, "2. 食事の見方", "その不調、食事からのサインかもしれません");

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

  s.addNotes(
    "医療的な診断ではないことを必ず明言する。\n" +
    "「怠けている」に見えることが、栄養のサインであることがある、という視点の提供にとどめる。"
  );
}

// ============================================================
// 15. 血糖の波（チャート）
// ============================================================
{
  const s = newSlide();
  header(s, "2. 食事の見方", "同じ「食べた」でも、午前中の体調は変わります");

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

  s.addNotes(
    "図はイメージであることを口頭でも言う。\n" +
    "持ち帰ってほしいキーワードは「単品にしない」。次のスライドで具体例につなげる。"
  );
}

// ============================================================
// 16. 夏の食事あるある × ちょい足し
// ============================================================
{
  const s = newSlide();
  header(s, "2. 食事の見方", "夏ごはんあるある × ちょい足し");

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

  card(s, M, 5.6, CW, 1.0, SAGE_LT);
  s.addText("献立を変えなくて大丈夫。いつものメニューに「1つ足す」だけで十分です。", {
    x: M + 0.5, y: 5.6, w: CW - 1.0, h: 1.0, fontFace: JP, fontSize: 16, bold: true,
    color: "2A5F4E", margin: 0, valign: "middle",
  });

  s.addNotes(
    "第1回の「足し算」の考え方がここに戻ってくる。\n" +
    "作る量を増やす話ではなく、常備できるもの(卵・納豆・チーズ・ツナ)を置いておく話として伝える。"
  );
}

// ============================================================
// 17. 「食べない」ときの考え方
// ============================================================
{
  const s = newSlide();
  header(s, "2. 食事の見方", "それでも「食べない」ときは");

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

  s.addNotes(
    "「食べない」に悩む保護者は多い。ここは特に丁寧に。\n" +
    "受診の目安を具体的に示すことで、抱え込みを防ぐ。"
  );
}

// ============================================================
// 18. Section 3
// ============================================================
divider("03", "夏休み後半から整える\n「夜ごはんと睡眠」", [
  "夕食の時間・中身・遅くなった日の対応",
  "寝る前90分のルーティン",
  "夜ふかしの巻き戻し方",
]).addNotes("ここから20分。夜パート。");

// ============================================================
// 19. 夜が翌朝を決める
// ============================================================
{
  const s = newSlide();
  header(s, "3. 夜ごはんと睡眠", "夜にできることは、3つだけ");

  const levers = [
    ["夕食の時間", "何時に食べ終わるか", AMBER],
    ["お風呂の時間", "何時に湯船から出るか", ROSE],
    ["光の扱い", "照明と画面をどうするか", SAGE],
  ];
  const cw = 3.71, gap = 0.4;
  levers.forEach((l, i) => {
    const x = M + i * (cw + gap);
    card(s, x, 1.62, cw, 1.9, CARD);
    badge(s, x + 0.35, 1.95, 0.62, String(i + 1), l[2], W, 17);
    s.addText(l[0], {
      x: x + 1.1, y: 1.95, w: cw - 1.45, h: 0.62, fontFace: JP, fontSize: 18, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(l[1], {
      x: x + 0.35, y: 2.78, w: cw - 0.7, h: 0.5, fontFace: JP, fontSize: 13,
      color: GRAY, margin: 0, valign: "middle",
    });
  });

  card(s, M, 3.78, CW, 1.72, INK);
  const flow = ["夕食", "お風呂", "明かりを落とす", "画面を置く", "就寝"];
  flow.forEach((t, i) => {
    const x = M + 0.45 + i * 2.28;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 4.28, w: 1.95, h: 0.72, rectRadius: 0.1,
      fill: { color: INK_SOFT }, line: { width: 0 },
    });
    s.addText(t, {
      x, y: 4.28, w: 1.95, h: 0.72, fontFace: JP, fontSize: 13, bold: true,
      color: W, align: "center", valign: "middle", margin: 0,
    });
    if (i < flow.length - 1) {
      s.addText("▶", {
        x: x + 1.95, y: 4.28, w: 0.33, h: 0.72, fontFace: JP, fontSize: 11,
        color: AMBER, align: "center", valign: "middle", margin: 0,
      });
    }
  });
  s.addText("この順番をくり返すと、体が「もう寝る時間だ」と覚えていきます。", {
    x: M + 0.45, y: 3.95, w: CW - 0.9, h: 0.35, fontFace: JP, fontSize: 13,
    color: "C7D6E6", margin: 0, valign: "middle",
  });

  card(s, M, 5.62, CW, 0.98, AMBER_LT);
  s.addText("「寝なさい」と言うより、順番を毎日そろえるほうが効きます。", {
    x: M + 0.5, y: 5.62, w: CW - 1.0, h: 0.98, fontFace: JP, fontSize: 16, bold: true,
    color: "8A4E13", margin: 0, valign: "middle",
  });

  s.addNotes("夜にコントロールできる要素を3つに絞る。あれこれやらせない。");
}

// ============================================================
// 20. 夕食のポイント
// ============================================================
{
  const s = newSlide();
  header(s, "3. 夜ごはんと睡眠", "夕食の3つのポイント");

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

  card(s, M, 6.18, CW, 0.85, INK);
  s.addText("夜にたくさん食べた翌朝は、朝ごはんが入りません。朝を守るために、夜を軽くします。", {
    x: M + 0.5, y: 6.18, w: CW - 1.0, h: 0.85, fontFace: JP, fontSize: 16, bold: true,
    color: W, margin: 0, valign: "middle",
  });

  s.addNotes("夜と朝がつながっていることを示すスライド。「朝食べない」の原因が夕食にあることは多い。");
}

// ============================================================
// 21. 寝る前90分
// ============================================================
{
  const s = newSlide();
  header(s, "3. 夜ごはんと睡眠", "寝る前90分のルーティン");

  const steps = [
    ["90分前", "お風呂に入る", "湯船に10分。上がった体温が下がるときに、自然と眠くなります。シャワーだけの日は少し早めに。", AMBER],
    ["60分前", "明かりを落とす", "天井の照明を消して、手元の明かりだけに。部屋が暗くなると、眠るホルモンが出はじめます。", "C77E3A"],
    ["30分前", "画面を置く", "スマホ・タブレット・ゲームはここまで。充電場所を寝室の外に決めておくのがいちばん確実です。", INK_SOFT],
    ["0分", "布団に入る", "同じ順番をくり返すことが、いちばんの近道。時間より「順番」を守ってください。", INK],
  ];
  const cw = 2.87, gap = 0.315;
  steps.forEach((st, i) => {
    const x = M + i * (cw + gap);
    card(s, x, 1.72, cw, 3.9, CARD);
    s.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.3, y: 2.02, w: 1.4, h: 0.46, rectRadius: 0.23,
      fill: { color: st[3] }, line: { width: 0 },
    });
    s.addText(st[0], {
      x: x + 0.3, y: 2.02, w: 1.4, h: 0.46, fontFace: JP, fontSize: 12.5, bold: true,
      color: W, align: "center", valign: "middle", margin: 0,
    });
    s.addText(st[1], {
      x: x + 0.3, y: 2.68, w: cw - 0.6, h: 0.75, fontFace: JP, fontSize: 17, bold: true,
      color: INK, margin: 0, valign: "top", lineSpacingMultiple: 1.2,
    });
    s.addText(st[2], {
      x: x + 0.3, y: 3.55, w: cw - 0.6, h: 1.85, fontFace: JP, fontSize: 12.5,
      color: GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.4,
    });
    if (i < steps.length - 1) {
      s.addText("▶", {
        x: x + cw, y: 3.3, w: gap, h: 0.4, fontFace: JP, fontSize: 11,
        color: "AAB8C6", align: "center", valign: "middle", margin: 0,
      });
    }
  });

  card(s, M, 5.78, CW, 0.85, SAGE_LT);
  s.addText("全部そろわなくて大丈夫。まずは「お風呂の時間」を毎日そろえるところから。", {
    x: M + 0.5, y: 5.78, w: CW - 1.0, h: 0.85, fontFace: JP, fontSize: 16, bold: true,
    color: "2A5F4E", margin: 0, valign: "middle",
  });

  s.addNotes(
    "4つ全部やろうとすると挫折する。最初の1つ(お風呂)だけを提案する。\n" +
    "スマホの充電場所は、後半のワークの選択肢にもなる。"
  );
}

// ============================================================
// 22. 夜ふかしの巻き戻し方
// ============================================================
{
  const s = newSlide();
  header(s, "3. 夜ごはんと睡眠", "もう夜ふかしになっている場合の戻し方");

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

  card(s, M, 5.82, CW, 0.82, INK);
  s.addText("眠くなる時間は、前の晩ではなく「その日の朝」に決まっています。", {
    x: M + 0.5, y: 5.82, w: CW - 1.0, h: 0.82, fontFace: JP, fontSize: 16, bold: true,
    color: W, margin: 0, valign: "middle",
  });

  s.addNotes("スライド7で話した「朝が原因」に戻る。ここで一貫性を出す。");
}

// ============================================================
// 23. Section 4
// ============================================================
divider("04", "学校再開前に\n慌てないための準備", [
  "1週間前・3日前・前日・当日の逆算リスト",
  "「行きたくない」と言われたときの備え",
]).addNotes("ここから10分。準備パート。");

// ============================================================
// 24. 逆算カレンダー
// ============================================================
{
  const s = newSlide();
  header(s, "4. 再開前の準備", "逆算カレンダー");

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

  card(s, M, 5.85, CW, 0.9, AMBER_LT);
  s.addText("全部やらなくて大丈夫。各列から1つずつ選ぶくらいで十分です。", {
    x: M + 0.5, y: 5.85, w: CW - 1.0, h: 0.9, fontFace: JP, fontSize: 15.5, bold: true,
    color: "8A4E13", margin: 0, valign: "middle",
  });

  s.addNotes(
    "始業式の日付は自治体差があるので「1週間前」など相対表現にしてある。\n" +
    "参加者に、自分の家の始業日を紙に書いてもらうと具体的になる。"
  );
}

// ============================================================
// 25. 「行きたくない」に備える
// ============================================================
{
  const s = newSlide();
  header(s, "4. 再開前の準備", "「行きたくない」と言われたときのために");

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

  s.addNotes(
    "デリケートなパート。断定せず、選択肢を示す姿勢で。\n" +
    "相談先を具体名で挙げることが、この10分の一番の価値になる。"
  );
}

// ============================================================
// 26. Section 5
// ============================================================
divider("05", "わが家の\n「2学期スタート作戦」", [
  "決めるのは3つだけ",
  "書き込みながら進めます",
  "続けるためのコツ",
]).addNotes("ここから10分。ワーク。紙とペンを用意してもらう。");

// ============================================================
// 27. ワーク
// ============================================================
{
  const s = newSlide();
  header(s, "5. スタート作戦", "ワーク：3つだけ決めましょう");

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

  card(s, M, 5.95, CW, 0.82, AMBER_LT);
  s.addText("決めるのは3つだけ。多いほど、続きません。", {
    x: M + 0.5, y: 5.95, w: CW - 1.0, h: 0.82, fontFace: JP, fontSize: 16, bold: true,
    color: "8A4E13", margin: 0, valign: "middle",
  });

  s.addNotes(
    "5分ほど時間を取って、実際に書いてもらう。\n" +
    "書けた方はチャットに1つだけ書いてもらうと、他の家庭の例が参考になる。"
  );
}

// ============================================================
// 28. 続けるコツ
// ============================================================
{
  const s = newSlide();
  header(s, "5. スタート作戦", "続けるための4つのコツ");

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

  card(s, M, 6.1, CW, 0.85, SAGE_LT);
  s.addText("うまくいかない日があって当たり前です。戻れることのほうが、ずっと大事。", {
    x: M + 0.5, y: 6.1, w: CW - 1.0, h: 0.85, fontFace: JP, fontSize: 16, bold: true,
    color: "2A5F4E", margin: 0, valign: "middle",
  });

  s.addNotes("完璧主義をゆるめるパート。ここで安心して終われるようにする。");
}

// ============================================================
// 29. まとめ
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
// 30. 質疑・おわりに
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

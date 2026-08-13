/**
 * スライドの「部品」
 *
 * カード、バッジ、見出し、脚注など、どのスライドでも使う小さな部品です。
 * ここも「見た目」のファイルなので、講座の中身を書き換えるときは触りません。
 */
const pptx = require("./deck");
const T = require("./theme");

/** 白（または濃紺）の背景の新しいスライドを1枚つくる */
function newSlide(dark) {
  const s = pptx.addSlide();
  s.background = { color: dark ? T.INK_DEEP : T.W };
  return s;
}

/** スライド上部の見出し（小見出し＋タイトル）。本文を始められる y 座標を返す */
function header(s, eyebrow, title) {
  s.addText(eyebrow, {
    x: T.M, y: 0.40, w: T.CW, h: 0.28, fontFace: T.JP, fontSize: 12, bold: true,
    color: T.AMBER, margin: 0, valign: "middle",
  });
  s.addText(title, {
    x: T.M, y: 0.70, w: T.CW, h: 0.62, fontFace: T.JP, fontSize: 27, bold: true,
    color: T.INK, margin: 0, valign: "middle",
  });
  return 1.55;
}

/** 丸いバッジ（中に短い文字を入れる） */
function badge(s, x, y, d, label, fill, txtColor, fs) {
  s.addShape(pptx.ShapeType.ellipse, {
    x, y, w: d, h: d, fill: { color: fill || T.AMBER }, line: { color: fill || T.AMBER, width: 0 },
  });
  s.addText(label, {
    x, y, w: d, h: d, fontFace: T.JP, fontSize: fs || 15, bold: true,
    color: txtColor || T.W, align: "center", valign: "middle", margin: 0,
  });
}

/** 角丸のカード（背景の四角） */
function card(s, x, y, w, h, fill) {
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.09,
    fill: { color: fill || T.CARD }, line: { color: fill || T.CARD, width: 0 },
    shadow: T.shadow(),
  });
}

/** スライド下端の注釈（※〜） */
function note(s, text, color) {
  s.addText(text, {
    x: T.M, y: 6.72, w: T.CW, h: 0.4, fontFace: T.JP, fontSize: 12,
    color: color || T.GRAY, margin: 0, valign: "middle",
  });
}

/**
 * スライド下部の「帯」（今日いちばん言いたい一言）
 * b = { text, tone, y, h, fontSize, sub }
 */
function banner(s, b) {
  if (!b) return;
  const c = T.tone(b.tone);
  const y = b.y != null ? b.y : 5.8;
  const h = b.h != null ? b.h : 0.85;
  card(s, T.M, y, T.CW, h, c.fill);
  if (b.sub) {
    // 2行タイプ（見出し＋補足）
    s.addText(b.text, {
      x: T.M + 0.5, y: y + 0.15, w: T.CW - 1.0, h: 0.42, fontFace: T.JP,
      fontSize: b.fontSize || 17, bold: true, color: c.text, margin: 0, valign: "middle",
    });
    s.addText(b.sub, {
      x: T.M + 0.5, y: y + 0.61, w: T.CW - 1.0, h: 0.42, fontFace: T.JP,
      fontSize: b.subFontSize || 13, color: c.text, margin: 0, valign: "middle",
    });
    return;
  }
  s.addText(b.text, {
    x: T.M + (b.pad != null ? b.pad : 0.5), y, w: T.CW - (b.pad != null ? b.pad : 0.5) * 2, h,
    fontFace: T.JP, fontSize: b.fontSize || 16, bold: b.bold !== false,
    color: c.text, margin: 0, valign: "middle",
  });
}

/** 右向きの三角（工程の矢印） */
function arrow(s, x, y, w, h, color, fs) {
  s.addText("▶", {
    x, y, w, h, fontFace: T.JP, fontSize: fs || 11,
    color: color || T.AMBER, align: "center", valign: "middle", margin: 0,
  });
}

/** 角丸のラベル（カードの中の小さな見出しタグ） */
function pill(s, x, y, w, h, r, fill, text, fs, color) {
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: r, fill: { color: fill }, line: { width: 0 },
  });
  s.addText(text, {
    x, y, w, h, fontFace: T.JP, fontSize: fs, bold: true,
    color: color || T.W, align: "center", valign: "middle", margin: 0,
  });
}

/** 箇条書き（・つき）のテキスト配列をつくる */
function bullets(list) {
  return list.map((t, i) => ({
    text: t,
    options: { bullet: true, breakLine: i < list.length - 1 },
  }));
}

module.exports = { newSlide, header, badge, card, note, banner, arrow, pill, bullets };

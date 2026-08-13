/**
 * スライドの「型」（レイアウト）
 *
 * 1つの関数が、スライド1枚の並べ方を表します。
 * content/ 側では layout: "cards3" のように名前で選ぶだけです。
 *
 * ここも「見た目」のファイルです。中身を書き換えるときは触りません。
 * どんな型があるかは README.md の一覧を見てください。
 */
const pptx = require("./deck");
const T = require("./theme");
const P = require("./parts");

/** tweak（微調整）から値を取り出す。無ければ既定値 */
const tw = (d, key, fallback) => (d.tweak && d.tweak[key] != null ? d.tweak[key] : fallback);

const layouts = {};

// ============================================================
// title … 表紙
// ============================================================
layouts.title = (d) => {
  const s = P.newSlide(true);
  s.addShape(pptx.ShapeType.ellipse, {
    x: 9.1, y: -1.55, w: 5.9, h: 5.9, fill: { color: T.INK }, line: { width: 0 },
  });
  s.addShape(pptx.ShapeType.ellipse, {
    x: 10.35, y: -0.3, w: 3.4, h: 3.4, fill: { color: T.AMBER }, line: { width: 0 },
  });

  s.addText(d.eyebrow, {
    x: T.M, y: 1.85, w: 8.5, h: 0.35, fontFace: T.JP, fontSize: 14, bold: true,
    color: T.AMBER, margin: 0, valign: "middle",
  });
  s.addText(d.title, {
    x: T.M, y: 2.35, w: 9.2, h: 1.0, fontFace: T.JP, fontSize: 46, bold: true,
    color: T.W, margin: 0, valign: "middle",
  });
  s.addText(d.subtitle, {
    x: T.M, y: 3.42, w: 9.2, h: 0.6, fontFace: T.JP, fontSize: 24,
    color: T.ON_DARK, margin: 0, valign: "middle",
  });
  s.addText(d.lead, {
    x: T.M, y: 4.15, w: 9.2, h: 0.4, fontFace: T.JP, fontSize: 14,
    color: T.ON_DARK_2, margin: 0, valign: "middle",
  });

  s.addShape(pptx.ShapeType.roundRect, {
    x: T.M, y: 5.05, w: 5.55, h: 0.62, rectRadius: 0.31,
    fill: { color: T.INK }, line: { color: T.INK_SOFT, width: 1 },
  });
  s.addText(d.pill, {
    x: T.M, y: 5.05, w: 5.55, h: 0.62, fontFace: T.JP, fontSize: 14, bold: true,
    color: T.W, align: "center", valign: "middle", margin: 0,
  });
  return s;
};

// ============================================================
// divider … 章の区切り（濃紺）
// ============================================================
layouts.divider = (d) => {
  const s = P.newSlide(true);
  s.addShape(pptx.ShapeType.ellipse, {
    x: 10.5, y: -1.5, w: 5.2, h: 5.2, fill: { color: T.INK, transparency: 30 }, line: { width: 0 },
  });
  s.addText(d.num, {
    x: T.M, y: 1.55, w: 3, h: 1.5, fontFace: T.JP, fontSize: 90, bold: true,
    color: T.AMBER, margin: 0, valign: "middle",
  });
  s.addText(d.title, {
    x: T.M, y: 3.15, w: 9.6, h: 1.5, fontFace: T.JP, fontSize: 32, bold: true,
    color: T.W, margin: 0, valign: "top", lineSpacingMultiple: 1.25,
  });
  const startY = 4.95;
  d.items.forEach((t, i) => {
    s.addShape(pptx.ShapeType.ellipse, {
      x: T.M + 0.02, y: startY + i * 0.5 + 0.13, w: 0.13, h: 0.13,
      fill: { color: T.AMBER }, line: { width: 0 },
    });
    s.addText(t, {
      x: T.M + 0.32, y: startY + i * 0.5, w: 9.2, h: 0.4, fontFace: T.JP, fontSize: 14,
      color: T.ON_DARK, margin: 0, valign: "middle",
    });
  });
  return s;
};

// ============================================================
// cards3 … 3枚のカード（バッジが上、その下に見出しと説明）
//   items: [{ badge, title, desc }]
// ============================================================
layouts.cards3 = (d) => {
  const s = P.newSlide();
  P.header(s, d.eyebrow, d.title);

  const badgeColor = T.accent(d.badgeTone || "amber");
  const cw = 3.71, gap = 0.4;
  d.items.forEach((it, i) => {
    const x = T.M + i * (cw + gap);
    P.card(s, x, 1.62, cw, tw(d, "cardH", 3.55), T.CARD);
    P.badge(s, x + 0.35, tw(d, "badgeY", 1.95), tw(d, "badgeSize", 0.7),
      it.badge, badgeColor, T.W, tw(d, "badgeFontSize", 17));
    s.addText(it.title, {
      x: x + 0.35, y: tw(d, "titleY", 2.85), w: cw - 0.7, h: tw(d, "titleH", 0.75),
      fontFace: T.JP, fontSize: tw(d, "titleFontSize", 16), bold: true,
      color: T.INK, margin: 0, valign: "top", lineSpacingMultiple: 1.2,
    });
    s.addText(it.desc, {
      x: x + 0.35, y: tw(d, "descY", 3.68), w: cw - 0.7, h: tw(d, "descH", 1.2),
      fontFace: T.JP, fontSize: tw(d, "descFontSize", 13),
      color: T.GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.35,
    });
  });

  P.banner(s, d.banner);
  if (d.note) P.note(s, d.note);
  return s;
};

// ============================================================
// cards3Chip … 3枚のカード（バッジは見出しの左、下に「症状」の囲み）
//   items: [{ title, desc, chip, tone }]
// ============================================================
layouts.cards3Chip = (d) => {
  const s = P.newSlide();
  P.header(s, d.eyebrow, d.title);

  const cw = 3.71, gap = 0.4;
  d.items.forEach((it, i) => {
    const x = T.M + i * (cw + gap);
    const c = T.accent(it.tone);
    P.card(s, x, 1.62, cw, 3.85, T.CARD);
    P.badge(s, x + 0.35, 1.95, 0.62, String(i + 1), c, T.W, 17);
    s.addText(it.title, {
      x: x + 1.1, y: 1.95, w: cw - 1.45, h: 0.62, fontFace: T.JP, fontSize: 18, bold: true,
      color: T.INK, margin: 0, valign: "middle",
    });
    s.addText(it.desc, {
      x: x + 0.35, y: 2.78, w: cw - 0.7, h: 1.65, fontFace: T.JP, fontSize: 12.5,
      color: T.GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.4,
    });
    s.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.35, y: 4.5, w: cw - 0.7, h: 0.72, rectRadius: 0.08,
      fill: { color: T.W }, line: { color: T.LINE, width: 1 },
    });
    s.addText(it.chip, {
      x: x + 0.45, y: 4.5, w: cw - 0.9, h: 0.72, fontFace: T.JP, fontSize: 12, bold: true,
      color: c, align: "center", valign: "middle", margin: 0, lineSpacingMultiple: 1.2,
    });
  });

  P.banner(s, d.banner);
  if (d.note) P.note(s, d.note);
  return s;
};

// ============================================================
// levels3 … 3段階（LEVEL 1/2/3 のような）カード
//   items: [{ label, title, list, foot, tone }]
// ============================================================
layouts.levels3 = (d) => {
  const s = P.newSlide();
  P.header(s, d.eyebrow, d.title);

  const cw = 3.71, gap = 0.4;
  d.items.forEach((it, i) => {
    const x = T.M + i * (cw + gap);
    P.card(s, x, 1.62, cw, 3.95, T.CARD);
    P.pill(s, x + 0.33, 1.9, 1.28, 0.36, 0.18, T.accent(it.tone), it.label, 10.5);
    s.addText(it.title, {
      x: x + 0.33, y: 2.42, w: cw - 0.66, h: 0.42, fontFace: T.JP, fontSize: 16.5, bold: true,
      color: T.INK, margin: 0, valign: "middle",
    });
    s.addText(P.bullets(it.list), {
      x: x + 0.4, y: 2.95, w: cw - 0.75, h: 1.35, fontFace: T.JP, fontSize: 13,
      color: T.INK, margin: 0, valign: "top", paraSpaceAfter: 6,
    });
    s.addText(it.foot, {
      x: x + 0.33, y: 4.45, w: cw - 0.66, h: 0.9, fontFace: T.JP, fontSize: 12,
      color: T.GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.3,
    });
  });

  P.banner(s, d.banner);
  if (d.note) P.note(s, d.note);
  return s;
};

// ============================================================
// work3 … 記入式ワーク（3つ決める）
//   items: [{ badge, title, desc, blank, tone }]
// ============================================================
layouts.work3 = (d) => {
  const s = P.newSlide();
  P.header(s, d.eyebrow, d.title);

  const cw = 3.71, gap = 0.4;
  d.items.forEach((it, i) => {
    const x = T.M + i * (cw + gap);
    P.card(s, x, 1.62, cw, 4.15, T.CARD);
    P.badge(s, x + 0.35, 1.92, 0.6, it.badge, T.accent(it.tone), T.W, 18);
    s.addText(it.title, {
      x: x + 1.08, y: 1.92, w: cw - 1.43, h: 0.6, fontFace: T.JP, fontSize: 17, bold: true,
      color: T.INK, margin: 0, valign: "middle",
    });
    s.addText(it.desc, {
      x: x + 0.35, y: 2.7, w: cw - 0.7, h: 1.0, fontFace: T.JP, fontSize: 12.5,
      color: T.GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.35,
    });
    s.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.35, y: 3.82, w: cw - 0.7, h: 1.65, rectRadius: 0.08,
      fill: { color: T.W }, line: { color: "C3D0DC", width: 1 },
    });
    s.addText(it.blank, {
      x: x + 0.45, y: 3.82, w: cw - 0.9, h: 1.65, fontFace: T.JP, fontSize: 14, bold: true,
      color: T.INK_SOFT, align: "center", valign: "middle", margin: 0, lineSpacingMultiple: 1.4,
    });
  });

  P.banner(s, d.banner);
  if (d.note) P.note(s, d.note);
  return s;
};

// ============================================================
// list3WithNote … 左に3枚の横長カード＋右にまとめパネル
//   items: [{ title, desc }] / aside: { label, body, sub, tone }
// ============================================================
layouts.list3WithNote = (d) => {
  const s = P.newSlide();
  P.header(s, d.eyebrow, d.title);

  d.items.forEach((it, i) => {
    const y = 1.68 + i * 1.5;
    P.card(s, T.M, y, 7.9, 1.28, T.CARD);
    P.badge(s, T.M + 0.3, y + 0.34, 0.62, String(i + 1), T.INK, T.W, 15);
    s.addText(it.title, {
      x: T.M + 1.12, y: y + 0.24, w: 6.6, h: 0.42, fontFace: T.JP, fontSize: 16, bold: true,
      color: T.INK, margin: 0, valign: "middle",
    });
    s.addText(it.desc, {
      x: T.M + 1.12, y: y + 0.68, w: 6.6, h: 0.4, fontFace: T.JP, fontSize: 12.5,
      color: T.GRAY, margin: 0, valign: "middle",
    });
  });

  const a = d.aside;
  P.card(s, 8.95, 1.68, 3.68, 4.28, T.tone(a.tone).fill);
  s.addText(a.label, {
    x: 9.25, y: 2.05, w: 3.1, h: 0.35, fontFace: T.JP, fontSize: 13, bold: true,
    color: T.accent(a.tone), margin: 0, valign: "middle",
  });
  s.addText(a.body, {
    x: 9.25, y: 2.6, w: 3.1, h: 1.7, fontFace: T.JP, fontSize: 16, bold: true,
    color: T.INK, margin: 0, valign: "top", lineSpacingMultiple: 1.35,
  });
  s.addText(a.sub, {
    x: 9.25, y: 4.6, w: 3.1, h: 0.85, fontFace: T.JP, fontSize: 12.5,
    color: T.GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.3,
  });

  if (d.note) P.note(s, d.note);
  return s;
};

// ============================================================
// steps3WithNote … 左に3つのSTEPカード＋右に濃紺パネル
//   items: [{ title, desc }] / aside: { label, body }
// ============================================================
layouts.steps3WithNote = (d) => {
  const s = P.newSlide();
  P.header(s, d.eyebrow, d.title);

  d.items.forEach((it, i) => {
    const y = 1.62 + i * 1.55;
    P.card(s, T.M, y, 8.55, 1.38, T.CARD);
    P.badge(s, T.M + 0.35, y + 0.32, 0.74, "STEP\n" + (i + 1), T.AMBER, T.W, 10);
    s.addText(it.title, {
      x: T.M + 1.32, y: y + 0.2, w: 7.0, h: 0.42, fontFace: T.JP, fontSize: 17, bold: true,
      color: T.INK, margin: 0, valign: "middle",
    });
    s.addText(it.desc, {
      x: T.M + 1.32, y: y + 0.66, w: 7.0, h: 0.6, fontFace: T.JP, fontSize: 13,
      color: T.GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.3,
    });
  });

  const a = d.aside;
  P.card(s, 9.55, 1.62, 3.08, 4.55, T.INK);
  s.addText(a.label, {
    x: 9.85, y: 1.95, w: 2.5, h: 0.4, fontFace: T.JP, fontSize: 15, bold: true,
    color: T.AMBER, margin: 0, valign: "middle",
  });
  s.addText(a.body, {
    x: 9.85, y: 2.5, w: 2.5, h: 3.4, fontFace: T.JP, fontSize: 12.5,
    color: T.ON_DARK, margin: 0, valign: "top", lineSpacingMultiple: 1.35,
  });

  if (d.note) P.note(s, d.note);
  return s;
};

// ============================================================
// list3WithAlert … 左に3枚のカード＋右に「こんなときは相談を」パネル
//   items: [{ title, desc }] / alert: { heading, list }
// ============================================================
layouts.list3WithAlert = (d) => {
  const s = P.newSlide();
  P.header(s, d.eyebrow, d.title);

  d.items.forEach((it, i) => {
    const y = 1.62 + i * 1.62;
    P.card(s, T.M, y, 8.55, 1.42, T.CARD);
    P.badge(s, T.M + 0.35, y + 0.4, 0.62, String(i + 1), T.AMBER, T.W, 15);
    s.addText(it.title, {
      x: T.M + 1.2, y: y + 0.28, w: 7.15, h: 0.42, fontFace: T.JP, fontSize: 16.5, bold: true,
      color: T.INK, margin: 0, valign: "middle",
    });
    s.addText(it.desc, {
      x: T.M + 1.2, y: y + 0.74, w: 7.15, h: 0.5, fontFace: T.JP, fontSize: 12.5,
      color: T.GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.3,
    });
  });

  const a = d.alert;
  P.card(s, 9.55, 1.62, 3.08, 4.86, T.ROSE_LT);
  P.badge(s, 9.85, 2.0, 0.5, "!", T.ROSE, T.W, 17);
  s.addText(a.heading, {
    x: 9.85, y: 2.65, w: 2.5, h: 0.75, fontFace: T.JP, fontSize: 15, bold: true,
    color: T.ROSE, margin: 0, valign: "top", lineSpacingMultiple: 1.2,
  });
  s.addText(P.bullets(a.list), {
    x: 9.9, y: 3.6, w: 2.45, h: 2.4, fontFace: T.JP, fontSize: 12.5,
    color: T.ROSE_TXT, margin: 0, valign: "top", paraSpaceAfter: 12,
  });

  if (d.note) P.note(s, d.note);
  return s;
};

// ============================================================
// list4WithStatement … 左に4枚の小さめカード＋右に濃紺のメッセージ
//   items: [{ title, desc }] / aside: { heading, body }
// ============================================================
layouts.list4WithStatement = (d) => {
  const s = P.newSlide();
  P.header(s, d.eyebrow, d.title);

  d.items.forEach((it, i) => {
    const y = 1.62 + i * 1.1;
    P.card(s, T.M, y, 8.85, 0.95, T.CARD);
    P.badge(s, T.M + 0.32, y + 0.19, 0.57, String(i + 1), T.INK, T.W, 14);
    s.addText(it.title, {
      x: T.M + 1.08, y: y + 0.1, w: 7.55, h: 0.4, fontFace: T.JP, fontSize: 15.5, bold: true,
      color: T.INK, margin: 0, valign: "middle",
    });
    s.addText(it.desc, {
      x: T.M + 1.08, y: y + 0.5, w: 7.55, h: 0.36, fontFace: T.JP, fontSize: 12.5,
      color: T.GRAY, margin: 0, valign: "middle",
    });
  });

  const a = d.aside;
  P.card(s, 9.85, 1.62, 2.78, 4.4, T.INK);
  s.addText(a.heading, {
    x: 10.15, y: 2.0, w: 2.2, h: 1.2, fontFace: T.JP, fontSize: 19, bold: true,
    color: T.W, margin: 0, valign: "top", lineSpacingMultiple: 1.25,
  });
  s.addText(a.body, {
    x: 10.15, y: 3.5, w: 2.2, h: 2.3, fontFace: T.JP, fontSize: 12.5,
    color: T.ON_DARK, margin: 0, valign: "top", lineSpacingMultiple: 1.4,
  });

  if (d.note) P.note(s, d.note);
  return s;
};

// ============================================================
// agenda … 時間つきの進行表
//   rows: [{ num, label, time, tone }]
// ============================================================
layouts.agenda = (d) => {
  const s = P.newSlide();
  P.header(s, d.eyebrow, d.title);

  d.rows.forEach((r, i) => {
    const y = 1.62 + i * 0.72;
    const c = T.accent(r.tone);
    P.card(s, T.M, y, T.CW, 0.6, i % 2 === 0 ? T.CARD : T.CARD_ALT);
    if (r.num) {
      P.badge(s, T.M + 0.22, y + 0.11, 0.38, r.num, c, T.W, 12);
    } else {
      s.addShape(pptx.ShapeType.ellipse, {
        x: T.M + 0.35, y: y + 0.24, w: 0.12, h: 0.12, fill: { color: T.OUTLINE }, line: { width: 0 },
      });
    }
    s.addText(r.label, {
      x: T.M + 0.8, y, w: 9.2, h: 0.6, fontFace: T.JP, fontSize: 15,
      bold: !!r.num, color: r.num ? T.INK : T.GRAY, margin: 0, valign: "middle",
    });
    s.addText(r.time, {
      x: T.M + T.CW - 1.5, y, w: 1.2, h: 0.6, fontFace: T.JP, fontSize: 13, bold: true,
      color: c, align: "right", margin: 0, valign: "middle",
    });
  });

  if (d.note) P.note(s, d.note);
  return s;
};

// ============================================================
// checklist2 … チェックボックス付きの2列リスト
//   left: [文字列] / right: [文字列]
// ============================================================
layouts.checklist2 = (d) => {
  const s = P.newSlide();
  P.header(s, d.eyebrow, d.title);

  [d.left, d.right].forEach((col, ci) => {
    const x = T.M + ci * 6.17;
    col.forEach((t, i) => {
      const y = 1.65 + i * 0.82;
      P.card(s, x, y, 5.76, 0.66, T.CARD);
      s.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.28, y: y + 0.17, w: 0.32, h: 0.32, rectRadius: 0.05,
        fill: { color: T.W }, line: { color: "B9C7D4", width: 1 },
      });
      s.addText(t, {
        x: x + 0.78, y, w: 4.8, h: 0.66, fontFace: T.JP, fontSize: 14,
        color: T.INK, margin: 0, valign: "middle",
      });
    });
  });

  P.banner(s, d.banner);
  if (d.note) P.note(s, d.note);
  return s;
};

// ============================================================
// compare2 … 左右の比較（○／×）
//   left / right: { tone, badge, heading, items: [文字列] }
// ============================================================
layouts.compare2 = (d) => {
  const s = P.newSlide();
  P.header(s, d.eyebrow, d.title);

  const panelH = tw(d, "panelH", 3.95);
  const itemY0 = tw(d, "itemY0", 2.65);
  const itemStep = tw(d, "itemStep", 0.66);
  const itemH = tw(d, "itemH", 0.55);
  const itemFS = tw(d, "itemFontSize", 14.5);

  [
    { data: d.left, cardX: T.M, headX: T.M + 1.05, badgeX: T.M + 0.4, textX: T.M + 0.4 },
    { data: d.right, cardX: 7.27, headX: 8.32, badgeX: 7.67, textX: 7.67 },
  ].forEach((side) => {
    const p = T.panel(side.data.tone);
    P.card(s, side.cardX, 1.62, 5.76, panelH, p.fill);
    P.badge(s, side.badgeX, 1.92, 0.5, side.data.badge, p.accent, T.W, 17);
    s.addText(side.data.heading, {
      x: side.headX, y: 1.92, w: 4.3, h: 0.5, fontFace: T.JP, fontSize: 16, bold: true,
      color: p.accent, margin: 0, valign: "middle",
    });
    side.data.items.forEach((t, i) => {
      s.addText(t, {
        x: side.textX, y: itemY0 + i * itemStep, w: 5.0, h: itemH,
        fontFace: T.JP, fontSize: itemFS, color: T.INK, margin: 0, valign: "middle",
      });
    });
  });

  P.banner(s, d.banner);
  if (d.note) P.note(s, d.note);
  return s;
};

// ============================================================
// orderCompare … 「うまくいかない順番／うまくいく順番」の流れ図
//   left / right: { tone, heading, steps: [文字列] }
//   statement: { headline, body } / lead: 文字列
// ============================================================
layouts.orderCompare = (d) => {
  const s = P.newSlide();
  P.header(s, d.eyebrow, d.title);

  [
    { data: d.left, cardX: T.M, innerX: T.M + 0.4, headX: T.M + 0.4, boxLine: "E4C3BF" },
    { data: d.right, cardX: 7.27, innerX: 7.67, headX: 7.67, boxLine: "BCD8CC" },
  ].forEach((side) => {
    const p = T.panel(side.data.tone);
    P.card(s, side.cardX, 1.62, 5.76, 2.15, p.fill);
    s.addText(side.data.heading, {
      x: side.headX, y: 1.8, w: 5.0, h: 0.35, fontFace: T.JP, fontSize: 13, bold: true,
      color: p.accent, margin: 0, valign: "middle",
    });
    side.data.steps.forEach((t, i) => {
      const x = side.innerX + i * 1.78;
      s.addShape(pptx.ShapeType.roundRect, {
        x, y: 2.28, w: 1.5, h: 1.14, rectRadius: 0.08,
        fill: { color: T.W }, line: { color: side.boxLine, width: 1 },
      });
      s.addText(t, {
        x, y: 2.28, w: 1.5, h: 1.14, fontFace: T.JP, fontSize: 12.5, bold: true,
        color: T.INK, align: "center", valign: "middle", margin: 0, lineSpacingMultiple: 1.2,
      });
      if (i < side.data.steps.length - 1) {
        P.arrow(s, x + 1.5, 2.28, 0.28, 1.14, p.accent);
      }
    });
  });

  P.card(s, T.M, 4.08, T.CW, 1.55, T.INK);
  s.addText(d.statement.headline, {
    x: T.M + 0.6, y: 4.3, w: T.CW - 1.2, h: 0.5, fontFace: T.JP, fontSize: 24, bold: true,
    color: T.W, margin: 0, valign: "middle",
  });
  s.addText(d.statement.body, {
    x: T.M + 0.6, y: 4.86, w: T.CW - 1.2, h: 0.5, fontFace: T.JP, fontSize: 13.5,
    color: T.ON_DARK, margin: 0, valign: "middle",
  });

  s.addText(d.lead, {
    x: T.M, y: 5.85, w: T.CW, h: 0.45, fontFace: T.JP, fontSize: 14, bold: true,
    color: T.AMBER, margin: 0, valign: "middle",
  });

  if (d.note) P.note(s, d.note);
  return s;
};

// ============================================================
// tableWithTips … 表＋右に2つの小パネル
//   columns: [見出し] / rows: [[セル,…]] / tip: { label, list, foot } / aside: { text }
// ============================================================
layouts.tableWithTips = (d) => {
  const s = P.newSlide();
  P.header(s, d.eyebrow, d.title);

  const head = d.columns.map((c) => ({
    text: c, options: { fill: { color: T.INK }, color: T.W, bold: true },
  }));
  s.addTable([head, ...d.rows], {
    x: T.M, y: 1.62, w: 8.55, colW: d.colW,
    fontFace: T.JP, fontSize: 13, color: T.INK, valign: "middle",
    rowH: 0.62, border: { type: "solid", color: T.LINE, pt: 1 },
    fill: { color: T.W }, align: "left", margin: [4, 10, 4, 10],
  });

  const tip = d.tip;
  P.card(s, 9.55, 1.62, 3.08, 3.6, T.AMBER_LT);
  s.addText(tip.label, {
    x: 9.85, y: 1.92, w: 2.5, h: 0.35, fontFace: T.JP, fontSize: 14, bold: true,
    color: T.AMBER_TXT, margin: 0, valign: "middle",
  });
  s.addText(tip.list, {
    x: 9.85, y: 2.42, w: 2.5, h: 1.7, fontFace: T.JP, fontSize: 13, bold: true,
    color: T.AMBER_TXT, margin: 0, valign: "top", lineSpacingMultiple: 1.45,
  });
  s.addText(tip.foot, {
    x: 9.85, y: 4.3, w: 2.5, h: 0.85, fontFace: T.JP, fontSize: 11.5,
    color: T.AMBER_TXT, margin: 0, valign: "top", lineSpacingMultiple: 1.3,
  });

  P.card(s, 9.55, 5.4, 3.08, 1.02, T.SAGE_LT);
  s.addText(d.aside.text, {
    x: 9.85, y: 5.4, w: 2.5, h: 1.02, fontFace: T.JP, fontSize: 13.5, bold: true,
    color: T.SAGE_TXT, margin: 0, valign: "middle", lineSpacingMultiple: 1.25,
  });

  if (d.note) P.note(s, d.note);
  return s;
};

// ============================================================
// table … 全幅の表＋下の帯
//   columns: [見出し] / rows: [[セル,…]] / colW: [幅,…]
// ============================================================
layouts.table = (d) => {
  const s = P.newSlide();
  P.header(s, d.eyebrow, d.title);

  const head = d.columns.map((c) => ({
    text: c, options: { fill: { color: T.INK }, color: T.W, bold: true },
  }));
  s.addTable([head, ...d.rows], {
    x: T.M, y: 1.62, w: T.CW, colW: d.colW,
    fontFace: T.JP, fontSize: 14, color: T.INK, valign: "middle",
    rowH: 0.62, border: { type: "solid", color: T.LINE, pt: 1 },
    fill: { color: T.W }, align: "left", margin: [5, 12, 5, 12],
  });

  P.banner(s, d.banner);
  if (d.note) P.note(s, d.note);
  return s;
};

// ============================================================
// chartWithNotes … 折れ線グラフ＋右に2つのパネル
//   series: [{ name, labels, values }] / caption
//   tip: { title, body } / keyPoint: { label, headline, body }
// ============================================================
layouts.chartWithNotes = (d) => {
  const s = P.newSlide();
  P.header(s, d.eyebrow, d.title);

  s.addChart(pptx.ChartType.line, d.series, {
    x: T.M, y: 1.62, w: 7.9, h: 4.05,
    chartColors: [T.AMBER, T.SAGE],
    lineSize: 4, lineSmooth: true,
    showLegend: true, legendPos: "b", legendFontSize: 12, legendFontFace: T.JP, legendColor: T.INK,
    catAxisLabelFontFace: T.JP, catAxisLabelFontSize: 12, catAxisLabelColor: T.GRAY,
    valAxisLabelFontFace: T.JP, valAxisLabelFontSize: 11, valAxisLabelColor: T.GRAY,
    valAxisMinVal: 60, valAxisMaxVal: 190, valAxisHidden: true,
    valGridLine: { color: "EDF2F6", size: 1 },
    catGridLine: { style: "none" },
    showValue: false,
    dataBorder: { pt: 0, color: T.W },
  });

  s.addText(d.caption, {
    x: T.M, y: 5.72, w: 7.9, h: 0.3, fontFace: T.JP, fontSize: 10.5,
    color: T.GRAY_LT, margin: 0, valign: "middle",
  });

  P.card(s, 8.95, 1.62, 3.68, 2.15, T.AMBER_LT);
  s.addText(d.tip.title, {
    x: 9.28, y: 1.85, w: 3.05, h: 0.4, fontFace: T.JP, fontSize: 14.5, bold: true,
    color: T.AMBER_TXT, margin: 0, valign: "middle",
  });
  s.addText(d.tip.body, {
    x: 9.28, y: 2.35, w: 3.05, h: 1.3, fontFace: T.JP, fontSize: 12.5,
    color: T.AMBER_TXT, margin: 0, valign: "top", lineSpacingMultiple: 1.35,
  });

  P.card(s, 8.95, 3.95, 3.68, 2.3, T.INK);
  s.addText(d.keyPoint.label, {
    x: 9.28, y: 4.18, w: 3.05, h: 0.35, fontFace: T.JP, fontSize: 12.5, bold: true,
    color: T.AMBER, margin: 0, valign: "middle",
  });
  s.addText(d.keyPoint.headline, {
    x: 9.28, y: 4.62, w: 3.05, h: 0.5, fontFace: T.JP, fontSize: 22, bold: true,
    color: T.W, margin: 0, valign: "middle",
  });
  s.addText(d.keyPoint.body, {
    x: 9.28, y: 5.2, w: 3.05, h: 0.95, fontFace: T.JP, fontSize: 12,
    color: T.ON_DARK, margin: 0, valign: "top", lineSpacingMultiple: 1.3,
  });

  if (d.note) P.note(s, d.note);
  return s;
};

// ============================================================
// levers3WithFlow … 3つの短いカード＋その下に流れの帯
//   items: [{ title, desc, tone }] / flow: { lead, steps: [文字列] }
// ============================================================
layouts.levers3WithFlow = (d) => {
  const s = P.newSlide();
  P.header(s, d.eyebrow, d.title);

  const cw = 3.71, gap = 0.4;
  d.items.forEach((it, i) => {
    const x = T.M + i * (cw + gap);
    P.card(s, x, 1.62, cw, 1.9, T.CARD);
    P.badge(s, x + 0.35, 1.95, 0.62, String(i + 1), T.accent(it.tone), T.W, 17);
    s.addText(it.title, {
      x: x + 1.1, y: 1.95, w: cw - 1.45, h: 0.62, fontFace: T.JP, fontSize: 18, bold: true,
      color: T.INK, margin: 0, valign: "middle",
    });
    s.addText(it.desc, {
      x: x + 0.35, y: 2.78, w: cw - 0.7, h: 0.5, fontFace: T.JP, fontSize: 13,
      color: T.GRAY, margin: 0, valign: "middle",
    });
  });

  P.card(s, T.M, 3.78, T.CW, 1.72, T.INK);
  d.flow.steps.forEach((t, i) => {
    const x = T.M + 0.45 + i * 2.28;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 4.28, w: 1.95, h: 0.72, rectRadius: 0.1,
      fill: { color: T.INK_SOFT }, line: { width: 0 },
    });
    s.addText(t, {
      x, y: 4.28, w: 1.95, h: 0.72, fontFace: T.JP, fontSize: 13, bold: true,
      color: T.W, align: "center", valign: "middle", margin: 0,
    });
    if (i < d.flow.steps.length - 1) {
      P.arrow(s, x + 1.95, 4.28, 0.33, 0.72, T.AMBER);
    }
  });
  s.addText(d.flow.lead, {
    x: T.M + 0.45, y: 3.95, w: T.CW - 0.9, h: 0.35, fontFace: T.JP, fontSize: 13,
    color: T.ON_DARK, margin: 0, valign: "middle",
  });

  P.banner(s, d.banner);
  if (d.note) P.note(s, d.note);
  return s;
};

// ============================================================
// rows3Pill … 全幅の横長カード（左にラベル、右に見出しと説明）
//   items: [{ label, title, desc, tone }]
// ============================================================
layouts.rows3Pill = (d) => {
  const s = P.newSlide();
  P.header(s, d.eyebrow, d.title);

  d.items.forEach((it, i) => {
    const y = 1.62 + i * 1.52;
    P.card(s, T.M, y, T.CW, 1.32, T.CARD);
    P.pill(s, T.M + 0.32, y + 0.36, 1.15, 0.6, 0.09, T.accent(it.tone), it.label, 15);
    s.addText(it.title, {
      x: T.M + 1.72, y: y + 0.2, w: 9.7, h: 0.45, fontFace: T.JP, fontSize: 17, bold: true,
      color: T.INK, margin: 0, valign: "middle",
    });
    s.addText(it.desc, {
      x: T.M + 1.72, y: y + 0.68, w: 9.7, h: 0.45, fontFace: T.JP, fontSize: 13,
      color: T.GRAY, margin: 0, valign: "middle",
    });
  });

  P.banner(s, d.banner);
  if (d.note) P.note(s, d.note);
  return s;
};

// ============================================================
// cols4Steps … 4列のステップ（ラベル＋見出し＋説明、間に矢印）
//   items: [{ label, title, desc, tone }]
// ============================================================
layouts.cols4Steps = (d) => {
  const s = P.newSlide();
  P.header(s, d.eyebrow, d.title);

  const cw = 2.87, gap = 0.315;
  d.items.forEach((it, i) => {
    const x = T.M + i * (cw + gap);
    P.card(s, x, 1.72, cw, 3.9, T.CARD);
    P.pill(s, x + 0.3, 2.02, 1.4, 0.46, 0.23, T.accent(it.tone), it.label, 12.5);
    s.addText(it.title, {
      x: x + 0.3, y: 2.68, w: cw - 0.6, h: 0.75, fontFace: T.JP, fontSize: 17, bold: true,
      color: T.INK, margin: 0, valign: "top", lineSpacingMultiple: 1.2,
    });
    s.addText(it.desc, {
      x: x + 0.3, y: 3.55, w: cw - 0.6, h: 1.85, fontFace: T.JP, fontSize: 12.5,
      color: T.GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.4,
    });
    if (i < d.items.length - 1) {
      P.arrow(s, x + cw, 3.3, gap, 0.4, T.OUTLINE);
    }
  });

  P.banner(s, d.banner);
  if (d.note) P.note(s, d.note);
  return s;
};

// ============================================================
// cols4List … 4列のチェックリスト（見出しタグ＋箇条書き）
//   items: [{ label, list, tone }]
// ============================================================
layouts.cols4List = (d) => {
  const s = P.newSlide();
  P.header(s, d.eyebrow, d.title);

  const cw = 2.87, gap = 0.315;
  d.items.forEach((it, i) => {
    const x = T.M + i * (cw + gap);
    P.card(s, x, 1.62, cw, 3.95, T.CARD);
    P.pill(s, x + 0.28, 1.92, cw - 0.56, 0.55, 0.09, T.accent(it.tone), it.label, 16);
    s.addText(P.bullets(it.list), {
      x: x + 0.26, y: 2.72, w: cw - 0.48, h: 2.9, fontFace: T.JP, fontSize: 12,
      color: T.INK, margin: 0, valign: "top", paraSpaceAfter: 14, lineSpacingMultiple: 1.25,
    });
  });

  P.banner(s, d.banner);
  if (d.note) P.note(s, d.note);
  return s;
};

// ============================================================
// grid4 … 2×2 のカード
//   items: [{ title, desc }]
// ============================================================
layouts.grid4 = (d) => {
  const s = P.newSlide();
  P.header(s, d.eyebrow, d.title);

  const cw = 5.76, gap = 0.41;
  d.items.forEach((it, i) => {
    const x = T.M + (i % 2) * (cw + gap);
    const y = 1.68 + Math.floor(i / 2) * 2.15;
    P.card(s, x, y, cw, 1.9, T.CARD);
    P.badge(s, x + 0.38, y + 0.34, 0.72, String(i + 1),
      i % 2 === 0 ? T.AMBER : T.SAGE, T.W, 17);
    s.addText(it.title, {
      x: x + 1.32, y: y + 0.3, w: cw - 1.7, h: 0.45, fontFace: T.JP, fontSize: 18, bold: true,
      color: T.INK, margin: 0, valign: "middle",
    });
    s.addText(it.desc, {
      x: x + 1.32, y: y + 0.82, w: cw - 1.7, h: 0.85, fontFace: T.JP, fontSize: 13,
      color: T.GRAY, margin: 0, valign: "top", lineSpacingMultiple: 1.35,
    });
  });

  P.banner(s, d.banner);
  if (d.note) P.note(s, d.note);
  return s;
};

// ============================================================
// summary … まとめ（濃紺・3つの持ち帰り）
//   items: [{ num, title, desc }] / closing: 文字列
// ============================================================
layouts.summary = (d) => {
  const s = P.newSlide(true);

  s.addText(d.eyebrow, {
    x: T.M, y: 0.5, w: T.CW, h: 0.3, fontFace: T.JP, fontSize: 12, bold: true,
    color: T.AMBER, margin: 0, valign: "middle",
  });
  s.addText(d.title, {
    x: T.M, y: 0.85, w: T.CW, h: 0.62, fontFace: T.JP, fontSize: 30, bold: true,
    color: T.W, margin: 0, valign: "middle",
  });

  d.items.forEach((it, i) => {
    const y = 1.75 + i * 1.42;
    s.addShape(pptx.ShapeType.roundRect, {
      x: T.M, y, w: T.CW, h: 1.22, rectRadius: 0.09,
      fill: { color: T.INK }, line: { width: 0 },
    });
    s.addText(it.num, {
      x: T.M + 0.4, y: y + 0.24, w: 1.0, h: 0.74, fontFace: T.JP, fontSize: 30, bold: true,
      color: T.AMBER, margin: 0, valign: "middle",
    });
    s.addText(it.title, {
      x: T.M + 1.5, y: y + 0.2, w: 9.9, h: 0.45, fontFace: T.JP, fontSize: 19, bold: true,
      color: T.W, margin: 0, valign: "middle",
    });
    s.addText(it.desc, {
      x: T.M + 1.5, y: y + 0.68, w: 9.9, h: 0.4, fontFace: T.JP, fontSize: 13,
      color: T.ON_DARK_2, margin: 0, valign: "middle",
    });
  });

  s.addText(d.closing, {
    x: T.M, y: 6.25, w: T.CW, h: 0.5, fontFace: T.JP, fontSize: 17, bold: true, italic: true,
    color: T.AMBER, margin: 0, valign: "middle",
  });
  return s;
};

// ============================================================
// closing … 質疑・おわりに（濃紺）
// ============================================================
layouts.closing = (d) => {
  const s = P.newSlide(true);
  s.addShape(pptx.ShapeType.ellipse, {
    x: 9.0, y: 1.9, w: 5.9, h: 5.9, fill: { color: T.INK }, line: { width: 0 },
  });
  s.addShape(pptx.ShapeType.ellipse, {
    x: 10.25, y: 3.15, w: 3.4, h: 3.4, fill: { color: T.AMBER }, line: { width: 0 },
  });

  s.addText(d.eyebrow, {
    x: T.M, y: 2.15, w: 8.0, h: 0.35, fontFace: T.JP, fontSize: 13, bold: true,
    color: T.AMBER, margin: 0, valign: "middle",
  });
  s.addText(d.title, {
    x: T.M, y: 2.6, w: 8.0, h: 0.9, fontFace: T.JP, fontSize: 40, bold: true,
    color: T.W, margin: 0, valign: "middle",
  });
  s.addText(d.lead, {
    x: T.M, y: 3.65, w: 8.0, h: 0.9, fontFace: T.JP, fontSize: 15,
    color: T.ON_DARK, margin: 0, valign: "top", lineSpacingMultiple: 1.4,
  });

  s.addShape(pptx.ShapeType.roundRect, {
    x: T.M, y: 4.85, w: 7.4, h: 1.1, rectRadius: 0.1,
    fill: { color: T.INK }, line: { width: 0 },
  });
  s.addText(d.callToAction, {
    x: T.M + 0.45, y: 4.85, w: 6.5, h: 1.1, fontFace: T.JP, fontSize: 14, bold: true,
    color: T.W, margin: 0, valign: "middle", lineSpacingMultiple: 1.35,
  });

  s.addText(d.thanks, {
    x: T.M, y: 6.15, w: 8.0, h: 0.45, fontFace: T.JP, fontSize: 15,
    color: T.ON_DARK_2, margin: 0, valign: "middle",
  });
  return s;
};

module.exports = layouts;

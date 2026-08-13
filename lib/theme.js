/**
 * 色・フォント・余白の定義
 *
 * ここは「見た目」のファイルです。
 * 講座の中身を書き換えるときは触りません。
 * 色を変えたい・フォントを変えたいときだけ、ここを直します。
 */

// ---------- 色 ----------
const INK       = "1E3A5F"; // 濃い紺（基本の文字色）
const INK_DEEP  = "13273F"; // さらに濃い紺（暗い背景のスライド）
const INK_SOFT  = "35557D"; // やわらかい紺
const AMBER     = "D9822B"; // オレンジ（アクセント）
const AMBER_LT  = "FBEAD6"; // うすいオレンジ（帯の背景）
const AMBER_DEEP= "C77E3A"; // 少し暗いオレンジ
const AMBER_TXT = "8A4E13"; // オレンジの帯の上に置く文字色
const SAGE      = "3F8A72"; // 緑
const SAGE_LT   = "E3EFEA"; // うすい緑
const SAGE_TXT  = "2A5F4E"; // 緑の帯の上に置く文字色
const ROSE      = "B4544F"; // 赤（NG・注意）
const ROSE_LT   = "F8E7E4"; // うすい赤
const ROSE_TXT  = "7A3733"; // 赤の帯の上に置く文字色
const CARD      = "F1F5F9"; // カードの背景
const CARD_ALT  = "F8FAFC"; // 交互に並べるときの薄いほう
const LINE      = "D9E2EA"; // 罫線
const GRAY      = "5C6E80"; // 説明文の文字色
const GRAY_LT   = "9AA9B8"; // 注釈の文字色
const W         = "FFFFFF"; // 白
const ON_DARK   = "C7D6E6"; // 暗い背景の上の説明文
const ON_DARK_2 = "9FB4CC"; // 暗い背景の上の、さらに控えめな文
const OUTLINE   = "AAB8C6"; // 矢印など

// ---------- フォント ----------
const JP = "Meiryo";

// ---------- スライドの寸法（インチ） ----------
const SW = 13.333;        // スライドの横幅
const SH = 7.5;           // スライドの高さ
const M  = 0.7;           // 左右の余白
const CW = SW - M * 2;    // 本文の幅 = 11.933

/**
 * 帯（バナー）の色づかい。content 側では "amber" のような名前で指定します。
 */
const TONES = {
  amber: { fill: AMBER_LT, text: AMBER_TXT },
  sage:  { fill: SAGE_LT,  text: SAGE_TXT },
  ink:   { fill: INK,      text: W },
  rose:  { fill: ROSE_LT,  text: ROSE_TXT },
  plain: { fill: CARD_ALT, text: GRAY },
};

/**
 * バッジ・見出しなどのアクセント色。content 側では "amber" のような名前で指定します。
 */
const ACCENTS = {
  amber:     AMBER,
  amberDeep: AMBER_DEEP,
  sage:      SAGE,
  rose:      ROSE,
  ink:       INK,
  inkSoft:   INK_SOFT,
  gray:      GRAY,
};

/** 左右に並べる比較パネル（○／×）の色づかい */
const PANELS = {
  sage: { fill: SAGE_LT, accent: SAGE },
  rose: { fill: ROSE_LT, accent: ROSE },
};

/** 名前 → 色。名前でなければ、そのまま色コードとして扱う */
function tone(name) {
  return TONES[name] || TONES.amber;
}
function accent(name) {
  return ACCENTS[name] || name || AMBER;
}
function panel(name) {
  return PANELS[name] || PANELS.sage;
}

/** カードに落とす影 */
const shadow = () => ({ type: "outer", color: INK, blur: 10, offset: 2, angle: 90, opacity: 0.10 });

module.exports = {
  INK, INK_DEEP, INK_SOFT,
  AMBER, AMBER_LT, AMBER_DEEP, AMBER_TXT,
  SAGE, SAGE_LT, SAGE_TXT,
  ROSE, ROSE_LT, ROSE_TXT,
  CARD, CARD_ALT, LINE, GRAY, GRAY_LT, W,
  ON_DARK, ON_DARK_2, OUTLINE,
  JP, SW, SH, M, CW,
  TONES, ACCENTS, PANELS,
  tone, accent, panel, shadow,
};

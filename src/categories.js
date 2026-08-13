/**
 * 発信コンテンツの分類先。
 * original は受信原文の保管先なので、Claude の選択肢には含めない。
 */

const ARCHIVE_FOLDER = "original";

const CATEGORIES = {
  ideas: {
    label: "ネタ帳",
    description:
      "まだ形になっていない着想・気づき・企画の種。断片的で結論が出ていないもの。",
    format:
      "見出しと箇条書きで整理する。何が引っかかったのか、どう展開できそうかを書き残す。無理に結論づけない。",
  },
  reels: {
    label: "リール台本",
    description: "30〜60秒のショート動画で伝えられる、一つの気づきや実践方法。",
    format:
      "話し言葉で書く。「フック（冒頭2秒）」「本編」「締め」の3見出し構成。本編は3〜4ステップ程度。テロップ案も添える。",
  },
  stories: {
    label: "ストーリーズ",
    description: "その日の出来事や短い問いかけ。気軽に流せる分量のもの。",
    format:
      "3〜5枚構成。1枚あたり2〜3行の短文。「1枚目」「2枚目」…と見出しを付ける。最後の1枚は質問スタンプやリンク導線の案を書く。",
  },
  newsletter: {
    label: "メルマガ",
    description: "背景や理由まで掘り下げて書ける、まとまったテーマ。",
    format:
      "件名を1行目に置き、本文は600〜1200字程度。導入・本題・実践できる一歩・結びの流れ。読者一人に語りかける文体。",
  },
  captions: {
    label: "投稿キャプション",
    description: "フィード投稿に添える文章。画像や図解とセットで伝えるもの。",
    format:
      "冒頭1行のフック、本文（3〜5段落・改行多め）、最後に行動を促す一文。末尾にハッシュタグを5〜10個。",
  },
};

const CATEGORY_KEYS = Object.keys(CATEGORIES);
const ALL_FOLDERS = [ARCHIVE_FOLDER, ...CATEGORY_KEYS];

/** `#reels` のような明示指定を拾うための別名表 */
const ALIASES = {
  ideas: "ideas",
  idea: "ideas",
  ネタ: "ideas",
  ネタ帳: "ideas",
  アイデア: "ideas",
  reels: "reels",
  reel: "reels",
  リール: "reels",
  動画: "reels",
  stories: "stories",
  story: "stories",
  ストーリー: "stories",
  ストーリーズ: "stories",
  newsletter: "newsletter",
  mail: "newsletter",
  メルマガ: "newsletter",
  メール: "newsletter",
  captions: "captions",
  caption: "captions",
  キャプション: "captions",
  投稿: "captions",
};

/**
 * 本文先頭の `#reels` / `＃メルマガ` を分類先の明示指定として取り出す。
 * 該当しなければ本文はそのまま返す。
 */
function extractForcedCategory(text) {
  const match = String(text || "").match(
    /^\s*[#＃]([A-Za-z぀-ヿ一-鿿]+)\s*([\s\S]*)$/
  );
  if (!match) return { forcedCategory: null, body: text };

  const key = ALIASES[match[1].toLowerCase()] || ALIASES[match[1]];
  if (!key) return { forcedCategory: null, body: text };

  return { forcedCategory: key, body: match[2].trim() || text };
}

module.exports = {
  ARCHIVE_FOLDER,
  CATEGORIES,
  CATEGORY_KEYS,
  ALL_FOLDERS,
  extractForcedCategory,
};

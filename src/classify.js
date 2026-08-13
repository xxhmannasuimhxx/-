/**
 * 受信メモを Claude に渡し、分類先の判定と原稿の生成を1回の呼び出しで行う。
 * 構造化出力（output_config.format）でスキーマを固定しているので、
 * 返ってくる JSON は必ずこの形になる。
 */
const Anthropic = require("@anthropic-ai/sdk");

const config = require("./config");
const { CATEGORIES, CATEGORY_KEYS } = require("./categories");

const client = new Anthropic();

const RESULT_SCHEMA = {
  type: "object",
  properties: {
    category: {
      type: "string",
      enum: CATEGORY_KEYS,
      description: "この原稿を置くフォルダ",
    },
    reason: {
      type: "string",
      description: "そのフォルダを選んだ理由。1〜2文。",
    },
    title: {
      type: "string",
      description: "原稿の見出し。20文字前後の日本語。",
    },
    slug: {
      type: "string",
      description:
        "ファイル名に使う英小文字とハイフンのみの短い識別子（例: summer-breakfast-rhythm）。",
    },
    summary: {
      type: "string",
      description: "何を書いた原稿か、1文で。LINE への返信に使う。",
    },
    tags: {
      type: "array",
      items: { type: "string" },
      description: "後から探すためのタグ。3〜6個の日本語。",
    },
    draft: {
      type: "string",
      description: "そのまま使える原稿本文。Markdown。",
    },
  },
  required: ["category", "reason", "title", "slug", "summary", "tags", "draft"],
  additionalProperties: false,
};

function buildSystemPrompt() {
  const catalog = CATEGORY_KEYS.map((key) => {
    const c = CATEGORIES[key];
    return `### ${key}（${c.label}）\n適する内容: ${c.description}\n原稿の形式: ${c.format}`;
  }).join("\n\n");

  return `あなたは、食と生活リズムをテーマに講座と SNS 発信を行う髙落まどかさんのコンテンツ制作アシスタントです。
LINE で届く音声メモや走り書きを受け取り、そのまま使える発信用の原稿に整えるのが役割です。

読み手は、子どもの食事や生活リズムに悩む保護者です。専門用語は噛み砕き、責める調子にはしません。

## 分類先（1つだけ選ぶ）

${catalog}

判断に迷ったら、内容の完成度と話せる長さで決めてください。断片的で結論が出ていないものは ideas、
短く話して伝わるものは reels、背景まで書き込めるテーマは newsletter が向いています。

## 原稿を書くときの約束

- メモの内容と意図をそのまま活かす。テーマを勝手に広げたり、別の話にすり替えたりしない。
- メモに書かれていない栄養情報・数値・研究結果・エピソードを創作しない。
  裏付けや実例が必要だと感じた箇所は、本文中に [要確認] と書いて残す。
- 断定しすぎない。「〜すべき」より「〜という手もあります」の温度で書く。
- 分類先の形式に合わせ、手直しなしで投稿できる状態まで仕上げる。`;
}

function buildUserPrompt(text, forcedCategory) {
  const parts = [];

  if (forcedCategory) {
    parts.push(
      `分類先は ${forcedCategory}（${CATEGORIES[forcedCategory].label}）に決まっています。この形式で原稿を書いてください。`
    );
  }

  parts.push("以下が今回届いたメモです。\n\n<メモ>\n" + text + "\n</メモ>");
  return parts.join("\n\n");
}

/**
 * @param {string} text 受信した本文
 * @param {{forcedCategory?: string|null}} options
 * @returns {Promise<object>} RESULT_SCHEMA の形
 */
async function classifyAndDraft(text, { forcedCategory = null } = {}) {
  const response = await client.messages.create({
    model: config.model,
    max_tokens: 16000,
    system: buildSystemPrompt(),
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: RESULT_SCHEMA },
    },
    messages: [{ role: "user", content: buildUserPrompt(text, forcedCategory) }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("Claude がこの内容の処理を見送りました。");
  }
  if (response.stop_reason === "max_tokens") {
    throw new Error("原稿が長すぎて途中で切れました。メモを分けて送ってください。");
  }

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock) {
    throw new Error("Claude の応答に本文が含まれていませんでした。");
  }

  const result = JSON.parse(textBlock.text);

  // スキーマで enum を固定しているが、書き込み先を決める値なので念のため確認する
  if (!CATEGORY_KEYS.includes(result.category)) {
    throw new Error(`想定外の分類先が返りました: ${result.category}`);
  }

  return { ...result, usage: response.usage };
}

module.exports = { classifyAndDraft, RESULT_SCHEMA };

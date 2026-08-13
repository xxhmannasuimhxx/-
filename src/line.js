/**
 * LINE Messaging API との入出力。
 * - 受信: 署名検証（HMAC-SHA256 / Base64）
 * - 送信: 返信（無料・トークンに有効期限あり）→ 失敗時は push にフォールバック
 */
const crypto = require("node:crypto");

const config = require("./config");

const API_BASE = "https://api.line.me/v2/bot";
const TEXT_LIMIT = 5000; // LINE のテキストメッセージ上限

/**
 * リクエストボディ（生バイト列）と x-line-signature ヘッダを突き合わせる。
 * JSON.parse 後のオブジェクトを再シリアライズしたものでは検証できないので、
 * 必ず生の Buffer を渡すこと。
 */
function verifySignature(rawBody, signature) {
  if (!signature || !Buffer.isBuffer(rawBody)) return false;

  const expected = crypto
    .createHmac("sha256", config.lineChannelSecret)
    .update(rawBody)
    .digest("base64");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(String(signature), "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

async function callLineApi(endpoint, payload) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.lineChannelAccessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const error = new Error(`LINE API ${endpoint} が ${res.status} を返しました: ${detail}`);
    error.status = res.status;
    throw error;
  }
  return res;
}

function toTextMessage(text) {
  const body = String(text ?? "").trim() || "（本文なし）";
  return {
    type: "text",
    text: body.length > TEXT_LIMIT ? `${body.slice(0, TEXT_LIMIT - 1)}…` : body,
  };
}

async function reply(replyToken, text) {
  await callLineApi("/message/reply", {
    replyToken,
    messages: [toTextMessage(text)],
  });
}

async function push(to, text) {
  await callLineApi("/message/push", {
    to,
    messages: [toTextMessage(text)],
  });
}

/**
 * 返信を試み、リプライトークンが切れていれば push で送り直す。
 * 原稿生成に時間がかかるとトークンが失効しうるため。
 */
async function replyOrPush({ replyToken, userId, text }) {
  if (replyToken) {
    try {
      await reply(replyToken, text);
      return "reply";
    } catch (error) {
      if (!userId) throw error;
      console.warn(`[warn] 返信に失敗したため push に切り替えます: ${error.message}`);
    }
  }
  if (!userId) throw new Error("送信先が特定できません（replyToken も userId もなし）");
  await push(userId, text);
  return "push";
}

module.exports = { verifySignature, reply, push, replyOrPush };

/**
 * Webhook イベント1件ぶんの処理。
 *
 * 流れ:
 *   1. 受信原文を original/ に保管する（この時点で失われない）
 *   2. Claude が分類先を選び、その形式の原稿を書く
 *   3. 原稿を該当フォルダに書き出す
 *   4. 結果を LINE に返す
 *
 * 2〜3 で失敗しても 1 は済んでいるので、メモそのものは残る。
 */
const { classifyAndDraft } = require("./classify");
const line = require("./line");
const { writeNote } = require("./store");
const {
  ARCHIVE_FOLDER,
  CATEGORIES,
  extractForcedCategory,
} = require("./categories");

/** 再送されたイベントを二重処理しないための記録 */
const seenEventIds = new Set();
const SEEN_LIMIT = 1000;

function alreadyHandled(eventId) {
  if (!eventId) return false;
  if (seenEventIds.has(eventId)) return true;

  seenEventIds.add(eventId);
  if (seenEventIds.size > SEEN_LIMIT) {
    // 古いものから捨てる（Set は挿入順を保つ）
    seenEventIds.delete(seenEventIds.values().next().value);
  }
  return false;
}

async function archiveOriginal(event, text) {
  const receivedAt = new Date(event.timestamp || Date.now());
  return writeNote(ARCHIVE_FOLDER, {
    slug: event.message?.id || "memo",
    date: receivedAt,
    frontMatter: {
      source: "line",
      received_at: receivedAt.toISOString(),
      message_id: event.message?.id,
      message_type: event.message?.type,
      source_type: event.source?.type,
      user_id: event.source?.userId,
    },
    body: text,
  });
}

function buildReply({ result, draftFile, originalFile }) {
  const label = CATEGORIES[result.category].label;
  return [
    `📥 ${label} に振り分けました`,
    "",
    `【${result.title}】`,
    result.summary,
    "",
    `理由: ${result.reason}`,
    `タグ: ${(result.tags || []).join(" / ")}`,
    "",
    `原稿: ${draftFile.relativePath}`,
    `原文: ${originalFile.relativePath}`,
  ].join("\n");
}

async function handleTextMessage(event) {
  const rawText = event.message.text || "";
  const { forcedCategory, body } = extractForcedCategory(rawText);

  const originalFile = await archiveOriginal(event, rawText);
  console.log(`[info] 原文を保管しました: ${originalFile.relativePath}`);

  let result;
  try {
    result = await classifyAndDraft(body, { forcedCategory });
  } catch (error) {
    console.error(`[error] 原稿生成に失敗: ${error.message}`);
    await line.replyOrPush({
      replyToken: event.replyToken,
      userId: event.source?.userId,
      text: [
        "⚠️ 原稿の生成に失敗しました。",
        `内容は ${originalFile.relativePath} に保管してあります。`,
        "",
        `詳細: ${error.message}`,
      ].join("\n"),
    });
    return;
  }

  const draftFile = await writeNote(result.category, {
    slug: result.slug,
    date: new Date(event.timestamp || Date.now()),
    frontMatter: {
      title: result.title,
      category: result.category,
      tags: result.tags,
      summary: result.summary,
      source_note: originalFile.relativePath,
      generated_at: new Date().toISOString(),
      status: "draft",
    },
    body: result.draft,
  });

  console.log(
    `[info] 原稿を書き出しました: ${draftFile.relativePath} ` +
      `(入力 ${result.usage?.input_tokens} / 出力 ${result.usage?.output_tokens} トークン)`
  );

  await line.replyOrPush({
    replyToken: event.replyToken,
    userId: event.source?.userId,
    text: buildReply({ result, draftFile, originalFile }),
  });
}

async function handleNonTextMessage(event) {
  const type = event.message?.type || "unknown";
  const originalFile = await archiveOriginal(
    event,
    `（${type} メッセージを受信しました。本文なし）`
  );

  await line.replyOrPush({
    replyToken: event.replyToken,
    userId: event.source?.userId,
    text: [
      `いまはテキストメッセージだけ原稿にできます（受信: ${type}）。`,
      `受信記録は ${originalFile.relativePath} に残しました。`,
    ].join("\n"),
  });
}

async function handleEvent(event) {
  if (alreadyHandled(event.webhookEventId)) {
    console.log(`[info] 再送イベントをスキップ: ${event.webhookEventId}`);
    return;
  }

  if (event.type === "follow") {
    await line.replyOrPush({
      replyToken: event.replyToken,
      userId: event.source?.userId,
      text: [
        "メモを送ると、内容に合わせて原稿に整えて保存します。",
        "",
        "分類先を指定したいときは、先頭に付けてください:",
        "#リール / #ストーリーズ / #メルマガ / #キャプション / #ネタ",
      ].join("\n"),
    });
    return;
  }

  if (event.type !== "message") return;

  if (event.message?.type === "text") {
    await handleTextMessage(event);
  } else {
    await handleNonTextMessage(event);
  }
}

/** イベントは順番に処理する（同時に走らせるとファイル名が衝突しやすい） */
async function handleEvents(events) {
  for (const event of events || []) {
    try {
      await handleEvent(event);
    } catch (error) {
      console.error(`[error] イベント処理に失敗: ${error.stack || error.message}`);
    }
  }
}

module.exports = { handleEvents, handleEvent };

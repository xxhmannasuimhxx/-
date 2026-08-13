/**
 * LINE Messaging API の Webhook 受け口。
 *
 * LINE はレスポンスが遅いと再送してくるので、署名を確認したら即座に 200 を返し、
 * 原稿生成はレスポンス後に走らせる。
 */
const express = require("express");

const config = require("./src/config");
const line = require("./src/line");
const { handleEvents } = require("./src/handler");

const app = express();

app.get("/healthz", (_req, res) => res.json({ ok: true }));

// 署名検証には生のボディが要るので、この経路だけ JSON パースを挟まない
app.post("/line/webhook", express.raw({ type: "*/*" }), (req, res) => {
  if (!line.verifySignature(req.body, req.get("x-line-signature"))) {
    console.warn("[warn] 署名が一致しないリクエストを拒否しました");
    return res.status(401).send("invalid signature");
  }

  let payload;
  try {
    payload = JSON.parse(req.body.toString("utf8"));
  } catch {
    return res.status(400).send("invalid json");
  }

  res.status(200).end();

  // 接続確認（Verify ボタン）では events が空で届く
  const events = payload.events || [];
  if (events.length === 0) return;

  setImmediate(() => {
    handleEvents(events).catch((error) => {
      console.error(`[error] 処理中に例外: ${error.stack || error.message}`);
    });
  });
});

app.listen(config.port, () => {
  console.log(`madoka-content-system の Webhook を起動しました`);
  console.log(`  ポート      : ${config.port}`);
  console.log(`  Webhook URL : POST /line/webhook`);
  console.log(`  モデル      : ${config.model}`);
  console.log(`  書き出し先  : ${config.contentRoot}`);
});

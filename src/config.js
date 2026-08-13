/**
 * 環境変数の読み込みと検証。
 * 足りない設定は起動時に落とす（受信してから気づくのを避ける）。
 */
require("dotenv").config({ quiet: true });

const path = require("node:path");

function required(name, hint) {
  const value = (process.env[name] || "").trim();
  if (!value) {
    throw new Error(
      `環境変数 ${name} が設定されていません。.env.example を参考に .env へ記入してください。${hint ? `\n  → ${hint}` : ""}`
    );
  }
  return value;
}

const config = {
  lineChannelSecret: required(
    "LINE_CHANNEL_SECRET",
    "LINE Developers > チャネル基本設定 > チャネルシークレット"
  ),
  lineChannelAccessToken: required(
    "LINE_CHANNEL_ACCESS_TOKEN",
    "LINE Developers > Messaging API設定 > チャネルアクセストークン（長期）"
  ),
  model: (process.env.ANTHROPIC_MODEL || "claude-opus-5").trim(),
  port: Number(process.env.PORT || 3000),
  contentRoot: path.resolve(process.env.CONTENT_ROOT || path.join(__dirname, "..")),
};

// ANTHROPIC_API_KEY は必須にしない。SDK は API キーの他に
// `ant auth login` のプロファイルからも認証情報を解決するため。
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn(
    "[warn] ANTHROPIC_API_KEY が未設定です。`ant auth login` 済みならそのまま動作します。"
  );
}

module.exports = config;

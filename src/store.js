/**
 * Markdown ファイルの書き出し。
 * ファイル名の一部はモデルの出力（slug）由来なので、書き込み先が
 * 指定フォルダの外に出ないことを必ず確認してから書く。
 */
const fs = require("node:fs/promises");
const path = require("node:path");

const config = require("./config");
const { ALL_FOLDERS } = require("./categories");

/** slug を英小文字・数字・ハイフンだけに落とす */
function sanitizeSlug(slug, fallback = "memo") {
  const cleaned = String(slug || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return cleaned || fallback;
}

/** 2026-08-13-2214-07 形式のタイムスタンプ（ローカル時刻） */
function timestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()) + pad(date.getMinutes()) + pad(date.getSeconds()),
  ].join("-");
}

/** YAML のスカラー値として安全な形に整える */
function yamlValue(value) {
  if (Array.isArray(value)) {
    return `[${value.map((v) => yamlValue(v)).join(", ")}]`;
  }
  if (value === null || value === undefined) return '""';
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ")}"`;
}

function buildFrontMatter(fields) {
  const lines = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}: ${yamlValue(v)}`);
  return `---\n${lines.join("\n")}\n---\n`;
}

/**
 * 指定フォルダに Markdown を書き出す。同名ファイルがあれば連番を付ける。
 * @returns {Promise<{path: string, relativePath: string}>}
 */
async function writeNote(folder, { slug, frontMatter, body, date = new Date() }) {
  if (!ALL_FOLDERS.includes(folder)) {
    throw new Error(`未知のフォルダです: ${folder}`);
  }

  const dir = path.join(config.contentRoot, folder);
  await fs.mkdir(dir, { recursive: true });

  const base = `${timestamp(date)}-${sanitizeSlug(slug)}`;
  const content = buildFrontMatter(frontMatter) + "\n" + String(body).trim() + "\n";

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const filename = attempt === 0 ? `${base}.md` : `${base}-${attempt + 1}.md`;
    const target = path.resolve(dir, filename);

    // slug 由来の文字列がディレクトリを抜け出していないか確認する
    if (path.dirname(target) !== path.resolve(dir)) {
      throw new Error(`書き込み先が不正です: ${filename}`);
    }

    try {
      await fs.writeFile(target, content, { encoding: "utf8", flag: "wx" });
      return { path: target, relativePath: path.join(folder, filename) };
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
    }
  }

  throw new Error(`ファイル名が衝突し続けています: ${base}`);
}

module.exports = { writeNote, sanitizeSlug, timestamp };

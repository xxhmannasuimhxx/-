/**
 * 保存先のパス。
 *
 * ログイン情報（.env）とログインセッションは、展開したフォルダの中ではなく
 * ユーザー領域に置く。ZIPを新しくしても入れ直さずに済むようにするため。
 *   Windows : %APPDATA%\\mailmag-tool
 *   Mac     : ~/Library/Application Support/mailmag-tool
 *   その他  : ~/.config/mailmag-tool
 */

const fs = require("fs");
const os = require("os");
const path = require("path");

const LOCAL_DIR = path.join(__dirname, "..");   // mailmag/

function userDataDir() {
  const home = os.homedir();
  if (process.platform === "win32") {
    return path.join(process.env.APPDATA || path.join(home, "AppData", "Roaming"), "mailmag-tool");
  }
  if (process.platform === "darwin") {
    return path.join(home, "Library", "Application Support", "mailmag-tool");
  }
  return path.join(process.env.XDG_CONFIG_HOME || path.join(home, ".config"), "mailmag-tool");
}

/**
 * 保存先を返す。フォルダ内に古いファイルがあればそれを優先し（以前の版との互換）、
 * 無ければユーザー領域を使う。
 * @param {string} name        ユーザー領域でのファイル名
 * @param {string} legacyPath  以前の保存場所
 */
function dataFile(name, legacyPath) {
  if (legacyPath && fs.existsSync(legacyPath)) return legacyPath;
  const dir = userDataDir();
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, name);
}

const ENV_FILE = process.env.MAILMAG_ENV_FILE ||
  dataFile(".env", path.join(LOCAL_DIR, ".env"));

const AUTH_FILE = process.env.RESERVESTOCK_AUTH_FILE ||
  dataFile("reservestock-session.json", path.join(LOCAL_DIR, ".auth", "reservestock.json"));

module.exports = { userDataDir, dataFile, ENV_FILE, AUTH_FILE, LOCAL_DIR };

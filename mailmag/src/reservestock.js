/**
 * リザーブストック（リザスト）管理画面のブラウザ自動操作。
 *
 * リザストは公開APIを提供していないため、Playwright で管理画面を操作する。
 * 既定では「下書き保存」までしか行わない（配信ボタンは押さない）。
 *
 * ログイン情報は環境変数から読む:
 *   RESERVESTOCK_EMAIL / RESERVESTOCK_PASSWORD
 * ログインセッションは mailmag/.auth/reservestock.json に保存して再利用する。
 */

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const CONFIG_FILE = path.join(ROOT, "config", "reservestock.json");
const AUTH_FILE = process.env.RESERVESTOCK_AUTH_FILE || path.join(ROOT, ".auth", "reservestock.json");
const OUT_DIR = path.join(ROOT, "out");

function loadConfig() {
  const cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
  // 環境変数があれば URL を上書きできる
  cfg.loginUrl = process.env.RESERVESTOCK_LOGIN_URL || cfg.loginUrl;
  cfg.composerUrl = process.env.RESERVESTOCK_COMPOSER_URL || cfg.composerUrl;
  return cfg;
}

function credentials() {
  const email = process.env.RESERVESTOCK_EMAIL;
  const password = process.env.RESERVESTOCK_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "RESERVESTOCK_EMAIL / RESERVESTOCK_PASSWORD が未設定です。\n" +
      "  ローカル: mailmag/.env に書く（.env は git 管理外）\n" +
      "  CI      : GitHub Secrets に登録する"
    );
  }
  return { email, password };
}

/** .env を読み込む（依存を増やさないための最小実装） */
function loadDotEnv(file = path.join(ROOT, ".env")) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/i.exec(line);
    if (!m) continue;
    const value = m[2].trim().replace(/^["'](.*)["']$/, "$1");
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}

async function launch(opts = {}) {
  const headless = opts.headed ? false : true;
  const browser = await chromium.launch({
    headless,
    slowMo: Number(process.env.RESERVESTOCK_SLOWMO || (opts.headed ? 200 : 0)),
    // コンテナ等でブラウザを別途用意している場合に差し替えられるようにしておく
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
  });
  const context = await browser.newContext({
    locale: "ja-JP",
    timezoneId: "Asia/Tokyo",
    viewport: { width: 1440, height: 960 },
    storageState: fs.existsSync(AUTH_FILE) ? AUTH_FILE : undefined,
  });
  context.setDefaultTimeout(Number(process.env.RESERVESTOCK_TIMEOUT || 30000));
  const page = await context.newPage();
  return { browser, context, page };
}

/** 候補セレクタを順に試し、最初に見つかった locator を返す */
async function firstVisible(scope, candidates, { timeout = 3000 } = {}) {
  for (const selector of candidates || []) {
    const locator = scope.locator(selector).first();
    try {
      await locator.waitFor({ state: "visible", timeout });
      return locator;
    } catch { /* 次の候補へ */ }
  }
  return null;
}

/** ラベル文字列から入力欄を探すフォールバック */
async function byLabel(page, pattern) {
  const locator = page.getByLabel(new RegExp(pattern)).first();
  try {
    await locator.waitFor({ state: "visible", timeout: 2000 });
    return locator;
  } catch {
    return null;
  }
}

async function isLoggedOut(page, cfg) {
  return (await page.locator(cfg.loggedOutMarker).count()) > 0;
}

/** ログイン（セッションが生きていれば何もしない） */
async function login(page, cfg, { force = false } = {}) {
  await page.goto(cfg.loginUrl, { waitUntil: "domcontentloaded" });
  if (!force && !(await isLoggedOut(page, cfg))) {
    console.log("· 保存済みセッションでログイン済みです");
    return;
  }
  const { email, password } = credentials();
  const emailField = await firstVisible(page, cfg.login.email);
  const passwordField = await firstVisible(page, cfg.login.password);
  if (!emailField || !passwordField) {
    throw new Error(
      "ログインフォームの入力欄が見つかりません。\n" +
      "`npm run mailmag:inspect` で実際の画面を確認し、mailmag/config/reservestock.json の " +
      "login.email / login.password を直してください。"
    );
  }
  await emailField.fill(email);
  await passwordField.fill(password);

  const submit = await firstVisible(page, cfg.login.submit);
  if (!submit) throw new Error("ログインボタンが見つかりません（config の login.submit を確認）");
  await Promise.all([
    page.waitForLoadState("networkidle").catch(() => {}),
    submit.click(),
  ]);
  await page.waitForTimeout(1500);

  if (await isLoggedOut(page, cfg)) {
    throw new Error(
      "ログインに失敗しました。ID/パスワードのほか、二段階認証や画像認証が出ている可能性があります。\n" +
      "`node mailmag/src/cli.js login --headed` を手元のPCで一度実行し、" +
      "ブラウザで最後までログインするとセッションが保存され、以後は自動で通ります。"
    );
  }
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  await page.context().storageState({ path: AUTH_FILE });
  console.log(`· ログイン成功（セッションを ${path.relative(process.cwd(), AUTH_FILE)} に保存）`);
}

/** 本文欄（リッチエディタ / textarea / contenteditable）を特定して書き込む */
async function fillBody(page, cfg, composed) {
  // 1) リッチエディタ（iframe）
  for (const selector of cfg.composer.bodyFrame || []) {
    if (await page.locator(selector).count()) {
      const frame = page.frameLocator(selector);
      const editable = frame.locator("body[contenteditable], body").first();
      await editable.click();
      await editable.evaluate((el, html) => { el.innerHTML = html; }, composed.html);
      return "richtext(iframe)";
    }
  }
  // 2) textarea / contenteditable
  const field = (await firstVisible(page, cfg.composer.body)) ||
                (await byLabel(page, cfg.labels.body));
  if (!field) {
    throw new Error(
      "本文の入力欄が見つかりません。`npm run mailmag:inspect` の結果を見て " +
      "config の composer.body / composer.bodyFrame を直してください。"
    );
  }
  const tag = await field.evaluate((el) => el.tagName.toLowerCase());
  if (tag === "textarea" || tag === "input") {
    // プレーンテキスト欄かHTML欄かは判断できないため、HTML欄想定なら --format html を使う
    await field.fill(composed.format === "text" ? composed.text : composed.html);
    return `${tag}`;
  }
  await field.click();
  await field.evaluate((el, html) => { el.innerHTML = html; }, composed.html);
  return "contenteditable";
}

/** 「下書き保存」ボタンを押す（配信系のボタンは絶対に押さない） */
async function saveDraft(page, cfg) {
  const save = new RegExp(cfg.composer.saveDraftPattern);
  const send = new RegExp(cfg.composer.sendPattern);

  const buttons = page.locator('button, input[type="submit"], input[type="button"], a[role="button"]');
  const count = await buttons.count();
  for (let i = 0; i < count; i++) {
    const button = buttons.nth(i);
    if (!(await button.isVisible().catch(() => false))) continue;
    const label = ((await button.innerText().catch(() => "")) ||
                   (await button.getAttribute("value").catch(() => "")) || "").trim();
    if (!label || !save.test(label) || send.test(label)) continue;
    console.log(`· 「${label}」を押します`);
    await button.click();
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1500);
    return label;
  }
  throw new Error(
    "下書き保存ボタンが見つかりませんでした（配信ボタンは安全のため押しません）。\n" +
    "config の composer.saveDraftPattern を実際のボタン文言に合わせてください。"
  );
}

/** 画面の状態を out/ に保存する（後から確認・セレクタ調整用） */
async function capture(page, name) {
  const dir = path.join(OUT_DIR, "inspect");
  fs.mkdirSync(dir, { recursive: true });
  const shot = path.join(dir, `${name}.png`);
  const html = path.join(dir, `${name}.html`);
  await page.screenshot({ path: shot, fullPage: true });
  fs.writeFileSync(html, await page.content());
  return { shot, html };
}

/** 入力欄・ボタンの一覧を書き出す（セレクタ調整用） */
async function describeForm(page, name) {
  const info = await page.evaluate(() => {
    const describe = (el) => ({
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute("type") || "",
      name: el.getAttribute("name") || "",
      id: el.id || "",
      cls: el.className && String(el.className).slice(0, 80),
      label: (el.labels && el.labels[0] && el.labels[0].innerText.trim()) ||
             el.getAttribute("placeholder") || el.getAttribute("aria-label") || "",
      text: (el.innerText || el.value || "").trim().slice(0, 40),
    });
    return {
      url: location.href,
      title: document.title,
      fields: [...document.querySelectorAll("input, textarea, select, [contenteditable=true]")].map(describe),
      frames: [...document.querySelectorAll("iframe")].map((f) => ({
        id: f.id, cls: String(f.className).slice(0, 80), title: f.title || "",
      })),
      buttons: [...document.querySelectorAll('button, input[type=submit], input[type=button], a[role=button]')]
        .map(describe),
    };
  });
  const dir = path.join(OUT_DIR, "inspect");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(info, null, 2));
  return { file, info };
}

module.exports = {
  loadConfig, loadDotEnv, credentials, launch, login, fillBody, saveDraft,
  capture, describeForm, firstVisible, byLabel, AUTH_FILE, OUT_DIR, CONFIG_FILE,
};

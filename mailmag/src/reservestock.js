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
const { ENV_FILE, AUTH_FILE } = require("./paths");

const ROOT = path.join(__dirname, "..");
const CONFIG_FILE = path.join(ROOT, "config", "reservestock.json");
const OUT_DIR = path.join(ROOT, "out");

function loadConfig() {
  const cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
  // 環境変数があれば URL を上書きできる
  cfg.baseUrl = process.env.RESERVESTOCK_BASE_URL || cfg.baseUrl;
  cfg.loginUrl = process.env.RESERVESTOCK_LOGIN_URL || cfg.loginUrl;
  cfg.composerUrl = process.env.RESERVESTOCK_COMPOSER_URL || cfg.composerUrl;
  return cfg;
}

function credentials() {
  const email = process.env.RESERVESTOCK_EMAIL;
  const password = process.env.RESERVESTOCK_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "リザストのログイン情報が未設定です。\n" +
      `  設定ファイル: ${ENV_FILE}\n` +
      "  1-SETUP をもう一度実行すると入力し直せます。"
    );
  }
  return { email, password };
}

/** .env を読み込む（依存を増やさないための最小実装） */
function loadDotEnv(file = ENV_FILE) {
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
  let emailField = await firstVisible(page, cfg.login.email, { timeout: 2000 });
  let passwordField = await firstVisible(page, cfg.login.password, { timeout: 2000 });

  if (!emailField || !passwordField) {
    // 設定が合わないときは、パスワード欄とその直前の入力欄を自動で見つける
    const marked = await page.evaluate(() => {
      const pw = [...document.querySelectorAll('input[type="password"]')]
        .find((el) => el.getBoundingClientRect().width > 40);
      if (!pw) return false;
      pw.setAttribute("data-mailmag-pick", "password");
      const inputs = [...document.querySelectorAll("input")];
      const before = inputs.slice(0, inputs.indexOf(pw)).reverse()
        .find((el) => /text|email|tel|^$/i.test(el.getAttribute("type") || "") &&
                      el.getBoundingClientRect().width > 40);
      if (before) before.setAttribute("data-mailmag-pick", "email");
      return !!before;
    });
    if (marked) {
      emailField = page.locator('[data-mailmag-pick="email"]').first();
      passwordField = page.locator('[data-mailmag-pick="password"]').first();
      console.log("· ログインフォームを自動判別しました");
    }
  }
  if (!emailField || !passwordField) {
    throw new Error(
      "ログイン画面の入力欄が見つかりませんでした。\n" +
      "`npm run mailmag:login` を実行して、ブラウザでご自身でログインしてください（一度でOKです）。"
    );
  }
  await emailField.fill(email);
  await passwordField.fill(password);

  const submit = (await firstVisible(page, cfg.login.submit, { timeout: 2000 })) ||
    page.getByRole("button", { name: /ログイン|サインイン|login/i }).first();
  if (!(await submit.count().catch(() => 1))) {
    throw new Error("ログインボタンが見つかりませんでした。`npm run mailmag:login` で手動ログインしてください。");
  }
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

// ------------------------------------------------------------------
// 画面の自動判別
//   config のセレクタが実画面と合わなくても動くように、
//   ラベル・name・placeholder の文字から入力欄を推測する。
// ------------------------------------------------------------------

/**
 * 画面内から「件名らしい入力欄」「本文らしい入力欄」を推測し、
 * 目印の属性（data-mailmag-pick）を付けてから locator を返す。
 */
async function autoPick(page, kind) {
  const found = await page.evaluate((target) => {
    const WORDS = {
      subject: /件名|題名|タイトル|subject|title/i,
      body: /本文|内容|メッセージ|body|content|message|editor/i,
    }[target];

    const labelOf = (el) => [
      el.labels && el.labels[0] && el.labels[0].innerText,
      el.getAttribute("placeholder"), el.getAttribute("aria-label"),
      el.getAttribute("name"), el.id,
      el.closest("label") && el.closest("label").innerText,
      el.closest("tr") && el.closest("tr").innerText,
      el.closest(".form-group, .field, dl, li") &&
        el.closest(".form-group, .field, dl, li").innerText,
    ].filter(Boolean).join(" ").slice(0, 200);

    const visible = (el) => {
      const r = el.getBoundingClientRect();
      return r.width > 40 && r.height > 10 && getComputedStyle(el).visibility !== "hidden";
    };

    const candidates = target === "subject"
      ? [...document.querySelectorAll('input[type="text"], input:not([type]), input[type="search"]')]
      : [...document.querySelectorAll('textarea, [contenteditable="true"]')];

    let best = null;
    for (const el of candidates) {
      if (!visible(el)) continue;
      const text = labelOf(el);
      const r = el.getBoundingClientRect();
      // 文字が一致すれば高得点、そうでなければ大きさで判断（本文欄は広い）
      const score = (WORDS.test(text) ? 1000 : 0) + Math.min(r.width * r.height / 1000, 500);
      if (!best || score > best.score) {
        best = { el, score, text: text.replace(/\s+/g, " ").trim().slice(0, 60) };
      }
    }
    if (!best || best.score < 50) return null;
    best.el.setAttribute("data-mailmag-pick", target);
    return {
      text: best.text,
      byWord: best.score >= 1000,
      tag: best.el.tagName.toLowerCase(),
      name: best.el.getAttribute("name") || "",
      id: best.el.id || "",
    };
  }, kind);

  if (!found) return null;
  return { locator: page.locator(`[data-mailmag-pick="${kind}"]`).first(), info: found };
}

/** 件名欄を探す（config → ラベル → 自動判別の順） */
async function findSubject(page, cfg) {
  const configured = await firstVisible(page, cfg.composer.subject, { timeout: 2000 });
  if (configured) return { locator: configured, how: "設定ファイルのセレクタ" };
  const labelled = await byLabel(page, cfg.labels.subject);
  if (labelled) return { locator: labelled, how: "ラベル「件名」" };
  const auto = await autoPick(page, "subject");
  if (auto) return { locator: auto.locator, how: `自動判別（${auto.info.name || auto.info.tag}：${auto.info.text}）` };
  return null;
}

/**
 * 本文欄に書き込む。
 * リッチエディタ（iframe）→ textarea / contenteditable の順に探す。
 */
async function fillBody(page, cfg, composed) {
  // 1) リッチエディタ（iframe）。設定のクラス名に頼らず、中身が編集可能な iframe を探す。
  const frames = page.locator("iframe");
  const frameCount = await frames.count();
  for (let i = 0; i < frameCount; i++) {
    const selector = `iframe >> nth=${i}`;
    const body = page.frameLocator(selector).locator('body[contenteditable="true"], body [contenteditable="true"]').first();
    if (await body.count().catch(() => 0)) {
      await body.click({ timeout: 5000 }).catch(() => {});
      await body.evaluate((el, html) => { el.innerHTML = html; }, composed.html);
      return "リッチエディタ（iframe）";
    }
  }

  // 2) textarea / contenteditable
  const configured = await firstVisible(page, cfg.composer.body, { timeout: 2000 });
  const labelled = configured || (await byLabel(page, cfg.labels.body));
  const auto = labelled ? null : await autoPick(page, "body");
  const field = labelled || (auto && auto.locator);
  if (!field) {
    throw new Error(
      "本文の入力欄が見つかりませんでした。\n" +
      "mailmag/out/inspect/ のスクリーンショットを見せていただければ、設定を合わせます。"
    );
  }

  const tag = await field.evaluate((el) => el.tagName.toLowerCase());
  if (tag === "textarea" || tag === "input") {
    // ふつうの入力欄はテキストメール用と考えて、HTMLタグが出ないテキスト版を入れる
    // （HTMLで入れたいときは --format html）
    const isHtml = composed.format === "html";
    await field.fill(isHtml ? composed.html : composed.text);
    const kind = isHtml ? "HTML" : "テキスト";
    return auto ? `自動判別した入力欄・${kind}（${auto.info.text}）` : `${tag}・${kind}`;
  }
  await field.click();
  await field.evaluate((el, html) => { el.innerHTML = html; }, composed.html);
  return "編集可能エリア";
}

/**
 * メルマガ作成画面を開く。
 * 設定の URL で開けなければ、管理画面のリンクをたどって探す。
 */
async function openComposer(page, cfg) {
  const hasSubject = async () => !!(await findSubject(page, cfg));

  await page.goto(cfg.composerUrl, { waitUntil: "domcontentloaded" }).catch(() => {});
  await page.waitForTimeout(1200);
  if (await hasSubject()) return { url: page.url(), how: "設定ファイルのURL" };

  console.log("· 設定のURLでは作成画面が開けなかったので、メニューから探します");
  const trails = [/メルマガ|メールマガジン|メール配信/, /新規|作成|書く|配信予約|新しい/];
  await page.goto(cfg.baseUrl, { waitUntil: "domcontentloaded" }).catch(() => {});
  for (const pattern of trails) {
    const link = page.getByRole("link", { name: pattern }).first();
    if (!(await link.count().catch(() => 0))) continue;
    await link.click({ timeout: 5000 }).catch(() => {});
    await page.waitForLoadState("domcontentloaded").catch(() => {});
    await page.waitForTimeout(1200);
    if (await hasSubject()) break;
  }
  if (await hasSubject()) {
    // 見つかったURLを控えておく（次回から設定に書ける）
    const dir = path.join(OUT_DIR, "inspect");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "found-composer-url.txt"), page.url() + "\n");
    return { url: page.url(), how: "メニューから自動で発見" };
  }
  throw new Error(
    "メルマガ作成画面を開けませんでした。\n" +
    "リザストの画面でメルマガ作成ページを開き、そのURLを教えてください（設定に書き込みます）。"
  );
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
  autoPick, findSubject, openComposer,
  capture, describeForm, firstVisible, byLabel, AUTH_FILE, OUT_DIR, CONFIG_FILE,
};

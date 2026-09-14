#!/usr/bin/env node
/**
 * メルマガ自動投稿 CLI
 *
 *   node mailmag/src/cli.js list                 原稿の一覧
 *   node mailmag/src/cli.js new --from-deck      スライドから原稿のたたき台を作る
 *   node mailmag/src/cli.js build                原稿を件名・本文に組み立てて out/ に出す
 *   node mailmag/src/cli.js login --headed       手動ログインしてセッションを保存する
 *   node mailmag/src/cli.js inspect              管理画面の入力欄を調べて out/inspect/ に出す
 *   node mailmag/src/cli.js post                 リザストに下書きとして保存する
 *
 * 共通オプション: --file <原稿.md> --headed --dry-run --keep-open --force
 */

const fs = require("fs");
const path = require("path");
const { pickDraft, listDrafts, markPosted, DRAFT_DIR } = require("./draft");
const { compose, writeOutput } = require("./compose");
const { deckToMarkdown } = require("./deckSource");
const rs = require("./reservestock");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "out");

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const [key, inline] = a.slice(2).split("=");
      const next = argv[i + 1];
      if (inline !== undefined) args[key] = inline;
      else if (next && !next.startsWith("--")) { args[key] = next; i++; }
      else args[key] = true;
    } else args._.push(a);
  }
  return args;
}

function requireDraft(args, { respectDate = true } = {}) {
  const draft = pickDraft({
    file: args.file,
    today: args.today,
    respectDate: respectDate && !args.force,
  });
  if (!draft) {
    const ready = listDrafts().filter((d) => d.status === "ready");
    throw new Error(
      `投稿できる原稿がありません。\n` +
      `${path.relative(process.cwd(), DRAFT_DIR)}/ に status: ready の .md を置くか、--file で指定してください。` +
      (ready.length
        ? `\n（予定日がまだ先の原稿が ${ready.length} 件あります。今すぐ投稿するなら --force）`
        : "")
    );
  }
  return draft;
}

// ---------- コマンド ----------

function cmdList() {
  const drafts = listDrafts();
  if (!drafts.length) return console.log("原稿がありません（mailmag/drafts/*.md）");
  for (const d of drafts) {
    console.log(`${d.status.padEnd(7)} ${String(d.date || "-").padEnd(12)} ${d.name}  「${d.subject}」`);
  }
}

function cmdNew(args) {
  const deck = args["from-deck"] === true || !args["from-deck"]
    ? path.join(ROOT, "..", "build_deck.js")
    : args["from-deck"];
  const result = deckToMarkdown(deck, { slides: args.slides, notes: !!args.notes });
  const date = args.date || new Date().toISOString().slice(0, 10);
  const slug = args.name || "from-deck";
  const file = path.join(DRAFT_DIR, `${date}-${slug}.md`);

  const front = [
    "---",
    `subject: ${result.title}`,
    `date: ${date}`,
    "status: draft   # 内容を整えたら ready に変える",
    `source: ${path.basename(deck)}（スライド ${result.usedSlides.join(",") || "全部"}）`,
    "---",
    "",
  ].join("\n");

  fs.mkdirSync(DRAFT_DIR, { recursive: true });
  fs.writeFileSync(file, front + result.markdown);
  console.log(`スライド ${result.slideCount} 枚から下書きを作りました: ${path.relative(process.cwd(), file)}`);
  console.log("そのままでは読み物になっていないので、本文を整えてから status: ready にしてください。");
}

function cmdBuild(args, { respectDate = false } = {}) {
  const draft = requireDraft(args, { respectDate });
  const composed = compose(draft);
  composed.format = args.format || "html";
  const files = writeOutput(composed, OUT_DIR, draft.name);
  console.log(`原稿    : ${path.relative(process.cwd(), draft.file)}`);
  console.log(`件名    : ${composed.subject}`);
  console.log(`本文HTML: ${path.relative(process.cwd(), files.html)}`);
  console.log(`本文TEXT: ${path.relative(process.cwd(), files.text)}`);
  return { draft, composed };
}

async function cmdLogin(args) {
  rs.loadDotEnv();
  const cfg = rs.loadConfig();
  const { browser, page } = await rs.launch({ headed: true });
  try {
    await page.goto(cfg.loginUrl, { waitUntil: "domcontentloaded" });
    if (args.manual) {
      console.log("ブラウザでログインを完了してください。完了したら Enter を押してください…");
      process.stdin.resume();
      await new Promise((resolve) => process.stdin.once("data", resolve));
      process.stdin.pause();
      fs.mkdirSync(path.dirname(rs.AUTH_FILE), { recursive: true });
      await page.context().storageState({ path: rs.AUTH_FILE });
      console.log(`セッションを保存しました: ${path.relative(process.cwd(), rs.AUTH_FILE)}`);
    } else {
      await rs.login(page, cfg, { force: true });
    }
  } finally {
    if (!args["keep-open"]) await browser.close();
  }
}

async function cmdInspect(args) {
  rs.loadDotEnv();
  const cfg = rs.loadConfig();
  const { browser, page } = await rs.launch({ headed: !!args.headed });
  try {
    await rs.login(page, cfg);
    const login = await rs.describeForm(page, "01-after-login");
    console.log(`ログイン後: ${login.info.url}`);

    await page.goto(cfg.composerUrl, { waitUntil: "domcontentloaded" }).catch((e) => {
      console.log(`! メルマガ作成画面を開けませんでした: ${e.message}`);
    });
    await page.waitForTimeout(2000);
    const composer = await rs.describeForm(page, "02-composer");
    const shots = await rs.capture(page, "02-composer");

    console.log(`作成画面  : ${composer.info.url}`);
    console.log(`入力欄    : ${composer.info.fields.length} 個 / iframe ${composer.info.frames.length} 個`);
    for (const f of composer.info.fields.slice(0, 40)) {
      console.log(`  - <${f.tag}${f.type ? " type=" + f.type : ""}> name="${f.name}" id="${f.id}" ${f.label ? `label="${f.label}"` : ""}`);
    }
    console.log(`ボタン    : ${composer.info.buttons.map((b) => b.text).filter(Boolean).join(" / ")}`);
    console.log(`詳細JSON  : ${path.relative(process.cwd(), composer.file)}`);
    console.log(`スクショ  : ${path.relative(process.cwd(), shots.shot)}`);
    console.log("\nこの結果を見て mailmag/config/reservestock.json のセレクタを合わせてください。");
  } finally {
    if (!args["keep-open"]) await browser.close();
  }
}

async function cmdPost(args) {
  rs.loadDotEnv();
  const { draft, composed } = cmdBuild(args, { respectDate: true });

  if (args["dry-run"]) {
    console.log("\n--dry-run のためブラウザ操作は行いません。out/ のプレビューを確認してください。");
    return;
  }

  const cfg = rs.loadConfig();
  const { browser, page } = await rs.launch({ headed: !!args.headed });
  try {
    await rs.login(page, cfg);
    await page.goto(cfg.composerUrl, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    const subjectField = (await rs.firstVisible(page, cfg.composer.subject)) ||
                         (await rs.byLabel(page, cfg.labels.subject));
    if (!subjectField) {
      throw new Error("件名の入力欄が見つかりません。`npm run mailmag:inspect` で確認してください。");
    }
    await subjectField.fill(composed.subject);
    console.log(`· 件名を入力: ${composed.subject}`);

    // 配信リストの指定（原稿の list: / 環境変数で指定されているときだけ）
    const listName = draft.meta.list || process.env.RESERVESTOCK_LIST;
    if (listName) {
      const select = await rs.firstVisible(page, cfg.composer.list, { timeout: 1500 });
      if (select) {
        await select.selectOption({ label: listName }).catch(async () => {
          await select.selectOption(listName).catch(() => {
            console.log(`! 配信リスト「${listName}」を選べませんでした（画面で確認してください）`);
          });
        });
        console.log(`· 配信リスト: ${listName}`);
      }
    }

    const how = await rs.fillBody(page, cfg, composed);
    console.log(`· 本文を入力（${how}）`);

    await rs.capture(page, "03-before-save");
    const label = await rs.saveDraft(page, cfg);
    const after = await rs.capture(page, "04-after-save");

    markPosted(draft, `下書き保存: ${label}`);
    console.log(`\n下書きとして保存しました（${label}）`);
    console.log(`確認用スクリーンショット: ${path.relative(process.cwd(), after.shot)}`);
    console.log("リザストの管理画面で内容を確認し、配信ボタンはご自身で押してください。");
  } finally {
    if (!args["keep-open"]) await browser.close();
  }
}

// ---------- エントリポイント ----------

const COMMANDS = {
  list: cmdList, new: cmdNew, build: cmdBuild,
  login: cmdLogin, inspect: cmdInspect, post: cmdPost,
};

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] || "list";
  const run = COMMANDS[command];
  if (!run) {
    console.error(`使い方: node mailmag/src/cli.js <${Object.keys(COMMANDS).join("|")}> [options]`);
    process.exit(1);
  }
  await run(args);
}

main().catch((err) => {
  console.error(`\n${err.message}`);
  process.exit(1);
});

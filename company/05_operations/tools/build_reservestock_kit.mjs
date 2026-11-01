// リザスト作業キット（スマホ用ページ）を生成する。
// LP本文は company/03_sales/リザスト貼付用_LP本文.md から読み込むので、
// 原稿を直したら、このスクリプトを実行し直すだけでページも最新になる。
//
//   node company/05_operations/tools/build_reservestock_kit.mjs
//
// 個人情報は扱わない。リザストには接続しない（APIなし・鍵なし）。
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, '../../03_sales/リザスト貼付用_LP本文.md'), 'utf8');
const out = join(here, 'reservestock_kit.html');

// ── LP本文を「ここから」「ここまで」の間で切り出し、■見出しごとに分ける
const lines = src.split('\n');
const start = lines.findIndex((l) => l.includes('ここから'));
const end = lines.findIndex((l) => l.includes('ここまで'));
const body = lines.slice(start + 1, end).join('\n').trim();

const sections = [];
let cur = { title: '冒頭（キャッチ・講座名）', text: [] };
for (const l of body.split('\n')) {
  if (l.startsWith('■ ')) {
    sections.push(cur);
    cur = { title: l.replace(/^■\s*/, ''), text: [l] };
  } else cur.text.push(l);
}
sections.push(cur);
const secs = sections.map((s) => ({ title: s.title, text: s.text.join('\n').trim() }));

// ── 太字にすると効く行（ハルのメモ）
const boldStart = lines.findIndex((l) => l.includes('太字」にすると効く行'));
const bold = [];
for (let i = boldStart + 1; i < lines.length; i++) {
  if (lines[i].startsWith('### ')) break;
  const m = lines[i].match(/^\d+\.\s*「(.+)」/);
  if (m) bold.push(m[1]);
}

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const data = JSON.stringify({ secs, full: body, bold }).replace(/</g, '\\u003c');

const html = `<title>リザスト作業キット</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap">
<style>
/* 1カラム・親指で押せる大きさ。上から「今やること → 貼る → 確かめる → 数字」の順 */
:root{
  --bg:#f3f6f3; --surface:#ffffff; --ink:#1f2a24; --muted:#5d6b63; --line:#d8e1da;
  --accent:#2f7a5b; --accent-ink:#ffffff; --soft:#e3efe8; --ok:#2f7a5b;
  --display:"Zen Maru Gothic","Hiragino Maru Gothic ProN",system-ui,sans-serif;
  --body:"Zen Kaku Gothic New","Hiragino Sans","Noto Sans JP",system-ui,sans-serif;
}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){
  --bg:#141a17; --surface:#1c2420; --ink:#e6ede8; --muted:#9fb0a6; --line:#2f3b35;
  --accent:#6cc39b; --accent-ink:#0f1a14; --soft:#22322a; --ok:#6cc39b; color-scheme:dark}}
:root[data-theme="dark"]{
  --bg:#141a17; --surface:#1c2420; --ink:#e6ede8; --muted:#9fb0a6; --line:#2f3b35;
  --accent:#6cc39b; --accent-ink:#0f1a14; --soft:#22322a; --ok:#6cc39b; color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:var(--body);font-size:16px;line-height:1.75;
  padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:20px 48px}
main{max-width:640px;margin:0 auto;display:flex;flex-direction:column;gap:28px}
h1,h2{font-family:var(--display);text-wrap:balance;margin:0;line-height:1.4}
h1{font-size:1.6rem}
h2{font-size:1.2rem;display:flex;align-items:baseline;gap:10px}
h2 .step{font-size:.8rem;color:var(--accent);letter-spacing:.08em;font-family:var(--body);font-weight:700}
p{margin:0}
.lead{color:var(--muted)}
section{display:flex;flex-direction:column;gap:12px}
.deadline{background:var(--soft);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:4px}
.deadline b{font-family:var(--display);font-size:1.25rem}
.deadline small{color:var(--muted)}
button{font:inherit;cursor:pointer;border-radius:12px;min-height:48px;padding:10px 16px}
button:focus-visible,summary:focus-visible,input:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.primary{background:var(--accent);color:var(--accent-ink);border:0;font-weight:700;width:100%}
.ghost{background:var(--surface);color:var(--accent);border:1px solid var(--line);font-weight:700}
.list{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:14px;background:var(--surface);overflow:hidden}
details{border-top:1px solid var(--line)}
details:first-child{border-top:0}
summary{list-style:none;display:flex;align-items:center;gap:12px;padding:12px 14px;min-height:56px}
summary::-webkit-details-marker{display:none}
summary .t{flex:1;min-width:0;font-weight:500}
summary .done{font-size:.75rem;color:var(--ok);font-weight:700;letter-spacing:.04em}
summary .ghost{min-height:40px;padding:6px 14px;font-size:.9rem}
details pre{margin:0;padding:0 14px 16px;white-space:pre-wrap;word-break:break-word;font-family:var(--body);font-size:.92rem;color:var(--muted);max-height:50vh;overflow:auto}
.check{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;border-top:1px solid var(--line)}
.check:first-child{border-top:0}
.check input{width:22px;height:22px;margin-top:3px;accent-color:var(--accent);flex:none}
.check label{min-width:0}
.check small{display:block;color:var(--muted);font-size:.85rem}
ol.bold{margin:0;padding:12px 14px 12px 36px;background:var(--surface);border:1px solid var(--line);border-radius:14px;display:flex;flex-direction:column;gap:6px}
.names{display:grid;gap:8px}
.name{display:flex;align-items:center;gap:10px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:8px 8px 8px 14px}
.name code{flex:1;min-width:0;font-family:var(--body);font-weight:700}
.name .ghost{min-height:40px;padding:6px 12px;font-size:.85rem}
.note{font-size:.85rem;color:var(--muted)}
.tag{display:inline-block;font-size:.75rem;font-weight:700;color:var(--accent);background:var(--soft);border-radius:6px;padding:0 6px;margin-right:4px}
.say{background:var(--surface);border:1px dashed var(--accent);border-radius:14px;padding:14px;font-size:.95rem}
#toast{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(20px + env(safe-area-inset-bottom,0px));background:var(--ink);color:var(--bg);padding:10px 18px;border-radius:999px;font-weight:700;opacity:0;transition:opacity .2s;pointer-events:none}
#toast.on{opacity:1}
#fallback{width:100%;min-height:140px;font:inherit;font-size:.85rem;border-radius:12px;border:1px solid var(--line);background:var(--surface);color:var(--ink);padding:10px}
@media (prefers-reduced-motion:reduce){#toast{transition:none}}
</style>

<main>
  <header style="display:flex;flex-direction:column;gap:10px">
    <h1>リザスト作業キット</h1>
    <p class="lead">スマホのリザストで作業するときに、横に開いておくページです。文章は長押しで選ばなくても、ボタンひとつでコピーできます。</p>
    <div class="deadline">
      <small>次の区切り（催促ではありません）</small>
      <b>11/15（日）までに、9期のイベントを作る</b>
      <small>11/16（月）募集開始・メルマガ1通目</small>
    </div>
  </header>

  <section>
    <h2><span class="step">STEP 1</span>イベント名をコピー</h2>
    <p class="note"><span class="tag">案</span>名前に「種類」と「期・日付」が入っていると、あとで申込数を数えるときに迷いません。</p>
    <div class="names">
      <div class="name"><code>【9期】スマイルおうち栄養士講座（2027年1月開講）</code><button class="ghost" data-copy="【9期】スマイルおうち栄養士講座（2027年1月開講）">コピー</button></div>
      <div class="name"><code>【説明会】11/20</code><button class="ghost" data-copy="【説明会】11/20">コピー</button></div>
    </div>
    <p class="note">説明会の日付は例です。開くときに日付だけ変えてください。【要確認】</p>
  </section>

  <section>
    <h2><span class="step">STEP 2</span>本文を貼る</h2>
    <p class="note">一度に全部貼れるなら上のボタン。スマホで長すぎて貼りにくいときは、見出しごとに分けて貼れます。貼った見出しには「貼った」印がつきます。</p>
    <button class="primary" id="copyAll">本文をまるごとコピー</button>
    <div class="list" id="secs"></div>
  </section>

  <section>
    <h2><span class="step">STEP 3</span>太字にすると効く行</h2>
    <p class="note">多くても10か所まで。つけすぎると、どれも目立たなくなります。</p>
    <ol class="bold" id="bold"></ol>
  </section>

  <section>
    <h2><span class="step">STEP 4</span>公開前に確かめること</h2>
    <div class="list" id="checks"></div>
    <p class="note">チェックはこのスマホの中だけに残ります。</p>
  </section>

  <section>
    <h2><span class="step">毎週</span>数字を伝える</h2>
    <p>金曜のふりかえりで、ハルが聞く数字はこの3つです。リザストの画面で見えている数をそのまま返すだけで足ります。</p>
    <div class="say">ハル、今週の数字：<br>9期 申込 ○人／説明会 申込 ○人／メルマガ読者 ○人</div>
    <button class="ghost" data-copy="ハル、今週の数字：9期 申込 人／説明会 申込 人／メルマガ読者 人">この文をコピー（Claudeアプリに貼る）</button>
    <p class="note">申込者の名前・メール・CSVは貼らないでください。数だけで足ります。</p>
  </section>
</main>
<div id="toast" role="status" aria-live="polite"></div>

<script>
const D = ${data};
const KEY = 'rsk-v1';
let st = {};
try { st = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { st = {}; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
const toast = (m) => { const t = document.getElementById('toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('on'), 1600); };
function fallback(text) {
  let ta = document.getElementById('fallback');
  if (!ta) { ta = document.createElement('textarea'); ta.id = 'fallback'; ta.readOnly = true; document.querySelector('main').prepend(ta); }
  ta.value = text; ta.focus(); ta.select();
  toast('選択しました。長押しでコピーしてください');
}
function copy(text, after) {
  const ok = () => { toast('コピーしました'); after && after(); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, () => fallback(text));
  else fallback(text);
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-copy]');
  if (b) { e.preventDefault(); copy(b.dataset.copy); }
});
document.getElementById('copyAll').addEventListener('click', () => copy(D.full));

const secs = document.getElementById('secs');
D.secs.forEach((s, i) => {
  const d = document.createElement('details');
  d.innerHTML = '<summary><span class="t"></span><span class="done" hidden>貼った</span><button class="ghost" type="button">コピー</button></summary><pre></pre>';
  d.querySelector('.t').textContent = s.title;
  d.querySelector('pre').textContent = s.text;
  const done = d.querySelector('.done');
  const mark = () => { done.hidden = !st['s' + i]; };
  mark();
  d.querySelector('button').addEventListener('click', (e) => { e.preventDefault(); copy(s.text, () => { st['s' + i] = 1; save(); mark(); }); });
  secs.append(d);
});

const bold = document.getElementById('bold');
D.bold.forEach((t) => { const li = document.createElement('li'); li.textContent = t; bold.append(li); });

const CHECKS = [
  ['申込ボタンが、カード決済（Stripe）と振込案内につながっている', ''],
  ['振込を選んだ方への案内文がある', '振込手数料はお客様のご負担、の一文'],
  ['申込後の自動返信メールの文面が入っている', '文面が必要なら「リョウ、自動返信の文面」と頼めます'],
  ['問い合わせはリザストの問い合わせフォームにつながっている', '10/9に確定済み'],
  ['定員10名・開講2027年1月の表記が合っている', '開講日 1/19 は仮置き'],
  ['スマホで頭から最後まで1回読んだ', '崩れはここでしか見つかりません'],
];
const checks = document.getElementById('checks');
CHECKS.forEach(([t, n], i) => {
  const row = document.createElement('div'); row.className = 'check';
  row.innerHTML = '<input type="checkbox" id="c' + i + '"><label for="c' + i + '"></label>';
  row.querySelector('label').textContent = t;
  if (n) { const s = document.createElement('small'); s.textContent = n; row.querySelector('label').append(s); }
  const cb = row.querySelector('input'); cb.checked = !!st['c' + i];
  cb.addEventListener('change', () => { st['c' + i] = cb.checked ? 1 : 0; save(); });
  checks.append(row);
});
</script>
`;
writeFileSync(out, html);
console.log('wrote', out, secs.length, 'sections,', bold.length, 'bold lines');

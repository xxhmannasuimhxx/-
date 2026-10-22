// 週次の数字（集計値のみ）を metrics.csv に追記し、kpi.md の表を書き換える。
// 個人情報は扱わない。名前・メール・電話番号らしき値は受け付けない。
//
//   node company/05_operations/tools/metrics.mjs add 週=2026-10-23 メルマガ読者=240 講座申込=1 ...
//   node company/05_operations/tools/metrics.mjs report   … kpi.md の表を再生成
//   node company/05_operations/tools/metrics.mjs check 2026-10-23 … その週の行があるか確認
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const shared = join(dirname(fileURLToPath(import.meta.url)), '../../_shared');
const csvPath = join(shared, 'metrics.csv');
const kpiPath = join(shared, 'kpi.md');
const START = '<!-- metrics:start -->';
const END = '<!-- metrics:end -->';

function load() {
  const [head, ...lines] = readFileSync(csvPath, 'utf8').trim().split('\n');
  const cols = head.split(',');
  const rows = lines.filter(Boolean).map((l) => {
    const v = l.split(',');
    return Object.fromEntries(cols.map((c, i) => [c, v[i] ?? '']));
  });
  return { cols, rows };
}

function save(cols, rows) {
  rows.sort((a, b) => a['週'].localeCompare(b['週']));
  const body = rows.map((r) => cols.map((c) => r[c] ?? '').join(','));
  writeFileSync(csvPath, [cols.join(','), ...body].join('\n') + '\n');
}

function add(args) {
  const { cols, rows } = load();
  const row = {};
  for (const a of args) {
    const i = a.indexOf('=');
    if (i < 0) throw new Error(`「項目=値」の形で渡してください: ${a}`);
    const k = a.slice(0, i), v = a.slice(i + 1).trim();
    if (!cols.includes(k)) throw new Error(`未知の項目です: ${k}（使える項目: ${cols.join(' ')}）`);
    if (/[,\n]/.test(v)) throw new Error(`値にカンマや改行は使えません: ${k}`);
    if (/@|\d{2,4}-\d{2,4}-\d{3,4}/.test(v) && k !== '週') throw new Error(`個人情報らしき値は記録しません: ${k}`);
    if (k !== '週' && k !== 'メモ' && v !== '' && !/^\d+(\.\d+)?$/.test(v)) throw new Error(`数字で入れてください: ${k}=${v}`);
    row[k] = v;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(row['週'] ?? '')) throw new Error('週=YYYY-MM-DD（その週の金曜）が必要です');
  const existing = rows.find((r) => r['週'] === row['週']);
  // 同じ週は上書きではなく、渡された項目だけ埋める（後から数字が届いても足せる）
  if (existing) Object.assign(existing, row);
  else rows.push(row);
  save(cols, rows);
  console.log(`記録しました: ${row['週']}`);
}

const pct = (a, b) => (a && b ? `${Math.round((a / b) * 1000) / 10}%` : '—');
const num = (v) => (v === '' || v === undefined ? null : Number(v));

function report() {
  const { rows } = load();
  const recent = rows.slice(-8);
  const show = (v) => (v === '' || v === undefined ? '' : v);
  const lines = [
    START,
    '<!-- この表は metrics.mjs report が自動生成します。手で編集しないでください -->',
    '',
    '| 週 | メルマガ | IG | 説明会申込 | 説明会参加 | 講座申込 | 入金額 | 個別相談 | 時間(講座/発信/事務/配信代行) | ワクワク |',
    '|---|---|---|---|---|---|---|---|---|---|',
    ...recent.map((r) =>
      `| ${r['週']} | ${show(r['メルマガ読者'])} | ${show(r['IGフォロワー'])} | ${show(r['説明会申込'])} | ${show(r['説明会参加'])} | ${show(r['講座申込'])} | ${show(r['入金額'])} | ${show(r['個別相談'])} | ${['時間_講座', '時間_発信', '時間_事務', '時間_配信代行'].map((k) => show(r[k]) || '-').join('/')} | ${show(r['ワクワク度'])} |`),
  ];
  if (!recent.length) lines.push('| （まだ記録がありません） | | | | | | | | | |');

  // 累計で見る転換率（週単位だと数が小さすぎてぶれるため）
  const sum = (k) => rows.reduce((s, r) => s + (num(r[k]) ?? 0), 0);
  const hours = (k) => sum(k);
  const latestList = [...rows].reverse().map((r) => num(r['メルマガ読者'])).find((v) => v !== null);
  lines.push(
    '',
    '**記録開始からの累計**',
    '',
    '| 指標 | 値 |',
    '|---|---|',
    `| 説明会 参加率（参加／申込） | ${pct(sum('説明会参加'), sum('説明会申込'))} |`,
    `| 講座申込 ／ 説明会参加 | ${pct(sum('講座申込'), sum('説明会参加'))} |`,
    `| 講座申込 ／ メルマガ読者（最新） | ${pct(sum('講座申込'), latestList)} |`,
    `| 入金額 合計 | ${sum('入金額').toLocaleString('ja-JP')}円 |`,
    `| 1時間あたり入金額（講座＋発信＋事務） | ${(() => { const h = hours('時間_講座') + hours('時間_発信') + hours('時間_事務'); return h ? `${Math.round(sum('入金額') / h).toLocaleString('ja-JP')}円` : '—'; })()} |`,
    `| 配信代行の時間 合計 | ${hours('時間_配信代行') || '—'} 時間 |`,
    '',
    END,
  );

  const kpi = readFileSync(kpiPath, 'utf8');
  const s = kpi.indexOf(START), e = kpi.indexOf(END);
  if (s < 0 || e < 0) throw new Error('kpi.md に metrics:start / metrics:end の目印がありません');
  writeFileSync(kpiPath, kpi.slice(0, s) + lines.join('\n') + kpi.slice(e + END.length));
  console.log(`kpi.md を更新しました（${rows.length}週分）`);
}

function check(week) {
  const { rows } = load();
  const r = rows.find((x) => x['週'] === week);
  if (!r) { console.log(`未記録: ${week} の行がありません`); process.exit(1); }
  const blank = Object.entries(r).filter(([k, v]) => k !== 'メモ' && v === '').map(([k]) => k);
  console.log(blank.length ? `記録あり（未入力: ${blank.join(' ')}）` : '記録あり（全項目入力済み）');
}

const [cmd, ...rest] = process.argv.slice(2);
try {
  if (cmd === 'add') add(rest);
  else if (cmd === 'report') report();
  else if (cmd === 'check') check(rest[0]);
  else console.log('使い方: add 項目=値 ... / report / check YYYY-MM-DD');
} catch (err) {
  console.error(`エラー: ${err.message}`);
  process.exit(1);
}

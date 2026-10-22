// 集計して、スプレッドシート用の .xlsx と週次分析レポートの下書きを書き出す。
//   node src/build.mjs --sample            … 架空データで試す（out/sample_* に出力）
//   node src/build.mjs [--week 2026-10-23] … 本番データ（data/）で作る
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readTable, weekOf, num } from './lib.mjs';
import { mailSends, weeklySeries, eventLatest, judgeMeasure, rate, fmtRate } from './calc.mjs';
import { writeXlsx } from './xlsx.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export function load(sample) {
  const dir = sample ? join(root, 'sample/data') : join(root, 'data');
  const t = (name) => readTable(join(dir, `${sample ? 'sample_' : ''}${name}.csv`));
  return {
    mail: t('メルマガ配信'), line: t('LINE友だち'), events: t('イベント'), note: t('note'), measures: t('施策'),
    // 本番の手入力は第1段階の metrics.csv をそのまま読む（二重管理しない）
    manual: sample ? t('週次手入力') : readTable(join(root, '../_shared/metrics.csv')),
  };
}

const KEYS = [
  ['メルマガ配信回数', 'n'], ['開封率', '%'], ['実質開封率', '%'], ['メルマガ読者', 'n'],
  ['LINE追加', 'n'], ['LINEブロック', 'n'], ['LINE純増', 'n'], ['LINE有効友だち', 'n'],
  ['IGフォロワー', 'n'], ['説明会申込', 'n'], ['説明会参加', 'n'], ['講座申込', 'n'], ['入金額', '円'],
  ['個別相談', 'n'], ['時間_講座', 'h'], ['時間_発信', 'h'], ['時間_事務', 'h'], ['時間_配信代行', 'h'], ['ワクワク度', 'n'],
];
const fmt = (v, u) => (v === null || v === undefined ? '—' : u === '%' ? `${(v * 100).toFixed(1)}%` : u === '円' ? `${Math.round(v).toLocaleString('ja-JP')}円` : `${Math.round(v * 10) / 10}`);

export function analyze(d, week) {
  const series = weeklySeries(d);
  const target = week ?? series.at(-1)?.週;
  const i = series.findIndex((r) => r.週 === target);
  const cur = series[i] ?? {}, prev = series[i - 1] ?? {}, last4 = series.slice(Math.max(0, i - 4), i);
  const avg = (k) => { const v = last4.map((r) => r[k]).filter((x) => x !== null && x !== undefined); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
  const events = eventLatest(d.events);
  const measures = d.measures.map((m) => ({ ...m, ...judgeMeasure(series, m) }));
  const hours = ['時間_講座', '時間_発信', '時間_事務'].reduce((s, k) => s + series.reduce((a, r) => a + (r[k] ?? 0), 0), 0);
  const paid = series.reduce((a, r) => a + (r.入金額 ?? 0), 0);
  const tot = (k) => series.reduce((a, r) => a + (r[k] ?? 0), 0);
  const funnel = {
    説明会参加率: rate(tot('説明会参加'), tot('説明会申込') || null),
    成約率: rate(tot('講座申込'), tot('説明会参加') || null),
    時間あたり入金額: hours ? paid / hours : null,
  };
  return { series, target, cur, prev, avg, events, measures, funnel, note: d.note, mail: mailSends(d.mail) };
}

export function report(a, { sample }) {
  const L = [];
  const banner = sample ? '> ⚠ **架空データです。** 実際の数字ではありません（試作・テスト用）。\n' : '';
  L.push(`# 週次分析 ${a.target}（土〜金）${sample ? '【架空データ】' : ''}`, '', banner);
  L.push('## 1. 事実（数字と出典のみ。解釈は書かない）', '');
  L.push('| 指標 | 今週 | 先週 | 直前4週平均 |', '|---|---|---|---|');
  for (const [k, u] of KEYS) L.push(`| ${k} | ${fmt(a.cur[k], u)} | ${fmt(a.prev[k], u)} | ${fmt(a.avg(k), u)} |`);
  L.push('', '**累計の転換**（週単位では数が小さすぎるため累計で見る）', '', '| 指標 | 値 |', '|---|---|');
  L.push(`| 説明会参加率（参加／申込） | ${fmtRate(a.funnel.説明会参加率)} |`, `| 成約率（講座申込／説明会参加） | ${fmtRate(a.funnel.成約率)} |`);
  L.push(`| 1時間あたり入金額（講座＋発信＋事務） | ${fmt(a.funnel.時間あたり入金額, '円')} |`);
  L.push('', '**イベント（リザスト・各イベントの最新の取得値）**', '', '| 開催日 | イベント | 種類 | 申込／定員 | 閲覧 | 閲覧あたり申込率 | 売上 |', '|---|---|---|---|---|---|---|');
  for (const e of a.events) L.push(`| ${e.開催日} | ${e.イベント名} | ${e.種類} | ${e.申込数 ?? '—'}/${e.定員 ?? '—'} | ${e.閲覧数 ?? '—'} | ${fmtRate(e.閲覧あたり申込率)} | ${fmt(e.売上, '円')} |`);
  const n = a.note.at(-1);
  if (n) L.push('', `**note**（${n.期間開始}〜${n.期間終了}）：インプレッション ${n.インプレッション}／PV ${n.PV}／スキ ${n.スキ}／記事 ${n.公開記事数}本`);
  L.push('', '**出典**：メルマガ＝リザスト配信履歴／LINE＝L Message 友だち数推移／イベント＝リザスト イベント一覧／手入力＝金曜 `/weekly`', '');

  L.push('## 2. 推測（AIが記入。必ず確度と根拠を付ける）', '', '| # | 推測 | 確度 | 根拠（事実欄のどこか） |', '|---|---|---|---|', '| 1 | 【AIが記入】 | | |', '');

  L.push('## 3. 未確認・データ不足（自動）', '');
  const miss = KEYS.filter(([k]) => a.cur[k] === null || a.cur[k] === undefined).map(([k]) => k);
  L.push(miss.length ? `- 今週の記録が無い項目：${miss.join('、')}` : '- 今週の記録が無い項目：なし');
  const small = [['説明会参加率', a.funnel.説明会参加率], ['成約率', a.funnel.成約率], ...a.events.map((e) => [`${e.イベント名} の閲覧あたり申込率`, e.閲覧あたり申込率])].filter(([, r]) => r?.small);
  if (small.length) L.push(`- 分母が30未満で参考値の率：${small.map(([k, r]) => `${k}（n=${r.n}）`).join('、')}`);
  L.push('- 開封率は、iPhoneのメールの仕組みで実際より高く出ることがある。クリック率は現在計測されていない', '');

  L.push('## 4. 施策の状況（自動判定）', '', '| 施策 | 指標 | 期間 | 判定 | 前 → 期間中 | 根拠 |', '|---|---|---|---|---|---|');
  for (const m of a.measures) L.push(`| ${m.施策ID} ${m.施策名} | ${m.指標} | ${m.開始日}〜${m.終了日} | **${m.判定}** | ${fmt(m.前, m.指標.includes('率') ? '%' : 'n')} → ${fmt(m.期間中, m.指標.includes('率') ? '%' : 'n')} | ${m.理由} |`);
  L.push('', '## 5. 来週の施策候補（最大3つ・案A/B＋推奨）', '', '【AIが記入】※ 不安を煽る訴求、受講生・卒業生への依頼（感想・紹介・口コミ）は候補にしない', '');
  return L.join('\n');
}

export function sheets(a, { sample }) {
  const tag = sample ? '【架空データ】' : '';
  const v = (x) => (x === null || x === undefined ? '' : x);
  const r = (x) => (x ? x.value : '');
  return [
    { name: 'はじめに', rows: [['集客・売上分析'], [`${tag}対象週：${a.target}（土〜金）`], ['数字の出どころ：リザスト（メルマガ・イベント）／L Message（LINE）／note／金曜 /weekly の手入力'], ['個人情報は含みません。率の分母が30未満のものは参考値です'], ...(sample ? [['⚠ このファイルは架空データです。実際の数字ではありません']] : [])] },
    { name: '週次', rows: [['週', ...KEYS.map(([k]) => k)], ...a.series.map((s) => [s.週, ...KEYS.map(([k]) => v(s[k]))])],
      formats: Object.fromEntries(KEYS.map(([, u], i) => [i + 1, u === '%' ? 2 : u === '円' ? 3 : 0]).filter(([, f]) => f)) },
    { name: 'メルマガ', rows: [['配信日時', '件名', '配信数', '到達数', 'ユニーク開封数', '開封率', '実質開封率', '延べ開封回数'],
      ...a.mail.map((m) => [m.配信日時, m.件名, v(m.配信数), v(m.到達数), v(m.ユニーク開封数), m.開封率 === null ? '' : m.開封率 / 100, m.実質開封率 === null ? '' : m.実質開封率 / 100, v(m.延べ開封回数)])], formats: { 5: 2, 6: 2 } },
    { name: 'イベント', rows: [['開催日', 'イベント名', '種類', '定員', '申込数', '閲覧数', '充足率', '閲覧あたり申込率', '売上'],
      ...a.events.map((e) => [e.開催日, e.イベント名, e.種類, v(e.定員), v(e.申込数), v(e.閲覧数), r(e.充足率), r(e.閲覧あたり申込率), v(e.売上)])], formats: { 6: 2, 7: 2, 8: 3 } },
    { name: 'note', rows: [['取得日', '期間開始', '期間終了', 'インプレッション', 'PV', 'スキ', '公開記事数'], ...a.note.map((n) => [n.取得日, n.期間開始, n.期間終了, num(n.インプレッション), num(n.PV), num(n.スキ), num(n.公開記事数)])] },
    { name: '施策', rows: [['施策ID', '施策名', '段', '指標', '仮説', '開始日', '終了日', '目標', '判定', '前', '期間中', '根拠', '学び'],
      ...a.measures.map((m) => [m.施策ID, m.施策名, m.段, m.指標, m.仮説, m.開始日, m.終了日, m.目標, m.判定, v(m.前), v(m.期間中), m.理由, m.学び])] },
    { name: '定義', rows: [['指標', '計算式'], ['開封率', 'ユニーク開封数 ÷ 到達数（週は到達数で重み付け）'], ['実質開封率', 'リザストの表示値の平均（分母が画面に無いため）'],
      ['LINE純増', '友だち追加数 − ブロック数'], ['充足率', '申込数 ÷ 定員'], ['閲覧あたり申込率', '申込数 ÷ イベントページの閲覧数'],
      ['成約率', '講座申込 ÷ 説明会参加（累計）'], ['1時間あたり入金額', '入金額 ÷（講座＋発信＋事務の時間）'], ['施策の判定', '期間中の平均と直前の同じ週数の平均を比べ、±10%以上で改善／悪化。各2週未満は判定不能']] },
  ];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const sample = args.includes('--sample');
  const wi = args.indexOf('--week');
  const week = wi >= 0 ? weekOf(args[wi + 1]) : undefined;
  const a = analyze(load(sample), week);
  if (!a.series.length) { console.error('データがありません。先に取り込んでください（sample なら node sample/generate.mjs）'); process.exit(1); }
  const outDir = join(root, sample ? 'out' : 'reports');
  mkdirSync(outDir, { recursive: true });
  const pre = sample ? 'sample_' : '';
  const xlsxPath = join(root, 'out', `${pre}集客売上_${a.target}.xlsx`);
  writeXlsx(xlsxPath, sheets(a, { sample }));
  const mdPath = join(outDir, `${pre}${a.target}_週次分析.md`);
  writeFileSync(mdPath, report(a, { sample }));
  console.log(`スプレッドシート: ${xlsxPath}\nレポート下書き: ${mdPath}`);
}

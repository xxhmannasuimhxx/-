// CSVを取り込む。どのツールのCSVかを見出しで判定し、許可リストの列だけを残して data/ に追記する。
//   node src/import.mjs <CSVファイル> [--dir data] [--as 種類]
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decode, parseCSV, readTable, writeTable, normDate, normDateTime, num, PII } from './lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SOURCES = JSON.parse(readFileSync(join(root, 'config/sources.json'), 'utf8'));
const TEXT_COLS = new Set(['件名', 'イベント名', '種類', 'イベントID', '施策ID', '施策名', '段', '指標', '仮説', '目標', '学び']);

export function detect(cols, as) {
  const names = Object.keys(SOURCES).filter((k) => !k.startsWith('_'));
  const score = (k) => Object.values(SOURCES[k].columns).filter((al) => al.some((a) => cols.includes(a))).length;
  const pick = as ?? names.map((k) => [k, score(k)]).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!pick || !SOURCES[pick]) throw new Error(`どのツールのCSVか判定できません（見出し: ${cols.join(' / ')}）`);
  const missing = SOURCES[pick].key.filter((k) => !SOURCES[pick].columns[k].some((a) => cols.includes(a)));
  if (missing.length) throw new Error(`「${pick}」として読むには列が足りません: ${missing.join(' ')}`);
  return pick;
}

// 生のCSV文字列 → 正規化した行。捨てた列名も返す（記録用。中身は返さない）
export function normalize(text, as) {
  const { cols, rows } = parseCSV(text);
  const kind = detect(cols, as);
  const spec = SOURCES[kind];
  const map = Object.fromEntries(Object.entries(spec.columns).map(([to, al]) => [to, al.find((a) => cols.includes(a))]));
  const used = new Set(Object.values(map).filter(Boolean));
  const dropped = cols.filter((c) => !used.has(c));
  const out = rows.map((r, i) => {
    const o = {};
    for (const [to, from] of Object.entries(map)) {
      let v = from ? r[from] : '';
      if (PII.test(v)) throw new Error(`${i + 2}行目「${to}」に個人情報らしき値があるため、取り込みを中止しました`);
      if (v !== '' && spec.dates.includes(to)) v = to === '配信日時' ? normDateTime(v) : normDate(v);
      else if (v !== '' && !TEXT_COLS.has(to)) v = String(num(v) ?? '');
      o[to] = v;
    }
    return o;
  });
  return { kind, rows: out, dropped };
}

// 既存データに追記（同じキーの行は新しい値で置き換え＝何度取り込んでも重複しない）
export function merge(dir, kind, rows) {
  const spec = SOURCES[kind];
  const path = join(dir, `${kind}.csv`);
  const key = (r) => spec.key.map((k) => r[k]).join('|');
  const all = new Map(readTable(path).map((r) => [key(r), r]));
  let added = 0;
  for (const r of rows) { if (!all.has(key(r))) added++; all.set(key(r), r); }
  const sorted = [...all.values()].sort((a, b) => key(a).localeCompare(key(b)));
  writeTable(path, Object.keys(spec.columns), sorted);
  return { path, added, total: sorted.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
  const dir = opt('--dir') ?? join(root, 'data');
  const as = opt('--as');
  try {
    if (!args[0]) throw new Error('使い方: node src/import.mjs <CSVファイル> [--dir data] [--as 種類]');
    const { kind, rows, dropped } = normalize(decode(readFileSync(args[0])), as);
    const r = merge(dir, kind, rows);
    console.log(`「${kind}」として${rows.length}行を読み込み、新規${r.added}行（合計${r.total}行）: ${r.path}`);
    if (dropped.length) console.log(`捨てた列（許可リスト外）: ${dropped.join(' / ')}`);
  } catch (e) { console.error(`エラー: ${e.message}`); process.exit(1); }
}

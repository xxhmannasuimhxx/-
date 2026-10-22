// 架空データの生成。実際の画面と同じ形・同じくらいの規模にしてあるが、数字はすべて架空。
// 乱数の種を固定しているので、何度実行しても同じデータになる（テストで使うため）。
//   node sample/generate.mjs
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeTable } from '../src/lib.mjs';
import { SOURCES } from '../src/import.mjs';

const out = join(dirname(fileURLToPath(import.meta.url)), 'data');

function rng(seed) { // mulberry32
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
let r;
const between = (a, b) => a + r() * (b - a);
const int = (a, b) => Math.floor(between(a, b + 1));
const day = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => new Date(d.getTime() + n * 86400000);

const START = new Date('2026-07-25T00:00:00Z'); // 土曜
const WEEKS = 12;                                 // → 2026-10-16（金）まで
const END = addDays(START, WEEKS * 7 - 1);
const CAMPAIGN = [addDays(START, 8 * 7), END];    // 架空の施策 M-001 の期間（最後の4週）

export function generate() {
  r = rng(20261022); // 呼ぶたびに同じ種から始める
  const mail = [], line = [], manual = [], events = [];
  let readers = 236, friends = 84, total = 88;
  for (let d = START; d <= END; d = addDays(d, 1)) {
    const dow = d.getUTCDay();
    if (dow === 2 || dow === 5) { // 火・金に配信
      readers += int(0, 1);
      const sent = readers, reach = Math.round(sent * between(0.975, 0.983));
      const open = between(40, 44);
      mail.push({ 配信日時: `${day(d)} 12:0${int(0, 5)}`, 件名: `【架空】サンプル配信 ${mail.length + 1}`, 配信数: sent, 到達数: reach,
        開封率: open.toFixed(2), 実質開封率: (open * between(1.1, 1.15)).toFixed(2), 延べ開封回数: Math.round(reach * open / 100 * between(1.4, 1.6)) });
    }
    const inCampaign = d >= CAMPAIGN[0] && d <= CAMPAIGN[1];
    const add = r() < (inCampaign ? 0.45 : 0.15) ? int(1, 2) : 0;
    const block = r() < 0.05 ? 1 : 0;
    friends += add - block; total += add;
    line.push({ 日付: day(d), 友だち追加数: add, ブロック数: block, 有効友だち数: friends, 友だち追加総数: total });
    if (dow === 5) {
      const w = manual.length;
      manual.push({ 週: day(d), メルマガ読者: readers, IGフォロワー: w % 4 === 3 ? '' : 800 + w * 3, // ときどき未記録（欠損のテスト）
        説明会申込: w === 5 ? 14 : '', 説明会参加: w === 6 ? 11 : '', 講座申込: w === 8 ? 4 : w >= 10 ? 1 : '',
        入金額: w === 8 ? 34320 : w >= 10 ? 148000 : '', 個別相談: int(0, 2),
        時間_講座: int(2, 6), 時間_発信: int(2, 5), 時間_事務: int(1, 4), 時間_配信代行: int(4, 10), ワクワク度: int(3, 4) });
    }
  }
  const asOf = day(END);
  const ev = (id, date, name, kind, cap, apply, views, price) => events.push({ イベントID: id, 取得日: asOf, 開催日: date, イベント名: `【架空】${name}`, 種類: kind, 定員: cap, 申込数: apply, 閲覧数: views, 売上: apply * price });
  ev('S-01', '2026-08-03', 'カフェ 8月', 'カフェ', 6, 1, 6, 1500);
  ev('S-02', '2026-08-29', '無料講座 秋の不調', '無料講座', 20, 14, 61, 0);
  ev('S-03', '2026-09-07', 'カフェ 9月', 'カフェ', 6, 0, 3, 1500);
  ev('S-04', '2026-09-19', '単発講座 秋の朝ごはん', '単発講座', 10, 4, 44, 8580);
  ev('S-05', '2026-10-05', 'カフェ 10月', 'カフェ', 6, 2, 11, 1500);
  ev('S-06', '2026-12-05', '本講座（サンプル期）', '本講座', 10, 3, 52, 148000);
  const measures = [
    { 施策ID: 'M-001', 施策名: '【架空】イベント告知をLINEでも送る', 段: 'リスト', 指標: 'LINE追加', 仮説: 'メルマガを読まない層にLINEで届く', 開始日: day(CAMPAIGN[0]), 終了日: day(CAMPAIGN[1]), 目標: '週の追加 +2', 学び: '' },
    { 施策ID: 'M-002', 施策名: '【架空】件名に問いかけを入れる', 段: '配信', 指標: '実質開封率', 仮説: '問いかけの件名は開かれやすい', 開始日: day(addDays(END, -6)), 終了日: day(END), 目標: '+3ポイント', 学び: '' },
  ];
  return { mail, line, manual, events, measures };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mkdirSync(out, { recursive: true });
  const g = generate();
  writeTable(join(out, 'sample_メルマガ配信.csv'), Object.keys(SOURCES['メルマガ配信'].columns), g.mail);
  writeTable(join(out, 'sample_LINE友だち.csv'), Object.keys(SOURCES['LINE友だち'].columns), g.line);
  writeTable(join(out, 'sample_イベント.csv'), Object.keys(SOURCES['イベント'].columns), g.events);
  writeTable(join(out, 'sample_施策.csv'), Object.keys(SOURCES['施策'].columns), g.measures);
  writeTable(join(out, 'sample_note.csv'), Object.keys(SOURCES.note.columns), [
    { 取得日: '2026-09-24', 期間開始: '2026-08-28', 期間終了: '2026-09-24', インプレッション: 180, PV: 9, スキ: 2, 公開記事数: 1 },
    { 取得日: '2026-10-16', 期間開始: '2026-09-19', 期間終了: '2026-10-16', インプレッション: 230, PV: 12, スキ: 5, 公開記事数: 2 }]);
  writeTable(join(out, 'sample_週次手入力.csv'), Object.keys(g.manual[0]), g.manual);
  console.log(`架空データを書き出しました: ${out}（メルマガ${g.mail.length}通・LINE${g.line.length}日・イベント${g.events.length}件・施策${g.measures.length}件）`);
}

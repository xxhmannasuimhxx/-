import { test } from 'node:test';
import assert from 'node:assert/strict';
import { weekOf, num, parseCSV, decode, normDateTime } from '../src/lib.mjs';
import { rate, fmtRate, mailWeekly, lineWeekly, eventLatest, judgeMeasure, weeklySeries } from '../src/calc.mjs';

test('週は土曜〜金曜。金曜の日付で表す', () => {
  assert.equal(weekOf('2026-10-23'), '2026-10-23'); // 金
  assert.equal(weekOf('2026-10-24'), '2026-10-30'); // 土 → 翌週
  assert.equal(weekOf('2026-10-18'), '2026-10-23'); // 日
  assert.equal(weekOf('2026/10/20 15:25'), '2026-10-23');
});

test('画面の表記から数字を取り出す。空・「---」は記録なし（0ではない）', () => {
  assert.equal(num('1,500円'), 1500);
  assert.equal(num('97.9%'), 97.9);
  assert.equal(num('241通'), 241);
  assert.equal(num('---'), null);
  assert.equal(num(''), null);
  assert.equal(num('0'), 0);
  assert.throws(() => num('たくさん'));
});

test('日時の表記ゆれをそろえる', () => {
  assert.equal(normDateTime('2026/10/ 9 12:02'), '2026-10-09 12:02');
  assert.equal(normDateTime('2026年10月22日 (木)'), '2026-10-22');
});

test('率：分母0は計算しない。分母30未満は参考値', () => {
  assert.equal(rate(3, 0), null);
  assert.equal(rate(null, 10), null);
  assert.deepEqual(rate(5, 10), { value: 0.5, n: 10, small: true });
  assert.equal(fmtRate(rate(5, 10)), '50.0%（参考値 n=10）');
  assert.equal(fmtRate(rate(99, 236)), '41.9%');
});

test('メルマガ：開封率は到達数で重み付けした週平均（実際の画面の値で検算）', () => {
  // #150（10/20）236通×41.95%＝99人、#149（10/15）236通×41.53%＝98人 → 同じ週ではない
  const rows = [
    { 配信日時: '2026-10-20 15:25', 件名: 'a', 配信数: '241', 到達数: '236', 開封率: '41.95', 実質開封率: '47.37' },
    { 配信日時: '2026-10-22 12:00', 件名: 'b', 配信数: '241', 到達数: '', 開封率: '', 実質開封率: '' }, // 予約中（未配信）
  ];
  const w = mailWeekly(rows)['2026-10-23'];
  assert.equal(w.メルマガ配信回数, 2);
  assert.equal(Math.round(w.開封率 * 236), 99);
  assert.ok(Math.abs(w.実質開封率 - 0.4737) < 1e-9);
});

test('LINE：週の追加・ブロック・純増と、週末時点の有効友だち数', () => {
  const rows = [
    { 日付: '2026-10-17', 友だち追加数: '2', ブロック数: '0', 有効友だち数: '95' },
    { 日付: '2026-10-22', 友だち追加数: '1', ブロック数: '1', 有効友だち数: '95' },
    { 日付: '2026-10-21', 友だち追加数: '0', ブロック数: '0', 有効友だち数: '95' },
  ];
  const w = lineWeekly(rows)['2026-10-23'];
  assert.deepEqual([w.LINE追加, w.LINEブロック, w.LINE純増, w.LINE有効友だち], [3, 1, 2, 95]);
});

test('イベント：同じイベントは最新の取得日の値を使う', () => {
  const ev = eventLatest([
    { イベントID: 'E1', 取得日: '2026-10-16', 開催日: '2026-10-26', 定員: '6', 申込数: '0', 閲覧数: '2' },
    { イベントID: 'E1', 取得日: '2026-10-22', 開催日: '2026-10-26', 定員: '6', 申込数: '1', 閲覧数: '5' },
  ]);
  assert.equal(ev.length, 1);
  assert.equal(ev[0].申込数, 1);
  assert.equal(fmtRate(ev[0].閲覧あたり申込率), '20.0%（参考値 n=5）');
});

test('週次一覧：記録の無い週・項目は null のまま（0で埋めない）', () => {
  const s = weeklySeries({ manual: [{ 週: '2026-10-23', 講座申込: '', 入金額: '0' }] });
  assert.equal(s[0].講座申込, null);
  assert.equal(s[0].入金額, 0);
});

const series = (vals, key = 'LINE追加') => vals.map((v, i) => ({ 週: weekOf(new Date(Date.UTC(2026, 8, 4 + i * 7)).toISOString()), [key]: v }));

test('施策の判定：改善／変化なし／悪化／判定不能', () => {
  const s = series([1, 1, 1, 1, 3, 3, 3, 3]); // 9/4〜10/23 の8週
  assert.equal(judgeMeasure(s, { 指標: 'LINE追加', 開始日: '2026-09-26', 終了日: '2026-10-23' }).判定, '改善');
  assert.equal(judgeMeasure(series([2, 2, 2, 2, 2.1, 2.1, 2.1, 2.1]), { 指標: 'LINE追加', 開始日: '2026-09-26', 終了日: '2026-10-23' }).判定, '変化なし');
  assert.equal(judgeMeasure(s, { 指標: 'LINE追加', 開始日: '2026-10-17', 終了日: '2026-10-23' }).判定, '判定不能');
  // 減るほうが良い指標は向きが逆
  assert.equal(judgeMeasure(series([1, 1, 1, 1, 3, 3, 3, 3], 'LINEブロック'), { 指標: 'LINEブロック', 開始日: '2026-09-26', 終了日: '2026-10-23' }).判定, '悪化');
  // 記録の欠けた週は数えない
  assert.equal(judgeMeasure(series([null, null, null, 1, 3, 3, 3, 3]), { 指標: 'LINE追加', 開始日: '2026-09-26', 終了日: '2026-10-23' }).判定, '判定不能');
});

test('CSV：引用符・改行・Shift_JIS', () => {
  const { rows } = parseCSV('件名,配信数\n"「a,b」と""言われて""",241\r\n');
  assert.equal(rows[0].件名, '「a,b」と"言われて"');
  const sjis = Buffer.from([0x93, 0xfa, 0x95, 0x74, 0x0a, 0x31]); // 「日付\n1」
  assert.equal(decode(sjis), '日付\n1');
});

test('個人情報の検出：メール・電話は捕まえ、小数・日付・金額には反応しない', async () => {
  const { PII } = await import('../src/lib.mjs');
  for (const v of ['test@example.com', '090-1234-5678', '09012345678', '03-1234-5678']) assert.match(v, PII, v);
  for (const v of ['0.41416309012875535', '2026-10-22', '148,000', '20261022', '@']) assert.doesNotMatch(v, PII, v);
});

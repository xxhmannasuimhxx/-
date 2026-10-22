import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { normalize, merge } from '../src/import.mjs';

test('L Message の見出しを判定し、許可リストの列だけ残す（前日比・未知の列は捨てる）', () => {
  const csv = '日付,友だち追加数,ブロック数,前日比,有効友だち数,友だち追加総数,表示名\n2026年10月22日 (木),0,0,0,93,98,\n';
  const r = normalize(csv);
  assert.equal(r.kind, 'LINE友だち');
  assert.deepEqual(r.rows[0], { 日付: '2026-10-22', 友だち追加数: '0', ブロック数: '0', 有効友だち数: '93', 友だち追加総数: '98' });
  assert.deepEqual(r.dropped, ['前日比', '表示名']);
});

test('許可した列に個人情報らしき値があれば、取り込みを止める', () => {
  assert.throws(() => normalize('配信日時,件名,配信数\n2026/10/20 15:25,test@example.com,241\n'), /個人情報/);
  assert.throws(() => normalize('配信日時,件名,配信数\n2026/10/20 15:25,090-1234-5678,241\n'), /個人情報/);
});

test('画面の表記（％・通・---）を数字にそろえる', () => {
  const r = normalize('配信日時,件名,配信数,到達数,開封率,実質開封率\n2026/10/ 9 12:02,#147,240通,235,40.85%,---\n');
  assert.deepEqual(r.rows[0], { 配信日時: '2026-10-09 12:02', 件名: '#147', 配信数: '240', 到達数: '235', 開封率: '40.85', 実質開封率: '', 延べ開封回数: '' });
});

test('判定できない・必須列が無いCSVは取り込まない', () => {
  assert.throws(() => normalize('氏名,メール\nA,a@b\n'), /判定できません|足りません/);
});

test('同じ行を2回取り込んでも重複しない', () => {
  const dir = mkdtempSync(join(tmpdir(), 'an-'));
  const { kind, rows } = normalize('日付,友だち追加数,ブロック数,有効友だち数\n2026/10/22,0,0,93\n');
  merge(dir, kind, rows);
  const r = merge(dir, kind, rows);
  assert.equal(r.added, 0);
  assert.equal(r.total, 1);
  assert.equal(readFileSync(join(dir, 'LINE友だち.csv'), 'utf8').trim().split('\n').length, 2);
});

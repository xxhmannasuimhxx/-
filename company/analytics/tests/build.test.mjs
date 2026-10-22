import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generate } from '../sample/generate.mjs';
import { analyze, report, sheets } from '../src/build.mjs';
import { writeXlsx } from '../src/xlsx.mjs';
import { PII } from '../src/lib.mjs';

const g = generate();
const a = analyze({ mail: g.mail.map(s), line: g.line.map(s), manual: g.manual.map(s), events: g.events.map(s), measures: g.measures, note: [] });
function s(o) { return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v)])); }

test('架空データは毎回同じになる', () => {
  assert.deepEqual(generate(), g);
});

test('架空データのレポートには「架空データ」と明記される', () => {
  const md = report(a, { sample: true });
  assert.match(md.split('\n')[0], /架空データ/);
  assert.match(md, /実際の数字ではありません/);
});

test('レポートは「事実」「推測」「未確認」の欄に分かれ、事実欄に因果の言葉が入らない', () => {
  const md = report(a, { sample: true });
  const fact = md.slice(md.indexOf('## 1. 事実'), md.indexOf('## 2. 推測'));
  assert.ok(md.includes('## 2. 推測') && md.includes('## 3. 未確認'));
  assert.doesNotMatch(fact, /ため、|影響で|のせいで|原因/);
});

test('架空の施策：LINE告知（M-001）は改善、期間1週の M-002 は判定不能', () => {
  const m = Object.fromEntries(a.measures.map((x) => [x.施策ID, x.判定]));
  assert.deepEqual(m, { 'M-001': '改善', 'M-002': '判定不能' });
});

test('出力に個人情報らしき値が含まれない', () => {
  const dir = mkdtempSync(join(tmpdir(), 'an-'));
  writeXlsx(join(dir, 't.xlsx'), sheets(a, { sample: true }));
  assert.doesNotMatch(report(a, { sample: true }), PII);
  assert.doesNotMatch(readFileSync(join(dir, 't.xlsx')).toString('utf8'), PII);
});

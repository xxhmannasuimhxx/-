// CSVの読み書き・週の判定など、どのファイルからも使う小さな道具。
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

export function decode(buf) {
  // リザスト等のCSVは Shift_JIS のことがある。UTF-8として読めなければ Shift_JIS とみなす
  let text;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(buf); }
  catch { text = new TextDecoder('shift_jis').decode(buf); }
  return text.replace(/^﻿/, '');
}

export function parseCSV(text) {
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((v) => v !== '')) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((v) => v !== '')) rows.push(row);
  if (!rows.length) return { cols: [], rows: [] };
  const cols = rows[0].map((h) => h.trim());
  return { cols, rows: rows.slice(1).map((r) => Object.fromEntries(cols.map((c, i) => [c, (r[i] ?? '').trim()]))) };
}

const esc = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v ?? ''));
export const toCSV = (cols, rows) => [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c] ?? '')).join(','))].join('\n') + '\n';

export function readTable(path) {
  if (!existsSync(path)) return [];
  return parseCSV(decode(readFileSync(path))).rows;
}
export const writeTable = (path, cols, rows) => writeFileSync(path, toCSV(cols, rows));

// 週＝土曜〜金曜。その週の金曜日（YYYY-MM-DD）で表す（第1段階の metrics.csv と同じ基準）
export function weekOf(date) {
  const d = new Date(`${String(date).slice(0, 10).replace(/\//g, '-')}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) throw new Error(`日付として読めません: ${date}`);
  d.setUTCDate(d.getUTCDate() + ((5 - d.getUTCDay() + 7) % 7));
  return d.toISOString().slice(0, 10);
}

export function normDate(v) {
  const m = String(v).match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  if (!m) throw new Error(`日付として読めません: ${v}`);
  return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
}

export function normDateTime(v) {
  const t = String(v).match(/(\d{1,2}):(\d{2})/);
  return normDate(v) + (t ? ` ${t[1].padStart(2, '0')}:${t[2]}` : '');
}

// 「1,500円」「97.9%」「240通」などから数字だけ取り出す。空・「---」・「-」は null（＝記録なし。0とは区別する）
export function num(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).replace(/[,，円通名回件%％\s]/g, '');
  if (s === '' || /^-+$/.test(s)) return null;
  const n = Number(s);
  if (Number.isNaN(n)) throw new Error(`数字として読めません: ${v}`);
  return n;
}

// 個人情報らしき値（メールアドレス・電話番号）。小数や日付の一部に反応しないよう、前後が数字・小数点でないことを条件にする
export const PII = /[\w.+-]+@[\w-]+\.[\w.]+|(?<![\d.])0\d{1,4}-\d{1,4}-\d{3,4}(?![\d])|(?<![\d.])0[789]0\d{8}(?![\d.])/;

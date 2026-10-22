// 計算。すべて純粋な関数（ファイルを読まない）。計算式の定義は docs/データ定義書.md
import { weekOf, num } from './lib.mjs';

export const MIN_N = 30; // 分母がこれ未満の率は「参考値」

export function rate(numer, denom) {
  if (numer === null || denom === null || !denom) return null;
  return { value: numer / denom, n: denom, small: denom < MIN_N };
}
export const fmtRate = (r) => (r ? `${(Math.round(r.value * 1000) / 10).toFixed(1)}%${r.small ? `（参考値 n=${r.n}）` : ''}` : '—');

// メルマガ：1配信ごと
export function mailSends(rows) {
  return rows.map((r) => {
    const 到達数 = num(r['到達数']) ?? num(r['配信数']);
    const 開封率 = num(r['開封率']);
    return {
      週: weekOf(r['配信日時']), 配信日時: r['配信日時'], 件名: r['件名'],
      配信数: num(r['配信数']), 到達数,
      ユニーク開封数: 開封率 === null || 到達数 === null ? null : Math.round((到達数 * 開封率) / 100),
      開封率, 実質開封率: num(r['実質開封率']), 延べ開封回数: num(r['延べ開封回数']),
    };
  });
}

// メルマガ：週ごと（開封率は到達数で重み付け。実質開封率は分母が画面に無いため単純平均）
export function mailWeekly(rows) {
  const out = {};
  for (const s of mailSends(rows)) {
    const w = (out[s.週] ??= { 配信回数: 0, 到達: 0, 開封: 0, 実質: [], 配信数: null });
    w.配信回数++;
    if (s.到達数 !== null && s.ユニーク開封数 !== null) { w.到達 += s.到達数; w.開封 += s.ユニーク開封数; }
    if (s.実質開封率 !== null) w.実質.push(s.実質開封率);
    w.配信数 = s.配信数 ?? w.配信数;
  }
  return Object.fromEntries(Object.entries(out).map(([k, w]) => [k, {
    メルマガ配信回数: w.配信回数,
    メルマガ配信数: w.配信数,
    開封率: w.到達 ? w.開封 / w.到達 : null,
    実質開封率: w.実質.length ? w.実質.reduce((a, b) => a + b, 0) / w.実質.length / 100 : null,
  }]));
}

// LINE（L Message の友だち数推移）：日別 → 週ごと
export function lineWeekly(rows) {
  const out = {};
  const sorted = [...rows].sort((a, b) => a['日付'].localeCompare(b['日付']));
  for (const r of sorted) {
    const w = (out[weekOf(r['日付'])] ??= { LINE追加: 0, LINEブロック: 0, LINE有効友だち: null, 日数: 0 });
    w.LINE追加 += num(r['友だち追加数']) ?? 0;
    w.LINEブロック += num(r['ブロック数']) ?? 0;
    w.LINE有効友だち = num(r['有効友だち数']) ?? w.LINE有効友だち; // 週の最後の日の値
    w.日数++;
  }
  for (const w of Object.values(out)) w.LINE純増 = w.LINE追加 - w.LINEブロック;
  return out;
}

// イベント：取得日ごとの記録から、イベントごとの最新を取り出す
export function eventLatest(rows) {
  const latest = {};
  for (const r of rows) {
    const id = r['イベントID'];
    if (!latest[id] || r['取得日'] > latest[id]['取得日']) latest[id] = r;
  }
  return Object.values(latest).sort((a, b) => a['開催日'].localeCompare(b['開催日'])).map((r) => {
    const 申込数 = num(r['申込数']), 定員 = num(r['定員']), 閲覧数 = num(r['閲覧数']);
    return {
      イベントID: r['イベントID'], 開催日: r['開催日'], イベント名: r['イベント名'], 種類: r['種類'],
      定員, 申込数, 閲覧数, 売上: num(r['売上']),
      充足率: rate(申込数, 定員), 閲覧あたり申込率: rate(申込数, 閲覧数),
    };
  });
}

// 週次の一覧（すべての出どころを週でまとめる）。記録が無い項目は null のまま
export function weeklySeries({ mail = [], line = [], manual = [] }) {
  const m = mailWeekly(mail), l = lineWeekly(line);
  const man = Object.fromEntries(manual.map((r) => [r['週'], r]));
  const weeks = [...new Set([...Object.keys(m), ...Object.keys(l), ...Object.keys(man)])].sort();
  return weeks.map((週) => {
    const x = man[週] ?? {};
    const pick = (k) => num(x[k]);
    return {
      週, ...(m[週] ?? {}), ...(l[週] ?? {}),
      メルマガ読者: pick('メルマガ読者'), IGフォロワー: pick('IGフォロワー'),
      説明会申込: pick('説明会申込'), 説明会参加: pick('説明会参加'), 講座申込: pick('講座申込'),
      入金額: pick('入金額'), 個別相談: pick('個別相談'),
      時間_講座: pick('時間_講座'), 時間_発信: pick('時間_発信'), 時間_事務: pick('時間_事務'), 時間_配信代行: pick('時間_配信代行'),
      ワクワク度: pick('ワクワク度'),
    };
  });
}

// 施策の判定：施策期間の平均 と 直前の同じ週数の平均 を比べる
export const THRESHOLD = 0.1; // ±10%未満は「変化なし」
export const LOWER_IS_BETTER = new Set(['LINEブロック', '時間_事務', '時間_配信代行']); // 減るほうが良い指標
export function judgeMeasure(series, { 指標, 開始日, 終了日 }) {
  const s = weekOf(開始日), e = weekOf(終了日);
  const idx = series.map((r) => r.週);
  const during = series.filter((r) => r.週 >= s && r.週 <= e);
  const len = during.length || 1;
  const startIdx = idx.findIndex((w) => w >= s);
  const before = startIdx < 0 ? [] : series.slice(Math.max(0, startIdx - len), startIdx);
  const vals = (arr) => arr.map((r) => r[指標]).filter((v) => v !== null && v !== undefined);
  const a = vals(before), b = vals(during);
  const avg = (v) => v.reduce((x, y) => x + y, 0) / v.length;
  if (a.length < 2 || b.length < 2) return { 判定: '判定不能', 理由: `記録のある週が足りません（前${a.length}週・期間中${b.length}週。各2週以上必要）`, 前: a.length ? avg(a) : null, 期間中: b.length ? avg(b) : null };
  const 前 = avg(a), 期間中 = avg(b);
  const 変化率 = 前 === 0 ? null : (期間中 - 前) / 前;
  const dir = LOWER_IS_BETTER.has(指標) ? -1 : 1;
  const 判定 = 変化率 === null ? (期間中 > 0 ? (dir > 0 ? '改善' : '悪化') : '変化なし')
    : 変化率 * dir >= THRESHOLD ? '改善' : 変化率 * dir <= -THRESHOLD ? '悪化' : '変化なし';
  return { 判定, 理由: `前${a.length}週平均 → 期間中${b.length}週平均`, 前, 期間中, 変化率 };
}

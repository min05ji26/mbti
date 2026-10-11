#!/usr/bin/env node
// 매일 돌리는 지표 리포트: Cloudflare Analytics Engine(mbti_events)에서 이벤트를 받아
// metrics/events.jsonl 에 누적(원본 보관 — Cloudflare는 3개월만 보관하므로) 하고,
// metrics/daily.csv · metrics/SUMMARY.md 를 새로 만든다.
//
// 필요한 값 (.env):
//   CLOUDFLARE_ACCOUNT_ID=...
//   CLOUDFLARE_API_TOKEN=...   (권한: Account → Account Analytics → Read)
// 실행: node scripts/metrics.mjs

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'metrics');
const EVENTS = join(OUT, 'events.jsonl');
const DATASET = 'mbti_events';
const KST = 9 * 3600 * 1000;
// 앱(src/track.ts)이 보내는 이벤트 종류
// --include-test 를 붙이면 부하 테스트 데이터(loadtest-)도 포함해서 집계 (테스트 결과 확인용)
const INCLUDE_TEST = process.argv.includes('--include-test');
// 탭을 켜두고 방치하거나 비정상 값이 와도 평균이 튀지 않게 세션당 체류시간 상한 (30분)
const DWELL_CAP = 1800;
const ROW_LIMIT = 100000;
const KNOWN = new Set(['visit', 'screen', 'share', 'save', 'invite_popup', 'map_click', 'dwell']);

function loadEnv() {
  const env = { ...process.env };
  const p = join(ROOT, '.env');
  if (existsSync(p)) {
    for (const line of readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
  return env;
}

async function cfSql(env, sql) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/analytics_engine/sql`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}` },
    body: sql,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Analytics Engine SQL ${res.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text).data ?? [];
}

// Cloudflare Web Analytics(대시보드에서 켜는 방문자 통계) — 켜져 있지 않으면 조용히 건너뜀
async function webAnalytics(env, sinceDate) {
  const query = `query($acc: string!, $since: Date!) { viewer { accounts(filter: { accountTag: $acc }) {
    rumPageloadEventsAdaptiveGroups(limit: 1000, filter: { date_geq: $since }) {
      count sum { visits } dimensions { date requestHost }
    } } } }`;
  try {
    const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, 'content-type': 'application/json' },
      body: JSON.stringify({ query, variables: { acc: env.CLOUDFLARE_ACCOUNT_ID, since: sinceDate } }),
    });
    const json = await res.json();
    if (json.errors?.length) return { error: json.errors[0].message, rows: [] };
    const groups = json.data?.viewer?.accounts?.[0]?.rumPageloadEventsAdaptiveGroups ?? [];
    return { rows: groups.filter((g) => /myanimaltest|mbti/.test(g.dimensions.requestHost)) };
  } catch (e) {
    return { error: String(e), rows: [] };
  }
}

function readEvents() {
  if (!existsSync(EVENTS)) return [];
  return readFileSync(EVENTS, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
}

const kstDay = (ts) => new Date(Date.parse(ts.replace(' ', 'T') + 'Z') + KST).toISOString().slice(0, 10);
const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : '-');
const fmtSec = (s) => (s >= 60 ? `${Math.floor(s / 60)}분 ${Math.round(s % 60)}초` : `${Math.round(s)}초`);
const median = (arr) => {
  if (!arr.length) return 0;
  const a = [...arr].sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};

function stats(events) {
  const sessions = new Map();
  const s = (id) => {
    if (!sessions.has(id)) sessions.set(id, { quiz: false, result: false, kept: false, dwell: 0 });
    return sessions.get(id);
  };
  const c = { visits: 0, shareTry: 0, shared: 0, saveTry: 0, saved: 0, invitePopup: 0, inviteView: 0, mapView: 0, mapClick: 0 };
  const animals = {};
  const refs = {};
  for (const e of events) {
    if (!KNOWN.has(e.event) || !e.sid) continue; // 배포 확인용 테스트 요청 등은 집계에서 제외
    if (!INCLUDE_TEST && String(e.sid).startsWith('loadtest-')) continue; // 부하 테스트로 넣은 가상 방문자 제외
    const n = Number(e.n) || 1; // 샘플링 보정 (트래픽이 적으면 항상 1)
    const ss = s(e.sid);
    if (e.event === 'visit') {
      c.visits += n;
      refs[e.label || 'direct'] = (refs[e.label || 'direct'] ?? 0) + n;
    } else if (e.event === 'screen') {
      if (e.label === 'quiz') ss.quiz = true;
      if (e.label === 'invite') c.inviteView += n;
      if (e.label === 'map') c.mapView += n;
      if (e.label.startsWith('result:') && !ss.result) {
        ss.result = true;
        const a = e.label.slice(7);
        if (a) animals[a] = (animals[a] ?? 0) + n;
      }
    } else if (e.event === 'share') {
      c.shareTry += n;
      if (e.label === 'shared') {
        c.shared += n;
        ss.kept = true;
      }
    } else if (e.event === 'save') {
      c.saveTry += n;
      if (e.label === 'saved') {
        c.saved += n;
        ss.kept = true;
      }
    } else if (e.event === 'invite_popup') c.invitePopup += n;
    else if (e.event === 'map_click') c.mapClick += n;
    else if (e.event === 'dwell') ss.dwell = Math.max(ss.dwell, Math.min(Number(e.value) || 0, DWELL_CAP));
  }
  const all = [...sessions.values()];
  const dwells = all.map((x) => x.dwell).filter((x) => x > 0);
  return {
    ...c,
    visitors: sessions.size,
    starters: all.filter((x) => x.quiz).length,
    completers: all.filter((x) => x.result).length,
    keepers: all.filter((x) => x.kept).length,
    avgDwell: dwells.length ? dwells.reduce((a, b) => a + b, 0) / dwells.length : 0,
    medianDwell: median(dwells),
    animals,
    refs,
  };
}

async function main() {
  const env = loadEnv();
  if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_API_TOKEN) {
    console.error('❌ .env 에 CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN 이 필요해요.');
    process.exit(1);
  }
  mkdirSync(OUT, { recursive: true });

  // 1) 이벤트 받기. Cloudflare는 이벤트를 몇 분 늦게 저장하기도 해서, "마지막 시각 이후"만 받으면
  //    늦게 도착한 이벤트를 놓친다. 그래서 최근 48시간은 매번 통째로 다시 받아 교체하고,
  //    그 이전은 로컬 보관본(events.jsonl)을 그대로 쓴다. (Cloudflare 보관기간 3개월이 지나도 데이터 유지)
  const old = readEvents();
  const utc = (ms) => new Date(ms).toISOString().slice(0, 19).replace('T', ' ');
  const cutoff = utc(Date.now() - (old.length ? 48 : 90 * 24) * 3600 * 1000);
  const rows = await cfSql(
    env,
    `SELECT timestamp, blob1, blob2, blob3, blob4, blob5, double1, _sample_interval FROM ${DATASET} WHERE timestamp >= toDateTime('${cutoff}') ORDER BY timestamp ASC LIMIT ${ROW_LIMIT} FORMAT JSON`,
  );
  if (rows.length >= ROW_LIMIT) console.warn(`⚠️ 48시간 이벤트가 ${ROW_LIMIT}개를 넘어 일부만 받았어요. 하루에 여러 번 실행해 주세요.`);
  const recentRows = rows.map((r) => ({
    ts: r.timestamp,
    event: r.blob1,
    label: r.blob2,
    sid: r.blob3,
    country: r.blob4,
    host: r.blob5,
    value: Number(r.double1) || 0,
    n: Number(r._sample_interval) || 1,
  }));
  const events = old.filter((e) => e.ts < cutoff).concat(recentRows);
  const added = Math.max(events.length - old.length, 0);
  // 중간에 끊겨도 기존 파일이 깨지지 않게 임시 파일에 쓴 뒤 교체
  writeFileSync(EVENTS + '.tmp', events.map((e) => JSON.stringify(e)).join('\n') + (events.length ? '\n' : ''));
  renameSync(EVENTS + '.tmp', EVENTS);

  // 2) 날짜별(KST) 지표
  const byDay = new Map();
  for (const e of events) {
    const d = kstDay(e.ts);
    if (!byDay.has(d)) byDay.set(d, []);
    byDay.get(d).push(e);
  }
  const days = [...byDay.keys()].sort();
  const header = 'date,visitors,visits,quiz_starters,completers,completion_rate,avg_dwell_sec,median_dwell_sec,saved,shared,invite_popup,invite_view,map_click';
  const lines = days.map((d) => {
    const x = stats(byDay.get(d));
    return [d, x.visitors, x.visits, x.starters, x.completers, pct(x.completers, x.starters), Math.round(x.avgDwell), Math.round(x.medianDwell), x.saved, x.shared, x.invitePopup, x.inviteView, x.mapClick].join(',');
  });
  writeFileSync(join(OUT, 'daily.csv'), [header, ...lines].join('\n') + '\n');

  // 3) 요약 + 이력서용 문장
  const t = stats(events);
  const perDay = days.map((d) => ({ d, v: stats(byDay.get(d)).visitors }));
  const peak = perDay.reduce((a, b) => (b.v > a.v ? b : a), { d: '-', v: 0 });
  const topAnimals = Object.entries(t.animals).sort((a, b) => b[1] - a[1]);
  const topRefs = Object.entries(t.refs).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const since = days[0] ?? new Date().toISOString().slice(0, 10);
  const wa = await webAnalytics(env, since);
  const waVisits = wa.rows.reduce((a, g) => a + (g.sum?.visits ?? 0), 0);
  const waViews = wa.rows.reduce((a, g) => a + (g.count ?? 0), 0);
  const today = new Date(Date.now() + KST).toISOString().slice(0, 10);
  const recent = perDay.slice(-7);

  const md = `# 📊 성격 동물 테스트 지표 리포트

_마지막 업데이트: ${today} (KST) · 집계 기간: ${since} ~ ${days.at(-1) ?? '-'} (${days.length}일)_

## 누적 핵심 지표
| 지표 | 값 |
|---|---|
| 순 방문자 (세션) | **${t.visitors.toLocaleString()}명** |
| 테스트 시작 | ${t.starters.toLocaleString()}명 |
| 테스트 완료 | ${t.completers.toLocaleString()}명 |
| **완료율** (시작 → 결과) | **${pct(t.completers, t.starters)}** |
| 방문 → 완료 전환율 | ${pct(t.completers, t.visitors)} |
| 평균 체류시간 | ${fmtSec(t.avgDwell)} (중앙값 ${fmtSec(t.medianDwell)}) |
| 결과 카드 저장 | ${t.saved.toLocaleString()}회 (시도 ${t.saveTry}) |
| 결과 카드 공유 | ${t.shared.toLocaleString()}회 (시도 ${t.shareTry}) |
| 저장·공유한 사람 (완료자 대비) | ${t.keepers}명 (${pct(t.keepers, t.completers)}) |
| 초대장 열람 | 팝업 ${t.invitePopup} · 초대장 화면 ${t.inviteView} |
| 지도(네이버) 클릭 | ${t.mapClick}회 |
| 최다 방문일 | ${peak.d} (${peak.v}명) |
${wa.error ? '' : `| Cloudflare Web Analytics 방문 | ${waVisits.toLocaleString()}회 · 페이지뷰 ${waViews.toLocaleString()} |\n`}
## 최근 7일 방문자
${recent.map((r) => `- ${r.d}: ${r.v}명`).join('\n') || '- (아직 데이터 없음)'}

## 결과 동물 분포
${topAnimals.map(([a, n]) => `- ${a}: ${n}명 (${pct(n, t.completers)})`).join('\n') || '- (아직 데이터 없음)'}

## 유입 경로
${topRefs.map(([r, n]) => `- ${r}: ${n}`).join('\n') || '- (아직 데이터 없음)'}

## ✍️ 이력서용 문장 (숫자 자동 갱신)
- 청소년 대상 심리테스트 웹앱을 React·TypeScript로 개발하고 Cloudflare에 배포해, ${days.length}일간 **순 방문자 ${t.visitors.toLocaleString()}명**, **테스트 완료율 ${pct(t.completers, t.starters)}** 달성
- 결과 카드 이미지 저장·공유 기능으로 완료자의 **${pct(t.keepers, t.completers)}가 결과를 저장·공유** (총 ${(t.saved + t.shared).toLocaleString()}회)
- Cloudflare Workers + Analytics Engine으로 이벤트 수집 파이프라인을 직접 구축해 퍼널(방문→시작→완료→공유)과 체류시간(평균 ${fmtSec(t.avgDwell)})을 일 단위로 추적
${wa.error ? `\n> Web Analytics 조회 실패(대시보드에서 아직 안 켰으면 정상): ${wa.error}\n` : ''}`;
  writeFileSync(join(OUT, 'SUMMARY.md'), md);

  console.log(`✅ 새 이벤트 ${added}개 · 누적 ${events.length}개 · 방문자 ${t.visitors}명 · 완료율 ${pct(t.completers, t.starters)}`);
  console.log(`   → metrics/SUMMARY.md, metrics/daily.csv 갱신`);

}

main().catch((e) => {
  console.error('❌', e.message);
  process.exit(1);
});

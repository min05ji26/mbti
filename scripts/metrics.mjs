#!/usr/bin/env node
// 매일 돌리는 지표 리포트: Cloudflare D1(이벤트 DB)에서 새 이벤트를 받아
// metrics/events.jsonl 에 누적(로컬 원본 보관)하고, metrics/daily.csv · metrics/SUMMARY.md 를 새로 만든다.
//
// 필요한 값 (.env):
//   CLOUDFLARE_ACCOUNT_ID=...
//   CLOUDFLARE_D1_DATABASE_ID=...  (D1 데이터베이스 mbti-events 의 ID)
//   CLOUDFLARE_API_TOKEN=...       (권한: Account → D1 → Read)
// 실행: node scripts/metrics.mjs   (테스트 데이터까지 보려면 --include-test)

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'metrics');
const EVENTS = join(OUT, 'events.jsonl');
const KST = 9 * 3600 * 1000;
// --include-test 를 붙이면 부하 테스트 데이터(loadtest-)도 포함해서 집계 (테스트 결과 확인용)
const INCLUDE_TEST = process.argv.includes('--include-test');
// 탭을 켜두고 방치하거나 비정상 값이 와도 평균이 튀지 않게 세션당 체류시간 상한 (30분)
const DWELL_CAP = 1800;
const PAGE = 5000;
// 앱(src/track.ts)이 보내는 이벤트 종류
// 결과 동물 키 → 한글 이름 (src/data.ts 의 ORDER)
const ANIMAL_KO = { dog: '강아지', cat: '고양이', rabbit: '토끼', fox: '여우' };
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

async function d1Query(env, sql, params = []) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/d1/database/${env.CLOUDFLARE_D1_DATABASE_ID}/query`;
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, 'content-type': 'application/json' },
        body: JSON.stringify({ sql, params }),
      });
      const text = await res.text();
      // 아직 아무도 접속 안 해서 테이블이 없으면 빈 결과로 취급
      if (/no such table/i.test(text)) return [];
      if (res.status === 401 || res.status === 403) throw Object.assign(new Error(`D1 권한 오류 ${res.status}: API 토큰에 Account → D1 → Read 권한이 있는지 확인해 주세요.`), { fatal: true });
      if (!res.ok) throw new Error(`D1 ${res.status}: ${text.slice(0, 300)}`);
      return JSON.parse(text).result?.[0]?.results ?? [];
    } catch (e) {
      if (e.fatal) throw e;
      lastErr = e;
      await new Promise((r) => setTimeout(r, 2000 * attempt)); // 일시적인 네트워크 오류는 재시도
    }
  }
  throw lastErr;
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
  if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_API_TOKEN || !env.CLOUDFLARE_D1_DATABASE_ID) {
    console.error('❌ .env 에 CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_D1_DATABASE_ID / CLOUDFLARE_API_TOKEN 이 필요해요.');
    process.exit(1);
  }
  mkdirSync(OUT, { recursive: true });

  // 1) 마지막으로 받은 id 이후 이벤트만 받아 누적 (D1은 id가 순서대로 붙어서 빠짐·중복 없음)
  const old = readEvents();
  let lastId = old.reduce((m, e) => Math.max(m, Number(e.id) || 0), 0);
  const fresh = [];
  for (;;) {
    const rows = await d1Query(env, 'SELECT id, ts, event, label, sid, country, host, value FROM events WHERE id > ? ORDER BY id LIMIT ?', [lastId, PAGE]);
    for (const r of rows) fresh.push({ ...r, value: Number(r.value) || 0 });
    if (rows.length < PAGE) break;
    lastId = rows[rows.length - 1].id;
  }
  const events = old.concat(fresh);
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

## 최근 7일 방문자
${recent.map((r) => `- ${r.d}: ${r.v}명`).join('\n') || '- (아직 데이터 없음)'}

## 결과 동물 분포
${topAnimals.map(([a, n]) => `- ${ANIMAL_KO[a] ?? a}: ${n}명 (${pct(n, t.completers)})`).join('\n') || '- (아직 데이터 없음)'}

## 유입 경로
${topRefs.map(([r, n]) => `- ${r}: ${n}`).join('\n') || '- (아직 데이터 없음)'}

## ✍️ 이력서용 문장 (숫자 자동 갱신)
- 청소년 대상 심리테스트 웹앱을 React·TypeScript로 개발하고 Cloudflare에 배포해, ${days.length}일간 **순 방문자 ${t.visitors.toLocaleString()}명**, **테스트 완료율 ${pct(t.completers, t.starters)}** 달성
- 결과 카드 이미지 저장·공유 기능으로 완료자의 **${pct(t.keepers, t.completers)}가 결과를 저장·공유** (총 ${(t.saved + t.shared).toLocaleString()}회)
- Cloudflare Workers + D1(SQLite)으로 이벤트 수집 파이프라인을 직접 구축해 퍼널(방문→시작→완료→공유)과 체류시간(평균 ${fmtSec(t.avgDwell)})을 일 단위로 추적
`;
  writeFileSync(join(OUT, 'SUMMARY.md'), md);

  console.log(`✅ 새 이벤트 ${fresh.length}개 · 누적 ${events.length}개 · 방문자 ${t.visitors}명 · 완료율 ${pct(t.completers, t.starters)}`);
  console.log(`   → metrics/SUMMARY.md, metrics/daily.csv 갱신`);

}

main().catch((e) => {
  console.error('❌', e.message);
  process.exit(1);
});

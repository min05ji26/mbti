// /api/track 이벤트를 Cloudflare D1(바인딩 이름 DB)의 events 테이블에 한 줄씩 기록.
// Pages(functions/api/track.ts)와 Workers(worker/index.ts)가 같이 쓰는 공용 로직.
// (처음엔 Analytics Engine을 썼는데, 접속이 조금만 몰려도 샘플링돼서 사람 단위 지표가 틀어져 D1로 교체)
// 바인딩이 아직 없거나 요청이 이상해도 항상 204로 조용히 응답 — 앱에는 영향 없음.

interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  run(): Promise<unknown>;
}
interface D1Database {
  prepare(sql: string): D1Statement;
  exec(sql: string): Promise<unknown>;
}

export interface TrackEnv {
  DB?: D1Database;
}

export interface WaitUntil {
  waitUntil(p: Promise<unknown>): void;
}

const noContent = () => new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });

// 테이블은 첫 요청 때 자동 생성 (isolate 당 한 번만 실행)
let ready: Promise<unknown> | null = null;
function ensureTable(db: D1Database) {
  ready ??= db
    .exec(
      "CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now')), event TEXT NOT NULL, label TEXT, sid TEXT NOT NULL, country TEXT, host TEXT, value REAL)",
    )
    .catch((e) => {
      ready = null; // 실패하면 다음 요청 때 다시 시도
      throw e;
    });
  return ready;
}

export async function handleTrack(request: Request, env: TrackEnv, ctx?: WaitUntil): Promise<Response> {
  if (request.method !== 'POST') return new Response(null, { status: 405 });
  try {
    const text = await request.text();
    if (text.length > 2000) return noContent();
    const d = JSON.parse(text) as { e?: unknown; l?: unknown; v?: unknown; s?: unknown };
    const event = String(d.e ?? '');
    if (!/^[a-z_]{1,32}$/.test(event)) return noContent();
    const sid = String(d.s ?? '').slice(0, 64);
    if (!sid) return noContent(); // 세션 ID 없는 요청은 앱에서 온 게 아니므로 버림
    const db = env.DB;
    if (!db) return noContent();
    const cf = (request as Request & { cf?: { country?: string } }).cf;
    const write = ensureTable(db)
      .then(() =>
        db
          .prepare('INSERT INTO events (event, label, sid, country, host, value) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(
            event,
            String(d.l ?? '').slice(0, 64),
            sid,
            cf?.country ?? '',
            new URL(request.url).hostname,
            Math.min(Math.max(Number(d.v) || 0, 0), 86400),
          )
          .run(),
      )
      .catch(() => {
        /* 저장 실패는 무시 */
      });
    // 응답은 바로 보내고 저장은 뒤에서 마무리
    if (ctx) ctx.waitUntil(write);
    else await write;
  } catch {
    /* 잘못된 요청은 무시 */
  }
  return noContent();
}

// /api/track 이벤트를 Cloudflare Analytics Engine(바인딩 이름 TRACK)에 기록.
// Pages(functions/api/track.ts)와 Workers(worker/index.ts)가 같이 쓰는 공용 로직.
// 바인딩이 아직 없거나 요청이 이상해도 항상 204로 조용히 응답 — 앱에는 영향 없음.

interface AnalyticsEngineDataset {
  writeDataPoint(point: { indexes?: string[]; blobs?: string[]; doubles?: number[] }): void;
}

export interface TrackEnv {
  TRACK?: AnalyticsEngineDataset;
}

const noContent = () => new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });

export async function handleTrack(request: Request, env: TrackEnv): Promise<Response> {
  if (request.method !== 'POST') return new Response(null, { status: 405 });
  try {
    const text = await request.text();
    if (text.length > 2000) return noContent();
    const d = JSON.parse(text) as { e?: unknown; l?: unknown; v?: unknown; s?: unknown };
    const event = String(d.e ?? '');
    if (!/^[a-z_]{1,32}$/.test(event)) return noContent();
    const sid = String(d.s ?? '').slice(0, 64);
    if (!sid) return noContent(); // 세션 ID 없는 요청은 앱에서 온 게 아니므로 버림
    const cf = (request as Request & { cf?: { country?: string } }).cf;
    env.TRACK?.writeDataPoint({
      // index = 샘플링 단위. 접속이 몰리면 Cloudflare가 index별로 샘플링하는데, 세션 ID로 두면
      // 한 사람의 이벤트는 통째로 남거나 통째로 빠져서 완료율·체류시간 같은 세션 지표가 안 깨짐
      indexes: [sid],
      // blob1=이벤트, blob2=라벨(화면/동물/유입경로 등), blob3=세션ID, blob4=국가, blob5=도메인
      blobs: [
        event,
        String(d.l ?? '').slice(0, 64),
        sid,
        cf?.country ?? '',
        new URL(request.url).hostname,
      ],
      // double1=값 (체류시간 초 등)
      doubles: [Math.min(Math.max(Number(d.v) || 0, 0), 86400)],
    });
  } catch {
    /* 잘못된 요청은 무시 */
  }
  return noContent();
}

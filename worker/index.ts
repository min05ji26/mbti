// Cloudflare Workers(mbti.min05ji26.workers.dev)용 진입점 — /api/track 만 처리하고 나머지는 정적 파일
import { handleTrack, TrackEnv } from '../server/track';

interface Env extends TrackEnv {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
  fetch(request: Request, env: Env) {
    if (new URL(request.url).pathname === '/api/track') return handleTrack(request, env);
    return env.ASSETS.fetch(request);
  },
};

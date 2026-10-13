// Cloudflare Pages용 /api/track 함수
import { handleTrack, TrackEnv } from '../../server/track';

export const onRequest = (ctx: { request: Request; env: TrackEnv; waitUntil(p: Promise<unknown>): void }) =>
  handleTrack(ctx.request, ctx.env, ctx);

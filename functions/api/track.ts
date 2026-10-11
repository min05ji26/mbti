// Cloudflare Pages(myanimaltest.pages.dev)용 /api/track 함수
import { handleTrack, TrackEnv } from '../../server/track';

export const onRequest = (ctx: { request: Request; env: TrackEnv }) => handleTrack(ctx.request, ctx.env);

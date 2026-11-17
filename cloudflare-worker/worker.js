/**
 * 별빛 트리 광장 · TURN 로그인 발급 Worker (Cloudflare Workers)
 *
 * 페이지가 POST로 부르면 Cloudflare TURN의 임시 로그인(4시간)을 만들어 돌려줘요.
 * TURN API 토큰은 이 Worker 안에만 있고, 페이지에는 절대 들어가지 않아요.
 *
 * Worker 설정 → Variables and Secrets 에 넣을 값
 *   TURN_KEY_ID          (Text)   Cloudflare Realtime → TURN 키의 ID
 *   TURN_KEY_API_TOKEN   (Secret) 같은 TURN 키의 API 토큰
 *   ALLOWED_ORIGINS      (Text)   광장 주소들, 쉼표로 구분
 *                                 예) https://ssoonson.github.io
 */
const TTL_SECONDS = 4 * 60 * 60;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim().replace(/\/$/, '')).filter(Boolean);
    const ok = allowed.includes(origin);
    const cors = {
      'Access-Control-Allow-Origin': ok ? origin : 'null',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    };

    if (request.method === 'OPTIONS') return new Response(null, { status: ok ? 204 : 403, headers: cors });
    if (!ok) return new Response('이 주소에서는 쓸 수 없어요', { status: 403, headers: cors });
    if (request.method !== 'POST') return new Response('POST로 불러 주세요', { status: 405, headers: cors });
    if (!env.TURN_KEY_ID || !env.TURN_KEY_API_TOKEN) return new Response('TURN 설정이 비어 있어요', { status: 500, headers: cors });

    const res = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${encodeURIComponent(env.TURN_KEY_ID)}/credentials/generate-ice-servers`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.TURN_KEY_API_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ttl: TTL_SECONDS }),
      },
    );
    if (!res.ok) return new Response('TURN 로그인을 만들지 못했어요 (' + res.status + ')', { status: 502, headers: cors });

    return new Response(await res.text(), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  },
};

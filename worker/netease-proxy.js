// Cloudflare Worker for the lyrics feature: NetEase Cloud Music's public API sends no CORS headers,
// so the site can't call it from the browser. This forwards exactly two GET endpoints and adds CORS.
// Deploy: Cloudflare dashboard -> Workers & Pages -> Create -> "Hello World" Worker -> paste this file -> Deploy,
// then put the https://<name>.<account>.workers.dev URL into the site's 「歌詞管理」 -> 網易雲轉送網址.
const ALLOW = ['https://jruei.github.io', 'http://localhost:8765', 'http://127.0.0.1:8765'];
const UP = { '/search': 'https://music.163.com/api/search/get', '/lyric': 'https://music.163.com/api/song/lyric' };
const KEEP = { '/search': ['s', 'type', 'limit', 'offset'], '/lyric': ['id', 'lv', 'tv'] };

export default {
  async fetch(req) {
    const u = new URL(req.url), o = req.headers.get('Origin');
    const cors = { 'Access-Control-Allow-Origin': ALLOW.includes(o) ? o : ALLOW[0], Vary: 'Origin' };
    if (req.method !== 'GET' || !UP[u.pathname]) return new Response('not found', { status: 404, headers: cors });
    const q = new URLSearchParams();
    for (const k of KEEP[u.pathname]) if (u.searchParams.has(k)) q.set(k, u.searchParams.get(k));
    const r = await fetch(UP[u.pathname] + '?' + q);
    return new Response(r.body, { status: r.status, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=86400' } });
  },
};

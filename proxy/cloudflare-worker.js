/**
 * Optional proxy for the Interio AI designer (Cloudflare Worker).
 * Keeps the Anthropic API key on the server so visitors of the GitHub Pages site don't need one.
 *
 * Deploy:  wrangler secret put ANTHROPIC_API_KEY   (and set ALLOWED_ORIGIN, e.g. https://<user>.github.io)
 * Then paste the worker URL into the app's AI settings → "Proxy URL".
 *
 * It only forwards the two endpoints the app uses (POST /v1/messages, GET /v1/models/...),
 * passes the anthropic-version / anthropic-beta headers through, and adds the key.
 */
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = env.ALLOWED_ORIGIN || '';
    const cors = {
      'Access-Control-Allow-Origin': allowed || origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type, anthropic-version, anthropic-beta, x-api-key, anthropic-dangerous-direct-browser-access, x-stainless-arch, x-stainless-lang, x-stainless-os, x-stainless-package-version, x-stainless-retry-count, x-stainless-runtime, x-stainless-runtime-version, x-stainless-timeout',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin'
    };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (allowed && origin !== allowed) return new Response('Forbidden origin', { status: 403, headers: cors });
    const url = new URL(request.url);
    const ok = (request.method === 'POST' && url.pathname === '/v1/messages') || (request.method === 'GET' && url.pathname.startsWith('/v1/models'));
    if (!ok) return new Response('Not found', { status: 404, headers: cors });
    const headers = new Headers();
    for (const k of ['content-type', 'anthropic-version', 'anthropic-beta']) { const v = request.headers.get(k); if (v) headers.set(k, v); }
    headers.set('x-api-key', env.ANTHROPIC_API_KEY);
    const upstream = await fetch('https://api.anthropic.com' + url.pathname + url.search, { method: request.method, headers, body: request.method === 'POST' ? request.body : undefined });
    const out = new Response(upstream.body, upstream);
    for (const [k, v] of Object.entries(cors)) out.headers.set(k, v);
    return out;
  }
};

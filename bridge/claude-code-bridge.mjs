#!/usr/bin/env node
/**
 * Interio ↔ Claude Code bridge
 * ─────────────────────────────
 * Lets the Interio planner use YOUR Claude subscription (through the Claude Code CLI you are
 * already logged in to) instead of an API key. It runs on your machine and speaks just enough of
 * the Messages API for the app: the app thinks it is talking to a proxy; each request is answered
 * by running `claude -p` headless with the app's system prompt and JSON schema.
 *
 *   node bridge/claude-code-bridge.mjs                      # http://127.0.0.1:8787
 *   node bridge/claude-code-bridge.mjs --port 9000 --origin https://<you>.github.io
 *
 * Then in the app: AI settings → "Claude Code bridge" → URL http://127.0.0.1:8787
 *
 * Requirements: Node 18+, Claude Code installed and logged in (`claude` on PATH).
 * Personal use only: it binds to 127.0.0.1 and only answers pages from allowed origins.
 * Don't expose it to other people or the internet — that would share your subscription.
 * No dependencies; nothing is stored. (Windows: run it inside WSL.)
 */
import http from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : def; };
const PORT = +arg('port', process.env.PORT || 8787);
const CLAUDE = arg('claude', process.env.CLAUDE_BIN || 'claude');
// --model forces one model for every request (e.g. opus, sonnet, claude-opus-4-7) — use it when your Claude Code
// can't run the model the app asks for. Without it the app's choice is used ("default" = Claude Code's own default).
const FORCE_MODEL = arg('model', process.env.BRIDGE_MODEL || '');
// file:// pages send Origin "null"; local dev servers are localhost; add your GitHub Pages origin with --origin
const ORIGINS = ['null', ...(arg('origin', process.env.ALLOW_ORIGINS || '')).split(',').map(s => s.trim()).filter(Boolean)];
const allowed = o => !o || ORIGINS.includes(o) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o);

function cors(req, res) {
  const o = req.headers.origin;
  if (o && allowed(o)) {
    res.setHeader('Access-Control-Allow-Origin', o);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || '*');
    res.setHeader('Access-Control-Allow-Private-Network', 'true'); // Chrome: public page → localhost
    res.setHeader('Access-Control-Max-Age', '600');
  }
}
const sendJSON = (res, status, body) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };
const apiError = (res, status, type, message) => sendJSON(res, status, { type: 'error', error: { type, message } });
const readBody = req => new Promise((ok, bad) => { let s = ''; req.on('data', c => { s += c; if (s.length > 5e6) bad(new Error('too large')); }); req.on('end', () => ok(s)); req.on('error', bad); });
const textOf = c => typeof c === 'string' ? c : (c || []).filter(b => b.type === 'text').map(b => b.text).join('\n\n');

let current = null; // the running `claude` process (one at a time; a new request replaces an abandoned one)
async function handleMessages(req, res) {
  let body;
  try { body = JSON.parse(await readBody(req)); } catch { return apiError(res, 400, 'invalid_request_error', 'Body is not JSON.'); }
  if (current) { console.log('[bridge] new request — stopping the previous one'); current.replaced = true; current.kill('SIGTERM'); current = null; }
  const system = textOf(body.system), user = (body.messages || []).filter(m => m.role === 'user').map(m => textOf(m.content)).join('\n\n');
  const schema = body.output_config && body.output_config.format && body.output_config.format.schema;
  const effort = body.output_config && body.output_config.effort;
  if (!user) return apiError(res, 400, 'invalid_request_error', 'No user message.');

  const dir = mkdtempSync(join(tmpdir(), 'interio-bridge-')), sysFile = join(dir, 'system.txt');
  writeFileSync(sysFile, system || 'You are a helpful assistant.');
  const args = ['-p', '--output-format', 'stream-json', '--verbose', '--include-partial-messages', '--no-session-persistence', '--tools', '', '--system-prompt-file', sysFile];
  const model = FORCE_MODEL || (body.model && body.model !== 'default' ? body.model : '');
  if (model) args.push('--model', model);
  if (effort) args.push('--effort', effort);
  if (schema) args.push('--json-schema', JSON.stringify(schema));

  // Answer as a Messages API event stream so the app's SDK can read it.
  res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' });
  const ev = (type, data) => res.write(`event: ${type}\ndata: ${JSON.stringify(Object.assign({ type }, data))}\n\n`);
  const id = 'msg_bridge_' + Date.now();
  ev('message_start', { message: { id, type: 'message', role: 'assistant', model: body.model || 'claude-code', content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 0, output_tokens: 0 } } });
  const ping = setInterval(() => res.write(': working\n\n'), 10000);

  const t0 = Date.now(); let lineBuf = '', result = null, stderr = '';
  console.log(`[bridge] ${new Date().toLocaleTimeString()} request · model ${model || "Claude Code's default"} · effort ${effort || 'default'} · schema ${schema ? 'yes' : 'no'}`);
  const child = spawn(CLAUDE, args, { cwd: dir, stdio: ['pipe', 'pipe', 'pipe'], env: process.env }); current = child;
  // the app cancelled, the page reloaded or the tab closed: stop Claude Code so it doesn't keep running
  res.on('close', () => { if (!res.writableFinished && child.exitCode === null) { child.kill('SIGTERM'); console.log('[bridge] app disconnected — stopped Claude Code'); } });
  child.stdout.on('data', chunk => {
    lineBuf += chunk; let i;
    while ((i = lineBuf.indexOf('\n')) >= 0) {
      const line = lineBuf.slice(0, i).trim(); lineBuf = lineBuf.slice(i + 1); if (!line) continue;
      let d; try { d = JSON.parse(line); } catch { continue; }
      if (d.type === 'result') result = d;
    }
  });
  child.stderr.on('data', c => { stderr += c; });
  child.on('error', e => { stderr += e.message; });
  child.stdin.end(user);
  child.on('close', code => {
    clearInterval(ping); if (current === child) current = null; rmSync(dir, { recursive: true, force: true });
    if (res.writableEnded) return;
    const secs = ((Date.now() - t0) / 1000).toFixed(0);
    if (!result || result.is_error || result.subtype !== 'success') {
      if (child.replaced) { ev('error', { error: { type: 'api_error', message: 'Stopped: a newer request from the app replaced this one.' } }); return res.end(); }
      let msg = (result && (result.result || result.subtype)) || stderr.trim().split('\n').pop() || `claude exited with code ${code}`;
      if (/usage limit|rate limit|limit reached|too many requests/i.test(msg)) msg += ' — this is your Claude plan\'s usage limit; try again after it resets, or use a smaller model / lower effort.';
      else if (/model/i.test(msg) && /(not found|not available|invalid|access|support)/i.test(msg)) msg += ` — your Claude Code can't use ${model || 'that model'}. Pick another model in the app, or restart the bridge with --model opus (or the newest model you have).`;
      console.log(`[bridge] failed after ${secs}s: ${msg}`);
      ev('error', { error: { type: 'api_error', message: `Claude Code: ${msg}` } }); return res.end();
    }
    const text = schema && result.structured_output !== undefined ? JSON.stringify(result.structured_output) : String(result.result || '');
    console.log(`[bridge] done in ${secs}s · ${text.length} chars${result.total_cost_usd != null ? ` · ~$${result.total_cost_usd.toFixed(3)} equivalent` : ''}`);
    ev('content_block_start', { index: 0, content_block: { type: 'text', text: '' } });
    for (let i = 0; i < text.length; i += 2000) ev('content_block_delta', { index: 0, delta: { type: 'text_delta', text: text.slice(i, i + 2000) } });
    ev('content_block_stop', { index: 0 });
    ev('message_delta', { delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: (result.usage && result.usage.output_tokens) || 0 } });
    ev('message_stop', {}); res.end();
  });
}

http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  cors(req, res);
  if (origin && !allowed(origin)) return apiError(res, 403, 'permission_error', `Origin ${origin} is not allowed. Restart the bridge with --origin ${origin}`);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const path = new URL(req.url, 'http://x').pathname;
  if (req.method === 'GET' && path.startsWith('/v1/models')) { const m = decodeURIComponent(path.split('/')[3] || 'claude-code'); return sendJSON(res, 200, { id: m, type: 'model', display_name: `${m} via Claude Code`, created_at: new Date().toISOString() }); }
  if (req.method === 'POST' && path === '/v1/messages') return handleMessages(req, res).catch(e => { if (!res.headersSent) apiError(res, 500, 'api_error', e.message); else res.end(); });
  apiError(res, 404, 'not_found_error', 'Only POST /v1/messages and GET /v1/models are bridged.');
}).listen(PORT, '127.0.0.1', () => {
  console.log(`Interio ↔ Claude Code bridge on http://127.0.0.1:${PORT}`);
  if (FORCE_MODEL) console.log(`Every request uses model: ${FORCE_MODEL}`);
  console.log(`Allowed origins: file:// pages, localhost${ORIGINS.length > 1 ? ', ' + ORIGINS.slice(1).join(', ') : ''}`);
  console.log('In the app: AI settings → Claude Code bridge → this URL. Ctrl+C to stop.');
});

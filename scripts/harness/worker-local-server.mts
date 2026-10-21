// Serves the real Worker (worker/index.ts) on localhost so scripts/security-smoke.mjs can run
// against it. Requests are re-addressed to https://beautyfacelift-zuerich.ch (production host
// rules apply, e.g. Turnstile). Every outbound fetch from the Worker (Supabase, Turnstile, Resend,
// Meta) is blocked, which also simulates the offline Supabase backend.
// Usage: tsx worker-local-server.mts <worktree> [port]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const WT = process.argv[2];
const PORT = Number(process.argv[3] ?? 4351);
const DIST = path.join(WT, 'dist');
const outbound: string[] = [];
globalThis.fetch = (async (input: any) => {
  const url = String(input instanceof Request ? input.url : input);
  outbound.push(url);
  throw new TypeError(`fetch failed (blocked in harness): ${url}`);
}) as typeof fetch;

const worker = (await import(`file:///${WT.replace(/\\/g, '/')}/worker/index.ts`)).default;
const ASSETS = {
  async fetch(req: Request) {
    const { pathname } = new URL(req.url);
    let file = path.join(DIST, decodeURIComponent(pathname));
    if (pathname.endsWith('/')) file = path.join(file, 'index.html');
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      return new Response(fs.readFileSync(path.join(DIST, '404.html')), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    const type = file.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream';
    return new Response(fs.readFileSync(file), { status: 200, headers: { 'Content-Type': type } });
  },
};
const env = {
  ASSETS,
  PUBLIC_SUPABASE_URL: 'https://izekwngqjllaqibrwotp.supabase.co',
  PUBLIC_SUPABASE_ANON_KEY: 'anon-stub',
  TURNSTILE_SECRET_KEY: 'secret-stub',
  RESEND_API_KEY: 're_stub',
  CONTACT_TO_EMAIL: 'inbox@example.test',
};
const ctx = { waitUntil() {}, passThroughOnException() {} };

http.createServer(async (req, res) => {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v);
  headers.set('cf-connecting-ip', '10.7.7.7');
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const request = new Request(`https://beautyfacelift-zuerich.ch${req.url}`, { method: req.method, headers, body: hasBody ? Buffer.concat(chunks) : undefined, redirect: 'manual' });
  const response: Response = await worker.fetch(request, env, ctx);
  const outHeaders = Object.fromEntries(response.headers.entries());
  // Calibration: PLANT=xfo breaks one header on the home page; the smoke must fail on it.
  if (process.env.PLANT === 'xfo' && req.url === '/') outHeaders['x-frame-options'] = 'SAMEORIGIN';
  res.writeHead(response.status, outHeaders);
  res.end(req.method === 'HEAD' ? undefined : Buffer.from(await response.arrayBuffer()));
}).listen(PORT, () => console.log(`worker harness on http://localhost:${PORT}`));
process.on('SIGTERM', () => { console.log(`outbound fetches blocked: ${outbound.length}`); process.exit(0); });

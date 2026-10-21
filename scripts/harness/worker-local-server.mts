// Local-only Worker adapter for validation. All application fetches are blocked, the environment is
// made of fixtures, and assets are confined to dist/. Usage: tsx worker-local-server.mts <worktree> [port]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const WT = path.resolve(process.argv[2] ?? process.cwd());
const PORT = Number(process.argv[3] ?? 4351);
const DIST = path.join(WT, 'dist');
const calibration = process.env.BFL_HARNESS_CALIBRATION;
let blockedOutbound = 0;
globalThis.fetch = (async () => {
  blockedOutbound += 1;
  throw new TypeError('fetch failed (blocked in local harness)');
}) as typeof fetch;
const worker = (await import(pathToFileURL(path.join(WT, 'worker/index.ts')).href)).default;

const ASSETS = {
  async fetch(req: Request): Promise<Response> {
    let pathname: string;
    try { pathname = decodeURIComponent(new URL(req.url).pathname); }
    catch { return new Response('Bad path', { status: 400 }); }
    if (pathname.includes('\0')) return new Response('Bad path', { status: 400 });
    const filePath = path.resolve(DIST, `.${pathname}`);
    const relative = path.relative(DIST, filePath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) return new Response('Forbidden', { status: 403 });
    let file = pathname.endsWith('/') ? path.join(filePath, 'index.html') : filePath;
    if (calibration === 'worker' && pathname === '/termin/') return new Response('Planted broken booking page');
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      file = path.join(DIST, '404.html');
      return new Response(fs.readFileSync(file), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    const type = file.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream';
    return new Response(fs.readFileSync(file), { headers: { 'Content-Type': type } });
  },
};
const env = {
  ASSETS,
  ENVIRONMENT: 'production',
  ENABLE_LEGACY_BOOKING: 'false',
  PUBLIC_SUPABASE_URL: 'https://offline.example.test',
  PUBLIC_SUPABASE_ANON_KEY: 'anon-stub',
  TURNSTILE_SECRET_KEY: 'secret-stub',
  RESEND_API_KEY: 're_stub',
  CONTACT_TO_EMAIL: 'inbox@example.test',
};

const server = http.createServer(async (req, res) => {
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) if (typeof value === 'string') headers.set(key, value);
    headers.set('cf-connecting-ip', '10.7.7.7');
    const request = new Request(`https://beautyfacelift-zuerich.ch${req.url}`, {
      method: req.method, headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(chunks),
      redirect: 'manual',
    });
    const ctx = { waitUntil(work: Promise<unknown>) { work.catch(() => {}); }, passThroughOnException() {} };
    const response: Response = await worker.fetch(request, env, ctx);
    const outHeaders = Object.fromEntries(response.headers.entries());
    if ((calibration === 'security' || process.env.PLANT === 'xfo') && req.url === '/') outHeaders['x-frame-options'] = 'SAMEORIGIN';
    res.writeHead(response.status, outHeaders);
    res.end(req.method === 'HEAD' ? undefined : Buffer.from(await response.arrayBuffer()));
  } catch {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Local harness request failed');
  }
});
server.listen(PORT, '127.0.0.1', () => {
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No local listening address');
  const url = `http://127.0.0.1:${address.port}`;
  console.log(`worker harness on ${url}`);
  process.send?.({ type: 'ready', url });
});
process.on('SIGTERM', () => {
  server.close(() => {
    console.log(`outbound fetches blocked: ${blockedOutbound}`);
    process.exit(0);
  });
});

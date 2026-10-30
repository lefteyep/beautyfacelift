// Synthetic, memory-only cockpit preview. No .env files, credentials, live D1 or external fetch.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createFakeD1 } from './fake-d1.mjs';
import worker from '../../worker/index.ts';
import { createLeadFromSubmission, type LeadSubmission } from '../../worker/leads/ingest.ts';
import type { Env } from '../../worker/env.ts';

globalThis.fetch = (async () => { throw new Error('External services are blocked in the synthetic pilot preview'); }) as typeof fetch;
const root = fileURLToPath(new URL('../../', import.meta.url));
const dist = path.join(root, 'dist');
const db = createFakeD1({ migrationsDir: path.join(root, 'worker/migrations') });
const env: Env = {
  ENVIRONMENT: 'development', LEADS_DEV_EMAIL: 'agency@example.test', LEADS_SIGNING_SECRET: 'synthetic-local-preview-secret-not-a-production-credential',
  LEADS_CAPTURE: 'on', LEADS_REMINDERS: 'off', LEADS_DB: db as Env['LEADS_DB'],
  PUBLIC_SUPABASE_URL: '', PUBLIC_SUPABASE_ANON_KEY: '', ENABLE_LEGACY_BOOKING: 'false',
  ASSETS: { async fetch(request: Request) {
    let pathname: string;
    try { pathname = decodeURIComponent(new URL(request.url).pathname); } catch { return new Response(null, { status: 400 }); }
    const candidate = path.resolve(dist, `.${pathname}`);
    const relative = path.relative(dist, candidate);
    if (relative.startsWith('..') || path.isAbsolute(relative) || pathname.includes('\0')) return new Response(null, { status: 403 });
    const file = pathname.endsWith('/') ? path.join(candidate, 'index.html') : candidate;
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return new Response('Preview asset not found', { status: 404 });
    const type = file.endsWith('.html') ? 'text/html; charset=utf-8' : file.endsWith('.css') ? 'text/css' : file.endsWith('.woff2') ? 'font/woff2' : 'application/octet-stream';
    return new Response(fs.readFileSync(file), { headers: { 'content-type': type } });
  } } as Env['ASSETS'],
};
const fields: LeadSubmission = {
  name: 'TEST Beispiel Anfrage', email: 'fixture@example.test', phone: '079 000 00 00', preferredContactMethod: 'E-Mail', preferredCallbackTime: '', preferredDate: '',
  topic: 'Ich möchte einen Termin buchen', message: 'Synthetische Anfrage für die lokale Pilotprüfung.', source: 'kontakt-page', marketingConsent: '', campaign: '', offer: '', treatment: 'Aquafacial',
  landingPage: '', pageUrl: '', referrer: '', skinConcern: '', utmSource: '', utmMedium: '', utmCampaign: '', utmContent: '', utmTerm: '', fbclid: '', gclid: '', msclkid: '',
};
await createLeadFromSubmission(env, fields, new Date(), '11111111-1111-4111-8111-111111111111');

const server = http.createServer(async (req, res) => {
  try {
    const chunks: Buffer[] = []; let size = 0;
    for await (const chunk of req) { size += chunk.length; if (size > 64 * 1024) throw new Error('Preview body too large'); chunks.push(chunk); }
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) if (typeof value === 'string') headers.set(key, value);
    const request = new Request(`http://127.0.0.1:${port}${req.url}`, {
      method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method ?? '') ? undefined : Buffer.concat(chunks),
    });
    const response = await worker.fetch(request, env, { waitUntil(work: Promise<unknown>) { work.catch(() => {}); } } as unknown as Parameters<typeof worker.fetch>[2]);
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    res.end(req.method === 'HEAD' ? undefined : Buffer.from(await response.arrayBuffer()));
  } catch { res.writeHead(500); res.end('Synthetic preview request failed'); }
});
const port = Number(process.argv[2] ?? 4357);
server.listen(port, '127.0.0.1', () => console.log(`Synthetic cockpit preview: http://127.0.0.1:${port}/admin/leads/ (all external services blocked)`));
process.on('SIGTERM', () => server.close(() => process.exit(0)));

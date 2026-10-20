// Harness for the Cloudflare Access guard on /admin/* (npm run harness:leads-access).
// Runs the real Worker entry (worker/index.ts default export) so the wiring is tested too.
// Test JWTs are signed with RSA keys generated here; globalThis.fetch is stubbed so the certs URL
// answers locally and any other URL fails the run. No real Cloudflare endpoint is called.
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { createFakeD1 } from './fake-d1.mjs';
import worker from '../../worker/index.ts';
import { resetAccessKeyCache } from '../../worker/leads/access.ts';

type WorkerEnv = Parameters<typeof worker.fetch>[1];
type WorkerCtx = Parameters<typeof worker.fetch>[2];

const migrationsDir = fileURLToPath(new URL('../../worker/migrations/', import.meta.url));
const TEAM = 'https://bfl-test.cloudflareaccess.com';
const CERTS_URL = `${TEAM}/cdn-cgi/access/certs`;
const AUD = 'aud-test';
const ALLOWED = 'mediapaulo@gmail.com';
const PROD = 'https://beautyfacelift-zuerich.ch';

let failures = 0;
function check(condition: unknown, label: string, detail?: unknown): void {
  if (condition) {
    console.log(`[ok] ${label}`);
  } else {
    failures += 1;
    console.log(`[fail] ${label}${detail === undefined ? '' : ` — got ${JSON.stringify(detail)}`}`);
  }
}

// ---- keys and tokens ------------------------------------------------------------------------------
const algorithm = { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' };
const accessKeys = (await crypto.subtle.generateKey(algorithm, true, ['sign', 'verify'])) as CryptoKeyPair;
const otherKeys = (await crypto.subtle.generateKey(algorithm, true, ['sign', 'verify'])) as CryptoKeyPair;
const publicJwk = { ...(await crypto.subtle.exportKey('jwk', accessKeys.publicKey)), kid: 'kid-1', alg: 'RS256', use: 'sig' };

const b64url = (data: string | ArrayBuffer) => Buffer.from(typeof data === 'string' ? Buffer.from(data) : new Uint8Array(data)).toString('base64url');
const nowSeconds = () => Math.floor(Date.now() / 1000);

async function signJwt(claims: Record<string, unknown>, { kid = 'kid-1', key = accessKeys.privateKey, alg = 'RS256' } = {}): Promise<string> {
  const header = b64url(JSON.stringify({ alg, kid, typ: 'JWT' }));
  const payload = b64url(JSON.stringify(claims));
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(`${header}.${payload}`));
  return `${header}.${payload}.${b64url(signature)}`;
}

const validClaims = () => ({ iss: TEAM, aud: [AUD], exp: nowSeconds() + 3600, iat: nowSeconds(), email: ALLOWED, type: 'app' });

// ---- fetch stub -----------------------------------------------------------------------------------
let certFetches = 0;
let certsFail = false;
const unexpectedFetches: string[] = [];
globalThis.fetch = (async (input: RequestInfo | URL) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (url === CERTS_URL) {
    certFetches += 1;
    if (certsFail) return new Response('unavailable', { status: 500 });
    return Response.json({ keys: [publicJwk], public_cert: {}, public_certs: [] });
  }
  unexpectedFetches.push(url);
  throw new Error(`Harness: unexpected fetch to ${url}`);
}) as typeof fetch;

// Access denials are logged with console.warn; collect them so the output stays clean.
const warnings: string[] = [];
console.warn = (...args: unknown[]) => {
  warnings.push(args.map(String).join(' '));
};

// ---- env, ctx, requests ---------------------------------------------------------------------------
const db = createFakeD1({ migrationsDir });
const seededAt = new Date().toISOString();
db._db.prepare(`INSERT INTO leads (id, created_at, updated_at, source, name, phone, phone_normalized, status_changed_at)
  VALUES ('lead-1', ?, ?, 'kontakt-page', 'Seed Kundin', '079 123 45 67', '41791234567', ?)`).run(seededAt, seededAt, seededAt);
db._db.prepare(`INSERT INTO lead_events (lead_id, at, type, actor, to_status) VALUES ('lead-1', ?, 'created', 'system', 'neu')`).run(seededAt);

let assetCalls = 0;
const assets = {
  async fetch(request: Request) {
    assetCalls += 1;
    return new Response(`<!doctype html><title>Admin | Beauty Face Lift</title><p>legacy ${new URL(request.url).pathname}</p>`, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  },
};

function makeEnv(overrides: Record<string, unknown> = {}): WorkerEnv {
  return {
    ASSETS: assets,
    ACCESS_TEAM_DOMAIN: TEAM,
    ACCESS_AUD: AUD,
    ACCESS_ALLOWED_EMAILS: ALLOWED,
    ENVIRONMENT: 'production',
    LEADS_DB: db,
    LEADS_SIGNING_SECRET: 'test-secret',
    ...overrides,
  } as unknown as WorkerEnv;
}

const ctx = { waitUntil() {}, passThroughOnException() {}, props: {} } as unknown as WorkerCtx;

async function get(url: string, { headers = {}, env = makeEnv(), method = 'GET' }: { headers?: Record<string, string>; env?: WorkerEnv; method?: string } = {}) {
  const response = await worker.fetch(new Request(url, { method, headers }), env, ctx);
  return { status: response.status, body: await response.text(), headers: response.headers };
}

const asHeader = (token: string) => ({ 'Cf-Access-Jwt-Assertion': token });
const LIST = `${PROD}/admin/leads/`;

// ---- 1. valid JWT --------------------------------------------------------------------------------
resetAccessKeyCache();
{
  const token = await signJwt(validClaims());
  const viaHeader = await get(LIST, { headers: asHeader(token) });
  check(viaHeader.status === 200 && viaHeader.body.includes('Lead-Cockpit'), '1 valid JWT in Cf-Access-Jwt-Assertion: 200 with "Lead-Cockpit"', viaHeader.status);
  check(viaHeader.body.includes('Angemeldet als mediapaulo@gmail.com') && viaHeader.body.includes('Seed Kundin'), '1 valid JWT: page names the signed-in address and lists the seeded lead');
  check(certFetches === 1, '1 valid JWT: certs fetched once', certFetches);
  check(viaHeader.headers.get('cache-control') === 'no-store' && viaHeader.headers.get('x-robots-tag') === 'noindex, nofollow',
    '1 valid JWT: no-store and noindex headers', [viaHeader.headers.get('cache-control'), viaHeader.headers.get('x-robots-tag')]);

  const viaCookie = await get(LIST, { headers: { Cookie: `theme=x; CF_Authorization=${token}; other=y` } });
  check(viaCookie.status === 200 && viaCookie.body.includes('Lead-Cockpit'), '2 valid JWT in the CF_Authorization cookie: 200', viaCookie.status);
  check(certFetches === 1, '2 cached certs: the second valid request does not refetch', certFetches);

  const arrayAud = await get(LIST, { headers: asHeader(await signJwt({ ...validClaims(), aud: ['other-app', AUD] })) });
  check(arrayAud.status === 200, '3 aud array containing ACCESS_AUD: 200', arrayAud.status);
  const upperEmail = await get(LIST, { headers: asHeader(await signJwt({ ...validClaims(), email: 'MediaPaulo@Gmail.com' })) });
  check(upperEmail.status === 200, '4 allowed e-mail in other case: 200', upperEmail.status);
}

// ---- 2. rejected tokens --------------------------------------------------------------------------
{
  const warningsBefore = warnings.length;
  const none = await get(LIST);
  check(none.status === 401 && none.body.includes('Nicht angemeldet'), '5 no token: 401 "Nicht angemeldet"', none.status);
  check(warnings.length === warningsBefore, '5 no token: denied without a log line (bots, security smoke)', warnings.slice(warningsBefore));
  check(!/http-equiv="refresh"/i.test(none.body) && !/<script/i.test(none.body), '5 401 page: no meta refresh, no script');
  check(none.body.includes('href="/admin/leads/"') && none.body.includes('href="/cdn-cgi/access/logout"'), '5 401 page: "Erneut anmelden" and "Abmelden" links');
  check(none.headers.get('x-frame-options') === 'DENY' && none.headers.get('cache-control') === 'no-store'
    && none.headers.get('x-robots-tag') === 'noindex, nofollow', '5 401 page: security, no-store and noindex headers');
  check(!none.body.includes('Seed Kundin'), '5 401 page: no lead data');

  const cases: [string, Promise<string>][] = [
    ['6 expired (beyond the 60 s leeway)', signJwt({ ...validClaims(), exp: nowSeconds() - 120 })],
    ['7 wrong aud', signJwt({ ...validClaims(), aud: ['another-aud'] })],
    ['8 e-mail not allowed', signJwt({ ...validClaims(), email: 'info@beautyfacelift.ch' })],
    ['9 wrong iss', signJwt({ ...validClaims(), iss: 'https://evil.cloudflareaccess.com' })],
    ['10 nbf in the future', signJwt({ ...validClaims(), nbf: nowSeconds() + 600 })],
    ['11 e-mail missing', signJwt({ iss: TEAM, aud: [AUD], exp: nowSeconds() + 3600 })],
    ['12 signed with another key (known kid)', signJwt(validClaims(), { key: otherKeys.privateKey })],
    ['13 alg HS256 in the header', signJwt(validClaims(), { alg: 'HS256' })],
  ];
  for (const [label, tokenPromise] of cases) {
    const result = await get(LIST, { headers: asHeader(await tokenPromise) });
    check(result.status === 401 && result.body.includes('Nicht angemeldet') && !result.body.includes('Seed Kundin'), `${label}: 401`, result.status);
  }
  check(certFetches === 1, '6-13 rejected tokens with the known kid: no refetch', certFetches);
  check(warnings.at(-1)?.startsWith('Access denied for /admin/: ') === true, '6-13 rejected tokens are logged with their reason', warnings.at(-1));

  const skewedExp = await get(LIST, { headers: asHeader(await signJwt({ ...validClaims(), exp: nowSeconds() - 30 })) });
  check(skewedExp.status === 200, '13b exp 30 s ago (within the 60 s clock leeway): 200', skewedExp.status);
  const skewedNbf = await get(LIST, { headers: asHeader(await signJwt({ ...validClaims(), nbf: nowSeconds() + 30 })) });
  check(skewedNbf.status === 200, '13c nbf 30 s ahead (within the 60 s clock leeway): 200', skewedNbf.status);

  const garbage = await get(LIST, { headers: asHeader('not.a.jwt') });
  check(garbage.status === 401, '14 malformed token: 401', garbage.status);

  const userHeaderOnly = await get(LIST, { headers: { 'Cf-Access-Authenticated-User-Email': ALLOWED } });
  check(userHeaderOnly.status === 401, '15 Cf-Access-Authenticated-User-Email header alone: 401', userHeaderOnly.status);
}

// ---- 3. unknown kid ----------------------------------------------------------------------------------
{
  const before = certFetches;
  const unknown = await get(LIST, { headers: asHeader(await signJwt(validClaims(), { kid: 'kid-2', key: otherKeys.privateKey })) });
  check(unknown.status === 401, '16 unknown kid: 401', unknown.status);
  check(certFetches === before + 1, '16 unknown kid: exactly one refetch of the certs', certFetches - before);
  const again = await get(LIST, { headers: asHeader(await signJwt(validClaims(), { kid: 'kid-3', key: otherKeys.privateKey })) });
  check(again.status === 401 && certFetches === before + 1, '17 another unknown kid within a minute: 401, refetch throttled', certFetches - before);
  const stillValid = await get(LIST, { headers: asHeader(await signJwt(validClaims())) });
  check(stillValid.status === 200 && certFetches === before + 1, '18 valid token after the refetch: 200 from the cache', stillValid.status);
}

// ---- 4. configuration fails closed --------------------------------------------------------------------
{
  const token = await signJwt(validClaims());
  for (const [label, overrides] of [
    ['19 ACCESS_AUD empty', { ACCESS_AUD: '' }],
    ['20 ACCESS_TEAM_DOMAIN empty', { ACCESS_TEAM_DOMAIN: '' }],
    ['21 ACCESS_ALLOWED_EMAILS empty', { ACCESS_ALLOWED_EMAILS: '' }],
  ] as const) {
    const result = await get(LIST, { headers: asHeader(token), env: makeEnv(overrides) });
    check(result.status === 401, `${label}: valid token still 401`, result.status);
  }
  resetAccessKeyCache();
  certsFail = true;
  const fetchesBefore = certFetches;
  const unreachable = await get(LIST, { headers: asHeader(token) });
  check(unreachable.status === 401 && certFetches === fetchesBefore + 1, '22 certs endpoint answers 500: 401 after one fetch', [unreachable.status, certFetches - fetchesBefore]);
  certsFail = false; // the endpoint is back, but the failure is remembered for 60 s
  const withinBackoff = await get(LIST, { headers: asHeader(token) });
  check(withinBackoff.status === 401 && certFetches === fetchesBefore + 1, '22b second request within 60 s of the failure: 401 without fetching again (negative cache)', [withinBackoff.status, certFetches - fetchesBefore]);
  resetAccessKeyCache();
}

// ---- 5. dev bypass ------------------------------------------------------------------------------------
{
  const devEnv = makeEnv({ ENVIRONMENT: 'development', LEADS_DEV_EMAIL: 'mediapaulo@gmail.com' });
  const local = await get('http://localhost/admin/leads/', { env: devEnv });
  check(local.status === 200 && local.body.includes('Entwicklungsmodus'), '23 dev bypass on localhost (development + LEADS_DEV_EMAIL): 200', local.status);
  const loopback = await get('http://127.0.0.1:8787/admin/leads/', { env: devEnv });
  check(loopback.status === 200, '24 dev bypass on 127.0.0.1: 200', loopback.status);
  const onProdHost = await get(LIST, { env: devEnv });
  check(onProdHost.status === 401, '25 dev bypass on beautyfacelift-zuerich.ch: 401', onProdHost.status);
  const prodEnv = await get('http://localhost/admin/leads/', { env: makeEnv({ LEADS_DEV_EMAIL: 'mediapaulo@gmail.com' }) });
  check(prodEnv.status === 401, '26 ENVIRONMENT=production + LEADS_DEV_EMAIL on localhost: 401', prodEnv.status);
  const noDevEmail = await get('http://localhost/admin/leads/', { env: makeEnv({ ENVIRONMENT: 'development' }) });
  check(noDevEmail.status === 401, '27 development without LEADS_DEV_EMAIL on localhost: 401', noDevEmail.status);
}

// ---- 6. legacy static /admin/ pages ----------------------------------------------------------------------
{
  const before = assetCalls;
  const anonymous = await get(`${PROD}/admin/`);
  check(anonymous.status === 401 && assetCalls === before, '28 GET /admin/ without token: 401, assets not asked', [anonymous.status, assetCalls - before]);
  const encoded = await get(`${PROD}/%61dmin/`);
  check(encoded.status === 401 && assetCalls === before, '29 GET /%61dmin/ without token: 401 (encoded path is guarded too)', encoded.status);
  const doubleSlash = await get(`${PROD}//admin/`);
  check(doubleSlash.status === 401 && assetCalls === before, '29b GET //admin/ without token: 401 (repeated slashes are guarded too)', doubleSlash.status);
  const innerDoubleSlash = await get(`${PROD}/admin//leads/`);
  check(innerDoubleSlash.status === 401 && assetCalls === before, '29c GET /admin//leads/ without token: 401', innerDoubleSlash.status);
  const signedIn = await get(`${PROD}/admin/`, { headers: asHeader(await signJwt(validClaims())) });
  check(signedIn.status === 200 && signedIn.body.includes('legacy /admin/') && assetCalls === before + 1, '30 GET /admin/ with token: 200 from the assets', signedIn.status);
  check(signedIn.headers.get('x-robots-tag') === 'noindex, nofollow' && signedIn.headers.get('cache-control') === 'no-store', '30 legacy page: noindex and no-store');
}

// ---- 7. methods ---------------------------------------------------------------------------------------
{
  const token = await signJwt(validClaims());
  const put = await get(LIST, { method: 'PUT', headers: asHeader(token) });
  check(put.status === 405 && (put.headers.get('allow') ?? '').includes('GET'), '31 PUT /admin/leads/ with token: 405 with Allow', [put.status, put.headers.get('allow')]);
  const anonymousPut = await get(LIST, { method: 'PUT' });
  check(anonymousPut.status === 401, '32 PUT without token: 401 before anything else', anonymousPut.status);
  const head = await get(LIST, { method: 'HEAD', headers: asHeader(token) });
  check(head.status === 200 && head.body === '', '33 HEAD /admin/leads/ with token: 200 without body', head.status);
  const anonymousHead = await get(LIST, { method: 'HEAD' });
  check(anonymousHead.status === 401 && anonymousHead.body === '', '34 HEAD without token: 401 without body', [anonymousHead.status, anonymousHead.body.length]);
}

// ---- general ------------------------------------------------------------------------------------------
check(unexpectedFetches.length === 0, 'only the stubbed certs URL was fetched', unexpectedFetches);
check(warnings.length > 0 && warnings.every((line) => line.startsWith('Access denied for /admin/: ') && !line.includes('eyJ')),
  'denials are logged as "Access denied for /admin/: <reason>" without token contents', warnings.slice(0, 3));

if (failures > 0) {
  console.log(`[fail] ${failures} access check(s) failed`);
  process.exit(1);
}
console.log('[ok] lead access harness passed');

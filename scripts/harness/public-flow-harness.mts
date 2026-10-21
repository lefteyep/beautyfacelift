// Public tracking, attribution, link-preview and image-loading regressions.
// Run after npm run build: node --import tsx scripts/harness/public-flow-harness.mts
// All requests and browser APIs are local doubles. No analytics or mail leaves this process.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import sharp from 'sharp';
import { trackRoute } from '../../worker/routes/track.ts';
import * as tracking from '../../shared/tracking.ts';
import { BOOKING_FORWARD_KEYS, TREATWELL_BOOKING_URL } from '../../shared/site.ts';

const origin = 'https://beautyfacelift-zuerich.ch';
const graphCalls: Record<string, any>[] = [];
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  assert.match(String(input), /^https:\/\/graph\.facebook\.com\//, 'unexpected outbound request');
  graphCalls.push(JSON.parse(String(init?.body)));
  return Response.json({ events_received: 1 });
}) as typeof fetch;
const trackingEnv = { META_PIXEL_ID: 'test', META_ACCESS_TOKEN: 'stub' } as Parameters<typeof trackRoute>[1];
const validEvent = {
  event_name: 'Lead', event_id: 'public-flow-test', event_source_url: `${origin}/lp/aquafacial/`,
  event_data: { source: 'aquafacial_lp_form', value: 99, currency: 'CHF' },
  user_data: { em: 'a'.repeat(64), fbc: 'fb.1.1700000000000.TEST_CLICK' },
};
let requestNumber = 0;
async function post(body: unknown, headers: Record<string, string>, expected: number, label: string) {
  const before = graphCalls.length;
  const response = await trackRoute(new Request(`${origin}/api/track`, {
    method: 'POST', body: JSON.stringify(body),
    headers: { 'cf-connecting-ip': `10.0.0.${++requestNumber}`, ...headers },
  }), trackingEnv);
  assert.equal(response.status, expected, label);
  assert.equal(graphCalls.length - before, expected === 200 ? 1 : 0, `${label}: forwarding count`);
}
await post(validEvent, { origin, 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' }, 200, 'same-origin browser event');
assert.deepEqual(graphCalls[0].data[0].custom_data, validEvent.event_data, 'event data contract remains unchanged');
assert.equal(graphCalls[0].data[0].user_data.em, validEvent.user_data.em, 'hashed contact remains unchanged');
await post(validEvent, { 'content-type': 'Application/JSON; charset=UTF-8' }, 200, 'headerless JSON integration with charset');
await post(validEvent, { origin, 'sec-fetch-site': 'cross-site', 'content-type': 'application/json' }, 403, 'cross-site Fetch Metadata');
await post(validEvent, { origin: 'https://attacker.example', 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' }, 403, 'mismatched Origin');
await post(validEvent, { origin: 'null', 'content-type': 'application/json' }, 403, 'opaque Origin');
await post(validEvent, { origin: `https://www.beautyfacelift-zuerich.ch`, 'sec-fetch-site': 'same-site', 'content-type': 'application/json' }, 403, 'same-site origin is still different');
for (const contentType of ['text/plain', 'application/x-www-form-urlencoded', 'multipart/form-data; boundary=test', 'application/problem+json']) {
  await post(validEvent, { 'content-type': contentType }, 415, contentType);
}
await post(validEvent, {}, 415, 'missing JSON content type');
for (const body of [null, [], 'a string', 12, true]) {
  await post(body, { 'content-type': 'application/json' }, 400, `non-object JSON: ${JSON.stringify(body)}`);
}
const invalidJson = await trackRoute(new Request(`${origin}/api/track`, {
  method: 'POST', body: '{', headers: { 'content-type': 'application/json' },
}), trackingEnv);
assert.equal(invalidJson.status, 400, 'invalid JSON returns a client error');
await post({ ...validEvent, user_data: { em: 'person@example.test' } }, { 'content-type': 'application/json' }, 400, 'raw contact data remains rejected');
await post({ ...validEvent, event_data: { unknown_key: 'x' } }, { 'content-type': 'application/json' }, 400, 'unknown event keys remain rejected');
console.log('[ok] tracking origin, media type, body shape and forwarding contract');

const browserModule = ts.transpileModule(readFileSync('src/lib/track.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const bridgeSource = readFileSync('src/pages/termin/index.astro', 'utf8')
  .match(/<script is:inline define:vars=\{\{ bookingTargetUrl:[^\n]+>\n([\s\S]*?)<\/script>/)?.[1];
assert.ok(bridgeSource, 'booking bridge inline script found');
type BrowserCase = { oldCookie?: string; click?: string; storedClick?: string; consent?: boolean };
function browserCase(path: 'module' | 'bridge', options: BrowserCase) {
  const cookies = new Map<string, string>([['_fbp', 'fb.1.1700000000000.1234567']]);
  if (options.oldCookie) cookies.set('_fbc', options.oldCookie);
  const writes: string[] = [];
  const requests: Record<string, any>[] = [];
  const location = new URL(`${origin}/${path === 'bridge' ? 'termin/' : 'lp/aquafacial/'}`);
  if (options.click !== undefined) location.searchParams.set('fbclid', options.click);
  Object.assign(location, { replace() {}, assign() {} });
  const storage = { getItem(key: string) {
    if (key === 'bfl_marketing_consent') return options.consent === false ? 'denied' : 'granted';
    if (key === 'bfl_utm') return JSON.stringify(options.storedClick ? { fbclid: options.storedClick } : {});
    return null;
  }, setItem() {} };
  const document = { title: 'Test', getElementById() { return { setAttribute() {}, addEventListener() {} }; } };
  Object.defineProperty(document, 'cookie', {
    get: () => [...cookies].map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('; '),
    set(value: string) {
      writes.push(value);
      const [pair] = value.split(';');
      const [key, ...rest] = pair.split('=');
      cookies.set(key, decodeURIComponent(rest.join('=')));
    },
  });
  const callbacks: (() => void)[] = [];
  const window = { location, localStorage: storage, sessionStorage: storage, bflTrackingConfig: {},
    setTimeout(callback: () => void) { callbacks.push(callback); }, crypto: globalThis.crypto };
  const exports: Record<string, any> = {};
  const context = vm.createContext({ window, document, sessionStorage: storage, localStorage: storage,
    URL, URLSearchParams, Date, crypto: globalThis.crypto, TextEncoder, exports, module: { exports },
    require(name: string) { assert.equal(name, '../../shared/tracking'); return tracking; },
    bookingTargetUrl: TREATWELL_BOOKING_URL, bookingForwardKeys: [...BOOKING_FORWARD_KEYS], treatwellServiceDetailsByService: {},
    fetch(_input: unknown, init: RequestInit) { requests.push(JSON.parse(String(init.body))); return Promise.resolve(new Response('{}')); },
  });
  if (path === 'module') {
    vm.runInContext(browserModule, context);
    exports.trackPageView();
  } else {
    vm.runInContext(bridgeSource!, context);
    callbacks.forEach((callback) => callback());
  }
  return { fbc: cookies.get('_fbc'), fbcWrites: writes.filter((value) => value.startsWith('_fbc=')), writes, requests };
}
const oldCookie = 'fb.1.1700000000000.OLD_CLICK';
const sameCookie = 'fb.1.1700000000000.NEW.CLICK';
for (const path of ['module', 'bridge'] as const) {
  const changed = browserCase(path, { oldCookie, click: 'NEW.CLICK' });
  assert.match(changed.fbc!, /^fb\.1\.\d+\.NEW\.CLICK$/, `${path}: new click replaces previous ID`);
  assert.equal(changed.fbcWrites.length, 1, `${path}: one cookie replacement across events`);
  assert.ok(changed.requests.every((request) => request.user_data.fbc === changed.fbc), `${path}: new ID reaches every CAPI event`);
  const same = browserCase(path, { oldCookie: sameCookie, click: 'NEW.CLICK' });
  assert.equal(same.fbc, sameCookie, `${path}: same click preserves creation timestamp`);
  assert.equal(same.fbcWrites.length, 0, `${path}: same click is not rewritten`);
  for (const click of [undefined, 'not a valid click']) {
    const fallback = browserCase(path, { oldCookie, click });
    assert.equal(fallback.fbc, oldCookie, `${path}: missing/invalid click preserves existing cookie`);
    assert.equal(fallback.fbcWrites.length, 0);
    const noPreviousClick = browserCase(path, { click });
    assert.equal(noPreviousClick.fbc, undefined, `${path}: missing/invalid click creates no attribution`);
    assert.equal(noPreviousClick.fbcWrites.length, 0);
  }
  const stored = browserCase(path, { oldCookie, storedClick: 'STORED_CLICK' });
  assert.match(stored.fbc!, /\.STORED_CLICK$/, `${path}: session attribution updates previous ID`);
  const fresh = browserCase(path, { click: 'FRESH_CLICK' });
  assert.match(fresh.fbc!, /\.FRESH_CLICK$/, `${path}: first click creates cookie`);
  const denied = browserCase(path, { oldCookie, click: 'NEW_CLICK', consent: false });
  assert.equal(denied.fbc, oldCookie, `${path}: denied consent leaves existing cookie alone`);
  assert.equal(denied.writes.length, 0, `${path}: denied consent makes no cookie writes`);
  assert.equal(denied.requests.length, 0, `${path}: denied consent sends no events`);
}
console.log('[ok] both tracking paths: new/same/missing/invalid/stored click IDs and denied consent');

const lazyScript = readFileSync('src/layouts/Base.astro', 'utf8')
  .match(/<!-- Lazy image reveal -->\s*<script is:inline>([\s\S]*?)<\/script>/)?.[1];
assert.ok(lazyScript, 'image reveal script found');
let onReady: (() => void) | undefined;
let onLoad: (() => void) | undefined;
const classes = new Set<string>();
const lazyImage = { loading: 'lazy', complete: false, classList: { add(value: string) { classes.add(value); } },
  addEventListener(_event: string, callback: () => void) { onLoad = callback; } };
vm.runInNewContext(lazyScript!, { document: {
  addEventListener(_event: string, callback: () => void) { onReady = callback; },
  querySelectorAll() { return [lazyImage]; },
} });
onReady!();
assert.equal(lazyImage.loading, 'lazy', 'DOMContentLoaded preserves native lazy loading');
onLoad!();
assert.ok(classes.has('loaded'), 'loaded-image reveal class is preserved');
console.log('[ok] native lazy loading and image reveal');

for (const slug of ['aquafacial', 'aquafacial-microneedling', 'carbon-microneedling', 'microneedling', 'peeling']) {
  const html = readFileSync(`dist/lp/${slug}/index.html`, 'utf8');
  function meta(property: string) {
    const tag = html.match(new RegExp(`<meta\\b[^>]*property="${property}"[^>]*>`))?.[0];
    return tag?.match(/content="([^"]*)"/)?.[1];
  }
  const imageUrl = meta('og:image');
  assert.ok(imageUrl, `${slug}: OG image exists`);
  const imageFile = resolve('dist', `.${new URL(imageUrl!).pathname}`);
  const actual = await sharp(imageFile).metadata();
  assert.equal(Number(meta('og:image:width')), actual.width, `${slug}: declared width matches image`);
  assert.equal(Number(meta('og:image:height')), actual.height, `${slug}: declared height matches image`);
  assert.ok(Math.abs(actual.width! / actual.height! - 1200 / 630) < 0.005, `${slug}: preview is landscape 1.91:1`);
}
console.log('[ok] all five landing-page previews match actual image dimensions');

#!/usr/bin/env node

const DEFAULT_BASE_URL = 'https://beautyfacelift.mediapaulo.workers.dev';
const REQUIRED_HEADERS = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'x-frame-options': 'DENY',
  'strict-transport-security': 'max-age=31536000',
};

const args = parseArgs(process.argv.slice(2));
const baseUrl = normalizeBaseUrl(args['base-url'] || process.env.SECURITY_SMOKE_BASE_URL || DEFAULT_BASE_URL);
const supabaseUrl = args['supabase-url'] || process.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = args['supabase-anon-key'] || process.env.PUBLIC_SUPABASE_ANON_KEY || '';
const failures = [];

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith('--')) continue;

    const [rawKey, inlineValue] = value.slice(2).split('=', 2);
    if (inlineValue !== undefined) {
      parsed[rawKey] = inlineValue;
      continue;
    }

    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      parsed[rawKey] = next;
      index += 1;
    } else {
      parsed[rawKey] = 'true';
    }
  }
  return parsed;
}

function normalizeBaseUrl(value) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`Unsupported base URL protocol: ${url.protocol}`);
  }
  url.pathname = url.pathname.replace(/\/+$/, '');
  url.search = '';
  url.hash = '';
  return url.toString().replace(/\/$/, '');
}

function buildUrl(path) {
  return `${baseUrl}${path}`;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Expected JSON response, got: ${text.slice(0, 120)}`);
  }
}

async function check(name, task) {
  try {
    const detail = await task();
    console.log(`PASS ${name}${detail ? ` - ${detail}` : ''}`);
  } catch (error) {
    failures.push({ name, error });
    console.error(`FAIL ${name} - ${error.message}`);
  }
}

function assertSecurityHeaders(response) {
  for (const [header, expected] of Object.entries(REQUIRED_HEADERS)) {
    const actual = response.headers.get(header);
    assert(actual === expected, `${header} expected "${expected}", got "${actual}"`);
  }
}

async function postJson(path, body) {
  return fetch(buildUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'beautyfacelift-security-smoke/1.0',
    },
    body: JSON.stringify(body),
  });
}

console.log(`Security smoke base URL: ${baseUrl}`);

await check('services API returns active catalog', async () => {
  const response = await fetch(buildUrl('/api/services'));
  assert(response.status === 200, `expected 200, got ${response.status}`);
  assertSecurityHeaders(response);
  const data = await readJson(response);
  assert(Array.isArray(data.services), 'services payload is not an array');
  assert(data.services.length > 0, 'services payload is empty');
  assert(data.services.every((service) => typeof service.id === 'string' && typeof service.name === 'string'), 'service rows are missing id/name');
  return `${data.services.length} services`;
});

await check('slots API rejects malformed input', async () => {
  const response = await fetch(buildUrl('/api/slots?date=not-a-date&service_id=bad'));
  assert(response.status === 400, `expected 400, got ${response.status}`);
  assertSecurityHeaders(response);
  const data = await readJson(response);
  assert(typeof data.error === 'string' && data.error.length > 0, 'missing stable error message');
});

await check('contact API requires Turnstile on production host', async () => {
  const response = await postJson('/api/contact', {
    name: 'Security Smoke',
    email: 'smoke@example.com',
    phone: '',
    preferredCallbackTime: 'Morgen',
    topic: 'Erstberatung',
    message: 'Smoke test only. This request must fail before email delivery.',
    privacyConsent: 'true',
    company: '',
  });
  assert(response.status === 400, `expected 400, got ${response.status}`);
  assertSecurityHeaders(response);
  const data = await readJson(response);
  assert(String(data.error || '').includes('Sicherheitspr'), 'unexpected contact error message');
});

await check('tracking API rejects unknown event names', async () => {
  const response = await postJson('/api/track', {
    event_name: 'Purchase',
    event_source_url: `${baseUrl}/termin/`,
    event_data: {},
    user_data: {},
  });
  assert(response.status === 400, `expected 400, got ${response.status}`);
  assertSecurityHeaders(response);
  const data = await readJson(response);
  assert(data.error === 'Invalid event', `unexpected tracking error: ${JSON.stringify(data)}`);
});

await check('tracking API rejects raw PII user_data', async () => {
  const response = await postJson('/api/track', {
    event_name: 'Lead',
    event_source_url: `${baseUrl}/termin/`,
    event_data: {},
    user_data: {
      em: 'smoke@example.com',
      ph: '+41790000000',
    },
  });
  assert(response.status === 400, `expected 400, got ${response.status}`);
  assertSecurityHeaders(response);
  const data = await readJson(response);
  assert(data.error === 'Invalid user_data', `unexpected tracking error: ${JSON.stringify(data)}`);
});

await check('admin page stays noindex and protected by headers', async () => {
  const response = await fetch(buildUrl('/admin/'));
  assert(response.status === 200, `expected 200, got ${response.status}`);
  assertSecurityHeaders(response);
  const xRobotsTag = response.headers.get('x-robots-tag') || '';
  assert(xRobotsTag.toLowerCase().includes('noindex'), `missing noindex X-Robots-Tag: ${xRobotsTag}`);
  const cacheControl = response.headers.get('cache-control') || '';
  assert(cacheControl.toLowerCase().includes('no-store'), `admin cache-control must be no-store, got "${cacheControl}"`);
  const html = await response.text();
  assert(html.includes('Admin | Beauty Face Lift'), 'admin HTML title missing');
  assert(/name=["']robots["'][^>]*noindex/i.test(html), 'admin meta robots noindex missing');
});

await check('root response has baseline security headers', async () => {
  const response = await fetch(buildUrl('/'));
  assert(response.status === 200, `expected 200, got ${response.status}`);
  assertSecurityHeaders(response);
});

if (supabaseUrl && supabaseAnonKey) {
  await check('Supabase anon cannot enumerate bookings', async () => {
    const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/bookings?select=id&limit=1`;
    const response = await fetch(endpoint, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });

    if ([401, 403, 404].includes(response.status)) return `blocked with ${response.status}`;
    assert(response.status === 200, `expected blocked or empty 200, got ${response.status}`);
    const data = await readJson(response);
    assert(Array.isArray(data), 'expected array response');
    assert(data.length === 0, 'anon bookings endpoint exposed rows');
    return '200 empty result';
  });
} else {
  console.log('SKIP Supabase anon bookings check - set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY to enable it');
}

if (failures.length > 0) {
  console.error(`\nSecurity smoke failed: ${failures.length} check(s) failed`);
  process.exit(1);
}

console.log('\nSecurity smoke passed');

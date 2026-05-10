import type { Env } from '../env';

const TRACK_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const TRACK_RATE_LIMIT_MAX_REQUESTS = 120;
const ALLOWED_EVENTS = new Set(['PageView', 'Lead', 'Contact']);
const ALLOWED_SOURCE_HOSTS = new Set([
  'beautyfacelift.mediapaulo.workers.dev',
  'beautyfacelift.ch',
  'www.beautyfacelift.ch',
]);
const SHA256_HEX_RE = /^[a-f0-9]{64}$/i;
const META_COOKIE_RE = /^[A-Za-z0-9._:-]{1,200}$/;
const trackRateLimit = new Map<string, number[]>();

type TrackingBody = {
  event_name?: unknown;
  event_id?: unknown;
  event_data?: unknown;
  user_data?: unknown;
  event_source_url?: unknown;
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Cache-Control': 'no-store',
    },
  });
}

function getClientIp(request: Request): string {
  return request.headers.get('cf-connecting-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || '';
}

function checkRateLimit(ip: string): boolean {
  const key = ip || 'unknown';
  const now = Date.now();
  const existing = trackRateLimit.get(key) ?? [];
  const activeHits = existing.filter((timestamp) => now - timestamp < TRACK_RATE_LIMIT_WINDOW_MS);

  if (activeHits.length >= TRACK_RATE_LIMIT_MAX_REQUESTS) {
    trackRateLimit.set(key, activeHits);
    return false;
  }

  activeHits.push(now);
  trackRateLimit.set(key, activeHits);

  if (trackRateLimit.size > 2000) {
    for (const [rateKey, hits] of trackRateLimit.entries()) {
      const freshHits = hits.filter((timestamp) => now - timestamp < TRACK_RATE_LIMIT_WINDOW_MS);
      if (freshHits.length === 0) trackRateLimit.delete(rateKey);
      else trackRateLimit.set(rateKey, freshHits);
    }
  }

  return true;
}

function getString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function validateSourceUrl(value: unknown): string | null {
  const rawUrl = getString(value);
  if (!rawUrl || rawUrl.length > 2048) return null;

  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:') return null;
    if (!ALLOWED_SOURCE_HOSTS.has(parsed.hostname.toLowerCase())) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function validateEventId(value: unknown): string | undefined {
  const eventId = getString(value);
  if (!eventId) return undefined;
  if (eventId.length > 128 || !/^[A-Za-z0-9._:-]+$/.test(eventId)) return undefined;
  return eventId;
}

function sanitizeUserData(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  const input = value as Record<string, unknown>;
  const output: Record<string, string> = {};

  for (const [key, rawValue] of Object.entries(input)) {
    if (!['em', 'ph', 'fbp', 'fbc'].includes(key)) return null;
    if (rawValue === null || rawValue === undefined || rawValue === '') continue;
    if (typeof rawValue !== 'string') return null;

    const normalizedValue = rawValue.trim();
    if (key === 'em' || key === 'ph') {
      if (!SHA256_HEX_RE.test(normalizedValue)) return null;
      output[key] = normalizedValue.toLowerCase();
      continue;
    }

    if (!META_COOKIE_RE.test(normalizedValue)) return null;
    output[key] = normalizedValue;
  }

  return output;
}

function sanitizeEventData(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  const input = value as Record<string, unknown>;
  const output: Record<string, unknown> = {};

  for (const [key, rawValue] of Object.entries(input)) {
    if (!['value', 'currency', 'method', 'source', 'content_name'].includes(key)) return null;
    if (rawValue === null || rawValue === undefined || rawValue === '') continue;

    if (key === 'value') {
      if (typeof rawValue !== 'number' || !Number.isFinite(rawValue) || rawValue < 0 || rawValue > 100000) return null;
      output.value = rawValue;
      continue;
    }

    if (key === 'currency') {
      if (rawValue !== 'CHF') return null;
      output.currency = 'CHF';
      continue;
    }

    if (key === 'method') {
      if (!['whatsapp', 'phone', 'email'].includes(String(rawValue))) return null;
      output.method = rawValue;
      continue;
    }

    const stringValue = String(rawValue).trim();
    if (stringValue.length > 120) return null;
    output[key] = stringValue;
  }

  return output;
}

function ga4EventName(eventName: string): string {
  if (eventName === 'PageView') return 'page_view';
  if (eventName === 'Lead') return 'generate_lead';
  return 'contact';
}

export async function trackRoute(request: Request, env: Env): Promise<Response> {
  const clientIp = getClientIp(request);
  if (!checkRateLimit(clientIp)) {
    return jsonResponse({ error: 'Too many requests' }, 429);
  }

  let body: TrackingBody;
  try {
    body = await request.json() as TrackingBody;
  } catch {
    return jsonResponse({ error: 'Invalid request' }, 400);
  }

  const eventName = getString(body.event_name);
  if (!ALLOWED_EVENTS.has(eventName)) {
    return jsonResponse({ error: 'Invalid event' }, 400);
  }

  const eventSourceUrl = validateSourceUrl(body.event_source_url);
  if (!eventSourceUrl) {
    return jsonResponse({ error: 'Invalid event_source_url' }, 400);
  }

  const eventId = validateEventId(body.event_id);
  if (body.event_id && !eventId) {
    return jsonResponse({ error: 'Invalid event_id' }, 400);
  }

  const userData = sanitizeUserData(body.user_data);
  if (!userData) {
    return jsonResponse({ error: 'Invalid user_data' }, 400);
  }

  const eventData = sanitizeEventData(body.event_data);
  if (!eventData) {
    return jsonResponse({ error: 'Invalid event_data' }, 400);
  }

  const userAgent = request.headers.get('user-agent') || '';
  const results: Record<string, string> = {};

  if (env.META_PIXEL_ID && env.META_ACCESS_TOKEN) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v25.0/${env.META_PIXEL_ID}/events?access_token=${env.META_ACCESS_TOKEN}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: [{
              event_name: eventName,
              event_time: Math.floor(Date.now() / 1000),
              event_id: eventId,
              event_source_url: eventSourceUrl,
              action_source: 'website',
              user_data: {
                ...userData,
                client_ip_address: clientIp,
                client_user_agent: userAgent,
              },
              ...(Object.keys(eventData).length > 0 ? { custom_data: eventData } : {}),
            }],
          }),
        },
      );
      results.meta = res.ok ? 'ok' : 'error';
    } catch {
      results.meta = 'error';
    }
  }

  if (env.GA4_MEASUREMENT_ID && env.GA4_API_SECRET) {
    try {
      const res = await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${env.GA4_MEASUREMENT_ID}&api_secret=${env.GA4_API_SECRET}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: userData.fbp || `server.${eventId || Date.now()}`,
            events: [{ name: ga4EventName(eventName), params: { event_id: eventId, ...eventData } }],
          }),
        },
      );
      results.ga4 = res.ok ? 'ok' : 'error';
    } catch {
      results.ga4 = 'error';
    }
  }

  return jsonResponse({ status: 'ok', results }, 200);
}

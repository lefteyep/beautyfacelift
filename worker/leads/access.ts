// Cloudflare Access guard for every /admin/* request. Cloudflare Access sits in front of /admin/ and
// signs a JWT per session; the Worker verifies that JWT itself (RS256 against the team's public keys)
// and never trusts the Cf-Access-Authenticated-User-Email header alone. Fails closed: missing config,
// a bad token or an unreachable key endpoint all mean "no identity" (the caller answers 401).
import type { Env } from '../env';
import type { LeadActor } from '../../shared/leads';
import { CONTACT_EMAIL } from '../../shared/site';

export type AccessIdentity = {
  email: string;
  /** JWT expiry (seconds since epoch); 0 for the local dev identity. Part of the CSRF token. */
  exp: number;
  actor: LeadActor;
  /** True for the local development bypass (no Access token). */
  dev: boolean;
};

const JWT_HEADER = 'Cf-Access-Jwt-Assertion';
const JWT_COOKIE = 'CF_Authorization';
const CERTS_PATH = '/cdn-cgi/access/certs';
const CERTS_TTL_MS = 60 * 60 * 1000;
const UNKNOWN_KID_REFETCH_MS = 60 * 1000;
/** After a failed certs fetch, fail closed without refetching for this long. */
const CERTS_FAILURE_BACKOFF_MS = 60 * 1000;
/** Allowed clock skew for exp and nbf, in seconds. */
const CLOCK_LEEWAY_SECONDS = 60;
const DEV_HOSTS = ['localhost', '127.0.0.1', '[::1]'];

type KeyCache = { fetchedAt: number; keys: Map<string, CryptoKey>; unknownKidRefetchAt: number };

// One cache per team domain, kept for the lifetime of the isolate.
const keyCaches = new Map<string, KeyCache>();
// Time of the last failed certs fetch per team domain (negative cache).
const certFailures = new Map<string, number>();

/** Harness hook: forget cached keys and remembered certs failures. */
export function resetAccessKeyCache(): void {
  keyCaches.clear();
  certFailures.clear();
}

class AccessDenied extends Error {}

function actorFor(email: string): LeadActor {
  return email.toLowerCase() === CONTACT_EMAIL ? 'teresa' : 'agentur';
}

function devIdentity(request: Request, env: Env): AccessIdentity | null {
  const email = env.LEADS_DEV_EMAIL?.trim().toLowerCase();
  if (env.ENVIRONMENT === 'production' || !email) return null;
  if (!DEV_HOSTS.includes(new URL(request.url).hostname)) return null;
  return { email, exp: 0, actor: actorFor(email), dev: true };
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('Cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    if (part.slice(0, index).trim() === name) return part.slice(index + 1).trim() || null;
  }
  return null;
}

function base64UrlToBytes(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(value)) throw new AccessDenied('token is not base64url');
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function decodeJson(segment: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(new TextDecoder().decode(base64UrlToBytes(segment)));
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new AccessDenied('token segment is not an object');
  return parsed as Record<string, unknown>;
}

async function fetchKeys(teamDomain: string): Promise<Map<string, CryptoKey>> {
  const response = await fetch(`${teamDomain}${CERTS_PATH}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new AccessDenied(`certs endpoint answered ${response.status}`);
  const body = (await response.json()) as { keys?: unknown };
  const keys = new Map<string, CryptoKey>();
  for (const jwk of Array.isArray(body.keys) ? body.keys : []) {
    const key = jwk as JsonWebKey & { kid?: unknown };
    if (typeof key.kid !== 'string' || key.kty !== 'RSA') continue;
    keys.set(key.kid, await crypto.subtle.importKey('jwk', key, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']));
  }
  if (keys.size === 0) throw new AccessDenied('certs endpoint returned no RSA keys');
  return keys;
}

/** fetchKeys with a negative cache: within CERTS_FAILURE_BACKOFF_MS of a failure, deny without fetching. */
async function loadKeys(teamDomain: string, nowMs: number): Promise<Map<string, CryptoKey>> {
  const failedAt = certFailures.get(teamDomain);
  if (failedAt !== undefined && nowMs - failedAt < CERTS_FAILURE_BACKOFF_MS) throw new AccessDenied('certs endpoint failed recently');
  try {
    const keys = await fetchKeys(teamDomain);
    certFailures.delete(teamDomain);
    return keys;
  } catch (error) {
    certFailures.set(teamDomain, nowMs);
    throw error;
  }
}

async function keyFor(teamDomain: string, kid: string, nowMs: number): Promise<CryptoKey> {
  let cache = keyCaches.get(teamDomain);
  let fetchedForThisRequest = false;
  if (!cache || nowMs - cache.fetchedAt >= CERTS_TTL_MS) {
    cache = { fetchedAt: nowMs, keys: await loadKeys(teamDomain, nowMs), unknownKidRefetchAt: cache?.unknownKidRefetchAt ?? 0 };
    keyCaches.set(teamDomain, cache);
    fetchedForThisRequest = true;
  }
  const cached = cache.keys.get(kid);
  if (cached) return cached;
  if (fetchedForThisRequest) throw new AccessDenied('unknown kid');

  // Unknown kid: Access may have rotated its keys. Refetch, but at most once per minute.
  if (nowMs - cache.unknownKidRefetchAt < UNKNOWN_KID_REFETCH_MS) throw new AccessDenied('unknown kid (refetch throttled)');
  cache.unknownKidRefetchAt = nowMs;
  const keys = await loadKeys(teamDomain, nowMs);
  keyCaches.set(teamDomain, { fetchedAt: nowMs, keys, unknownKidRefetchAt: nowMs });
  const fresh = keys.get(kid);
  if (!fresh) throw new AccessDenied('unknown kid');
  return fresh;
}

function allowedEmails(value: string): string[] {
  return value.split(',').map((email) => email.trim().toLowerCase()).filter(Boolean);
}

async function verifyToken(token: string, env: Env, nowMs: number): Promise<AccessIdentity> {
  const teamDomain = (env.ACCESS_TEAM_DOMAIN ?? '').trim().replace(/\/+$/, '');
  const audience = (env.ACCESS_AUD ?? '').trim();
  const allowed = allowedEmails(env.ACCESS_ALLOWED_EMAILS ?? '');
  if (!teamDomain || !audience || allowed.length === 0) throw new AccessDenied('Access is not configured');

  const segments = token.split('.');
  if (segments.length !== 3) throw new AccessDenied('token is not a JWT');
  const [headerSegment, payloadSegment, signatureSegment] = segments;
  const header = decodeJson(headerSegment);
  if (header.alg !== 'RS256') throw new AccessDenied('alg is not RS256');
  if (typeof header.kid !== 'string' || !header.kid) throw new AccessDenied('kid missing');

  const key = await keyFor(teamDomain, header.kid, nowMs);
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    base64UrlToBytes(signatureSegment),
    new TextEncoder().encode(`${headerSegment}.${payloadSegment}`),
  );
  if (!valid) throw new AccessDenied('bad signature');

  const claims = decodeJson(payloadSegment);
  const nowSeconds = Math.floor(nowMs / 1000);
  if (claims.iss !== teamDomain) throw new AccessDenied('wrong iss');
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!audiences.includes(audience)) throw new AccessDenied('wrong aud');
  // CLOCK_LEEWAY_SECONDS of tolerance on both bounds for clock skew between Access and the Worker.
  if (typeof claims.exp !== 'number' || claims.exp + CLOCK_LEEWAY_SECONDS <= nowSeconds) throw new AccessDenied('expired');
  if (claims.nbf !== undefined && (typeof claims.nbf !== 'number' || claims.nbf - CLOCK_LEEWAY_SECONDS > nowSeconds)) throw new AccessDenied('not yet valid');
  if (typeof claims.email !== 'string' || !claims.email) throw new AccessDenied('email missing');
  const email = claims.email.trim().toLowerCase();
  if (!allowed.includes(email)) throw new AccessDenied('email not allowed');

  return { email, exp: claims.exp, actor: actorFor(email), dev: false };
}

/**
 * The verified identity behind an /admin/* request, or null. Order: local dev bypass (never in
 * production, only on localhost) → Access JWT from the Cf-Access-Jwt-Assertion header or the
 * CF_Authorization cookie → signature against ${ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs → claims
 * iss, aud, exp, nbf, email ∈ ACCESS_ALLOWED_EMAILS. Never throws.
 */
export async function verifyAccess(request: Request, env: Env, now: Date = new Date()): Promise<AccessIdentity | null> {
  const dev = devIdentity(request, env);
  if (dev) return dev;

  const token = request.headers.get(JWT_HEADER)?.trim() || readCookie(request, JWT_COOKIE);
  // No token is the normal case for bots and the security smoke: denied without a log line.
  if (!token) return null;
  try {
    return await verifyToken(token, env, now.getTime());
  } catch (error) {
    // The reason only; never the token or its claims.
    const reason = error instanceof AccessDenied ? error.message : `verification error (${error instanceof Error ? error.name : 'unknown'})`;
    console.warn(`Access denied for /admin/: ${reason}`);
    return null;
  }
}

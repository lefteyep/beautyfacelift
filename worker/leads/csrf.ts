// CSRF protection for the cockpit's POST forms: the browser must say the request is same-origin
// (Sec-Fetch-Site, else Origin), and the form must carry the hidden `_csrf` token, an HMAC over the
// signed-in e-mail and the Access session expiry. Without LEADS_SIGNING_SECRET every POST is refused.
import type { Env } from '../env';
import type { AccessIdentity } from './access';

export type CsrfResult = 'ok' | 'forbidden' | 'unconfigured';

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Hex HMAC-SHA256(secret, `csrf:${email}:${exp}`). */
export async function csrfToken(secret: string, identity: AccessIdentity): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`csrf:${identity.email}:${identity.exp}`));
  return toHex(signature);
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return difference === 0;
}

function isSameOrigin(request: Request): boolean {
  const fetchSite = request.headers.get('Sec-Fetch-Site');
  // A browser that sends Sec-Fetch-Site must call the POST same-origin ("none", a typed URL, is no form post).
  if (fetchSite !== null) return fetchSite === 'same-origin';
  return request.headers.get('Origin') === new URL(request.url).origin;
}

/** Checks a cockpit POST. `unconfigured` when LEADS_SIGNING_SECRET is missing (the caller answers 503). */
export async function verifyCsrf(request: Request, env: Env, identity: AccessIdentity, form: FormData): Promise<CsrfResult> {
  const secret = env.LEADS_SIGNING_SECRET;
  if (!secret) return 'unconfigured';
  if (!isSameOrigin(request)) return 'forbidden';
  const submitted = form.get('_csrf');
  if (typeof submitted !== 'string' || !submitted) return 'forbidden';
  return constantTimeEqual(submitted, await csrfToken(secret, identity)) ? 'ok' : 'forbidden';
}

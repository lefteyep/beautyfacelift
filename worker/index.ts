import { Router } from 'itty-router';
import type { Env } from './env';
import { servicesRoute } from './routes/services';
import { availabilityRoute } from './routes/availability';
import { slotsRoute } from './routes/slots';
import { bookingsRoute } from './routes/bookings';
import { trackRoute } from './routes/track';
import { contactRoute } from './routes/contact';
import { CANONICAL_HOST, TEMP_WORKERS_DEV_HOST, WWW_HOST } from '../shared/site';

const router = Router();

router.get('/api/services', (req: Request, env: Env) => servicesRoute(req, env));
router.get('/api/availability', (req: Request, env: Env) => availabilityRoute(req, env));
router.get('/api/slots', (req: Request, env: Env) => slotsRoute(req, env));
router.post('/api/bookings', (req: Request, env: Env) => bookingsRoute(req, env));
router.post('/api/track', (req: Request, env: Env) => trackRoute(req, env));
router.post('/api/contact', (req: Request, env: Env) => contactRoute(req, env));

const REDIRECT_TO_CANONICAL_HOSTS = new Set([
  WWW_HOST,
  TEMP_WORKERS_DEV_HOST,
]);

function canonicalHostRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  const hostname = url.hostname.toLowerCase();
  const shouldRedirectHost = REDIRECT_TO_CANONICAL_HOSTS.has(hostname);
  const shouldRedirectProtocol = hostname === CANONICAL_HOST && url.protocol === 'http:';

  if (!shouldRedirectHost && !shouldRedirectProtocol) {
    return null;
  }

  url.protocol = 'https:';
  url.hostname = CANONICAL_HOST;
  url.port = '';

  return Response.redirect(url.toString(), 301);
}

function withSecurityHeaders(response: Response, request: Request): Response {
  const url = new URL(request.url);
  const headers = new Headers(response.headers);

  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('X-Frame-Options', 'DENY');

  if (url.pathname.startsWith('/admin/')) {
    headers.set('Cache-Control', 'no-store');
    headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function fetchStaticAsset(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'HEAD') {
    return env.ASSETS.fetch(request);
  }

  const assetRequest = new Request(request, { method: 'GET' });
  const response = await env.ASSETS.fetch(assetRequest);
  const headers = new Headers(response.headers);
  headers.delete('Content-Length');

  return new Response(null, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const redirect = canonicalHostRedirect(request);
    if (redirect) return redirect;

    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      const response = await router.fetch(request, env, ctx);
      if (response) return withSecurityHeaders(response, request);
      return withSecurityHeaders(new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }), request);
    }

    const response = await fetchStaticAsset(request, env);
    return withSecurityHeaders(response, request);
  },
};

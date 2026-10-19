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
const DOCUMENT_ASSET_RELEASE_KEY = '2026-05-26-contact-layout-003';
const AQUAFACIAL_HERO_ASSET_PREFIX = '/assets/lp-aquafacial/';
const LONG_LIVED_STATIC_ASSET_CACHE = 'public, max-age=31536000, immutable';
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net",
  "connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://*.googletagmanager.com https://stats.g.doubleclick.net https://*.g.doubleclick.net https://www.google.com https://www.facebook.com https://graph.facebook.com",
  // www.google.com: the map embed on /kontakt/.
  "frame-src 'self' https://challenges.cloudflare.com https://www.google.com",
].join('; ');

router.get('/api/services', (req: Request, env: Env) => servicesRoute(req, env));
router.head('/api/services', async (req: Request, env: Env) => {
  const response = await servicesRoute(req, env);
  return new Response(null, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
});
router.get('/api/availability', (req: Request, env: Env) => availabilityRoute(req, env));
router.get('/api/slots', (req: Request, env: Env) => slotsRoute(req, env));
router.post('/api/bookings', (req: Request, env: Env) => bookingsRoute(req, env));
router.post('/api/track', (req: Request, env: Env) => trackRoute(req, env));
router.post('/api/contact', (req: Request, env: Env) => contactRoute(req, env));

const ERROR_PAGE_PATHS = new Set(['/404/', '/404.html']);

const REDIRECT_TO_CANONICAL_HOSTS = new Set([
  WWW_HOST,
  TEMP_WORKERS_DEV_HOST,
]);

// The old WordPress site. Once its DNS points at this Worker (docs/current/OLD-SITE-SHUTDOWN.md),
// every old URL answers with one 301 to its counterpart here; unknown old paths go to the home page.
// Until then these hosts never reach the Worker, so the map is inert.
const OLD_SITE_HOSTS = new Set(['beautyfacelift.ch', 'www.beautyfacelift.ch']);
const OLD_SITE_PATH_MAP: Record<string, string> = {
  '/': '/',
  '/angebot-preise/': '/behandlungen/',
  '/behandlungen/': '/behandlungen/',
  '/behandlungen/bdr-fruchtsaeurepeeling/': '/behandlungen/fruchtsaeure-peeling-zuerich/',
  '/behandlungen/carbon-peeling/': '/behandlungen/microneedling-zuerich/',
  '/behandlungen/coldplasma/': '/behandlungen/coldplasma-zuerich/',
  '/behandlungen/gesichtsbehandlung/': '/behandlungen/gesichtsbehandlung-zuerich/',
  '/behandlungen/hydra4face/': '/behandlungen/aquafacial-zuerich/',
  '/behandlungen/laser-haarentfernung/': '/behandlungen/laser-haarentfernung-zuerich/',
  '/behandlungen/make-up/': '/behandlungen/make-up-zuerich/',
  '/behandlungen/massage/': '/behandlungen/massage-zuerich-bahnhofstrasse/',
  '/behandlungen/micro-needling/': '/behandlungen/microneedling-zuerich/',
  '/behandlungen/waxing/': '/behandlungen/waxing-zuerich/',
  '/behandlungen/wimpern-und-brauen-zupfen-faerben/': '/behandlungen/wimpern-brauen-zuerich/',
  '/blog/': '/blog/',
  '/buchen/': '/termin/',
  '/termin/': '/termin/',
  '/danke/': '/kontakt/danke/',
  '/faq/': '/haeufige-fragen/',
  '/kontakt/': '/kontakt/',
  '/ueber-mich/': '/ueber-mich/',
  '/lp-aquafacial-aktion/': '/lp/aquafacial/',
  '/lp-aquafacial-microneedling/': '/lp/aquafacial-microneedling/',
  '/lp-carbon-microneedling/': '/lp/carbon-microneedling/',
};

function oldSiteRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  if (!OLD_SITE_HOSTS.has(url.hostname.toLowerCase())) return null;

  // "/kontakt" and "/kontakt/" are the same old page; files (".png", ".php") have no counterpart.
  const path = canonicalPath(url.pathname) ?? url.pathname;
  const target = new URL(OLD_SITE_PATH_MAP[path] ?? '/', `https://${CANONICAL_HOST}`);
  target.search = url.search; // keep campaign parameters on old ad links
  return Response.redirect(target.toString(), 301);
}

// Pages live at "/path/". Without this, "/path" and "/path/index.html" answered 200 as duplicates.
// API routes and files with an extension (".txt", ".png", ...) keep their path.
function canonicalPath(pathname: string): string | null {
  if (pathname.startsWith('/api/')) return null;
  if (pathname.endsWith('/index.html')) return pathname.slice(0, -'index.html'.length);
  const lastSegment = pathname.slice(pathname.lastIndexOf('/') + 1);
  if (lastSegment && !lastSegment.includes('.')) return `${pathname}/`;
  return null;
}

function canonicalHostRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  const hostname = url.hostname.toLowerCase();
  const shouldRedirectHost = REDIRECT_TO_CANONICAL_HOSTS.has(hostname);
  const shouldRedirectProtocol = hostname === CANONICAL_HOST && url.protocol === 'http:';

  if (!shouldRedirectHost && !shouldRedirectProtocol) {
    return null;
  }

  // One hop: host, protocol and path are fixed together.
  url.pathname = canonicalPath(url.pathname) ?? url.pathname;
  url.protocol = 'https:';
  url.hostname = CANONICAL_HOST;
  url.port = '';

  return Response.redirect(url.toString(), 301);
}

function legacyPathRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  const normalizedPath = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;

  if (normalizedPath !== '/ueber-uns') {
    return null;
  }

  url.pathname = '/ueber-mich/';
  return Response.redirect(url.toString(), 301);
}

function trailingSlashRedirect(request: Request): Response | null {
  if (request.method !== 'GET' && request.method !== 'HEAD') return null;
  const url = new URL(request.url);
  const path = canonicalPath(url.pathname);
  if (!path) return null;
  url.pathname = path;
  return Response.redirect(url.toString(), 301);
}

function withSecurityHeaders(response: Response, request: Request): Response {
  const url = new URL(request.url);
  const headers = new Headers(response.headers);

  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Strict-Transport-Security', 'max-age=31536000');
  headers.set('Content-Security-Policy-Report-Only', CSP_REPORT_ONLY);

  if (isDocumentAssetRequest(request)) {
    headers.set('Cache-Control', 'no-store');
  }

  if (isAquafacialHeroAssetRequest(request)) {
    headers.set('Cache-Control', LONG_LIVED_STATIC_ASSET_CACHE);
  }

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
  const assetRequest = createStaticAssetRequest(request, request.method === 'HEAD' ? 'GET' : request.method);

  if (request.method !== 'HEAD') {
    return env.ASSETS.fetch(assetRequest);
  }

  const response = await env.ASSETS.fetch(assetRequest);
  const headers = new Headers(response.headers);
  headers.delete('Content-Length');

  return new Response(null, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function createStaticAssetRequest(request: Request, method: string): Request {
  const url = new URL(request.url);

  if (shouldUseDocumentAssetReleaseKey(request)) {
    url.searchParams.set('__bfl_asset_release', DOCUMENT_ASSET_RELEASE_KEY);
  }

  return new Request(url.toString(), {
    method,
    headers: request.headers,
  });
}

function shouldUseDocumentAssetReleaseKey(request: Request): boolean {
  return isDocumentAssetRequest(request);
}

function isDocumentAssetRequest(request: Request): boolean {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return false;
  }

  const { pathname } = new URL(request.url);
  return isDocumentPath(pathname);
}

function isAquafacialHeroAssetRequest(request: Request): boolean {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return false;
  }

  const { pathname } = new URL(request.url);
  return pathname.startsWith(AQUAFACIAL_HERO_ASSET_PREFIX);
}

function isDocumentPath(pathname: string): boolean {
  return pathname === '/' || pathname.endsWith('/') || pathname.endsWith('.html');
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const redirect = oldSiteRedirect(request) ?? canonicalHostRedirect(request) ?? legacyPathRedirect(request) ?? trailingSlashRedirect(request);
    if (redirect) return redirect;

    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      let response: Response | undefined;
      try {
        response = await router.fetch(request, env, ctx);
      } catch (error) {
        console.error('API route failed:', error instanceof Error ? error.message : 'unknown error');
        response = new Response(JSON.stringify({ error: 'Interner Fehler. Bitte versuchen Sie es später erneut.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (response) return withSecurityHeaders(response, request);
      return withSecurityHeaders(new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }), request);
    }

    const response = await fetchStaticAsset(request, env);
    // The error page's own URLs must not answer 200 (soft 404).
    if (ERROR_PAGE_PATHS.has(url.pathname) && response.status === 200) {
      return withSecurityHeaders(new Response(response.body, { status: 404, headers: response.headers }), request);
    }
    return withSecurityHeaders(response, request);
  },
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    dataLayer?: Record<string, unknown>[];
    bflTracking?: {
      trackTreatwellOutbound: typeof trackTreatwellOutbound;
      trackBookingButtonClick: typeof trackBookingButtonClick;
      trackContact: typeof trackContact;
    };
    bflTrackingConfig?: {
      metaPixelId?: string;
      gtmId?: string;
    };
    __bflPpcTrackingInitialized?: boolean;
    __bflPpcTrackingStarted?: boolean;
  }
}

type ContactMethod = 'whatsapp' | 'phone' | 'email';
type MetaTrackMethod = 'track' | 'trackCustom';
type PpcEventName =
  | 'view_content'
  | 'landing_page_view'
  | 'treatment_view'
  | 'booking_button_click'
  | 'treatwell_outbound_click'
  | 'phone_click'
  | 'whatsapp_click'
  | 'email_click'
  | 'scroll_50'
  | 'scroll_90'
  | 'time_on_page_30s'
  | 'high_intent_visit';
type CapiEventName =
  | 'PageView'
  | 'Lead'
  | 'Contact'
  | 'ViewContent'
  | 'LandingPageView'
  | 'TreatmentView'
  | 'BookingButtonClick'
  | 'TreatwellOutboundClick'
  | 'Scroll50'
  | 'Scroll90'
  | 'TimeOnPage30s'
  | 'HighIntentVisit';

interface LeadPayload {
  email?: string;
  phone?: string;
  value?: number;
  currency?: string;
  source?: string;
}

interface ContactPayload {
  method: ContactMethod;
  source?: string;
  button_location?: string;
}

interface BookingClickPayload {
  treatment_name?: string;
  button_location?: string;
  destination_url?: string;
  service?: string;
}

interface TreatwellOutboundPayload extends BookingClickPayload {
  destination_url: string;
}

type EventPayload = Record<string, string | number | boolean | undefined>;

const CAMPAIGN_KEYS = [
  'utm_id',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'utm_source_platform',
  'gclid',
  'gbraid',
  'wbraid',
  'fbclid',
  'matchtype',
  'network',
  'device',
] as const;

const CAPI_EVENT_DATA_KEYS = new Set([
  'value',
  'currency',
  'method',
  'source',
  'content_name',
  'treatment_name',
  'button_location',
  'page_path',
  'destination_url',
  'link_domain',
  'page_type',
  'service',
  'intent_rule',
  'percent_scrolled',
]);

const LANDING_PAGE_CONTENT: Record<string, EventPayload> = {
  '/lp/carbon-microneedling/': {
    content_name: 'Carbon Microneedling Glow-Up Aktion',
    treatment_name: 'Carbon Microneedling',
    service: 'Carbon Microneedling',
    value: 169,
    currency: 'CHF',
  },
};

let pageViewTracked = false;
let metaPixelLoaded = false;
let gtmLoaded = false;

const MARKETING_CONSENT_KEY = 'bfl_marketing_consent';

function hasMarketingConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(MARKETING_CONSENT_KEY) === 'granted';
  } catch {
    return false;
  }
}

function loadMetaPixel(): void {
  if (typeof window === 'undefined') return;
  if (metaPixelLoaded) return;
  if (!hasMarketingConsent()) return;

  const pixelId = window.bflTrackingConfig?.metaPixelId;
  if (!pixelId) return;
  metaPixelLoaded = true;

  /* eslint-disable */
  !function(f: Window, b: Document, e: string, v: string, n?: any, t?: HTMLScriptElement, s?: Element) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode?.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  window.fbq?.('init', pixelId);
}

function loadGtm(): void {
  if (typeof window === 'undefined') return;
  if (gtmLoaded) return;
  if (!hasMarketingConsent()) return;

  const gtmId = window.bflTrackingConfig?.gtmId;
  if (!gtmId) return;
  gtmLoaded = true;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const firstScript = document.getElementsByTagName('script')[0];
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
  firstScript.parentNode?.insertBefore(tag, firstScript);
}

function loadMarketingLibraries(): void {
  loadMetaPixel();
  loadGtm();
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function sha256(value: string): Promise<string | undefined> {
  if (!value) return undefined;
  if (typeof crypto === 'undefined' || !crypto.subtle) return undefined;
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const encodedName = `${encodeURIComponent(name)}=`;
  const cookie = document.cookie.split('; ').find((part) => part.startsWith(encodedName));
  return cookie ? decodeURIComponent(cookie.slice(encodedName.length)) : undefined;
}

function getStoredCampaignParams(): EventPayload {
  if (typeof window === 'undefined') return {};

  let stored: Record<string, unknown> = {};
  try {
    stored = JSON.parse(sessionStorage.getItem('bfl_utm') || '{}') || {};
  } catch {
    stored = {};
  }

  const params = new URLSearchParams(window.location.search);
  const output: EventPayload = {};
  CAMPAIGN_KEYS.forEach((key) => {
    const value = params.get(key) || (typeof stored[key] === 'string' ? String(stored[key]) : '');
    if (value) output[key] = value;
  });
  return output;
}

function getUserData(): Record<string, string> {
  const userData: Record<string, string> = {};
  const fbp = readCookie('_fbp');
  const fbc = readCookie('_fbc');
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;
  return userData;
}

function getPagePath(): string {
  if (typeof window === 'undefined') return '';
  return window.location.pathname;
}

function normalizedPagePath(): string {
  const path = getPagePath();
  return path.endsWith('/') ? path : `${path}/`;
}

function getPageType(): string {
  const path = getPagePath();
  if (path.startsWith('/lp/')) return 'landing_page';
  if (path.startsWith('/behandlungen/')) return 'treatment';
  if (path.startsWith('/termin/')) return 'booking_forward';
  if (path.startsWith('/kontakt/')) return 'contact';
  return 'standard';
}

function labelFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function inferTreatmentName(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const params = new URLSearchParams(window.location.search);
  const service = params.get('service');
  if (service) return service;

  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts[0] === 'lp' && pathParts[1]) return labelFromSlug(pathParts[1]);
  if (pathParts[0] === 'behandlungen' && pathParts[1]) {
    return labelFromSlug(pathParts[1].replace(/-zuerich(?:-bahnhofstrasse)?$/, ''));
  }
  return undefined;
}

function currentEventContext(): EventPayload {
  return {
    ...getStoredCampaignParams(),
    page_path: getPagePath(),
    page_type: getPageType(),
    treatment_name: inferTreatmentName(),
  };
}

function landingPageContent(): EventPayload {
  return LANDING_PAGE_CONTENT[normalizedPagePath()] || {
    content_name: inferTreatmentName() || document.title,
    service: inferTreatmentName(),
  };
}

function linkDomain(destinationUrl?: string): string | undefined {
  if (!destinationUrl || typeof window === 'undefined') return undefined;
  try {
    return new URL(destinationUrl, window.location.href).hostname;
  } catch {
    return undefined;
  }
}

function cleanPayload(payload: EventPayload): EventPayload {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== ''),
  ) as EventPayload;
}

function capiEventData(payload: EventPayload): EventPayload {
  return Object.fromEntries(
    Object.entries(payload).filter(([key, value]) => CAPI_EVENT_DATA_KEYS.has(key) && value !== undefined && value !== ''),
  ) as EventPayload;
}

function pushDataLayer(event: string, payload: EventPayload = {}): void {
  if (typeof window === 'undefined') return;
  if (!hasMarketingConsent()) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(cleanPayload({ event, ...payload }));
}

function sendMetaBrowserEvent(
  method: MetaTrackMethod,
  eventName: string,
  payload: EventPayload,
  eventId: string,
): void {
  if (typeof window === 'undefined') return;
  window.fbq?.(method, eventName, cleanPayload(payload), { eventID: eventId });
}

function postCapi(body: Record<string, unknown>): void {
  try {
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:') return;
    if (!hasMarketingConsent()) return;
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => { /* non-critical */ });
  } catch { /* non-critical */ }
}

function trackPpcEvent(options: {
  dataLayerEvent: PpcEventName;
  capiEventName?: CapiEventName;
  metaEventName?: string;
  metaTrackMethod?: MetaTrackMethod;
  payload?: EventPayload;
  sendCapi?: boolean;
  pushToDataLayer?: boolean;
}): string {
  if (typeof window === 'undefined') return '';
  if (!hasMarketingConsent()) return '';
  loadMarketingLibraries();
  const event_id = randomId();
  const eventPayload = cleanPayload({
    ...currentEventContext(),
    ...options.payload,
    event_id,
  });

  if (options.pushToDataLayer !== false) {
    pushDataLayer(options.dataLayerEvent, eventPayload);
  }

  if (options.metaEventName) {
    sendMetaBrowserEvent(options.metaTrackMethod || 'trackCustom', options.metaEventName, eventPayload, event_id);
  }

  if (options.sendCapi && options.capiEventName) {
    postCapi({
      event_name: options.capiEventName,
      event_id,
      event_source_url: window.location.href,
      event_data: capiEventData(eventPayload),
      user_data: getUserData(),
    });
  }

  return event_id;
}

export function trackPageView(): void {
  if (typeof window === 'undefined') return;
  if (!hasMarketingConsent()) return;
  if (pageViewTracked) return;
  pageViewTracked = true;
  loadMarketingLibraries();
  const event_id = randomId();
  pushDataLayer('page_view', { ...currentEventContext(), event_id });
  window.fbq?.('track', 'PageView', cleanPayload(currentEventContext()), { eventID: event_id });
  postCapi({
    event_name: 'PageView',
    event_id,
    event_source_url: window.location.href,
    event_data: capiEventData(currentEventContext()),
    user_data: getUserData(),
  });
}

export async function trackLead(payload: LeadPayload = {}): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!hasMarketingConsent()) return;
  loadMarketingLibraries();
  const event_id = randomId();
  const { email, phone, value, currency = 'CHF', source } = payload;

  const customData: Record<string, unknown> = {};
  if (typeof value === 'number') { customData.value = value; customData.currency = currency; }
  if (source) customData.source = source;

  window.fbq?.('track', 'Lead', customData, { eventID: event_id });
  pushDataLayer('generate_lead', { ...currentEventContext(), ...customData, event_id });

  const user_data: Record<string, string> = {};
  const em = await sha256(email || '');
  const ph = await sha256((phone || '').replace(/\D/g, ''));
  if (em) user_data.em = em;
  if (ph) user_data.ph = ph;
  Object.assign(user_data, getUserData());

  postCapi({
    event_name: 'Lead',
    event_id,
    event_source_url: window.location.href,
    event_data: customData,
    user_data,
  });
}

export function trackContact(payload: ContactPayload): void {
  if (typeof window === 'undefined') return;
  const { method, source, button_location } = payload;
  const dataLayerEvent: PpcEventName = method === 'whatsapp'
    ? 'whatsapp_click'
    : method === 'phone'
      ? 'phone_click'
      : 'email_click';
  trackPpcEvent({
    dataLayerEvent,
    capiEventName: 'Contact',
    metaEventName: 'Contact',
    metaTrackMethod: 'track',
    sendCapi: true,
    payload: {
      method,
      source,
      button_location,
      value: 8,
      currency: 'CHF',
    },
  });
}

export function trackBookingButtonClick(payload: BookingClickPayload = {}): string {
  const destination_url = payload.destination_url || (typeof window !== 'undefined' ? window.location.href : '');
  return trackPpcEvent({
    dataLayerEvent: 'booking_button_click',
    capiEventName: 'BookingButtonClick',
    metaEventName: 'BookingButtonClick',
    sendCapi: true,
    payload: {
      ...payload,
      destination_url,
      link_domain: linkDomain(destination_url),
      value: 5,
      currency: 'CHF',
    },
  });
}

export function trackTreatwellOutbound(payload: TreatwellOutboundPayload): string {
  return trackPpcEvent({
    dataLayerEvent: 'treatwell_outbound_click',
    capiEventName: 'TreatwellOutboundClick',
    metaEventName: 'TreatwellOutboundClick',
    sendCapi: true,
    payload: {
      ...payload,
      link_domain: linkDomain(payload.destination_url),
      value: 10,
      currency: 'CHF',
    },
  });
}

function trackLandingOrTreatmentView(): void {
  const pageType = getPageType();
  if (pageType === 'landing_page') {
    const content = landingPageContent();
    trackPpcEvent({
      dataLayerEvent: 'landing_page_view',
      capiEventName: 'LandingPageView',
      metaEventName: 'LandingPageView',
      sendCapi: true,
      payload: content,
    });
    trackPpcEvent({
      dataLayerEvent: 'view_content',
      capiEventName: 'ViewContent',
      metaEventName: 'ViewContent',
      metaTrackMethod: 'track',
      sendCapi: true,
      payload: {
        ...content,
      },
    });
    return;
  }

  if (pageType === 'treatment') {
    trackPpcEvent({
      dataLayerEvent: 'treatment_view',
      capiEventName: 'ViewContent',
      metaEventName: 'ViewContent',
      metaTrackMethod: 'track',
      sendCapi: true,
      payload: {
        content_name: inferTreatmentName() || document.title,
        service: inferTreatmentName(),
      },
    });
  }
}

function engagementCapiEvent(event: PpcEventName): CapiEventName | undefined {
  if (event === 'scroll_50') return 'Scroll50';
  if (event === 'scroll_90') return 'Scroll90';
  if (event === 'time_on_page_30s') return 'TimeOnPage30s';
  return undefined;
}

function engagementMetaEvent(event: PpcEventName): string | undefined {
  if (event === 'scroll_50') return 'Scroll50';
  if (event === 'scroll_90') return 'Scroll90';
  if (event === 'time_on_page_30s') return 'TimeOnPage30s';
  return undefined;
}

function trackEngagementEvent(event: PpcEventName, payload: EventPayload = {}): void {
  trackPpcEvent({
    dataLayerEvent: event,
    capiEventName: engagementCapiEvent(event),
    metaEventName: engagementMetaEvent(event),
    payload,
    sendCapi: true,
  });
}

function trackHighIntent(intentRule: string, extra: EventPayload = {}): void {
  if (typeof window === 'undefined') return;
  const storageKey = 'bfl_high_intent_visit';
  try {
    if (sessionStorage.getItem(storageKey)) return;
    sessionStorage.setItem(storageKey, '1');
  } catch { /* session storage is non-critical */ }

  trackPpcEvent({
    dataLayerEvent: 'high_intent_visit',
    capiEventName: 'HighIntentVisit',
    metaEventName: 'HighIntentVisit',
    sendCapi: true,
    payload: {
      ...extra,
      intent_rule: intentRule,
      value: 2,
      currency: 'CHF',
    },
  });
}

function closestLink(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLAnchorElement>('a[href]');
}

function isTreatwellBookingUrl(url: URL): boolean {
  return url.hostname === 'buchung.treatwell.ch' && url.pathname.startsWith('/ort/beauty-face-lift');
}

function isBookingLink(url: URL): boolean {
  return (url.origin === window.location.origin && url.pathname.startsWith('/termin/')) || isTreatwellBookingUrl(url);
}

function buttonLocation(link: HTMLAnchorElement): string {
  return link.dataset.buttonLocation || link.dataset.source || link.closest('section')?.id || link.className || 'link';
}

function treatmentName(link: HTMLAnchorElement, url: URL): string | undefined {
  return link.dataset.treatment || url.searchParams.get('service') || inferTreatmentName();
}

function initClickTracking(): void {
  document.addEventListener('click', (event) => {
    const link = closestLink(event.target);
    if (!link) return;

    let url: URL;
    try {
      url = new URL(link.href, window.location.href);
    } catch {
      return;
    }

    const location = buttonLocation(link);
    const treatment = treatmentName(link, url);

    if (isBookingLink(url)) {
      trackBookingButtonClick({
        treatment_name: treatment,
        button_location: location,
        destination_url: url.toString(),
        service: url.searchParams.get('service') || treatment,
      });
      trackHighIntent('booking_click', { treatment_name: treatment, button_location: location });

      if (isTreatwellBookingUrl(url) && !window.location.pathname.startsWith('/termin/')) {
        trackTreatwellOutbound({
          treatment_name: treatment,
          button_location: location,
          destination_url: url.toString(),
          service: url.searchParams.get('service') || treatment,
        });
      }
      return;
    }

    if (url.protocol === 'tel:') {
      trackContact({ method: 'phone', source: link.dataset.source || 'site', button_location: location });
      trackHighIntent('phone_click', { button_location: location });
      return;
    }

    if (url.protocol === 'mailto:') {
      trackContact({ method: 'email', source: link.dataset.source || 'site', button_location: location });
      trackHighIntent('email_click', { button_location: location });
      return;
    }

    if (url.hostname === 'wa.me' || url.hostname === 'api.whatsapp.com') {
      trackContact({ method: 'whatsapp', source: link.dataset.source || 'site', button_location: location });
      trackHighIntent('whatsapp_click', { button_location: location });
    }
  }, { capture: true });
}

function initScrollAndTimerTracking(): void {
  let scroll50 = false;
  let scroll90 = false;
  let timer30 = false;

  const maybeHighIntentByEngagement = () => {
    if ((getPageType() === 'landing_page' || getPageType() === 'treatment') && scroll50 && timer30) {
      trackHighIntent('scroll_50_and_30s');
    }
  };

  const onScroll = () => {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const percent = Math.min(100, Math.round((window.scrollY / scrollable) * 100));

    if (!scroll50 && percent >= 50) {
      scroll50 = true;
      trackEngagementEvent('scroll_50', { percent_scrolled: 50 });
      maybeHighIntentByEngagement();
    }

    if (!scroll90 && percent >= 90) {
      scroll90 = true;
      trackEngagementEvent('scroll_90', { percent_scrolled: 90 });
      window.removeEventListener('scroll', onScroll);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.setTimeout(() => {
    timer30 = true;
    trackEngagementEvent('time_on_page_30s', { source: 'timer' });
    maybeHighIntentByEngagement();
  }, 30000);
}

export function initPpcTracking(): void {
  if (typeof window === 'undefined') return;
  if (window.__bflPpcTrackingInitialized) return;
  window.__bflPpcTrackingInitialized = true;

  window.bflTracking = {
    trackTreatwellOutbound,
    trackBookingButtonClick,
    trackContact,
  };

  const start = () => {
    if (!hasMarketingConsent()) return;
    if (window.__bflPpcTrackingStarted) return;
    window.__bflPpcTrackingStarted = true;
    loadMarketingLibraries();
    trackPageView();
    trackLandingOrTreatmentView();
    initClickTracking();
    initScrollAndTimerTracking();
  };

  window.addEventListener('bfl:marketing-consent-granted', start);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}

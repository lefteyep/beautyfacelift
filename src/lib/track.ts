declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

interface LeadPayload {
  email?: string;
  phone?: string;
  value?: number;
  currency?: string;
  source?: string;
}

interface ContactPayload {
  method: 'whatsapp' | 'phone' | 'email';
  source?: string;
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

function postCapi(body: Record<string, unknown>): void {
  try {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => { /* non-critical */ });
  } catch { /* non-critical */ }
}

export function trackPageView(): void {
  if (typeof window === 'undefined') return;
  const event_id = randomId();
  window.fbq?.('track', 'PageView', {}, { eventID: event_id });
  postCapi({
    event_name: 'PageView',
    event_id,
    event_source_url: window.location.href,
    user_data: {},
  });
}

export async function trackLead(payload: LeadPayload = {}): Promise<void> {
  if (typeof window === 'undefined') return;
  const event_id = randomId();
  const { email, phone, value, currency = 'CHF', source } = payload;

  const customData: Record<string, unknown> = {};
  if (typeof value === 'number') { customData.value = value; customData.currency = currency; }
  if (source) customData.source = source;

  window.fbq?.('track', 'Lead', customData, { eventID: event_id });

  const user_data: Record<string, string> = {};
  const em = await sha256(email || '');
  const ph = await sha256((phone || '').replace(/\D/g, ''));
  if (em) user_data.em = em;
  if (ph) user_data.ph = ph;

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
  const event_id = randomId();
  const { method, source } = payload;
  window.fbq?.('track', 'Contact', { method, source }, { eventID: event_id });
  postCapi({
    event_name: 'Contact',
    event_id,
    event_source_url: window.location.href,
    event_data: { method, source },
    user_data: {},
  });
}

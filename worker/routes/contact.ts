import type { Env } from '../env';
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_DISPLAY,
  CONTACT_TOPICS,
  CONTACT_TO_EMAIL_FALLBACK,
  TREATWELL_BOOKING_URL,
  TURNSTILE_ALLOWED_HOSTS,
} from '../../shared/site';

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const contactRateLimit = new Map<string, number[]>();

class ContactConfigError extends Error {}

type ContactSubmission = {
  name: string;
  email: string;
  phone: string;
  preferredContactMethod: string;
  preferredCallbackTime: string;
  topic: string;
  message: string;
  privacyConsent: string;
  company: string;
  turnstileToken: string;
};

const PREFERRED_CONTACT_METHODS = ['WhatsApp', 'Telefon', 'E-Mail'] as const;

function getString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Cache-Control': 'no-store',
    },
  });
}

function redirectResponse(location: string): Response {
  return new Response(null, {
    status: 303,
    headers: {
      Location: location,
      'Cache-Control': 'no-store',
    },
  });
}

function htmlErrorResponse(message: string, status = 400): Response {
  const safeMessage = escapeHtml(message);
  const html = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Kontaktanfrage konnte nicht gesendet werden</title>
    <style>
      body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #F6F1EA; color: #1C1A17; line-height: 1.6; }
      main { max-width: 720px; margin: 0 auto; padding: 56px 24px; }
      .card { background: #FBF8F3; border: 1px solid rgba(28, 26, 23, 0.08); border-radius: 22px; padding: 32px; box-shadow: 0 4px 14px rgba(28, 26, 23, 0.06); }
      h1 { font-family: "Cormorant Garamond", "Times New Roman", serif; font-size: clamp(2rem, 5vw, 3rem); margin: 0 0 16px; line-height: 1.08; }
      p { margin: 0 0 16px; max-width: 60ch; }
      a { color: #1C1A17; }
      .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
      .pill { display: inline-flex; align-items: center; justify-content: center; padding: 14px 24px; border-radius: 999px; background: #B98F47; color: #fff; text-decoration: none; font-weight: 600; }
      .muted { color: #6E665B; font-size: 0.95rem; }
    </style>
  </head>
  <body>
    <main>
      <div class="card">
        <p class="muted">Kontaktformular</p>
        <h1>Die Anfrage konnte nicht gesendet werden.</h1>
        <p>${safeMessage}</p>
        <p class="muted">Wenn Ihr Anliegen dringend ist, erreichen Sie uns direkt unter <a href="tel:${CONTACT_PHONE}">${CONTACT_PHONE_DISPLAY}</a> oder per E-Mail an <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
        <div class="actions">
          <a class="pill" href="/kontakt/">Zurück zum Formular</a>
          <a href="${TREATWELL_BOOKING_URL}">Termin buchen</a>
        </div>
      </div>
    </main>
  </body>
</html>`;

  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'no-store',
    },
  });
}

async function parseSubmission(request: Request): Promise<{ data: ContactSubmission; expectsHtml: boolean }> {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const payload = await request.json() as Record<string, unknown>;
    return {
      expectsHtml: false,
      data: {
        name: getString(payload.name),
        email: getString(payload.email),
        phone: getString(payload.phone),
        preferredContactMethod: getString(payload.preferredContactMethod),
        preferredCallbackTime: getString(payload.preferredCallbackTime),
        topic: getString(payload.topic),
        message: getString(payload.message),
        privacyConsent: getString(payload.privacyConsent),
        company: getString(payload.company),
        turnstileToken: getString(payload.turnstileToken || payload['cf-turnstile-response']),
      },
    };
  }

  const formData = await request.formData();

  return {
    expectsHtml: true,
    data: {
      name: getString(formData.get('name')),
      email: getString(formData.get('email')),
      phone: getString(formData.get('phone')),
      preferredContactMethod: getString(formData.get('preferredContactMethod')),
      preferredCallbackTime: getString(formData.get('preferredCallbackTime')),
      topic: getString(formData.get('topic')),
      message: getString(formData.get('message')),
      privacyConsent: getString(formData.get('privacyConsent')),
      company: getString(formData.get('company')),
      turnstileToken: getString(formData.get('cf-turnstile-response')),
    },
  };
}

function getClientIp(request: Request): string {
  return request.headers.get('cf-connecting-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
}

function getTurnstileAllowedHosts(env: Env): string[] {
  const configuredHosts = env.TURNSTILE_ALLOWED_HOSTS
    ?.split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean) ?? [];

  return [...TURNSTILE_ALLOWED_HOSTS, ...configuredHosts];
}

function isTurnstileRequired(request: Request, env: Env): boolean {
  const hostname = new URL(request.url).hostname.toLowerCase();
  return getTurnstileAllowedHosts(env).includes(hostname);
}

function isAllowedTopic(topic: string): boolean {
  return CONTACT_TOPICS.includes(topic as (typeof CONTACT_TOPICS)[number]);
}

function isAllowedPreferredContactMethod(method: string): boolean {
  return PREFERRED_CONTACT_METHODS.includes(method as (typeof PREFERRED_CONTACT_METHODS)[number]);
}

function validateSubmission(data: ContactSubmission): string | null {
  if (!data.name) return 'Bitte geben Sie Ihren Namen an.';
  if (data.name.length > 120) return 'Der Name ist zu lang.';
  if (!data.email && !data.phone) return 'Bitte geben Sie mindestens eine E-Mail-Adresse oder Telefonnummer an.';
  if (data.email && !isValidEmail(data.email)) return 'Bitte geben Sie eine gültige E-Mail-Adresse an.';
  if (data.phone && !isValidPhone(data.phone)) return 'Bitte geben Sie eine gültige Telefonnummer an.';
  if (data.preferredContactMethod && !isAllowedPreferredContactMethod(data.preferredContactMethod)) return 'Bitte wählen Sie einen gültigen Kontaktweg aus.';
  if (data.preferredCallbackTime.length > 160) return 'Der gewünschte Rückrufzeitpunkt ist zu lang.';
  if (!data.topic || !isAllowedTopic(data.topic)) return 'Bitte wählen Sie ein gültiges Thema aus.';
  if (!data.message) return 'Bitte schreiben Sie eine Nachricht.';
  if (data.message.length > 4000) return 'Die Nachricht ist zu lang.';
  if (!data.privacyConsent) return 'Bitte bestätigen Sie die Datenschutzerklärung.';
  return null;
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const existing = contactRateLimit.get(ip) ?? [];
  const activeHits = existing.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (activeHits.length >= RATE_LIMIT_MAX_REQUESTS) {
    contactRateLimit.set(ip, activeHits);
    return false;
  }

  activeHits.push(now);
  contactRateLimit.set(ip, activeHits);

  if (contactRateLimit.size > 500) {
    for (const [key, hits] of contactRateLimit.entries()) {
      const freshHits = hits.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
      if (freshHits.length === 0) contactRateLimit.delete(key);
      else contactRateLimit.set(key, freshHits);
    }
  }

  return true;
}

async function verifyTurnstile(token: string, ip: string, secret: string): Promise<boolean> {
  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip: ip,
  });

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) return false;
  const result = await response.json() as { success?: boolean };
  return Boolean(result.success);
}

async function sendNotificationEmail(data: ContactSubmission, request: Request, env: Env, ip: string): Promise<void> {
  if (!env.RESEND_API_KEY) {
    throw new ContactConfigError('RESEND_API_KEY is missing');
  }

  const to = env.CONTACT_TO_EMAIL || env.OWNER_EMAIL || CONTACT_TO_EMAIL_FALLBACK;
  const from = env.CONTACT_FROM_EMAIL || 'Beauty Face Lift <onboarding@resend.dev>';
  const replyTo = isValidEmail(data.email) ? data.email : undefined;
  const userAgent = request.headers.get('user-agent') || 'Unbekannt';
  const submittedAt = new Date().toISOString();

  const text = [
    `Neue Kontaktanfrage: ${data.topic}`,
    '',
    `Name: ${data.name}`,
    `E-Mail: ${data.email || 'Nicht angegeben'}`,
    `Telefon: ${data.phone || 'Nicht angegeben'}`,
    `Bevorzugter Kontaktweg: ${data.preferredContactMethod || 'Nicht angegeben'}`,
    `Bevorzugter Rückrufzeitpunkt: ${data.preferredCallbackTime || 'Nicht angegeben'}`,
    `Thema: ${data.topic}`,
    '',
    'Nachricht:',
    data.message,
    '',
    `IP: ${ip}`,
    `User-Agent: ${userAgent}`,
    `Eingang: ${submittedAt}`,
  ].join('\n');

  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1C1A17; line-height: 1.6;">
      <h1 style="font-family: 'Cormorant Garamond', 'Times New Roman', serif; font-size: 32px; margin-bottom: 12px;">Neue Kontaktanfrage</h1>
      <p style="margin: 0 0 24px;">Thema: <strong>${escapeHtml(data.topic)}</strong></p>
      <table style="border-collapse: collapse; width: 100%; max-width: 720px;">
        <tr><td style="padding: 8px 0; font-weight: 600;">Name</td><td style="padding: 8px 0;">${escapeHtml(data.name)}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: 600;">E-Mail</td><td style="padding: 8px 0;">${escapeHtml(data.email || 'Nicht angegeben')}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: 600;">Telefon</td><td style="padding: 8px 0;">${escapeHtml(data.phone || 'Nicht angegeben')}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: 600;">Bevorzugter Kontaktweg</td><td style="padding: 8px 0;">${escapeHtml(data.preferredContactMethod || 'Nicht angegeben')}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: 600;">Rückrufzeit</td><td style="padding: 8px 0;">${escapeHtml(data.preferredCallbackTime || 'Nicht angegeben')}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: 600;">IP</td><td style="padding: 8px 0;">${escapeHtml(ip)}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: 600;">User-Agent</td><td style="padding: 8px 0;">${escapeHtml(userAgent)}</td></tr>
      </table>
      <div style="margin-top: 24px; padding: 20px; background: #FBF8F3; border: 1px solid rgba(28, 26, 23, 0.08); border-radius: 16px;">
        <p style="margin: 0 0 8px; font-weight: 600;">Nachricht</p>
        <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
      </div>
    </div>
  `;

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: replyTo ? [replyTo] : undefined,
      subject: `Neue Kontaktanfrage: ${data.topic} — ${data.name}`,
      text,
      html,
    }),
  });

  if (!resendResponse.ok) {
    throw new Error(`Resend request failed with status ${resendResponse.status}`);
  }
}

function respondError(message: string, status: number, expectsHtml: boolean): Response {
  return expectsHtml ? htmlErrorResponse(message, status) : jsonResponse({ error: message }, status);
}

export async function contactRoute(request: Request, env: Env): Promise<Response> {
  let parsed: { data: ContactSubmission; expectsHtml: boolean };

  try {
    parsed = await parseSubmission(request);
  } catch {
    return respondError('Die Anfrage konnte nicht gelesen werden.', 400, true);
  }

  const { data, expectsHtml } = parsed;

  if (data.company) {
    return respondError('Ungültige Anfrage.', 400, expectsHtml);
  }

  const validationError = validateSubmission(data);
  if (validationError) {
    return respondError(validationError, 400, expectsHtml);
  }

  const ip = getClientIp(request);
  if (!checkRateLimit(ip)) {
    return respondError('Zu viele Anfragen in kurzer Zeit. Bitte versuchen Sie es in einigen Minuten erneut.', 429, expectsHtml);
  }

  const turnstileRequired = isTurnstileRequired(request, env);
  if (turnstileRequired && !env.TURNSTILE_SECRET_KEY) {
    return respondError('Die Sicherheitsprüfung ist derzeit nicht verfügbar. Bitte rufen Sie uns direkt an oder schreiben Sie uns per E-Mail.', 503, expectsHtml);
  }

  if (turnstileRequired) {
    if (!data.turnstileToken) {
      return respondError('Bitte bestätigen Sie die Sicherheitsprüfung.', 400, expectsHtml);
    }

    const isHuman = await verifyTurnstile(data.turnstileToken, ip, env.TURNSTILE_SECRET_KEY || '');
    if (!isHuman) {
      return respondError('Die Sicherheitsprüfung konnte nicht bestätigt werden. Bitte versuchen Sie es erneut.', 400, expectsHtml);
    }
  }

  try {
    await sendNotificationEmail(data, request, env, ip);
  } catch (error) {
    const isConfigError = error instanceof ContactConfigError;
    console.error('Contact route failed:', isConfigError ? error.message : 'email delivery failed');
    return respondError(
      'Ihre Anfrage konnte gerade nicht versendet werden. Bitte rufen Sie uns direkt an oder schreiben Sie uns per E-Mail.',
      isConfigError ? 503 : 502,
      expectsHtml,
    );
  }

  return expectsHtml ? redirectResponse('/kontakt/danke/') : jsonResponse({ ok: true }, 201);
}

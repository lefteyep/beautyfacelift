// Sends one e-mail through the Resend API. Used by the automatic lead e-mails (customer confirmation,
// reminder to the studio). The owner enquiry e-mail in worker/routes/contact.ts still has its own
// request and is moved onto this sender in a later refactor.
// Never logs addresses or bodies; errors carry only the config name or the HTTP status.
import type { Env } from '../env';
import { CONTACT_EMAIL } from '../../shared/site';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const MAIL_TIMEOUT_MS = 10_000;

export type EmailMessage = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  /** Defaults to the studio address (CONTACT_EMAIL). */
  replyTo?: string;
  bcc?: string[];
  headers?: Record<string, string>;
  /** Provider-level deduplication for the same logical automated delivery. Never a mail header. */
  idempotencyKey?: string;
  /** Resend tags: name and value in ASCII letters, digits, "_" and "-". */
  tags?: { name: string; value: string }[];
};

/** A required setting (RESEND_API_KEY, CONTACT_FROM_EMAIL) is missing. Nothing was sent. */
export class MailConfigError extends Error {
  constructor(setting: string) {
    super(`${setting} is missing`);
    this.name = 'MailConfigError';
  }
}

/** Resend answered with a non-2xx status. */
export class MailSendError extends Error {
  readonly delivery: 'rejected' | 'uncertain';

  constructor(readonly status: number) {
    super(`Resend request failed with status ${status}`);
    this.name = 'MailSendError';
    // A timeout, idempotency conflict or server error does not establish that no mail was accepted.
    this.delivery = status >= 400 && status < 500 && status !== 408 && status !== 409 ? 'rejected' : 'uncertain';
  }
}

/** Only failures that establish no delivery may release an automation reservation for a retry. */
export function isDefinitiveMailRejection(error: unknown): boolean {
  return error instanceof MailConfigError || (error instanceof MailSendError && error.delivery === 'rejected');
}

/**
 * Sends `message` from CONTACT_FROM_EMAIL. Throws MailConfigError when RESEND_API_KEY or
 * CONTACT_FROM_EMAIL is missing (there is no shared test sender here: these mails go to customers),
 * MailSendError on a non-2xx answer. Returns the Resend message id.
 */
export async function sendEmail(env: Env, message: EmailMessage): Promise<{ id: string }> {
  if (!env.RESEND_API_KEY) throw new MailConfigError('RESEND_API_KEY');
  const from = env.CONTACT_FROM_EMAIL?.trim();
  if (!from) throw new MailConfigError('CONTACT_FROM_EMAIL');

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      ...(message.idempotencyKey ? { 'Idempotency-Key': message.idempotencyKey } : {}),
    },
    signal: AbortSignal.timeout(MAIL_TIMEOUT_MS),
    body: JSON.stringify({
      from,
      to: Array.isArray(message.to) ? message.to : [message.to],
      bcc: message.bcc && message.bcc.length > 0 ? message.bcc : undefined,
      reply_to: [message.replyTo ?? CONTACT_EMAIL],
      subject: message.subject,
      text: message.text,
      html: message.html,
      headers: message.headers,
      tags: message.tags,
    }),
  });

  if (!response.ok) throw new MailSendError(response.status);

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    // Acceptance may already have happened. The caller retains its reservation for agency review.
    throw new Error('Resend delivery confirmation is unreadable');
  }
  if (!body || typeof body !== 'object' || !('id' in body)
    || typeof body.id !== 'string' || !body.id.trim()) {
    throw new Error('Resend delivery confirmation has no message ID');
  }
  return { id: body.id };
}

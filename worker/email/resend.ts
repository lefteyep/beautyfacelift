// Sends one e-mail through the Resend API. Used by the automatic lead e-mails (customer confirmation,
// reminder to the studio). The owner enquiry e-mail in worker/routes/contact.ts still has its own
// request and is moved onto this sender in a later refactor.
// Never logs addresses or bodies; errors carry only the config name or the HTTP status.
import type { Env } from '../env';
import { CONTACT_EMAIL } from '../../shared/site';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export type EmailMessage = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  /** Defaults to the studio address (CONTACT_EMAIL). */
  replyTo?: string;
  bcc?: string[];
  headers?: Record<string, string>;
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
  constructor(readonly status: number) {
    super(`Resend request failed with status ${status}`);
    this.name = 'MailSendError';
  }
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
    },
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

  let id = '';
  try {
    const body = (await response.json()) as { id?: unknown };
    if (typeof body.id === 'string') id = body.id;
  } catch {
    // Sent, but the answer was not JSON: keep the empty id.
  }
  return { id };
}

// Sends the customer confirmation of receipt for one new lead, at most once. Called from
// worker/routes/contact.ts through ctx.waitUntil after the owner e-mail went out, so it never delays or
// changes the form's answer.
//
// Off until go-live: nothing is sent unless LEADS_CUSTOMER_MAILS is exactly "on".
// Anti-backscatter: the two ad pages accept posts without Turnstile, so a bot can enter strangers'
// addresses. Hence at most one confirmation per address per 24 h, at most 20 per hour overall, and none
// when the name (echoed in the greeting) carries a link, a domain, an address or markup.
import type { Env } from '../env';
import { normalizeEmail } from '../../shared/leads';
import { appendEvent, claimConfirmation, getLead, hasRecentConfirmation, releaseAutomation, type LeadRow } from '../leads/db';
import { isDefinitiveMailRejection, sendEmail } from './resend';
import { confirmationMail } from './templates/confirmation';

const HOUR_MS = 60 * 60 * 1000;
/** No second confirmation to the same address within this window. */
const SAME_ADDRESS_WINDOW_MS = 24 * HOUR_MS;
/** Maximum confirmations reserved in the last hour, including in-flight/uncertain deliveries. */
const MAX_CONFIRMATIONS_PER_HOUR = 20;
/**
 * A name that could turn the greeting into an advert: a URL scheme, "www.", "<" or ">", "@", or a dotted
 * domain (two or more characters, a dot, two or more letters, e.g. "example.test"). Accepted false
 * positive: a name written like "Dr.Med" gets no confirmation (the studio still gets the enquiry).
 */
const SUSPICIOUS_NAME = /https?:\/\/|www\.|[<>@]|\b[a-z0-9-]{2,}\.[a-z]{2,}\b/i;

export type ConfirmationSkipReason = 'off' | 'manual' | 'no-db' | 'no-email' | 'excluded' | 'already' | 'suspicious' | 'recent' | 'rate';
export type ConfirmationResult = { skipped: ConfirmationSkipReason } | { sent: string } | { failed: string } | { uncertain: string };

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}

/** Never throws; the tagged result is for logs and the harness. */
export async function sendConfirmationIfDue(env: Env, lead: LeadRow, now: Date): Promise<ConfirmationResult> {
  try {
    if (env.LEADS_CUSTOMER_MAILS !== 'on') return { skipped: 'off' };
    if (lead.source === 'manual') return { skipped: 'manual' };
    const db = env.LEADS_DB;
    if (!db) return { skipped: 'no-db' };
    const to = normalizeEmail(lead.email_normalized);
    if (!to) return { skipped: 'no-email' };
    if (lead.exclude) return { skipped: 'excluded' };
    if (lead.confirmation_sent_at) return { skipped: 'already' };
    if (SUSPICIOUS_NAME.test(lead.name)) return { skipped: 'suspicious' };

    const nowIso = now.toISOString();
    const addressSince = new Date(now.getTime() - SAME_ADDRESS_WINDOW_MS).toISOString();
    if (!(await claimConfirmation(db, {
      leadId: lead.id,
      emailNormalized: to,
      now: nowIso,
      addressSince,
      hourSince: new Date(now.getTime() - HOUR_MS).toISOString(),
      maxPerHour: MAX_CONFIRMATIONS_PER_HOUR,
    }))) {
      // These reads explain a rejected reservation only; the atomic UPDATE above enforces safety.
      const current = await getLead(db, lead.id);
      if (current?.confirmation_sent_at) return { skipped: 'already' };
      if (current?.exclude) return { skipped: 'excluded' };
      if (await hasRecentConfirmation(db, to, lead.id, addressSince)) return { skipped: 'recent' };
      return { skipped: 'rate' };
    }

    const mail = confirmationMail(lead, now);
    let id: string;
    try {
      ({ id } = await sendEmail(env, {
        to,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
        idempotencyKey: `bfl:confirmation:${lead.id}`,
        tags: [{ name: 'kind', value: 'confirmation' }],
      }));
    } catch (error) {
      const message = errorMessage(error);
      const rejected = isDefinitiveMailRejection(error);
      // A lost response or ambiguous provider error may follow acceptance: keep its reservation,
      // report uncertainty, and require a manual delivery check instead of sending another copy.
      if (rejected) await releaseAutomation(db, lead.id, 'confirmation_sent_at');
      await appendEvent(db, {
        lead_id: lead.id, at: nowIso, type: 'mail_failed', actor: 'system',
        meta: JSON.stringify({ kind: 'confirmation', error: message, delivery: rejected ? 'rejected' : 'uncertain', retry: rejected ? 'allowed' : 'manual' }),
      });
      console.error('Lead confirmation failed:', message);
      return rejected ? { failed: message } : { uncertain: message };
    }
    // Sent: the claim stays even if the event cannot be written.
    try {
      await appendEvent(db, { lead_id: lead.id, at: nowIso, type: 'mail_sent', actor: 'system', meta: JSON.stringify({ kind: 'confirmation', id }) });
    } catch (error) {
      console.error('Lead confirmation event failed:', errorMessage(error));
    }
    return { sent: id };
  } catch (error) {
    const message = errorMessage(error);
    console.error('Lead confirmation failed:', message);
    return { failed: message };
  }
}

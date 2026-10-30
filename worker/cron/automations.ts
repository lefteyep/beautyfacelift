// Lead automations, run by the Cron trigger (wrangler.jsonc, every 15 minutes) through the
// `scheduled` handler in worker/index.ts. Phase 1: the reminder ("nudge") to the studio about leads
// still "neu" NUDGE_AFTER_MINUTES after they arrived, only within opening hours.
//
// At most once per lead: claimAutomation sets nudge_sent_at before sending; only the run that made the
// claim sends. Only a definite rejection gives the claim back for a retry after 2 h. Uncertain
// deliveries keep their reservation and require a manual check, so a lost response cannot resend.
import type { Env } from '../env';
import { NUDGE_AFTER_MINUTES, normalizeEmail } from '../../shared/leads';
import { absoluteUrl } from '../../shared/site';
import { appendEvent, claimAutomation, listNudgeCandidates, releaseAutomation } from '../leads/db';
import { isWithinOpeningHours } from '../leads/time';
import { isDefinitiveMailRejection, MailConfigError, sendEmail } from '../email/resend';
import { nudgeMail } from '../email/templates/nudge';

const MINUTE_MS = 60 * 1000;
const NUDGE_BACKOFF_MS = 2 * 60 * MINUTE_MS;
const NUDGES_PER_RUN = 20;

export type AutomationsResult = {
  /** Ids of the leads a reminder was sent for. */
  nudged: string[];
  /** Why the run did nothing ('' when it ran). */
  skipped: '' | 'off' | 'no-db' | 'closed' | 'no-recipient';
  errors: number;
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}

export async function runAutomations(env: Env, now: Date): Promise<AutomationsResult> {
  const result: AutomationsResult = { nudged: [], skipped: '', errors: 0 };
  if (env.LEADS_REMINDERS !== 'on') return { ...result, skipped: 'off' };
  const db = env.LEADS_DB;
  if (!db) return { ...result, skipped: 'no-db' };
  // Outside opening hours nothing is sent; the first run after opening catches up, because candidates
  // are selected by age (created_at <= now - 60 min), not by a time window.
  if (!isWithinOpeningHours(now)) return { ...result, skipped: 'closed' };
  const to = normalizeEmail(env.LEADS_NUDGE_TO);
  if (!to) {
    console.error('Lead automations: LEADS_NUDGE_TO is missing; no reminders sent');
    return { ...result, skipped: 'no-recipient' };
  }

  const nowIso = now.toISOString();
  const candidates = await listNudgeCandidates(db, {
    createdBefore: new Date(now.getTime() - NUDGE_AFTER_MINUTES * MINUTE_MS).toISOString(),
    failedSince: new Date(now.getTime() - NUDGE_BACKOFF_MS).toISOString(),
    limit: NUDGES_PER_RUN,
  });

  for (const lead of candidates) {
    if (!(await claimAutomation(db, lead.id, 'nudge_sent_at', nowIso))) continue;

    const minutesOpen = Math.floor((now.getTime() - new Date(lead.created_at).getTime()) / MINUTE_MS);
    const mail = nudgeMail(lead, { cockpitUrl: `${absoluteUrl('/admin/leads/')}${lead.id}/`, minutesOpen });
    let id: string;
    try {
      ({ id } = await sendEmail(env, {
        to,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
        idempotencyKey: `bfl:nudge:${lead.id}`,
        // Replies go to whoever receives the reminder (the agency until go-live), never elsewhere.
        replyTo: to,
        tags: [{ name: 'kind', value: 'nudge' }],
      }));
    } catch (error) {
      const message = errorMessage(error);
      result.errors += 1;
      const rejected = isDefinitiveMailRejection(error);
      if (rejected) await releaseAutomation(db, lead.id, 'nudge_sent_at');
      await appendEvent(db, {
        lead_id: lead.id, at: nowIso, type: 'mail_failed', actor: 'system',
        meta: JSON.stringify({ kind: 'nudge', error: message, delivery: rejected ? 'rejected' : 'uncertain', retry: rejected ? 'allowed' : 'manual' }),
      });
      console.error('Lead reminder failed:', message);
      // A missing setting fails every send the same way: stop this run.
      if (error instanceof MailConfigError) break;
      continue;
    }

    result.nudged.push(lead.id);
    try {
      await appendEvent(db, { lead_id: lead.id, at: nowIso, type: 'nudge_sent', actor: 'system', meta: JSON.stringify({ to: 'LEADS_NUDGE_TO', id }) });
    } catch (error) {
      console.error('Lead reminder event failed:', errorMessage(error));
    }
  }

  return result;
}

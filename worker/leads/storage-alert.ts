import type { Env } from '../env';
import { isSingleMailbox, normalizeEmail } from '../../shared/leads';
import { sendEmail } from '../email/resend';

type StorageFailure = {
  enquiryId: string;
  receivedAt: Date;
  reason: 'missing-db' | 'write-failed';
};

/** Independent of D1, never throws, and never includes customer details in logs or alert mail. */
export async function reportStorageFailure(env: Env, failure: StorageFailure): Promise<void> {
  const receivedAt = failure.receivedAt.toISOString();
  const to = normalizeEmail(env.LEADS_ALERT_TO);
  const allowed = (env.ACCESS_ALLOWED_EMAILS ?? '').split(',').map(normalizeEmail);
  const alertConfigured = Boolean(to && isSingleMailbox(to) && allowed.includes(to));
  console.error('Lead ingest failed:', JSON.stringify({
    event: 'lead_storage_failed', reference: failure.enquiryId, received_at: receivedAt, reason: failure.reason,
    alert: alertConfigured ? 'configured' : 'unconfigured',
  }));
  if (!alertConfigured || !to) return;

  // Every failure in this UTC hour uses an IDENTICAL payload and provider key. In particular,
  // never put the individual enquiry reference in the mail: a changed payload would conflict
  // with the same idempotency key. The log/owner mail retain the individual reference.
  const hour = `${receivedAt.slice(0, 13)}:00:00.000Z`;
  const subject = `Lead-Speicherung prüfen (${hour})`;
  const text = `Im Zeitfenster ab ${hour} ist die Speicherung einer Website-Anfrage fehlgeschlagen.\n`
    + 'Die Besitzer-E-Mail wird unabhängig davon versucht; das Cockpit kann unvollständig sein.\n'
    + 'Bitte Worker-Logs (lead_storage_failed) und Besitzer-E-Mails anhand der Anfrage-ID abgleichen.\n'
    + 'Fehlende Datensätze ausschliesslich über den geschützten Nachtrag erfassen. Keine Formular-Testsendung auslösen.\n'
    + 'Diese Warnung bestätigt weder den E-Mail-Eingang noch eine vollständige Erfassung.';
  try {
    await sendEmail(env, {
      to, replyTo: to, subject, text,
      html: `<p>${text.split('\n').join('</p><p>')}</p>`,
      idempotencyKey: `bfl:storage-alert:${hour}`,
      tags: [{ name: 'kind', value: 'storage-alert' }],
    });
  } catch {
    // Provider failure and missing configuration need the independent log-monitoring route.
    // Never report acceptance/delivery when the provider acknowledgement is uncertain.
    console.error('Lead storage alert unconfirmed: inspect provider and Worker logs');
  }
}

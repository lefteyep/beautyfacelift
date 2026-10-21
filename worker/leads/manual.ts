// Staff-only manual capture/recovery. This module writes D1 only: no mail, tracking or automation.
import { isLeadSource, normalizeEmail, normalizePhone, type LeadActor, type LeadSource } from '../../shared/leads';

export const MANUAL_CHANNELS = ['phone', 'whatsapp', 'recovery'] as const;
export type ManualChannel = (typeof MANUAL_CHANNELS)[number];
export type ManualValues = Record<string, string>;
export type ManualInput = {
  id: string; channel: ManualChannel; receivedAt: string; originalSource: LeadSource | null;
  name: string; email: string | null; phone: string | null; emailNormalized: string | null;
  phoneNormalized: string | null; treatment: string; message: string; notes: string;
};
export type ManualValidation = { ok: true; input: ManualInput } | { ok: false; message: string };
export const MANUAL_FIELDS = ['entry_id', 'channel', 'original_reference', 'original_received_at', 'original_source', 'name', 'email', 'phone', 'treatment', 'message', 'notes'] as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Require an explicit zone and a real calendar/time, rather than Date.parse's rollover guesses. */
function receivedTimestamp(value: string, now: Date): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d, hh, mm, ss, , zone] = match;
  const calendar = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  if (calendar.getUTCFullYear() !== Number(y) || calendar.getUTCMonth() !== Number(m) - 1 || calendar.getUTCDate() !== Number(d)
    || Number(hh) > 23 || Number(mm) > 59 || Number(ss) > 59) return null;
  if (zone !== 'Z' && (Number(zone.slice(1, 3)) > 14 || Number(zone.slice(4)) > 59 || (Number(zone.slice(1, 3)) === 14 && Number(zone.slice(4)) !== 0))) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && timestamp <= now.getTime() ? new Date(timestamp).toISOString() : null;
}

export function validateManual(values: ManualValues, now: Date): ManualValidation {
  const fail = (message: string): ManualValidation => ({ ok: false, message });
  const channel = values.channel;
  if (!(MANUAL_CHANNELS as readonly string[]).includes(channel)) return fail('Bitte wählen Sie Telefon, WhatsApp oder Wiederherstellung.');
  const recovery = channel === 'recovery';
  const id = (recovery ? values.original_reference : values.entry_id).toLowerCase();
  if (!UUID.test(id)) return fail(recovery ? 'Bitte kopieren Sie die vollständige Anfrage-ID aus der Benachrichtigungs-E-Mail.' : 'Bitte öffnen Sie die manuelle Erfassung neu.');
  const name = values.name.trim();
  const email = values.email.trim();
  const phone = values.phone.trim();
  const treatment = values.treatment.trim();
  const message = values.message.replace(/\r\n/g, '\n').trim();
  const notes = values.notes.replace(/\r\n/g, '\n').trim();
  if (!name || name.length > 120 || /[\u0000-\u001f\u007f]/.test(name)) return fail('Bitte geben Sie einen Namen mit höchstens 120 Zeichen ein.');
  if (email && !normalizeEmail(email)) return fail('Bitte prüfen Sie die E-Mail-Adresse.');
  if (phone && (phone.length > 80 || !/^[+\d\s()./-]+$/.test(phone) || !normalizePhone(phone))) return fail('Bitte prüfen Sie die Telefonnummer.');
  if (!phone && (!recovery || !email)) return fail(recovery ? 'Bitte geben Sie eine E-Mail-Adresse oder Telefonnummer an.' : 'Für Telefon oder WhatsApp ist eine Telefonnummer nötig.');
  if (treatment.length > 200 || message.length > 4000 || notes.length > 4000) return fail('Bitte kürzen Sie die Behandlung auf 200 und Nachricht/Notiz auf je 4000 Zeichen.');
  if (recovery && !notes) return fail('Bitte notieren Sie kurz, weshalb die Anfrage wiederhergestellt wird.');
  const receivedAt = recovery ? receivedTimestamp(values.original_received_at.trim(), now) : now.toISOString();
  if (!receivedAt) return fail('Bitte kopieren Sie den gültigen Eingangszeitpunkt mit Zeitzone aus der E-Mail; er darf nicht in der Zukunft liegen.');
  const originalSource = values.original_source;
  if (recovery && (!isLeadSource(originalSource) || originalSource === 'manual')) return fail('Bitte wählen Sie die ursprüngliche Website-Quelle.');
  return { ok: true, input: {
    id, channel: channel as ManualChannel, receivedAt, originalSource: recovery ? originalSource as LeadSource : null,
    name, email: email || null, phone: phone || null, emailNormalized: normalizeEmail(email), phoneNormalized: normalizePhone(phone), treatment, message, notes,
  } };
}

/** PK uniqueness makes simultaneous replays safe. A failed event rolls the lead insert back too. */
export async function createManualLead(db: D1Database, input: ManualInput, actor: LeadActor, now: Date): Promise<'created' | 'existing'> {
  const at = now.toISOString();
  try {
    await db.batch([
      db.prepare(`INSERT INTO leads (id, created_at, updated_at, source, name, email, email_normalized, phone,
        phone_normalized, preferred_contact_method, treatment, message, notes, status_changed_at)
        VALUES (?, ?, ?, 'manual', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(input.id, input.receivedAt, at, input.name, input.email, input.emailNormalized, input.phone,
          input.phoneNormalized, input.channel === 'recovery' ? '' : input.channel === 'whatsapp' ? 'WhatsApp' : 'Telefon', input.treatment, input.message, input.notes, at),
      db.prepare(`INSERT INTO lead_events (lead_id, at, type, actor, to_status, meta) VALUES (?, ?, 'created', ?, 'neu', ?)`)
        .bind(input.id, at, actor, JSON.stringify({ source: 'manual', channel: input.channel, received_at: input.receivedAt,
          original_reference: input.channel === 'recovery' ? input.id : null, original_source: input.originalSource, automation: 'none' })),
    ]);
    return 'created';
  } catch (error) {
    // Do not turn other storage failures into success. Replays only link to the preserved row.
    const existing = await db.prepare('SELECT id FROM leads WHERE id = ?').bind(input.id).first<string>('id');
    if (existing) return 'existing';
    throw error;
  }
}

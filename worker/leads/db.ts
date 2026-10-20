// Typed access to the lead database (D1 binding LEADS_DB, schema in worker/migrations/).
// Every value is bound, never interpolated; undefined is turned into null before bind().
import type { LeadActor, LeadEventType, LeadSource, LeadStatus } from '../../shared/leads';

export type LeadRow = {
  id: string;
  created_at: string;
  updated_at: string;
  source: LeadSource;
  campaign: string;
  offer: string;
  treatment: string;
  topic: string;
  landing_page: string;
  page_url: string;
  referrer: string;
  name: string;
  email: string | null;
  email_normalized: string | null;
  phone: string | null;
  phone_normalized: string | null;
  preferred_contact_method: string;
  preferred_callback_time: string;
  preferred_date: string;
  skin_goal: string;
  message: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  fbclid: string;
  gclid: string;
  msclkid: string;
  status: LeadStatus;
  status_changed_at: string;
  first_contact_at: string | null;
  contact_attempts: number;
  appointment_at: string | null;
  revenue_first_visit_chf: number | null;
  follow_up_booked: number | null;
  notes: string;
  marketing_consent: number;
  marketing_consent_at: string | null;
  marketing_synced_at: string | null;
  confirmation_sent_at: string | null;
  nudge_sent_at: string | null;
  followup_sent_at: string | null;
  review_sent_at: string | null;
  unsubscribed_at: string | null;
  returning_of_lead_id: string | null;
  treatwell_booking_ref: string | null;
  exclude: 'test' | 'spam' | null;
};

export type LeadEventInput = {
  lead_id: string;
  at: string;
  type: LeadEventType;
  actor: LeadActor;
  from_status?: LeadStatus | null;
  to_status?: LeadStatus | null;
  note?: string | null;
  /** JSON string. */
  meta?: string | null;
};

export type LeadEventRow = {
  id: number;
  lead_id: string;
  at: string;
  type: LeadEventType;
  actor: LeadActor;
  from_status: LeadStatus | null;
  to_status: LeadStatus | null;
  note: string | null;
  meta: string | null;
};

const LEAD_COLUMNS = [
  'id', 'created_at', 'updated_at', 'source', 'campaign', 'offer', 'treatment', 'topic',
  'landing_page', 'page_url', 'referrer', 'name', 'email', 'email_normalized', 'phone', 'phone_normalized',
  'preferred_contact_method', 'preferred_callback_time', 'preferred_date', 'skin_goal', 'message',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'msclkid',
  'status', 'status_changed_at', 'first_contact_at', 'contact_attempts', 'appointment_at',
  'revenue_first_visit_chf', 'follow_up_booked', 'notes', 'marketing_consent', 'marketing_consent_at',
  'marketing_synced_at', 'confirmation_sent_at', 'nudge_sent_at', 'followup_sent_at', 'review_sent_at',
  'unsubscribed_at', 'returning_of_lead_id', 'treatwell_booking_ref', 'exclude',
] as const satisfies readonly (keyof LeadRow)[];

// Compile-time guard: every LeadRow field is in LEAD_COLUMNS, so the INSERT never drops a column.
type MissingLeadColumn = Exclude<keyof LeadRow, (typeof LEAD_COLUMNS)[number]>;
const allLeadColumnsListed: [MissingLeadColumn] extends [never] ? true : MissingLeadColumn = true;
void allLeadColumnsListed;

const INSERT_LEAD_SQL = `INSERT INTO leads (${LEAD_COLUMNS.join(', ')}) VALUES (${LEAD_COLUMNS.map(() => '?').join(', ')})`;
const INSERT_EVENT_SQL = 'INSERT INTO lead_events (lead_id, at, type, actor, from_status, to_status, note, meta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

/** Timestamp columns the automations claim once (at-most-once sending). */
export const AUTOMATION_COLUMNS = ['nudge_sent_at', 'followup_sent_at', 'review_sent_at', 'confirmation_sent_at'] as const;
export type AutomationColumn = (typeof AUTOMATION_COLUMNS)[number];

function bindable(value: unknown): unknown {
  return value === undefined ? null : value;
}

function eventStatement(db: D1Database, event: LeadEventInput): D1PreparedStatement {
  return db.prepare(INSERT_EVENT_SQL).bind(
    event.lead_id,
    event.at,
    event.type,
    event.actor,
    bindable(event.from_status),
    bindable(event.to_status),
    bindable(event.note),
    bindable(event.meta),
  );
}

/** Inserts the lead and its first event in one batch (one transaction). */
export async function insertLeadWithEvent(db: D1Database, lead: LeadRow, event: Omit<LeadEventInput, 'lead_id'>): Promise<void> {
  await db.batch([
    db.prepare(INSERT_LEAD_SQL).bind(...LEAD_COLUMNS.map((column) => bindable(lead[column]))),
    eventStatement(db, { ...event, lead_id: lead.id }),
  ]);
}

/**
 * The newest lead since `since` (ISO timestamp) with the same normalised e-mail OR phone, ignoring
 * leads marked as test or spam. Null when nothing matches or both keys are missing.
 */
export async function findRecentDuplicate(
  db: D1Database,
  { emailNormalized, phoneNormalized, since }: { emailNormalized: string | null; phoneNormalized: string | null; since: string },
): Promise<string | null> {
  const matches: string[] = [];
  const values: string[] = [];
  if (emailNormalized) {
    matches.push('email_normalized = ?');
    values.push(emailNormalized);
  }
  if (phoneNormalized) {
    matches.push('phone_normalized = ?');
    values.push(phoneNormalized);
  }
  if (matches.length === 0) return null;

  const id = await db
    .prepare(`SELECT id FROM leads WHERE created_at >= ? AND exclude IS NULL AND (${matches.join(' OR ')}) ORDER BY created_at DESC LIMIT 1`)
    .bind(since, ...values)
    .first<string>('id');
  return id ?? null;
}

export async function getLead(db: D1Database, id: string): Promise<LeadRow | null> {
  return db.prepare('SELECT * FROM leads WHERE id = ?').bind(id).first<LeadRow>();
}

export async function appendEvent(db: D1Database, event: LeadEventInput): Promise<void> {
  await eventStatement(db, event).run();
}

function assertAutomationColumn(column: string): asserts column is AutomationColumn {
  if (!(AUTOMATION_COLUMNS as readonly string[]).includes(column)) {
    throw new TypeError(`Unknown automation column: ${column}`);
  }
}

/**
 * Claims an automation for one lead: sets `column` to `now` only while it is still NULL.
 * True when this call made the claim (exactly one row changed), false when it was taken already.
 */
export async function claimAutomation(db: D1Database, leadId: string, column: AutomationColumn, now: string): Promise<boolean> {
  assertAutomationColumn(column);
  const result = await db
    .prepare(`UPDATE leads SET ${column} = ?, updated_at = ? WHERE id = ? AND ${column} IS NULL`)
    .bind(now, now, leadId)
    .run();
  return result.meta.changes === 1;
}

/** Gives a claim back (sets `column` to NULL), e.g. when sending failed and a retry is wanted. */
export async function releaseAutomation(db: D1Database, leadId: string, column: AutomationColumn): Promise<void> {
  assertAutomationColumn(column);
  await db.prepare(`UPDATE leads SET ${column} = NULL WHERE id = ?`).bind(leadId).run();
}

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
  /** Delivery reservation; success is established by mail_sent, not this timestamp alone. */
  confirmation_sent_at: string | null;
  /** Delivery reservation; success is established by nudge_sent, not this timestamp alone. */
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

// ---- cockpit (worker/leads/router.ts) ---------------------------------------------------------

/** Columns the cockpit forms may change through updateLead. */
export const EDITABLE_LEAD_COLUMNS = [
  'status', 'status_changed_at', 'appointment_at', 'revenue_first_visit_chf', 'follow_up_booked', 'notes', 'exclude',
] as const satisfies readonly (keyof LeadRow)[];
export type EditableLeadColumn = (typeof EDITABLE_LEAD_COLUMNS)[number];
export type LeadPatch = Partial<Pick<LeadRow, EditableLeadColumn>>;

/**
 * Writes `patch` (whitelisted columns only) plus `updated_at = now`, and the event when given, in one
 * batch. Throws on a column outside EDITABLE_LEAD_COLUMNS.
 */
export async function updateLead(db: D1Database, id: string, patch: LeadPatch, now: string, event?: Omit<LeadEventInput, 'lead_id'>): Promise<void> {
  const columns = Object.keys(patch) as EditableLeadColumn[];
  for (const column of columns) {
    if (!(EDITABLE_LEAD_COLUMNS as readonly string[]).includes(column)) throw new TypeError(`Column not editable: ${column}`);
  }
  const assignments = [...columns.map((column) => `${column} = ?`), 'updated_at = ?'];
  const statements = [
    db.prepare(`UPDATE leads SET ${assignments.join(', ')} WHERE id = ?`).bind(...columns.map((column) => bindable(patch[column])), now, id),
  ];
  if (event) statements.push(eventStatement(db, { ...event, lead_id: id }));
  await db.batch(statements);
}

/**
 * "Jetzt kontaktiert": first_contact_at only when still NULL, contact_attempts + 1, status neu → kontaktiert
 * (other statuses unchanged), plus the event; one batch, the counter is incremented in SQL.
 */
export async function markContacted(db: D1Database, id: string, now: string, event: Omit<LeadEventInput, 'lead_id'>): Promise<void> {
  await db.batch([
    db.prepare(`UPDATE leads SET
        first_contact_at = COALESCE(first_contact_at, ?),
        contact_attempts = contact_attempts + 1,
        status_changed_at = CASE WHEN status = 'neu' THEN ? ELSE status_changed_at END,
        status = CASE WHEN status = 'neu' THEN 'kontaktiert' ELSE status END,
        updated_at = ?
      WHERE id = ?`).bind(now, now, now, id),
    eventStatement(db, { ...event, lead_id: id }),
  ]);
}

export type LeadListFilter = {
  /** null = every status. */
  statuses: readonly LeadStatus[] | null;
  /** false hides leads marked as test or spam. */
  includeExcluded: boolean;
  /** Free text, matched with LIKE on name, e-mail, phone and normalised phone. */
  q: string;
  /** Digits of `q` in normalised phone form (e.g. "4179123"), or null. */
  qDigits: string | null;
  /** Exact campaign, or '' for all. */
  campaign: string;
  limit: number;
  offset: number;
};

/** Substring pattern for `LIKE ? ESCAPE '!'`: the wildcards % and _ (and ! itself) match literally. */
function likePattern(value: string): string {
  return `%${value.replace(/[!%_]/g, (character) => `!${character}`)}%`;
}

/** Leads for the cockpit list, newest first. */
export async function listLeads(db: D1Database, filter: LeadListFilter): Promise<LeadRow[]> {
  const where: string[] = [];
  const values: (string | number)[] = [];
  if (filter.statuses) {
    where.push(`status IN (${filter.statuses.map(() => '?').join(', ')})`);
    values.push(...filter.statuses);
  }
  if (!filter.includeExcluded) where.push('exclude IS NULL');
  if (filter.campaign) {
    where.push('campaign = ?');
    values.push(filter.campaign);
  }
  if (filter.q) {
    const pattern = likePattern(filter.q);
    const matches = ["name LIKE ? ESCAPE '!'", "email LIKE ? ESCAPE '!'", "phone LIKE ? ESCAPE '!'", "phone_normalized LIKE ? ESCAPE '!'"];
    values.push(pattern, pattern, pattern, pattern);
    if (filter.qDigits) {
      matches.push("phone_normalized LIKE ? ESCAPE '!'");
      values.push(likePattern(filter.qDigits));
    }
    where.push(`(${matches.join(' OR ')})`);
  }
  const sql = `SELECT * FROM leads${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`;
  const result = await db.prepare(sql).bind(...values, filter.limit, filter.offset).all<LeadRow>();
  return result.results;
}

export type WeekCounts = { total: number; byStatus: Partial<Record<LeadStatus, number>> };

/** Leads created in [start, end) and not excluded, counted by current status. */
export async function countLeadsForWeek(db: D1Database, start: string, end: string): Promise<WeekCounts> {
  const result = await db
    .prepare('SELECT status, COUNT(*) AS n FROM leads WHERE created_at >= ? AND created_at < ? AND exclude IS NULL GROUP BY status')
    .bind(start, end)
    .all<{ status: LeadStatus; n: number }>();
  const byStatus: Partial<Record<LeadStatus, number>> = {};
  let total = 0;
  for (const row of result.results) {
    byStatus[row.status] = row.n;
    total += row.n;
  }
  return { total, byStatus };
}

/** Every event of a lead, newest first. */
export async function listEvents(db: D1Database, leadId: string): Promise<LeadEventRow[]> {
  const result = await db.prepare('SELECT * FROM lead_events WHERE lead_id = ? ORDER BY at DESC, id DESC').bind(leadId).all<LeadEventRow>();
  return result.results;
}

// ---- automatic e-mails (worker/email/confirmation.ts, worker/cron/automations.ts) ---------------

/**
 * Atomically reserves one confirmation, including per-address and overall limits. In-flight and
 * uncertain deliveries retain their reservation and count towards both limits. Separate SELECTs
 * before a per-lead UPDATE would allow concurrent, distinct leads to bypass either limit.
 */
export async function claimConfirmation(
  db: D1Database,
  { leadId, emailNormalized, now, addressSince, hourSince, maxPerHour }: {
    leadId: string; emailNormalized: string; now: string; addressSince: string; hourSince: string; maxPerHour: number;
  },
): Promise<boolean> {
  const result = await db.prepare(`UPDATE leads SET confirmation_sent_at = ?, updated_at = ?
    WHERE id = ? AND confirmation_sent_at IS NULL AND exclude IS NULL AND email_normalized = ?
      AND NOT EXISTS (
        SELECT 1 FROM leads AS recent WHERE recent.email_normalized = ? AND recent.confirmation_sent_at >= ?
      )
      AND (SELECT COUNT(*) FROM leads AS recent WHERE recent.confirmation_sent_at >= ?) < ?`)
    .bind(now, now, leadId, emailNormalized, emailNormalized, addressSince, hourSince, maxPerHour)
    .run();
  return result.meta.changes === 1;
}

/** True when another lead with the same normalised e-mail got a confirmation at or after `since`. */
export async function hasRecentConfirmation(db: D1Database, emailNormalized: string, exceptLeadId: string, since: string): Promise<boolean> {
  const row = await db
    .prepare('SELECT id FROM leads WHERE email_normalized = ? AND id <> ? AND confirmation_sent_at >= ? LIMIT 1')
    .bind(emailNormalized, exceptLeadId, since)
    .first<{ id: string }>();
  return row !== null;
}

/** Number of leads whose confirmation was sent (or claimed) at or after `since`. */
export async function countConfirmationsSince(db: D1Database, since: string): Promise<number> {
  const count = await db.prepare('SELECT COUNT(*) AS n FROM leads WHERE confirmation_sent_at >= ?').bind(since).first<number>('n');
  return count ?? 0;
}

/**
 * Leads due for the reminder to the studio, oldest first: status neu, not excluded, no reminder yet,
 * created at or before `createdBefore`, and no failed reminder (`mail_failed` event with meta kind
 * "nudge") at or after `failedSince` (the back-off after a failed send).
 */
export async function listNudgeCandidates(
  db: D1Database,
  { createdBefore, failedSince, limit }: { createdBefore: string; failedSince: string; limit: number },
): Promise<LeadRow[]> {
  const result = await db
    .prepare(`SELECT * FROM leads
      WHERE status = 'neu' AND source <> 'manual' AND exclude IS NULL AND nudge_sent_at IS NULL AND created_at <= ?
        AND NOT EXISTS (
          SELECT 1 FROM lead_events
          WHERE lead_events.lead_id = leads.id AND lead_events.type = 'mail_failed' AND lead_events.at >= ?
            AND (CASE WHEN json_valid(lead_events.meta) THEN json_extract(lead_events.meta, '$.kind') END) = 'nudge'
        )
      ORDER BY created_at ASC, id ASC
      LIMIT ?`)
    .bind(createdBefore, failedSince, limit)
    .all<LeadRow>();
  return result.results;
}

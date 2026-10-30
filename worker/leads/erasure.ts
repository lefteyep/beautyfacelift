// Bounded exact-ID data operation. The caller MUST enforce staff authorization, CSRF, the
// independent operations gate/allow-list, typed confirmation and an approved private case reference.
// No retention, external request, mail, migration or credential logic belongs in this module.
import type { LeadRow, LeadEventRow } from './db';

export const LEAD_ERASURE_LIMITS = Object.freeze({ selectedLeads: 10, leads: 100, events: 400, snapshotBytes: 65_536, schemaObjects: 20, migrations: 100, sequences: 2, batchStatements: 45 });
export type LeadErasureErrorCode = 'invalid-selection' | 'missing-leads' | 'unsupported-schema' | 'bounds-exceeded'
  | 'blocked' | 'stale-plan' | 'transaction-failed' | 'storage-unavailable';
const MESSAGES: Record<LeadErasureErrorCode, string> = {
  'invalid-selection': 'Select between one and ten exact enquiry UUIDs.',
  'missing-leads': 'Every selected enquiry must exist. Review the selection again.',
  'unsupported-schema': 'The database schema or record shape requires a new data-operations review.',
  'bounds-exceeded': 'This database exceeds the bounded pilot operation. No erasure was performed.',
  blocked: 'Resolve the identity or copied-data blockers before erasure.',
  'stale-plan': 'The data changed or the confirmation is invalid. Generate a new preview.',
  'transaction-failed': 'The transaction outcome is unconfirmed. Inspect the affected records before retrying.',
  'storage-unavailable': 'The database could not be inspected safely. No erasure was performed.',
};
export class LeadErasureError extends Error {
  readonly code: LeadErasureErrorCode;
  constructor(code: LeadErasureErrorCode) { super(MESSAGES[code]); this.name = 'LeadErasureError'; this.code = code; }
}
export type LeadErasureBlocker = {
  kind: 'same-contact-needs-review' | 'possible-copy-needs-review';
  table: 'leads' | 'lead_events'; rowId: string | number; columns: string[];
};
export type LeadErasurePlan = {
  mode: 'dry-run'; leadIds: string[]; leadsDeleted: number; eventsDeleted: number;
  relationshipsCleared: string[]; metadataEventsRedacted: number[]; sameContactCandidateIds: string[];
  blockers: LeadErasureBlocker[]; snapshotHash: string; confirmation: string;
};
export type LeadErasureApplied = Omit<LeadErasurePlan, 'mode' | 'confirmation'> & { mode: 'applied' };
type Scalar = string | number | null;
type SchemaRow = [string, string, string, string | null];
type Snapshot = { schema: SchemaRow[]; leads: Scalar[][]; events: Scalar[][]; sequence: Scalar[][]; migrations: Scalar[][] };

// Fixed reviewed definitions, NOT discovered SELECT * columns. Updating a migration requires an
// explicit review of this allow-list and of every copied/related datum handled below.
const LEAD_DEFINITIONS = [
  'id TEXT PRIMARY KEY', 'created_at TEXT NOT NULL', 'updated_at TEXT NOT NULL', 'source TEXT NOT NULL',
  "campaign TEXT NOT NULL DEFAULT ''", "offer TEXT NOT NULL DEFAULT ''", "treatment TEXT NOT NULL DEFAULT ''",
  "topic TEXT NOT NULL DEFAULT ''", "landing_page TEXT NOT NULL DEFAULT ''", "page_url TEXT NOT NULL DEFAULT ''",
  "referrer TEXT NOT NULL DEFAULT ''", 'name TEXT NOT NULL', 'email TEXT', 'email_normalized TEXT', 'phone TEXT', 'phone_normalized TEXT',
  "preferred_contact_method TEXT NOT NULL DEFAULT ''", "preferred_callback_time TEXT NOT NULL DEFAULT ''", "preferred_date TEXT NOT NULL DEFAULT ''",
  "skin_goal TEXT NOT NULL DEFAULT ''", "message TEXT NOT NULL DEFAULT ''", "utm_source TEXT NOT NULL DEFAULT ''",
  "utm_medium TEXT NOT NULL DEFAULT ''", "utm_campaign TEXT NOT NULL DEFAULT ''", "utm_content TEXT NOT NULL DEFAULT ''",
  "utm_term TEXT NOT NULL DEFAULT ''", "fbclid TEXT NOT NULL DEFAULT ''", "gclid TEXT NOT NULL DEFAULT ''", "msclkid TEXT NOT NULL DEFAULT ''",
  "status TEXT NOT NULL DEFAULT 'neu'", 'status_changed_at TEXT NOT NULL', 'first_contact_at TEXT', 'contact_attempts INTEGER NOT NULL DEFAULT 0',
  'appointment_at TEXT', 'revenue_first_visit_chf INTEGER', 'follow_up_booked INTEGER', "notes TEXT NOT NULL DEFAULT ''",
  'marketing_consent INTEGER NOT NULL DEFAULT 0', 'marketing_consent_at TEXT', 'marketing_synced_at TEXT', 'confirmation_sent_at TEXT',
  'nudge_sent_at TEXT', 'followup_sent_at TEXT', 'review_sent_at TEXT', 'unsubscribed_at TEXT', 'returning_of_lead_id TEXT', 'treatwell_booking_ref TEXT', 'exclude TEXT',
] as const;
const EVENT_DEFINITIONS = [
  'id INTEGER PRIMARY KEY AUTOINCREMENT', 'lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE',
  'at TEXT NOT NULL', 'type TEXT NOT NULL', 'actor TEXT NOT NULL', 'from_status TEXT', 'to_status TEXT', 'note TEXT', 'meta TEXT',
] as const;
const LEAD_COLUMNS = LEAD_DEFINITIONS.map((definition) => definition.split(' ')[0]) as (keyof LeadRow)[];
const EVENT_COLUMNS = EVENT_DEFINITIONS.map((definition) => definition.split(' ')[0]) as (keyof LeadEventRow)[];
const SCHEMA_SQL = 'SELECT type, name, tbl_name, sql FROM sqlite_schema ORDER BY type, name';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// A small lexer, not regex comment stripping: strings containing --, /*, quotes, etc. retain
// their exact decoded values. Harmless SQL whitespace/comments/identifier quoting may differ in D1.
function sqlTokens(sql: string): string {
  const tokens: string[] = [];
  for (let at = 0; at < sql.length;) {
    if (/\s/.test(sql[at])) { at++; continue; }
    if (sql.startsWith('--', at)) { const end = sql.indexOf('\n', at); at = end < 0 ? sql.length : end + 1; continue; }
    if (sql.startsWith('/*', at)) {
      const end = sql.indexOf('*/', at + 2); if (end < 0) throw new LeadErasureError('unsupported-schema'); at = end + 2; continue;
    }
    const quote = sql[at];
    if (["'", '"', '`', '['].includes(quote)) {
      const close = quote === '[' ? ']' : quote;
      let value = ''; let closed = false; at++;
      while (at < sql.length) {
        if (sql[at] === close) {
          if (quote !== '[' && sql[at + 1] === close) { value += close; at += 2; continue; }
          at++; closed = true; break;
        }
        value += sql[at++];
      }
      if (!closed) throw new LeadErasureError('unsupported-schema');
      tokens.push(quote === "'" ? `string:${value}` : `word:${value.toLowerCase()}`); continue;
    }
    const word = /^[a-zA-Z_][a-zA-Z0-9_]*/.exec(sql.slice(at));
    if (word) { tokens.push(`word:${word[0].toLowerCase()}`); at += word[0].length; continue; }
    if (sql[at] !== ';') tokens.push(sql[at]);
    at++;
  }
  return JSON.stringify(tokens.filter((_, index) => !(tokens[index] === 'word:if' && tokens[index + 1] === 'word:not' && tokens[index + 2] === 'word:exists')
    && !(tokens[index - 1] === 'word:if' && tokens[index] === 'word:not' && tokens[index + 1] === 'word:exists')
    && !(tokens[index - 2] === 'word:if' && tokens[index - 1] === 'word:not' && tokens[index] === 'word:exists')));
}

const EXPECTED_SCHEMA = new Map<string, SchemaRow>([
  ['leads', ['table', 'leads', 'leads', `CREATE TABLE leads (${LEAD_DEFINITIONS.join(',')})`]],
  ['lead_events', ['table', 'lead_events', 'lead_events', `CREATE TABLE lead_events (${EVENT_DEFINITIONS.join(',')})`]],
  ['sqlite_sequence', ['table', 'sqlite_sequence', 'sqlite_sequence', 'CREATE TABLE sqlite_sequence(name,seq)']],
  ['sqlite_autoindex_leads_1', ['index', 'sqlite_autoindex_leads_1', 'leads', null]],
  ...(['created_at', 'status', 'email_normalized', 'phone_normalized', 'utm_content'] as const).map((column): [string, SchemaRow] => [
    `idx_leads_${column}`, ['index', `idx_leads_${column}`, 'leads', `CREATE INDEX idx_leads_${column} ON leads(${column})`],
  ]),
  ['idx_lead_events_lead', ['index', 'idx_lead_events_lead', 'lead_events', 'CREATE INDEX idx_lead_events_lead ON lead_events(lead_id,at)']],
  // Known provider/tooling metadata are named individually; no _cf_/sqlite* prefix exemption.
  ['_cf_KV', ['table', '_cf_KV', '_cf_KV', 'CREATE TABLE _cf_KV(key TEXT PRIMARY KEY,value BLOB) WITHOUT ROWID']],
  ['_cf_METADATA', ['table', '_cf_METADATA', '_cf_METADATA', 'CREATE TABLE _cf_METADATA(key INTEGER PRIMARY KEY,value BLOB)']],
  ['d1_migrations', ['table', 'd1_migrations', 'd1_migrations', 'CREATE TABLE d1_migrations(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT UNIQUE,applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL)']],
  ['sqlite_autoindex_d1_migrations_1', ['index', 'sqlite_autoindex_d1_migrations_1', 'd1_migrations', null]],
]);
const REQUIRED_SCHEMA = [...EXPECTED_SCHEMA.keys()].filter((name) => !['_cf_KV', '_cf_METADATA', 'd1_migrations', 'sqlite_autoindex_d1_migrations_1'].includes(name));

function assertSchema(rows: SchemaRow[]): boolean {
  if (rows.length > LEAD_ERASURE_LIMITS.schemaObjects) throw new LeadErasureError('bounds-exceeded');
  if (rows.some((row) => typeof row[3] === 'string' && row[3].length > LEAD_ERASURE_LIMITS.snapshotBytes)) throw new LeadErasureError('bounds-exceeded');
  const names = new Set<string>();
  for (const row of rows) {
    const known = EXPECTED_SCHEMA.get(row[1]);
    if (!known || names.has(row[1]) || row[0] !== known[0] || row[2] !== known[2]
      || (row[3] === null ? known[3] !== null : known[3] === null || sqlTokens(row[3]) !== sqlTokens(known[3]))) {
      throw new LeadErasureError('unsupported-schema');
    }
    names.add(row[1]);
  }
  if (REQUIRED_SCHEMA.some((name) => !names.has(name))
    || names.has('d1_migrations') !== names.has('sqlite_autoindex_d1_migrations_1')) throw new LeadErasureError('unsupported-schema');
  return names.has('d1_migrations');
}

function jsonRow(columns: readonly string[]): string {
  // D1 permits only 32 function arguments. Construct wider rows as valid JSON by joining the
  // interiors of small JSON arrays; json() preserves their JSON subtype for json_group_array().
  if (columns.length <= 20) return `json_array(${columns.join(',')})`;
  const chunks: string[] = [];
  for (let start = 0; start < columns.length; start += 20) {
    const part = `json_array(${columns.slice(start, start + 20).join(',')})`;
    chunks.push(`substr(${part},2,length(${part})-2)`);
  }
  return `json('['||${chunks.join("||','||")}||']')`;
}
const jsonRows = (columns: readonly string[], from: string) => `(SELECT json_group_array(${jsonRow(columns)}) FROM (${from}))`;
function balancedSum(terms: readonly string[]): string {
  if (terms.length === 1) return terms[0];
  const middle = Math.floor(terms.length / 2);
  return `(${balancedSum(terms.slice(0, middle))}+${balancedSum(terms.slice(middle))})`;
}
// D1's expression-depth ceiling is lower than Node SQLite's. Keep wide row-size arithmetic
// logarithmic in depth; a long left-associated sum fails before the snapshot can be inspected.
const rawBytes = (columns: readonly string[], table: string) => `(SELECT COALESCE(SUM(${balancedSum(columns.map((column) => `COALESCE(length(CAST(${column} AS BLOB)),0)`))}),0) FROM ${table})`;
function snapshotSql(withMigrations: boolean): string {
  const leads = jsonRows(LEAD_COLUMNS, `SELECT ${LEAD_COLUMNS.join(',')} FROM leads ORDER BY id LIMIT ${LEAD_ERASURE_LIMITS.leads + 1}`);
  const events = jsonRows(EVENT_COLUMNS, `SELECT ${EVENT_COLUMNS.join(',')} FROM lead_events ORDER BY id LIMIT ${LEAD_ERASURE_LIMITS.events + 1}`);
  const migrations = withMigrations ? jsonRows(['id', 'name', 'applied_at'], `SELECT id,name,applied_at FROM d1_migrations ORDER BY id LIMIT ${LEAD_ERASURE_LIMITS.migrations + 1}`) : "json('[]')";
  return `SELECT CASE WHEN (SELECT COUNT(*) FROM leads) > ${LEAD_ERASURE_LIMITS.leads}
    OR (SELECT COUNT(*) FROM lead_events) > ${LEAD_ERASURE_LIMITS.events}
    OR (SELECT COUNT(*) FROM sqlite_sequence) > ${LEAD_ERASURE_LIMITS.sequences}
    ${withMigrations ? `OR (SELECT COUNT(*) FROM d1_migrations) > ${LEAD_ERASURE_LIMITS.migrations}` : ''}
    OR ${rawBytes(LEAD_COLUMNS, 'leads')} + ${rawBytes(EVENT_COLUMNS, 'lead_events')}
      ${withMigrations ? `+ ${rawBytes(['id', 'name', 'applied_at'], 'd1_migrations')}` : ''} > ${LEAD_ERASURE_LIMITS.snapshotBytes}
    THEN NULL ELSE json_object(
      'schema',${jsonRows(['type', 'name', 'tbl_name', 'sql'], `${SCHEMA_SQL} LIMIT ${LEAD_ERASURE_LIMITS.schemaObjects + 1}`)},
      'leads',${leads},'events',${events},
      'sequence',${jsonRows(['name', 'seq'], `SELECT name,seq FROM sqlite_sequence ORDER BY name LIMIT ${LEAD_ERASURE_LIMITS.sequences + 1}`)},
      'migrations',${migrations}) END AS snapshot`;
}

function selection(ids: readonly string[]): string[] {
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > LEAD_ERASURE_LIMITS.selectedLeads
    || ids.some((id) => typeof id !== 'string' || !UUID.test(id.toLowerCase()))) throw new LeadErasureError('invalid-selection');
  const normalised = ids.map((id) => id.toLowerCase());
  if (new Set(normalised).size !== normalised.length) throw new LeadErasureError('invalid-selection');
  return normalised.sort();
}
async function digest(value: string): Promise<string> {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
function asRecords<T>(values: Scalar[][], columns: readonly string[]): T[] {
  if (values.some((row) => row.length !== columns.length || row.some((value) => value !== null && !['string', 'number'].includes(typeof value)))) throw new LeadErasureError('unsupported-schema');
  return values.map((row) => Object.fromEntries(columns.map((column, index) => [column, row[index]])) as T);
}
const DROP = Symbol('drop');
function removeReferences(value: unknown, ids: Set<string>): unknown {
  if (typeof value === 'string') return ids.has(value) ? DROP : value;
  if (Array.isArray(value)) return value.map((item) => removeReferences(item, ids)).filter((item) => item !== DROP);
  if (value !== null && typeof value === 'object') return Object.fromEntries(Object.entries(value).flatMap(([key, item]) => {
    const clean = removeReferences(item, ids); return ids.has(key) || clean === DROP ? [] : [[key, clean]];
  }));
  return value;
}

async function buildPlan(db: D1Database, ids: string[]) {
  try {
    const inspected = await db.prepare(`${SCHEMA_SQL} LIMIT ${LEAD_ERASURE_LIMITS.schemaObjects + 1}`).raw<Scalar[]>();
    const withMigrations = assertSchema(inspected as SchemaRow[]);
    const sql = snapshotSql(withMigrations);
    const raw = await db.prepare(sql).first<string>('snapshot');
    if (raw === null || new TextEncoder().encode(raw).byteLength > LEAD_ERASURE_LIMITS.snapshotBytes) throw new LeadErasureError('bounds-exceeded');
    const state = JSON.parse(raw) as Snapshot;
    if (assertSchema(state.schema) !== withMigrations) throw new LeadErasureError('stale-plan');
    const leads = asRecords<LeadRow>(state.leads, LEAD_COLUMNS);
    const events = asRecords<LeadEventRow>(state.events, EVENT_COLUMNS);
    if (state.sequence.some(([name, seq]) => !['lead_events', ...(withMigrations ? ['d1_migrations'] : [])].includes(String(name))
      || !Number.isSafeInteger(seq) || Number(seq) < 0)) throw new LeadErasureError('unsupported-schema');
    if (leads.some((row) => typeof row.id !== 'string' || !UUID.test(row.id))
      || events.some((event) => !Number.isSafeInteger(event.id) || event.id < 1 || typeof event.lead_id !== 'string'
        || !leads.some((lead) => lead.id === event.lead_id))) throw new LeadErasureError('unsupported-schema');
    const selected = new Set(ids);
    const targets = leads.filter((row) => selected.has(row.id));
    if (targets.length !== ids.length) throw new LeadErasureError('missing-leads');
    const emails = new Set(targets.flatMap((row) => [row.email, row.email_normalized]).filter((value): value is string => typeof value === 'string' && Boolean(value.trim())).map((value) => value.trim().toLowerCase()));
    const phones = new Set(targets.map((row) => row.phone_normalized).filter(Boolean));
    const candidates = leads.filter((row) => !selected.has(row.id) && (
      [row.email, row.email_normalized].some((value) => typeof value === 'string' && emails.has(value.trim().toLowerCase()))
      || (row.phone_normalized && phones.has(row.phone_normalized))
    )).map((row) => row.id);
    const blockers: LeadErasureBlocker[] = candidates.map((rowId) => ({ kind: 'same-contact-needs-review', table: 'leads', rowId, columns: ['email', 'email_normalized', 'phone_normalized'] }));
    const tokens = [...new Set(targets.flatMap((row) => [row.id, row.name, row.email, row.email_normalized, row.phone, row.phone_normalized])
      .filter((value): value is string => typeof value === 'string' && Boolean(value.trim())).map((value) => value.toLowerCase()))];
    const copied = (value: unknown) => typeof value === 'string' && tokens.some((token) => value.toLowerCase().includes(token));
    const copiedJson = (value: unknown): boolean => Array.isArray(value) ? value.some(copiedJson)
      : value !== null && typeof value === 'object' ? Object.entries(value).some(([key, item]) => copied(key) || copiedJson(item))
      : copied(typeof value === 'number' ? String(value) : value);
    const links: string[] = [];
    const metadata: { id: number; meta: string | null }[] = [];
    for (const row of leads) {
      if (selected.has(row.id)) continue;
      if (row.returning_of_lead_id && selected.has(row.returning_of_lead_id)) links.push(row.id);
      const remaining = { ...row, returning_of_lead_id: row.returning_of_lead_id && selected.has(row.returning_of_lead_id) ? null : row.returning_of_lead_id };
      const columns = Object.entries(remaining).filter(([, value]) => copied(value)).map(([key]) => key);
      if (columns.length) blockers.push({ kind: 'possible-copy-needs-review', table: 'leads', rowId: row.id, columns });
    }
    for (const event of events) {
      if (selected.has(event.lead_id)) continue;
      let meta: unknown = event.meta;
      let unreadable = false;
      if (typeof event.meta === 'string' && event.meta !== '') {
        try {
          const parsed: unknown = JSON.parse(event.meta);
          const clean = removeReferences(parsed, selected);
          meta = clean === DROP ? null : clean;
          if (JSON.stringify(parsed) !== JSON.stringify(meta)) metadata.push({ id: event.id, meta: meta === null ? null : JSON.stringify(meta) });
        } catch { unreadable = true; /* An undecodable/deep payload cannot establish absence of copied PII. */ }
      }
      const columns = Object.entries({ ...event, meta }).filter(([key, value]) => !['id', 'lead_id'].includes(key)
        && (key === 'meta' ? copiedJson(value) : copied(value))).map(([key]) => key);
      if (unreadable && !columns.includes('meta')) columns.push('meta');
      if (columns.length) blockers.push({ kind: 'possible-copy-needs-review', table: 'lead_events', rowId: event.id, columns });
    }
    const snapshotHash = await digest(raw);
    if (5 + 2 * Math.ceil(metadata.length / 20) > LEAD_ERASURE_LIMITS.batchStatements) throw new LeadErasureError('bounds-exceeded');
    const plan: LeadErasurePlan = {
      mode: 'dry-run', leadIds: ids, leadsDeleted: targets.length, eventsDeleted: events.filter((event) => selected.has(event.lead_id)).length,
      relationshipsCleared: links, metadataEventsRedacted: metadata.map((event) => event.id), sameContactCandidateIds: candidates, blockers,
      snapshotHash, confirmation: `ERASE-D1-${await digest(JSON.stringify({ version: 1, ids, snapshotHash }))}`,
    };
    return { plan, sql, raw, metadata, leadCount: leads.length, eventCount: events.length };
  } catch (error) { throw error instanceof LeadErasureError ? error : new LeadErasureError('storage-unavailable'); }
}

/** Only IDs/counts/blocker columns and digests leave the planning boundary. */
export async function planLeadErasure(db: D1Database, leadIds: readonly string[]): Promise<LeadErasurePlan> {
  return (await buildPlan(db, selection(leadIds))).plan;
}

/** Defaults to read-only preview. One batch guards the exact snapshot BEFORE any mutation. */
export async function executeLeadErasure(db: D1Database, options: {
  leadIds: readonly string[]; apply?: boolean; confirmation?: string;
}): Promise<LeadErasurePlan | LeadErasureApplied> {
  const operation = await buildPlan(db, selection(options.leadIds));
  if (options.apply !== true) return operation.plan;
  const { plan, sql, raw, metadata, leadCount, eventCount } = operation;
  if (options.confirmation !== plan.confirmation) throw new LeadErasureError('stale-plan');
  if (plan.blockers.length) throw new LeadErasureError('blocked');
  // A mismatch attempts a NOT-NULL-violating insert and therefore aborts the WHOLE batch.
  // A match inserts zero rows. No special guard table or externally-visible audit payload is created.
  try {
  const abortIf = (condition: string) => `INSERT INTO leads (id,created_at,updated_at,source,name,status_changed_at)
    SELECT NULL,NULL,NULL,NULL,NULL,NULL WHERE ${condition}`;
  const statements: D1PreparedStatement[] = [db.prepare(abortIf(`(${sql}) IS NOT ?`)).bind(raw)];
  const placeholders = plan.leadIds.map(() => '?').join(',');
  statements.push(db.prepare(`UPDATE leads SET returning_of_lead_id = NULL
    WHERE id NOT IN (${placeholders}) AND returning_of_lead_id IN (${placeholders})`).bind(...plan.leadIds, ...plan.leadIds));
  // At most 60 parameters per update and 40 per check. At the 400-event ceiling this gives
  // at most 45 statements in the whole batch, rather than one unbounded statement per event.
  for (let start = 0; start < metadata.length; start += 20) {
    const chunk = metadata.slice(start, start + 20);
    const when = chunk.map(() => 'WHEN ? THEN ?').join(' ');
    const eventIds = chunk.map(() => '?').join(',');
    statements.push(db.prepare(`UPDATE lead_events SET meta = CASE id ${when} ELSE meta END WHERE id IN (${eventIds})`)
      .bind(...chunk.flatMap((event) => [event.id, event.meta]), ...chunk.map((event) => event.id)));
    statements.push(db.prepare(abortIf(chunk.map(() => 'NOT EXISTS(SELECT 1 FROM lead_events WHERE id = ? AND meta IS ?)').join(' OR ')))
      .bind(...chunk.flatMap((event) => [event.id, event.meta])));
  }
  statements.push(db.prepare(`DELETE FROM lead_events WHERE lead_id IN (${placeholders})`).bind(...plan.leadIds));
  statements.push(db.prepare(`DELETE FROM leads WHERE id IN (${placeholders})`).bind(...plan.leadIds));
  const finalChecks = [`(SELECT COUNT(*) FROM leads) != ?`, `(SELECT COUNT(*) FROM lead_events) != ?`,
    `EXISTS(SELECT 1 FROM leads WHERE id IN (${placeholders}) OR returning_of_lead_id IN (${placeholders}))`,
    `EXISTS(SELECT 1 FROM lead_events WHERE lead_id IN (${placeholders}))`];
  statements.push(db.prepare(abortIf(finalChecks.join(' OR '))).bind(leadCount - plan.leadsDeleted, eventCount - plan.eventsDeleted,
    ...plan.leadIds, ...plan.leadIds, ...plan.leadIds));
  if (statements.length > LEAD_ERASURE_LIMITS.batchStatements) throw new LeadErasureError('bounds-exceeded');
    const results = await db.batch(statements);
    if (results.some((result) => !result.success)) throw new LeadErasureError('transaction-failed');
  } catch (error) {
    if (error instanceof LeadErasureError && error.code === 'bounds-exceeded') throw error;
    throw new LeadErasureError('transaction-failed');
  }
  const { confirmation: _confirmation, mode: _mode, ...summary } = plan;
  return { ...summary, mode: 'applied' };
}

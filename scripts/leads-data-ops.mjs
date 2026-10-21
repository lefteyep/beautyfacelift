#!/usr/bin/env node
// Synthetic, local SQLite rehearsal only. No network, Wrangler, credentials or remote mode.
import { createHash, randomUUID } from 'node:crypto';
import { closeSync, existsSync, lstatSync, mkdirSync, openSync, readFileSync, realpathSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const MIGRATIONS = path.join(ROOT, 'worker/migrations');
// An added migration must NOT automatically widen erasure's supported schema. Review every new
// table/column/relationship and extend the erasure/tests before changing this allow-list.
const REVIEWED_MIGRATIONS = {
  '0001_leads.sql': 'cb8c5e2c65dc43f0716d8f9472b18d8ea7eeeae6e47cb4ba92897f63faee8290',
};
const MARKER_SQL = `CREATE TABLE lead_ops_fixture (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  purpose TEXT NOT NULL CHECK (purpose = 'synthetic-only-v1'),
  instance TEXT NOT NULL
)`;
const sha = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const toPlain = (rows) => rows.map((row) => ({ ...row }));

function migrate(db) {
  const files = readdirSync(MIGRATIONS).filter((name) => name.endsWith('.sql')).sort();
  if (JSON.stringify(files) !== JSON.stringify(Object.keys(REVIEWED_MIGRATIONS).sort())) {
    throw new Error('Migrations changed. Review the erasure scope and tests before using this tool.');
  }
  for (const name of files) {
    const sql = readFileSync(path.join(MIGRATIONS, name), 'utf8').replaceAll('\r\n', '\n');
    if (createHash('sha256').update(sql).digest('hex') !== REVIEWED_MIGRATIONS[name]) {
      throw new Error('A reviewed migration changed. Review the erasure scope and tests before using this tool.');
    }
    db.exec(sql);
  }
  db.exec(MARKER_SQL);
}

function schema(db) {
  return toPlain(db.prepare(`SELECT type, name, tbl_name, sql FROM sqlite_schema
    WHERE name NOT LIKE 'sqlite_%' ORDER BY type, name`).all());
}

const expectedSchema = (() => {
  const db = new DatabaseSync(':memory:');
  try { migrate(db); return sha(schema(db)); } finally { db.close(); }
})();

function localPath(input, { mustExist = true } = {}) {
  if (typeof input !== 'string' || !input || /^(?:[a-z]+:\/\/|file:|\\\\|\/\/)/i.test(input)) {
    throw new Error('An ordinary local .sqlite file path is required; URLs and network paths are unsupported.');
  }
  const absolute = path.resolve(input);
  if (path.extname(absolute).toLowerCase() !== '.sqlite' || absolute.split(/[\\/]/).includes('.wrangler')) {
    throw new Error('Only standalone .sqlite fixture files are supported; Wrangler state is unsupported.');
  }
  // Do not follow a symlink/junction in any existing component of an operator-supplied path.
  let current = absolute;
  while (true) {
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) throw new Error('Symlink paths are unsupported.');
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  if (mustExist && (!existsSync(absolute) || !lstatSync(absolute).isFile())) {
    throw new Error('The fixture file must already exist. Use fixture to create synthetic data.');
  }
  if (existsSync(absolute)) return realpathSync(absolute);
  return absolute;
}

function assertFixture(db) {
  if (sha(schema(db)) !== expectedSchema) {
    throw new Error('Unsupported schema. Stop and review all tables, columns, triggers and relationships.');
  }
  const markers = db.prepare('SELECT * FROM lead_ops_fixture').all();
  if (markers.length !== 1 || markers[0].id !== 1 || markers[0].purpose !== 'synthetic-only-v1'
    || !/^[0-9a-f-]{36}$/.test(markers[0].instance)) {
    throw new Error('Not a tool-created synthetic fixture. Real data and D1 exports are unsupported.');
  }
  if (db.prepare('PRAGMA integrity_check').get().integrity_check !== 'ok'
    || db.prepare('PRAGMA foreign_key_check').all().length !== 0) {
    throw new Error('Fixture integrity/foreign-key check failed.');
  }
}

function openFixture(file, writable = false) {
  const filePath = localPath(file);
  const db = new DatabaseSync(filePath, { readOnly: !writable });
  try {
    db.exec('PRAGMA foreign_keys = ON');
    assertFixture(db);
    return { db, filePath };
  } catch (error) { db.close(); throw error; }
}

function snapshot(db) {
  return {
    schema: schema(db),
    marker: toPlain(db.prepare('SELECT * FROM lead_ops_fixture ORDER BY id').all()),
    leads: toPlain(db.prepare('SELECT * FROM leads ORDER BY id').all()),
    events: toPlain(db.prepare('SELECT * FROM lead_events ORDER BY id').all()),
    sequence: toPlain(db.prepare('SELECT * FROM sqlite_sequence ORDER BY name').all()),
  };
}

function confirmationFor(operation, filePath, state, extra = {}) {
  return `${operation.toUpperCase()}-FIXTURE-${sha({ operation, filePath, state, ...extra })}`;
}

function requireConfirmation(apply, actual, expected) {
  if (actual && !apply) throw new Error('--confirm requires --apply. Omit both for a dry run.');
  if (apply && actual !== expected) throw new Error('Confirmation does not match this current plan. Run the dry run again.');
}

function normalizeIds(ids) {
  const sorted = [...new Set(ids ?? [])].sort();
  if (!sorted.length || sorted.some((id) => typeof id !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(id))) {
    throw new Error('Supply at least one exact lead ID with --lead (letters, digits, hyphen, underscore).');
  }
  return sorted;
}

const DROP = Symbol('drop');
function removeIdReferences(value, ids) {
  if (typeof value === 'string') return ids.has(value) ? DROP : value;
  if (Array.isArray(value)) return value.map((item) => removeIdReferences(item, ids)).filter((item) => item !== DROP);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).flatMap(([key, item]) => {
      if (ids.has(key)) return [];
      const clean = removeIdReferences(item, ids);
      return clean === DROP ? [] : [[key, clean]];
    }));
  }
  return value;
}

function erasurePlan(db, filePath, ids) {
  const state = snapshot(db);
  const selected = new Set(ids);
  const targets = state.leads.filter((row) => selected.has(row.id));
  if (targets.length !== ids.length) throw new Error('Every requested lead ID must exist; nothing was changed.');
  // Contact matching is a review aid, never an automatic cascade to another enquiry/person.
  const emails = new Set(targets.flatMap((row) => [row.email, row.email_normalized]).filter(Boolean).map((s) => s.trim().toLowerCase()));
  const phones = new Set(targets.flatMap((row) => [row.phone_normalized]).filter(Boolean));
  const candidates = state.leads.filter((row) => !selected.has(row.id) && (
    [row.email, row.email_normalized].some((value) => value && emails.has(value.trim().toLowerCase()))
    || (row.phone_normalized && phones.has(row.phone_normalized))
  )).map((row) => row.id);
  const blockers = candidates.map((rowId) => ({ kind: 'same-contact-needs-review', table: 'leads', rowId }));
  const tokens = [...new Set(targets.flatMap((row) => [row.id, row.name, row.email, row.email_normalized, row.phone, row.phone_normalized])
    .filter((value) => typeof value === 'string' && value.trim()).map((value) => value.toLowerCase()))];
  const containsToken = (value) => typeof value === 'string' && tokens.some((token) => value.toLowerCase().includes(token));
  const links = [];
  const metadata = [];
  for (const row of state.leads) {
    if (selected.has(row.id)) continue;
    if (selected.has(row.returning_of_lead_id)) links.push(row.id);
    const columns = Object.entries(row).filter(([key, value]) => key !== 'returning_of_lead_id' && containsToken(value)).map(([key]) => key);
    if (columns.length) blockers.push({ kind: 'possible-copy-needs-review', table: 'leads', rowId: row.id, columns });
  }
  for (const event of state.events) {
    if (selected.has(event.lead_id)) continue;
    let meta = event.meta;
    if (meta !== null && meta !== '') {
      try {
        const parsed = JSON.parse(meta);
        const clean = removeIdReferences(parsed, selected);
        if (JSON.stringify(parsed) !== JSON.stringify(clean === DROP ? null : clean)) {
          meta = clean === DROP ? null : JSON.stringify(clean);
          metadata.push({ id: event.id, meta });
        }
      } catch {
        // Malformed JSON may contain PII; the scan below blocks rather than dropping its contents.
      }
    }
    const remaining = { ...event, meta };
    const columns = Object.entries(remaining).filter(([key, value]) => !['id', 'lead_id'].includes(key) && containsToken(value)).map(([key]) => key);
    if (columns.length) blockers.push({ kind: 'possible-copy-needs-review', table: 'lead_events', rowId: event.id, columns });
  }
  const plan = {
    operation: 'erase', mode: 'dry-run', syntheticOnly: true, database: filePath,
    leadIds: ids, leadsDeleted: targets.length,
    eventsDeleted: state.events.filter((event) => selected.has(event.lead_id)).length,
    relationshipsCleared: links, metadataEventsRedacted: metadata.map((event) => event.id),
    sameContactCandidateIds: candidates, blockers,
    snapshotHash: sha(state),
    confirmation: confirmationFor('erase', filePath, state, { ids }),
  };
  return { plan, links, metadata };
}

/** No raw names, contact details, notes or event payloads are returned by this tool. */
export function inspectFixture(file) {
  const { db, filePath } = openFixture(file);
  try {
    db.exec('BEGIN');
    const state = snapshot(db);
    db.exec('COMMIT');
    return {
      operation: 'inspect', syntheticOnly: true, database: filePath,
      leadIds: state.leads.map((row) => row.id), leads: state.leads.length, events: state.events.length,
      snapshotHash: sha(state),
    };
  } finally { db.close(); }
}

/** A write requires both apply=true and the digest from an unchanged dry run. */
export function eraseFixture(file, { leadIds, apply = false, confirmation } = {}) {
  const ids = normalizeIds(leadIds);
  const { db, filePath } = openFixture(file, apply);
  try {
    db.exec(apply ? 'BEGIN IMMEDIATE' : 'BEGIN');
    try {
      const { plan, links, metadata } = erasurePlan(db, filePath, ids);
      requireConfirmation(apply, confirmation, plan.confirmation);
      if (!apply) { db.exec('COMMIT'); return plan; }
      if (plan.blockers.length) throw new Error('Erasure blocked by unresolved identity/free-text references. Review the dry-run blockers.');
      for (const id of links) db.prepare('UPDATE leads SET returning_of_lead_id = NULL WHERE id = ?').run(id);
      for (const event of metadata) db.prepare('UPDATE lead_events SET meta = ? WHERE id = ?').run(event.meta, event.id);
      // Explicit deletion protects even if a fixture was originally created with FK checks disabled.
      for (const id of ids) db.prepare('DELETE FROM lead_events WHERE lead_id = ?').run(id);
      for (const id of ids) db.prepare('DELETE FROM leads WHERE id = ?').run(id);
      if (db.prepare('PRAGMA foreign_key_check').all().length) throw new Error('Post-erasure foreign-key check failed.');
      db.exec('COMMIT');
      return { ...plan, mode: 'applied', confirmation: undefined };
    } catch (error) { db.exec('ROLLBACK'); throw error; }
  } finally { db.close(); }
}

export function createFixture(file, { apply = false, confirmation } = {}) {
  const filePath = localPath(file, { mustExist: false });
  if (existsSync(filePath)) throw new Error('Refusing to overwrite an existing file.');
  const expected = 'CREATE-SYNTHETIC-FIXTURE';
  requireConfirmation(apply, confirmation, expected);
  const result = { operation: 'fixture', mode: 'dry-run', syntheticOnly: true, database: filePath, confirmation: expected };
  if (!apply) return result;
  mkdirSync(path.dirname(filePath), { recursive: true });
  // Exclusive creation also closes the check/open race; never open someone else's existing file for writing.
  closeSync(openSync(filePath, 'wx', 0o600));
  const db = new DatabaseSync(filePath);
  try {
    db.exec('PRAGMA foreign_keys = ON; BEGIN IMMEDIATE');
    try {
      migrate(db);
      db.prepare("INSERT INTO lead_ops_fixture VALUES (1, 'synthetic-only-v1', ?)").run(randomUUID());
      const insert = db.prepare(`INSERT INTO leads (id, created_at, updated_at, source, name, email, email_normalized,
        phone, phone_normalized, status_changed_at, returning_of_lead_id, notes, exclude)
        VALUES (?, ?, ?, 'manual', ?, ?, ?, ?, ?, ?, ?, ?, 'test')`);
      const at = '2026-10-21T10:00:00.000Z';
      for (const row of [
        ['fixture-a', 'Synthetic Alpha', 'alpha@example.invalid', '+00 000 000 001', '00000000001', null, 'Synthetic target only'],
        ['fixture-a-repeat', 'Synthetic Alpha', 'alpha@example.invalid', '+00 000 000 001', '00000000001', 'fixture-a', 'Synthetic repeat only'],
        ['fixture-b', 'Synthetic Beta', 'beta@example.invalid', '+00 000 000 002', '00000000002', 'fixture-a', 'Keep this enquiry'],
        ['fixture-c', 'Synthetic Gamma', 'gamma@example.invalid', '+00 000 000 003', '00000000003', null, 'Keep this too'],
      ]) {
        const [id, name, email, phone, normalizedPhone, related, notes] = row;
        insert.run(id, at, at, name, email, email, phone, normalizedPhone, at, related, notes);
      }
      const event = db.prepare("INSERT INTO lead_events (lead_id, at, type, actor, note, meta) VALUES (?, ?, 'created', 'system', ?, ?)");
      event.run('fixture-a', at, 'Synthetic Alpha note', JSON.stringify({ email: 'alpha@example.invalid' }));
      event.run('fixture-a-repeat', at, null, JSON.stringify({ returning_of_lead_id: 'fixture-a' }));
      event.run('fixture-b', at, 'Keep this event', JSON.stringify({ returning_of_lead_id: 'fixture-a', keep: 'unrelated', nested: ['fixture-a', 'retain'] }));
      event.run('fixture-c', at, null, JSON.stringify({ keep: 'unrelated' }));
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); throw error; }
  } finally { db.close(); }
  return { ...result, mode: 'applied', confirmation: undefined };
}

/** Backup/restore are verified copies into NEW files; existing files are never overwritten. */
export function copyFixture(file, output, { operation = 'backup', apply = false, confirmation } = {}) {
  if (!['backup', 'restore'].includes(operation)) throw new Error('Only backup or restore is supported.');
  const outputPath = localPath(output, { mustExist: false });
  if (existsSync(outputPath)) throw new Error('Refusing to overwrite an existing file. Restore into a new file.');
  const { db, filePath } = openFixture(file);
  try {
    const state = snapshot(db);
    const expected = confirmationFor(operation, filePath, state, { outputPath });
    const result = {
      operation, mode: 'dry-run', syntheticOnly: true, database: filePath, output: outputPath,
      leads: state.leads.length, events: state.events.length, snapshotHash: sha(state), confirmation: expected,
    };
    requireConfirmation(apply, confirmation, expected);
    if (!apply) return result;
    mkdirSync(path.dirname(outputPath), { recursive: true });
    closeSync(openSync(outputPath, 'wx', 0o600));
    // VACUUM INTO obtains SQLite's consistent snapshot; never copy a live .sqlite/-wal pair with fs.copyFile.
    db.prepare('VACUUM INTO ?').run(outputPath);
    const { db: restored } = openFixture(outputPath);
    try {
      if (sha(snapshot(restored)) !== sha(state)) throw new Error('Copy verification failed; keep the new file isolated and repeat the drill into another new path.');
    } finally { restored.close(); }
    return { ...result, mode: 'applied', verified: true, confirmation: undefined };
  } finally { db.close(); }
}

export function main(args = process.argv.slice(2)) {
  const { values, positionals } = parseArgs({ args, allowPositionals: true, strict: true, options: {
    db: { type: 'string' }, out: { type: 'string' }, lead: { type: 'string', multiple: true },
    apply: { type: 'boolean', default: false }, confirm: { type: 'string' }, help: { type: 'boolean' },
  } });
  if (values.help || positionals.length === 0) {
    console.log(`Synthetic local SQLite rehearsals only (no remote or production mode).
  node scripts/leads-data-ops.mjs fixture --db <new.sqlite>
  node scripts/leads-data-ops.mjs inspect --db <fixture.sqlite>
  node scripts/leads-data-ops.mjs erase --db <fixture.sqlite> --lead <id> [--lead <id>]
  node scripts/leads-data-ops.mjs backup --db <fixture.sqlite> --out <new.sqlite>
  node scripts/leads-data-ops.mjs restore --db <backup.sqlite> --out <new.sqlite>
All mutations default to a dry run. Repeat with --apply --confirm <exact confirmation>.
Erasure blocks on unresolved contact matches/free-text copies. Retention automation is absent.`);
    return;
  }
  const [command] = positionals;
  if (positionals.length !== 1 || !['fixture', 'inspect', 'erase', 'backup', 'restore'].includes(command)) throw new Error('Unsupported command; use --help.');
  if (!values.db) throw new Error('--db is required.');
  if (values.lead && command !== 'erase') throw new Error('--lead is only valid with erase.');
  if (values.out && !['backup', 'restore'].includes(command)) throw new Error('--out is only valid with backup/restore.');
  if (command === 'inspect' && (values.apply || values.confirm)) throw new Error('inspect is read-only.');
  const options = { apply: values.apply, confirmation: values.confirm };
  const result = command === 'fixture' ? createFixture(values.db, options)
    : command === 'inspect' ? inspectFixture(values.db)
    : command === 'erase' ? eraseFixture(values.db, { ...options, leadIds: values.lead })
    : copyFixture(values.db, values.out, { ...options, operation: command });
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { main(); } catch (error) {
    // Do not print exception text: SQLite errors can embed data from constraints/functions.
    const safe = error instanceof Error && !error.code ? error.message : 'SQLite/filesystem operation failed; no successful completion is claimed.';
    console.error(`[leads-data-ops] ${safe}`);
    process.exitCode = 1;
  }
}

// A D1Database stand-in for the lead harnesses: node:sqlite (in memory) behind the D1 API shape
// (prepare().bind().run()/first()/all()/raw(), batch(), exec()). It applies worker/migrations/*.sql
// on creation, so the harness runs against the real schema.
//
// node:sqlite prints an ExperimentalWarning on Node 22/24. The npm scripts run node with
// --disable-warning=ExperimentalWarning, which keeps harness output clean.
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

// Statements that return rows. Everything else reports changes / last_row_id.
const READER_PATTERN = /^\s*(SELECT|WITH|PRAGMA|VALUES)\b|\bRETURNING\b/i;

function toSqliteValue(value, index) {
  if (value === undefined) {
    // D1 rejects undefined the same way ("D1_TYPE_ERROR: Type 'undefined' not supported").
    throw new TypeError(`D1_TYPE_ERROR: Type 'undefined' not supported for value at index ${index}`);
  }
  if (typeof value === 'boolean') return value ? 1 : 0;
  return value;
}

class FakeStatement {
  #db;
  #sql;
  #values;

  constructor(db, sql, values = []) {
    this.#db = db;
    this.#sql = sql;
    this.#values = values;
  }

  bind(...values) {
    return new FakeStatement(this.#db, this.#sql, values.map(toSqliteValue));
  }

  /** Synchronous core shared by run/all and batch. */
  execute() {
    const statement = this.#db.prepare(this.#sql);
    if (READER_PATTERN.test(this.#sql)) {
      const results = statement.all(...this.#values);
      return { success: true, meta: { changes: 0, last_row_id: 0, duration: 0, rows_read: results.length, rows_written: 0 }, results };
    }
    const { changes, lastInsertRowid } = statement.run(...this.#values);
    return {
      success: true,
      meta: { changes: Number(changes), last_row_id: Number(lastInsertRowid), duration: 0, rows_read: 0, rows_written: Number(changes) },
      results: [],
    };
  }

  async run() {
    return this.execute();
  }

  async all() {
    return this.execute();
  }

  async first(column) {
    const row = this.#db.prepare(this.#sql).get(...this.#values);
    if (!row) return null;
    if (column === undefined) return { ...row };
    if (!(column in row)) throw new Error(`D1_COLUMN_NOTFOUND: Column not found (${column})`);
    return row[column];
  }

  async raw(options = {}) {
    const statement = this.#db.prepare(this.#sql);
    const rows = statement.all(...this.#values);
    const arrays = rows.map((row) => Object.values(row));
    if (options.columnNames) {
      return [statement.columns().map((column) => column.name), ...arrays];
    }
    return arrays;
  }
}

/**
 * @param {{ migrationsDir: string }} options
 * @returns a D1Database-shaped object plus `_db` (the DatabaseSync, for assertions)
 */
export function createFakeD1({ migrationsDir }) {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');

  const migrations = readdirSync(migrationsDir).filter((name) => name.endsWith('.sql')).sort();
  for (const name of migrations) {
    db.exec(readFileSync(path.join(migrationsDir, name), 'utf8'));
  }

  return {
    _db: db,
    migrations,

    prepare(sql) {
      return new FakeStatement(db, sql);
    },

    /** Runs all statements in one transaction, like D1; any error rolls everything back. */
    async batch(statements) {
      db.exec('BEGIN');
      try {
        const results = statements.map((statement) => statement.execute());
        db.exec('COMMIT');
        return results;
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },

    async exec(sql) {
      db.exec(sql);
      const count = sql.split(';').filter((part) => part.trim()).length;
      return { count, duration: 0 };
    },
  };
}

# Supabase Migration Status - 2026-05-05

## Current Live State

- Supabase project: `izekwngqjllaqibrwotp` (`beautyfacelift`).
- Worker API: `https://beautyfacelift.mediapaulo.workers.dev/api/services`.
- Production service catalog has been updated to the official Treatwell catalog.
- After applying `supabase/migrations/005_treatwell_range_price_services.sql` with `supabase db query --linked --file`, the Worker API returned 65 services.
- Supabase migration bookkeeping was repaired on 2026-05-05. `supabase db push --linked --dry-run` now reports that the remote database is up to date.
- Security follow-up migrations applied on 2026-05-05 through the Supabase Management API:
  - `20260505184333_private_admin_helper`: moves admin RLS checks to `private.is_admin()` and removes exposed `public.is_admin()` RPC.
  - `20260505184508_move_btree_gist_extension`: moves `btree_gist` from `public` to `extensions`.
- The two official Treatwell range-price services are present through the Worker API:
  - `maske-soin-initiale-augenmaske`: visible label `CHF 30-150`, stored lower-bound `price_chf = 30`.
  - `klassische-ganzkoerpermassage`: visible label `CHF 135-1200`, stored lower-bound `price_chf = 135`.

## Migration History Finding and Resolution

The production data was correct, but Supabase migration bookkeeping was not aligned with the repo.

Original remote migration table:

```text
version: 20260417151241
name: add_carbon_microneedling_service
```

Observed local migration files:

```text
001_initial_schema.sql
002_carbon_microneedling.sql
003_security_hardening.sql
004_treatwell_service_catalog.sql
005_treatwell_range_price_services.sql
```

This means the production database has migrations/data changes that were applied through the dashboard or direct SQL execution, but the Supabase migration history table does not record local versions `001` through `005`.

Repair applied on 2026-05-05:

```bash
npx supabase migration repair 001 002 003 004 005 --status applied --linked
npx supabase migration repair 20260417151241 --status reverted --linked
```

Verified result:

```text
Local | Remote
001   | 001
002   | 002
003   | 003
004   | 004
005   | 005
```

Security follow-up verification on 2026-05-05:

```text
Remote migrations include:
20260505184333 private_admin_helper
20260505184508 move_btree_gist_extension

Supabase security advisor remaining warning:
auth_leaked_password_protection
```

## Backup Notes

Supabase Free Plan does not include dashboard scheduled backups. A manual logical backup through `supabase db dump` was attempted, but the local CLI requires Docker Desktop or native Postgres tooling for `pg_dump`; Docker was not available on this machine.

Because the repair only mutates `supabase_migrations.schema_migrations`, a targeted before/after backup of that table was saved locally outside the repo:

```text
_archives/supabase-migration-repair-2026-05-05/
  schema_migrations-before.json
  schema_migrations-after.json
  public-row-counts-before.json
```

Do not rely on `_archives/supabase-backup-2026-05-05/` if present from earlier attempts; the Docker-blocked dump files were zero-byte and were removed.

## Guardrails

- Use `supabase db push --linked --dry-run` before any future production migration.
- Do not use `supabase db push --include-all` on production unless deliberately recovering migration history.
- Take a logical backup with Docker Desktop or native `pg_dump` before schema/data migrations with real blast radius.
- If a production data correction is urgent, run only a single reviewed SQL file through `supabase db query --linked --file <file>` and verify via the Worker API afterward.

## Future Migration Workflow

1. Create a non-`master` branch.
2. Add a new migration file under `supabase/migrations/`.
3. Run the SQL locally or against a staging copy when available.
4. Run:

```bash
npx supabase migration list --linked
npx supabase db push --linked --dry-run
```

5. Apply only after reviewing the dry-run output.
6. Verify through the live Worker API or a direct read-only SQL query.
7. Document the result in the PR.

## Operational Rule

For this project, production database writes should be treated like live deploys:

- work from a non-`master` branch,
- document the exact SQL,
- run a read-only status check first,
- apply one intentional change,
- verify through the live Worker API,
- then commit the documentation and migration files through a PR.

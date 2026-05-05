# Supabase Migration Status - 2026-05-05

## Current Live State

- Supabase project: `izekwngqjllaqibrwotp` (`beautyfacelift`).
- Worker API: `https://beautyfacelift.mediapaulo.workers.dev/api/services`.
- Production service catalog has been updated to the official Treatwell catalog.
- After applying `supabase/migrations/005_treatwell_range_price_services.sql` with `supabase db query --linked --file`, the Worker API returned 65 services.
- The two official Treatwell range-price services are present through the Worker API:
  - `maske-soin-initiale-augenmaske`: visible label `CHF 30-150`, stored lower-bound `price_chf = 30`.
  - `klassische-ganzkoerpermassage`: visible label `CHF 135-1200`, stored lower-bound `price_chf = 135`.

## Migration History Finding

The production data is correct, but Supabase migration bookkeeping is not aligned with the repo.

Observed remote migration table:

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

## Guardrails

- Do not run `supabase db push`, `supabase db push --include-all`, or `supabase migration repair` against production until the migration history is intentionally repaired.
- Do not assume `supabase db push --dry-run` is safe enough as the only check. On 2026-05-05, `supabase migration list --linked` failed without a valid `SUPABASE_DB_PASSWORD`, and `supabase db push --linked --dry-run` timed out.
- If a production data correction is urgent before repair, run only a single reviewed SQL file through `supabase db query --linked --file <file>` and verify via the Worker API afterward.

## Recommended Repair Plan

1. Take a remote backup before changing migration history:

```bash
npx supabase db dump --linked --file supabase-backup-YYYY-MM-DD.sql
```

2. Ensure the CLI can connect consistently:

```bash
$env:SUPABASE_DB_PASSWORD = "<production-db-password>"
npx supabase migration list --linked
```

3. Export the current migration history for audit:

```bash
npx supabase db query --linked "select * from supabase_migrations.schema_migrations order by version;"
```

4. Prefer a baseline repair in a dedicated branch:
   - Pull or dump the current production schema.
   - Create a single current-state baseline migration, or intentionally mark the already-applied local versions as applied.
   - Handle the existing remote-only `20260417151241` carbon migration explicitly so it does not remain a hidden mismatch.

5. Only after the repair is verified should future DB changes use normal migrations and `supabase db push`.

## Operational Rule

For this project, production database writes should be treated like live deploys:

- work from a non-`master` branch,
- document the exact SQL,
- run a read-only status check first,
- apply one intentional change,
- verify through the live Worker API,
- then commit the documentation and migration files through a PR.

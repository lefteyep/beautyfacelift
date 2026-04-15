# Legacy Pages Functions

These files powered the `/api/*` routes when the project was deployed on Cloudflare Pages.
They were replaced by the unified Worker at `worker/index.ts` on 2026-04-15.

Kept for reference and emergency rollback. See `docs/MIGRATION.md`.

**Do not deploy these.** The Workers runtime uses `worker/routes/*.ts` instead.

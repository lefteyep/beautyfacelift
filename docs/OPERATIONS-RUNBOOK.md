# Operations Runbook

Last updated: 2026-05-05

## Deployment rules

- `master` is the live deploy branch.
- Do not edit or commit directly on `master`.
- Do not run `wrangler deploy` from a local machine unless explicitly approved.
- Use a separate branch/worktree for each active editing agent.
- Prefer GitHub Actions deployment from `origin/master`.

## Standard verification

Before opening a PR:

```powershell
npm ci
npm audit --audit-level=moderate
npm run build
npm run smoke:security
npx wrangler deploy --dry-run
```

After a production deploy:

```powershell
npm run smoke:security -- --base-url https://beautyfacelift.mediapaulo.workers.dev
```

Optional Supabase anon verification:

```powershell
$env:PUBLIC_SUPABASE_URL="https://izekwngqjllaqibrwotp.supabase.co"
$env:PUBLIC_SUPABASE_ANON_KEY="<anon key>"
npm run smoke:security
```

## Secret handling

- Never commit secrets or paste them into docs.
- Any key pasted into chat, logs, screenshots, or issue text is temporary and must be revoked before production launch.
- Rotate `SUPABASE_SERVICE_ROLE_KEY` before collecting real customer data.
- Recreate the Resend API key after the real sender domain is verified.
- Recreate temporary Cloudflare setup tokens after setup work is complete.

## DNS and email launch sequence

1. Get DNS access for `beautyfacelift.ch`.
2. Add or transfer the zone to Cloudflare.
3. Bind `beautyfacelift.ch` and `www.beautyfacelift.ch` to the Worker.
4. Update Supabase Auth Site URL and Redirect URLs to the live domain.
5. Verify `beautyfacelift.ch` in Resend with DKIM/SPF/DMARC.
6. Update Worker and Supabase email sender secrets to the verified domain.
7. Run contact and booking notification tests.
8. Run the smoke script against the final custom domain.

## Known deferred work

- Stripe deposits are intentionally disabled.
- GA4 and Meta CAPI are ready in code but inactive until secrets are configured.
- The stale Claude homepage V2 worktree is design exploration only; do not merge it into security or ops PRs.

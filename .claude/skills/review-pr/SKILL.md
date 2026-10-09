---
name: review-pr
description: Review an existing pull request by number for a non-developer owner, read-only. Use when the user says "review PR N", "is PR N safe to merge", or wants a second opinion on work done by Codex or another session.
argument-hint: <pull request number>
---

Review pull request **$ARGUMENTS** of `lefteyep/beautyfacelift` for an owner who is not a developer. This is **read-only**: do not modify files, do not commit, do not push, do not post on GitHub unless the user asks.

1. **Load the pull request** with the GitHub tools in this session (`pull_request_read`) or locally with `gh pr view $ARGUMENTS`: title, description, head branch, check results.
2. **Get the code.** `git fetch origin master <branch>`. Read `git diff origin/master...origin/<branch>`. To run it, and only if the working tree is clean, `git switch --detach origin/<branch>`; return with `git switch -` when done.
3. **Run the checks.** `npm ci` if needed, `npm run build`, `npm run check`, and the `qa:*` scripts from `package.json` that cover the pages touched.
4. **Look for problems, most serious first:**
   - Anything that could break the live site: build failure, changes to `worker/`, security headers, forms, Turnstile, Supabase, redirects, 404 handling.
   - Wrong business facts: prices, opening hours, treatment names, address, phone, medical or marketing claims. Compare with the existing pages and `docs/current/`.
   - SEO regressions: titles, descriptions, canonical URLs, schema, sitemap, robots, internal links.
   - Edits to shared files (`src/components/Nav.astro`, `src/components/Footer.astro`, `src/layouts/`, `shared/site.ts`) and their effect on other pages.
   - Description versus diff: does the checklist match what actually changed?
5. **Report in plain language**, in the language the user writes in:
   - **Verdict:** SAFE TO MERGE, FIX FIRST, or DO NOT MERGE.
   - **Findings**, most serious first. For each: what, where (page or file), why it matters, and a one-sentence fix.
   - **What you checked and what passed.**
   - No code dumps. Short sentences.
6. **If the user then says "fix it":** switch to the head branch, fix, run the checks, push to the same branch, update the checklist in the pull request. Never a new branch, never a second pull request.

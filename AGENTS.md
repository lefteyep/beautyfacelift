# Project Rules for Coding Agents (Codex and Claude Code)

This file is read by Codex and by Claude Code, in local folders and in cloud sessions. It is the
single source of working rules for this repository. `CLAUDE.md` is gitignored on purpose and never
reaches a cloud session, so do not rely on it.

## Safety Model

- `master` is the live deploy branch. Pushing to `master` triggers Cloudflare deployment through `.github/workflows/deploy.yml`.
- Do not edit directly on `master`.
- Do not run `npm run cf:deploy`, `wrangler deploy`, or push to `master` without explicit user approval.
- The live production URL is `https://beautyfacelift-zuerich.ch`.
- The temporary workers.dev hostname is not canonical and should remain disabled or redirected by production config.
- The GitHub remote must be `https://github.com/lefteyep/beautyfacelift.git`.

## Required Start Check

Before editing files, run and report:

```bash
git status -sb
git remote -v
git branch --show-current
```

If the current branch is `master`, stop and create or switch to a task branch first:

```bash
git switch -c codex/<short-task-name>    # Codex
git switch -c claude/<short-task-name>   # Claude Code (cloud sessions already start on a claude/... branch)
```

If there are uncommitted changes you did not create, do not overwrite them. Work with them if they are relevant, or ask before touching the same files.

## Working Protocol (Claude Code and Codex)

The owner of this project is not a developer. These rules exist so that any task can be handed
over to another tool or another session at any moment, and so that nothing reaches the live site
without a reviewed pull request.

### Save as you go

- Commit and push after every completed step. Never end a session or a turn with uncommitted or unpushed work on a task branch. Use a `WIP:` prefix when a step is unfinished. (Claude Code enforces this with the Stop hook in `.claude/settings.json`.)
- Open a draft pull request as soon as the first commit exists. Fill in the template from `.github/pull_request_template.md`: What this changes / Done / Left to do / How to test / Screenshots.
- Update the pull request checklist with every push. The pull request is the handover note. Do not create separate handover files in the repository.
- End every session by reporting the pull request number and the branch name.

### The pull request number is the handle

- **"Continue PR N"**: find the head branch of pull request N, fetch and check it out, read the checklist and the latest commits, finish the open items one at a time, commit and push to the same branch after each item, keep the checklist current. In Claude Code: `/continue-pr N`.
- **"Review PR N"**: read-only. Fetch the branch, read the diff against `master` and the pull request description, run the build and the relevant checks, and report in plain language for a non-developer: a verdict (safe to merge / fix first / do not merge) and findings ordered by severity, each with where and why. Look especially for a broken build, wrong business facts (prices, hours, treatments, claims), SEO regressions, changes to forms, the worker or security headers, and edits to shared files. Change nothing. In Claude Code: `/review-pr N`.
- **"Fix PR N"**: only after an explicit instruction. Push fixes to the same branch so the existing pull request updates. Never open a second pull request for the same change.

### One editor at a time

- Only one tool or session edits a given branch at a time. A reviewer does not push. If you are asked to fix a pull request another tool wrote, assume that tool has finished.
- Shared files count as one page: `src/components/Nav.astro`, `src/components/Footer.astro`, everything in `src/layouts/`, `shared/site.ts`, and any file holding prices, opening hours or contact details. Say so before touching them, and leave them alone if another task is known to be editing them.
- Before a merge, the branch must be up to date with `master`. If GitHub reports a conflict, merge `master` into the task branch, resolve, run the build, push. Never rebase or force-push a branch another tool created.

### Facts and verification

- Never guess business facts: prices, opening hours, treatment names, address, phone, medical or marketing claims. Use what the repository and the user provide. Otherwise ask, or leave a clearly marked TODO in the pull request checklist.
- Before pushing, run `npm run build` and `npm run check`, plus the `qa:*` scripts in `package.json` that cover the pages you touched. Report results honestly. A failed check is reported, never hidden.
- When a page the visitor sees changed, attach screenshots to the pull request or send them to the user.

## Parallel Chat / Agent Rules

- Branches belong to folders, not chats. Two Codex chats using the same folder share the same files and the same current branch.
- Claude Code cloud sessions run in their own container with a fresh clone and need no worktree.
- For simultaneous local editing, create a temporary sibling Git worktree per agent/task.
- Each editing agent should have its own folder and its own branch, for example:

```text
astro-v2                      -> master, reference only
../astro-v2-worktrees/homepage -> codex/homepage-fixes
../astro-v2-worktrees/booking  -> codex/booking-fixes
```

- Do not let two agents edit the same files at the same time unless one agent is only reviewing.
- Use clear ownership: one agent per page, component group, or feature area.
- Before merging branches, run tests/builds and review the diff.
- Remove temporary worktrees after their branches are merged or abandoned.

## Deployment Rule

Changes are allowed to go live only after:

1. Work is on a non-master branch.
2. The branch has been tested locally or in the session.
3. A pull request is reviewed.
4. The user explicitly approves merge/deploy to `master`.

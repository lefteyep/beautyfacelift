# Codex Project Rules

## Safety Model

- `master` is the live deploy branch. Pushing to `master` triggers Cloudflare deployment through `.github/workflows/deploy.yml`.
- Do not edit directly on `master`.
- Do not run `npm run cf:deploy`, `wrangler deploy`, or push to `master` without explicit user approval.
- Install local Git hooks with `npm run agent:install-hooks`; the pre-push hook blocks pushes to `master` unless `ALLOW_MASTER_PUSH=1` is set for an explicitly approved emergency push.
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

If you are in the shared `astro-v2` checkout, stop. That checkout is reference/deploy state only and must not be used for implementation work.

Create a task worktree from `origin/master` instead:

```bash
npm run agent:start -- <short-task-name>
```

Then continue work inside the printed `.worktrees/<date>-<short-task-name>` folder.

If there are uncommitted changes you did not create, do not overwrite them. Work with them if they are relevant, or ask before touching the same files.

## Parallel Chat / Agent Rules

- Branches belong to folders, not chats. Two Codex chats using the same folder share the same files and the same current branch.
- No agent may edit in the shared `astro-v2` checkout.
- Every task gets exactly one worktree and one branch created from `origin/master`.
- No two agents may use the same folder or branch.
- For simultaneous editing, create a Git worktree per agent/task with `npm run agent:start -- <short-task-name>`.
- Each editing agent should have its own folder and its own branch, for example:

```text
astro-v2                                  -> master, reference only
astro-v2/.worktrees/2026-06-04-homepage   -> codex/2026-06-04-homepage
astro-v2/.worktrees/2026-06-04-booking    -> codex/2026-06-04-booking
```

- Do not let two agents edit the same files at the same time unless one agent is only reviewing.
- Use clear ownership: one agent per page, component group, or feature area.
- Before merging branches, run tests/builds and review the diff.
- Remove temporary worktrees only after their branches are merged, snapshotted, or explicitly abandoned.
- Use `npm run agent:status` before starting or merging parallel work.
- Use `npm run agent:snapshot -- <path>` before any cleanup that might discard dirty local work.
- Use `npm run agent:cleanup -- --stale` only for stale detached temp/deploy worktrees and orphaned `.worktrees/` folders.

## Deployment Rule

Changes are allowed to go live only after:

1. Work is on a non-master branch.
2. The branch has been tested locally.
3. A pull request is opened against `master`.
4. The GitHub Build check passes.
5. The pull request is reviewed.
6. The user explicitly approves merge/deploy to `master`.

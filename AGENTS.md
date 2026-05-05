# Codex Project Rules

## Safety Model

- `master` is the live deploy branch. Pushing to `master` triggers Cloudflare deployment through `.github/workflows/deploy.yml`.
- Do not edit directly on `master`.
- Do not run `npm run cf:deploy`, `wrangler deploy`, or push to `master` without explicit user approval.
- The live Worker URL is `https://beautyfacelift.mediapaulo.workers.dev/`.
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
git switch -c codex/<short-task-name>
```

If there are uncommitted changes you did not create, do not overwrite them. Work with them if they are relevant, or ask before touching the same files.

## Parallel Chat / Agent Rules

- Branches belong to folders, not chats. Two Codex chats using the same folder share the same files and the same current branch.
- For simultaneous editing, use a separate Git worktree per agent/task.
- Each editing agent should have its own folder and its own branch, for example:

```text
astro-v2                     -> master, reference only
astro-v2-worktrees/homepage  -> codex/homepage-fixes
astro-v2-worktrees/booking   -> codex/booking-fixes
```

- Do not let two agents edit the same files at the same time unless one agent is only reviewing.
- Use clear ownership: one agent per page, component group, or feature area.
- Before merging branches, run tests/builds and review the diff.

## Deployment Rule

Changes are allowed to go live only after:

1. Work is on a non-master branch.
2. The branch has been tested locally.
3. A pull request is reviewed.
4. The user explicitly approves merge/deploy to `master`.

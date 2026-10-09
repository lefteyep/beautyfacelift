---
name: continue-pr
description: Continue the work of an existing pull request by number. Use when the user says "continue PR N", "finish PR N", or hands over unfinished work from Codex or from another session.
argument-hint: <pull request number>
---

Continue pull request **$ARGUMENTS** of `lefteyep/beautyfacelift`. Follow the Working Protocol in `AGENTS.md`.

1. **Identify the pull request.** If no number was given, ask for it and stop. Find its head branch, title, description and draft state with the GitHub tools available in this session (`pull_request_read`) or, locally, with `gh pr view $ARGUMENTS --json headRefName,title,body,isDraft`.
2. **Check it out.** `git fetch origin <branch>`, then `git switch <branch>` (or `git switch -c <branch> --track origin/<branch>`). Confirm with `git status -sb`. Never continue on `master`. If the working tree has changes you did not make, stop and ask.
3. **Read the handover.** The pull request description (What this changes / Done / Left to do / How to test), the last commits (`git log --oneline -15`), and the diff against master (`git diff origin/master...HEAD --stat`). If the checklist is missing or stale, rebuild it from the diff before changing anything, and update the pull request description.
4. **Work through "Left to do" one item at a time.** After each item: run the checks that cover it, commit with a clear message, `git push -u origin <branch>`, and tick the item in the pull request description (`update_pull_request` or `gh pr edit`).
5. **Before finishing:** `npm run build`, `npm run check`, and the `qa:*` scripts from `package.json` that cover the pages you touched. A failing check is fixed or reported, never hidden. If a page a visitor sees changed, produce screenshots.
6. **Draft state.** If every item is done, mark the pull request ready for review. Otherwise leave it as a draft with the open items listed.
7. **Final report, in plain language:** what was finished, what is still open, the pull request number and branch, and where the screenshots are.

Rules: push to the same branch only. Never rebase or force-push. Do not merge. Do not touch `master`. Never guess prices, opening hours, treatment names or claims; ask or leave a marked TODO in the checklist.

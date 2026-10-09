#!/usr/bin/env node
// Claude Code Stop hook: refuse to end a turn while *this session's* work is uncommitted or
// unpushed. See AGENTS.md, "Working Protocol / Save as you go".
//
// Behaviour:
// - Nothing of this session's is unsaved      -> exit 0, Claude stops normally. Pre-existing
//                                               changes by somebody else are never flagged.
// - This session left work unsaved           -> prints {"decision":"block","reason":...}: commit,
//                                               push and update the PR checklist.
// - Second attempt (stop_hook_active)        -> exit 0, so Claude can explain instead of looping.
// - Any error (no git, not a repo, ...)      -> exit 0 silently. The hook fails open.
//
// Limits: the Stop hook only runs when Claude ends a turn normally. A turn that is interrupted by
// the user, hits a rate limit or fails with an error never reaches it. checkpoint-reminder.mjs
// covers long turns; the habit of pushing after every step covers the rest.
//
// "This session's work" is everything that differs from the snapshot session-baseline.mjs took
// when the session started. Without a snapshot (hooks added mid-session, fresh cloud clone) all
// unsaved work is treated as this session's, and the message says so.

import { readInput, openRepo, assess, listSome, saveAdvice, foreignNote } from './lib/git-state.mjs';

const input = readInput();
if (input.stop_hook_active) process.exit(0);

let a;
try {
  const repo = openRepo(process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd());
  a = assess(repo, input.session_id);
} catch {
  process.exit(0);
}

if (a.ownDirty.length === 0 && a.ownUnpushed === 0) process.exit(0);

const found = [];
if (a.ownDirty.length > 0) found.push(`uncommitted changes in ${listSome(a.ownDirty)}`);
if (a.ownUnpushed > 0) found.push(`${a.ownUnpushed} commit(s) not yet pushed to origin`);

const certainty = a.hasBaseline
  ? ''
  : ' (No session snapshot exists, so this may include changes that were already there: if any of them are not yours, do not commit them, say so, and stop.)';

const reason =
  `AGENTS.md Working Protocol: never end a turn with this session's work unsaved. Found: ${found.join(' and ')}.${certainty} ` +
  `${saveAdvice(a)}${foreignNote(a)} ` +
  'If the user explicitly told you not to commit or push, say so in one line and stop.';

process.stdout.write(JSON.stringify({ decision: 'block', reason }));
process.exit(0);

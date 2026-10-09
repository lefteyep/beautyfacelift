#!/usr/bin/env node
// Claude Code SessionStart hook: snapshot the working tree so the other hooks can tell this
// session's work apart from pre-existing, unfinished work by somebody else.
//
// Writes .git/claude-session-<session_id>.json once per session. A resumed or compacted session
// keeps its id and therefore its original snapshot. Fails open: any error -> exit 0 silently.

import { readInput, openRepo, loadBaseline, writeBaseline, pruneSessionFiles } from './lib/git-state.mjs';

const input = readInput();
try {
  const repo = openRepo(process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd());
  pruneSessionFiles(repo);
  if (!loadBaseline(repo, input.session_id)) writeBaseline(repo, input.session_id);
} catch {
  /* fail open */
}
process.exit(0);

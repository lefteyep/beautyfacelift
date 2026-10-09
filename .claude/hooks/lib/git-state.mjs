// Shared helpers for the Claude Code hooks in this folder.
//
// The hooks must only ever talk about work made in the *current* session. A snapshot of the
// working tree is taken when the session starts (session-baseline.mjs). Everything that was
// already uncommitted or unpushed at that moment is "foreign": somebody else's unfinished work,
// which the hooks mention but never ask Claude to commit or push.
//
// All git calls use argument arrays (no shell quoting) and run from the repository root, because
// `git status --porcelain` prints paths relative to the root regardless of the current directory.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// Personal, machine-specific files that never count as work to publish.
export const IGNORED_PATHS = ['.claude/settings.local.json'];

// Commits made this many ms before the session snapshot still count as this session's work.
const CLOCK_SKEW_MS = 60 * 1000;

export function readInput() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
  } catch {
    return {};
  }
}

export function openRepo(startDir) {
  const run = (args, cwd) =>
    execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const root = run(['rev-parse', '--show-toplevel'], startDir).trim();
  const git = (args) => run(args, root).trim(); // for single values: hashes, names, counts
  const gitRaw = (args) => run(args, root); // for line-oriented output: never trim, see dirtyEntries
  const gitDir = path.resolve(root, git(['rev-parse', '--git-dir']));
  return { root, git, gitRaw, gitDir };
}

// Porcelain v1 lines look like "XY path" or "XY old -> new". The first column may be a space,
// so the output must not be trimmed before slicing (that was the bug Codex found).
export function dirtyEntries(repo) {
  return repo
    .gitRaw(['status', '--porcelain=v1', '--untracked-files=all'])
    .split(/\r?\n/)
    .filter((line) => line.length > 3)
    .map((line) => {
      let p = line.slice(3);
      const arrow = p.indexOf(' -> ');
      if (arrow !== -1) p = p.slice(arrow + 4);
      if (p.startsWith('"') && p.endsWith('"')) p = p.slice(1, -1);
      return { code: line.slice(0, 2), path: p };
    })
    .filter((e) => !IGNORED_PATHS.includes(e.path));
}

export function hashPath(repo, p) {
  const abs = path.join(repo.root, p);
  try {
    if (!fs.existsSync(abs)) return 'deleted';
    if (fs.statSync(abs).isDirectory()) return 'dir';
    return repo.git(['hash-object', '--', p]);
  } catch {
    return 'unreadable';
  }
}

// Unix seconds of each commit that is not on the remote yet (newest first).
export function unpushedCommitTimes(repo) {
  const read = (range) =>
    repo
      .gitRaw(['log', '--format=%ct', ...range])
      .split(/\r?\n/)
      .filter(Boolean)
      .map(Number);
  try {
    return read(['@{upstream}..HEAD']);
  } catch {
    try {
      return read(['HEAD', '--not', '--remotes']);
    } catch {
      return [];
    }
  }
}

export function currentBranch(repo) {
  return repo.git(['rev-parse', '--abbrev-ref', 'HEAD']);
}

function safeId(sessionId) {
  return String(sessionId || 'unknown').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64) || 'unknown';
}

export function baselineFile(repo, sessionId) {
  return path.join(repo.gitDir, `claude-session-${safeId(sessionId)}.json`);
}

export function checkpointFile(repo, sessionId) {
  return path.join(repo.gitDir, `claude-checkpoint-${safeId(sessionId)}.json`);
}

export function loadBaseline(repo, sessionId) {
  try {
    return JSON.parse(fs.readFileSync(baselineFile(repo, sessionId), 'utf8'));
  } catch {
    return null;
  }
}

export function writeBaseline(repo, sessionId) {
  const dirty = {};
  for (const e of dirtyEntries(repo)) dirty[e.path] = hashPath(repo, e.path);
  const data = {
    createdAt: Date.now(),
    head: repo.git(['rev-parse', 'HEAD']),
    branch: currentBranch(repo),
    unpushedCommits: unpushedCommitTimes(repo).length,
    dirty,
  };
  fs.writeFileSync(baselineFile(repo, sessionId), JSON.stringify(data));
  return data;
}

// Remove snapshot and checkpoint files from sessions older than a week.
export function pruneSessionFiles(repo, maxAgeMs = 7 * 24 * 60 * 60 * 1000) {
  const now = Date.now();
  for (const name of fs.readdirSync(repo.gitDir)) {
    if (!/^claude-(session|checkpoint)-.*\.json$/.test(name)) continue;
    const file = path.join(repo.gitDir, name);
    try {
      if (now - fs.statSync(file).mtimeMs > maxAgeMs) fs.unlinkSync(file);
    } catch {
      /* ignore */
    }
  }
}

// Classify the current unsaved work into "own" (made in this session) and "foreign".
export function assess(repo, sessionId) {
  const baseline = loadBaseline(repo, sessionId);
  const ownDirty = [];
  const foreignDirty = [];
  for (const e of dirtyEntries(repo)) {
    if (!baseline) {
      ownDirty.push(e.path);
      continue;
    }
    const before = baseline.dirty?.[e.path];
    if (before === undefined || hashPath(repo, e.path) !== before) ownDirty.push(e.path);
    else foreignDirty.push(e.path);
  }

  const times = unpushedCommitTimes(repo);
  let ownUnpushed = 0;
  let foreignUnpushed = 0;
  for (const t of times) {
    if (!baseline || t * 1000 >= baseline.createdAt - CLOCK_SKEW_MS) ownUnpushed += 1;
    else foreignUnpushed += 1;
  }

  return {
    branch: currentBranch(repo),
    hasBaseline: Boolean(baseline),
    ownDirty,
    foreignDirty,
    ownUnpushed,
    foreignUnpushed,
  };
}

export function listSome(paths, max = 6) {
  const shown = paths.slice(0, max).join(', ');
  return paths.length > max ? `${shown} and ${paths.length - max} more` : shown;
}

// The sentence both hooks use to describe what to do about this session's work.
export function saveAdvice(a) {
  const stageHint =
    a.foreignDirty.length > 0
      ? ' Stage only the files you changed (git add <file> ...), never `git add -A`.'
      : '';
  if (a.branch === 'master') {
    return (
      'You are on master. Do not commit here: create a task branch with `git switch -c claude/<short-task-name>`, ' +
      `commit there (prefix "WIP:" if the step is unfinished), then \`git push -u origin <branch>\`.${stageHint}`
    );
  }
  return (
    `Commit now (prefix "WIP:" if the step is unfinished) and run \`git push -u origin ${a.branch}\`, ` +
    `then update the Done / Left to do checklist in the pull request, or open a draft pull request if none exists yet.${stageHint}`
  );
}

// The sentence about work that is not this session's.
export function foreignNote(a) {
  const parts = [];
  if (a.foreignDirty.length > 0) parts.push(`uncommitted changes in ${listSome(a.foreignDirty)}`);
  if (a.foreignUnpushed > 0) parts.push(`${a.foreignUnpushed} unpushed commit(s)`);
  if (parts.length === 0) return '';
  return (
    ` Also present but NOT yours (already there when this session started): ${parts.join(' and ')}. ` +
    'Leave that alone, do not commit or push it, and mention it to the user.'
  );
}

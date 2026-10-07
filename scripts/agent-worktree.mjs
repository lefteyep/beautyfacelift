#!/usr/bin/env node

import childProcess from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const BASE_REF = "origin/master";
const WORKTREE_DIR = ".worktrees";
const SNAPSHOT_DIR = ".agent-snapshots";
const STALE_TEMP_PREFIXES = [
  "beautyfacelift-deploy-",
  "beautyfacelift-edit-",
  "beautyfacelift-mobile-remove-",
];
const ORPHAN_ARCHIVE_EXCLUDES = new Set(["node_modules", "dist", ".astro", ".wrangler"]);

function localDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function timestamp(date = new Date()) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${localDate(date)}-${hours}${minutes}${seconds}`;
}

export function sanitizeSlug(value) {
  const slug = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slug) {
    throw new Error("A task slug is required.");
  }

  return slug.slice(0, 80).replace(/-$/g, "");
}

export function buildStartTarget(repoRoot, taskSlug, date = localDate()) {
  const slug = sanitizeSlug(taskSlug);
  const datedSlug = `${date}-${slug}`;

  return {
    slug,
    baseRef: BASE_REF,
    branch: `codex/${datedSlug}`,
    worktreePath: path.join(repoRoot, WORKTREE_DIR, datedSlug),
  };
}

export function parseWorktreePorcelain(output) {
  const worktrees = [];
  let current = null;

  for (const rawLine of String(output).split(/\r?\n/)) {
    const line = rawLine.trimEnd();

    if (!line) {
      if (current) {
        worktrees.push(finalizeWorktree(current));
        current = null;
      }
      continue;
    }

    if (line.startsWith("worktree ")) {
      if (current) {
        worktrees.push(finalizeWorktree(current));
      }
      current = {
        path: line.slice("worktree ".length),
        head: null,
        branch: null,
        detached: false,
        locked: false,
        prunable: false,
      };
      continue;
    }

    if (!current) {
      continue;
    }

    if (line.startsWith("HEAD ")) {
      current.head = line.slice("HEAD ".length);
    } else if (line.startsWith("branch ")) {
      current.branch = line.slice("branch ".length).replace(/^refs\/heads\//, "");
    } else if (line === "detached") {
      current.detached = true;
    } else if (line.startsWith("locked")) {
      current.locked = true;
    } else if (line.startsWith("prunable")) {
      current.prunable = true;
    }
  }

  if (current) {
    worktrees.push(finalizeWorktree(current));
  }

  return worktrees;
}

function finalizeWorktree(worktree) {
  return {
    path: worktree.path,
    head: worktree.head,
    branch: worktree.branch,
    detached: worktree.detached || !worktree.branch,
    locked: worktree.locked,
    prunable: worktree.prunable,
  };
}

function canonicalPath(filePath) {
  const resolved = path.resolve(filePath);
  return process.platform === "win32" ? resolved.toLowerCase() : resolved;
}

export function findOrphanWorktreeDirs(repoRoot, worktrees) {
  const worktreesRoot = path.join(repoRoot, WORKTREE_DIR);
  if (!fs.existsSync(worktreesRoot)) {
    return [];
  }

  const registered = new Set(worktrees.map((worktree) => canonicalPath(worktree.path)));

  return fs
    .readdirSync(worktreesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(worktreesRoot, entry.name))
    .filter((entryPath) => !registered.has(canonicalPath(entryPath)))
    .sort((a, b) => a.localeCompare(b));
}

export function isStaleTempWorktree(worktree, tempRoot = os.tmpdir()) {
  if (!worktree.detached || worktree.branch) {
    return false;
  }

  const baseName = path.basename(worktree.path).toLowerCase();
  const hasExpectedName = STALE_TEMP_PREFIXES.some((prefix) => baseName.startsWith(prefix));
  if (!hasExpectedName) {
    return false;
  }

  const relativeToTemp = path.relative(tempRoot, worktree.path);
  return relativeToTemp && !relativeToTemp.startsWith("..") && !path.isAbsolute(relativeToTemp);
}

function quoteCmdArg(arg) {
  if (/^[A-Za-z0-9._:/\\=-]+$/.test(arg)) {
    return arg;
  }

  return `"${String(arg).replace(/(["^&|<>%])/g, "^$1")}"`;
}

function commandForPlatform(command, args) {
  if (process.platform === "win32" && command === "npm") {
    return {
      executable: "cmd.exe",
      args: ["/d", "/s", "/c", ["npm", ...args.map(quoteCmdArg)].join(" ")],
    };
  }

  return { executable: command, args };
}

function run(command, args, options = {}) {
  const invocation = commandForPlatform(command, args);
  const result = childProcess.spawnSync(invocation.executable, invocation.args, {
    cwd: options.cwd,
    encoding: options.encoding ?? "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    windowsHide: true,
  });

  if (result.status !== 0) {
    const detail = result.stderr ? `\n${result.stderr.trim()}` : "";
    const spawnError = result.error ? `\n${result.error.message}` : "";
    throw new Error(`Command failed: ${command} ${args.join(" ")}${detail}${spawnError}`);
  }

  return options.capture ? String(result.stdout ?? "").trimEnd() : "";
}

function git(args, cwd, options = {}) {
  return run("git", args, { cwd, capture: true, ...options });
}

function tryGit(args, cwd) {
  try {
    return git(args, cwd);
  } catch {
    return null;
  }
}

function findCanonicalRepoRoot(cwd) {
  const commonDir = git(["rev-parse", "--git-common-dir"], cwd);
  const absoluteCommonDir = path.isAbsolute(commonDir)
    ? commonDir
    : path.resolve(cwd, commonDir);

  if (path.basename(absoluteCommonDir) !== ".git") {
    throw new Error(`Unsupported git common directory: ${absoluteCommonDir}`);
  }

  return path.dirname(absoluteCommonDir);
}

function getWorktrees(cwd) {
  return parseWorktreePorcelain(git(["worktree", "list", "--porcelain"], cwd));
}

function dirtyCount(worktreePath) {
  const status = tryGit(["status", "--porcelain"], worktreePath);
  if (status === null || !status) {
    return status === null ? "error" : 0;
  }

  return status.split(/\r?\n/).filter(Boolean).length;
}

function aheadBehind(worktreePath) {
  const output = tryGit(["rev-list", "--left-right", "--count", `HEAD...${BASE_REF}`], worktreePath);
  if (!output) {
    return { ahead: "?", behind: "?" };
  }

  const [ahead, behind] = output.split(/\s+/);
  return { ahead, behind };
}

function currentBranch(worktreePath) {
  return tryGit(["branch", "--show-current"], worktreePath) || null;
}

function currentHead(worktreePath) {
  return tryGit(["rev-parse", "HEAD"], worktreePath) || null;
}

function uniquePath(basePath) {
  if (!fs.existsSync(basePath)) {
    return basePath;
  }

  for (let index = 2; index < 1000; index += 1) {
    const candidate = `${basePath}-${index}`;
    if (!fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Could not find a unique path for ${basePath}`);
}

function branchExists(repoRoot, branch) {
  return childProcess.spawnSync("git", ["show-ref", "--verify", "--quiet", `refs/heads/${branch}`], {
    cwd: repoRoot,
    windowsHide: true,
  }).status === 0;
}

function uniqueBranch(repoRoot, branch) {
  if (!branchExists(repoRoot, branch)) {
    return branch;
  }

  for (let index = 2; index < 1000; index += 1) {
    const candidate = `${branch}-${index}`;
    if (!branchExists(repoRoot, candidate)) {
      return candidate;
    }
  }

  throw new Error(`Could not find a unique branch for ${branch}`);
}

function branchHead(repoRoot, branch) {
  return tryGit(["rev-parse", branch], repoRoot);
}

function reusableSafetyBranch(repoRoot, branch, head) {
  if (!branchExists(repoRoot, branch)) {
    return branch;
  }

  if (branchHead(repoRoot, branch) === head) {
    return branch;
  }

  return uniqueBranch(repoRoot, branch);
}

function printStatus(cwd) {
  const repoRoot = findCanonicalRepoRoot(cwd);
  const worktrees = getWorktrees(cwd);
  const orphans = findOrphanWorktreeDirs(repoRoot, worktrees);

  console.log(`Agent worktree status`);
  console.log(`Repo: ${repoRoot}`);
  console.log(`Base: ${BASE_REF}`);
  console.log("");
  console.log("Worktrees:");

  for (const worktree of worktrees) {
    const dirty = dirtyCount(worktree.path);
    const divergence = aheadBehind(worktree.path);
    const branch = worktree.branch || currentBranch(worktree.path) || "DETACHED";
    const flags = [];
    if (worktree.locked) flags.push("locked");
    if (worktree.prunable) flags.push("prunable");
    if (isStaleTempWorktree(worktree)) flags.push("stale-temp");

    console.log(
      `- ${branch} | dirty=${dirty} | ahead=${divergence.ahead} behind=${divergence.behind}${
        flags.length ? ` | ${flags.join(",")}` : ""
      }`,
    );
    console.log(`  ${worktree.path}`);
  }

  console.log("");
  console.log("Orphan folders:");
  if (orphans.length === 0) {
    console.log("- none");
  } else {
    for (const orphan of orphans) {
      console.log(`- ${orphan}`);
    }
  }
}

function parseOptionValue(args, name) {
  const index = args.indexOf(name);
  if (index === -1) {
    return null;
  }

  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${name}`);
  }

  return value;
}

function startWorktree(cwd, args) {
  const positional = args.filter((arg, index) => {
    if (arg === "--date") return false;
    if (args[index - 1] === "--date") return false;
    return !arg.startsWith("--");
  });
  const taskSlug = positional[0];
  const date = parseOptionValue(args, "--date") || localDate();
  const skipBaseline = args.includes("--skip-baseline");

  const repoRoot = findCanonicalRepoRoot(cwd);
  const target = buildStartTarget(repoRoot, taskSlug, date);

  if (fs.existsSync(target.worktreePath)) {
    throw new Error(`Worktree path already exists: ${target.worktreePath}`);
  }
  if (branchExists(repoRoot, target.branch)) {
    throw new Error(`Branch already exists: ${target.branch}`);
  }

  console.log(`Fetching origin...`);
  run("git", ["fetch", "origin"], { cwd: repoRoot });

  console.log(`Creating ${target.branch}`);
  run("git", ["worktree", "add", target.worktreePath, "-b", target.branch, target.baseRef], {
    cwd: repoRoot,
  });

  if (!skipBaseline) {
    console.log(`Installing dependencies in ${target.worktreePath}`);
    run("npm", ["ci"], { cwd: target.worktreePath });
    console.log(`Running baseline build in ${target.worktreePath}`);
    run("npm", ["run", "build"], { cwd: target.worktreePath });
  }

  console.log("");
  console.log(`Worktree ready: ${target.worktreePath}`);
  console.log(`Branch: ${target.branch}`);
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function copyUntrackedFiles(sourcePath, snapshotPath) {
  const output = childProcess.spawnSync("git", ["ls-files", "--others", "--exclude-standard", "-z"], {
    cwd: sourcePath,
    encoding: "buffer",
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });

  if (output.status !== 0) {
    throw new Error(`Could not list untracked files in ${sourcePath}`);
  }

  const files = output.stdout
    .toString("utf8")
    .split("\0")
    .filter(Boolean);

  for (const file of files) {
    const from = path.join(sourcePath, file);
    const to = path.join(snapshotPath, "untracked", file);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }

  return files;
}

function writeGitDiff(sourcePath, args, outputPath) {
  run("git", [...args, `--output=${outputPath}`], { cwd: sourcePath });
  if (!fs.existsSync(outputPath)) {
    writeFile(outputPath, "");
  }
}

function createSnapshot(targetPath, repoRoot, reason = "manual") {
  const sourcePath = path.resolve(targetPath);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Snapshot source does not exist: ${sourcePath}`);
  }

  const slug = sanitizeSlug(path.basename(sourcePath));
  const snapshotPath = uniquePath(path.join(repoRoot, SNAPSHOT_DIR, `${timestamp()}-${slug}`));
  fs.mkdirSync(snapshotPath, { recursive: true });

  const head = currentHead(sourcePath);
  const safetyBranchBase = `safety/${localDate()}-${slug}`;
  const safetyBranch = reusableSafetyBranch(repoRoot, safetyBranchBase, head);
  if (!branchExists(repoRoot, safetyBranch)) {
    run("git", ["branch", safetyBranch, "HEAD"], { cwd: sourcePath });
  }

  const status = git(["status", "--short", "--branch"], sourcePath);
  const untrackedFiles = copyUntrackedFiles(sourcePath, snapshotPath);

  writeFile(path.join(snapshotPath, "status.txt"), `${status}\n`);
  writeGitDiff(sourcePath, ["diff", "--binary"], path.join(snapshotPath, "tracked.patch"));
  writeGitDiff(
    sourcePath,
    ["diff", "--cached", "--binary"],
    path.join(snapshotPath, "staged.patch"),
  );
  writeFile(
    path.join(snapshotPath, "metadata.json"),
    `${JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        reason,
        sourcePath,
        branch: currentBranch(sourcePath),
        head,
        safetyBranch,
        untrackedFiles,
      },
      null,
      2,
    )}\n`,
  );

  return { snapshotPath, safetyBranch };
}

function snapshotCommand(cwd, args) {
  const targetPath = args.find((arg) => !arg.startsWith("--")) || cwd;
  const repoRoot = findCanonicalRepoRoot(cwd);
  const snapshot = createSnapshot(targetPath, repoRoot, "manual");

  console.log(`Snapshot created: ${snapshot.snapshotPath}`);
  console.log(`Safety branch: ${snapshot.safetyBranch}`);
}

function archiveOrphan(orphanPath, repoRoot) {
  const slug = sanitizeSlug(path.basename(orphanPath));
  const snapshotPath = uniquePath(path.join(repoRoot, SNAPSHOT_DIR, `${timestamp()}-orphan-${slug}`));
  const copyTarget = path.join(snapshotPath, "orphan-copy");

  fs.mkdirSync(snapshotPath, { recursive: true });
  const excluded = [];
  fs.cpSync(orphanPath, copyTarget, {
    recursive: true,
    force: true,
    filter(source) {
      const name = path.basename(source);
      if (ORPHAN_ARCHIVE_EXCLUDES.has(name)) {
        excluded.push(path.relative(orphanPath, source) || name);
        return false;
      }
      return true;
    },
  });
  writeFile(
    path.join(snapshotPath, "metadata.json"),
    `${JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        reason: "orphan-worktree-cleanup",
        sourcePath: path.resolve(orphanPath),
        excluded,
      },
      null,
      2,
    )}\n`,
  );

  return snapshotPath;
}

function cleanupStale(cwd, args) {
  if (!args.includes("--stale")) {
    throw new Error("Cleanup requires --stale. No broad cleanup command is available.");
  }

  const dryRun = args.includes("--dry-run");
  const repoRoot = findCanonicalRepoRoot(cwd);
  const worktrees = getWorktrees(cwd);
  const staleWorktrees = worktrees.filter((worktree) => isStaleTempWorktree(worktree));
  const orphans = findOrphanWorktreeDirs(repoRoot, worktrees);

  if (dryRun) {
    console.log("Dry run only. Stale worktrees:");
    staleWorktrees.forEach((worktree) => console.log(`- ${worktree.path}`));
    console.log("Orphan folders:");
    orphans.forEach((orphan) => console.log(`- ${orphan}`));
    return;
  }

  for (const orphan of orphans) {
    const archivePath = archiveOrphan(orphan, repoRoot);
    fs.rmSync(orphan, { recursive: true, force: true });
    console.log(`Archived and removed orphan: ${orphan}`);
    console.log(`  archive: ${archivePath}`);
  }

  for (const worktree of staleWorktrees) {
    const snapshot = createSnapshot(worktree.path, repoRoot, "stale-temp-worktree-cleanup");
    run("git", ["worktree", "remove", "--force", worktree.path], { cwd: repoRoot });
    console.log(`Snapshotted and removed stale worktree: ${worktree.path}`);
    console.log(`  snapshot: ${snapshot.snapshotPath}`);
    console.log(`  safety branch: ${snapshot.safetyBranch}`);
  }

  if (orphans.length === 0 && staleWorktrees.length === 0) {
    console.log("No stale temp worktrees or orphan folders found.");
  }
}

function printHelp() {
  console.log(`Usage:
  node scripts/agent-worktree.mjs status
  node scripts/agent-worktree.mjs start <task-slug> [--date YYYY-MM-DD] [--skip-baseline]
  node scripts/agent-worktree.mjs snapshot <path>
  node scripts/agent-worktree.mjs cleanup --stale [--dry-run]

Package aliases:
  npm run agent:status
  npm run agent:start -- <task-slug>
  npm run agent:snapshot -- <path>
  npm run agent:cleanup -- --stale
`);
}

export function main(argv = process.argv.slice(2), cwd = process.cwd()) {
  const [command, ...args] = argv;

  if (!command || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command === "status") {
    printStatus(cwd);
    return;
  }

  if (command === "start") {
    startWorktree(cwd, args);
    return;
  }

  if (command === "snapshot") {
    snapshotCommand(cwd, args);
    return;
  }

  if (command === "cleanup") {
    cleanupStale(cwd, args);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

if (process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1])) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

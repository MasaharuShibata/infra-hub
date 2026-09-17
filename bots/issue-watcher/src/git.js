import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

function run(cwd, args) {
  return execFileAsync("git", args, { cwd, maxBuffer: 1024 * 1024 * 32 });
}

export async function syncBaseBranch(repoPath, baseBranch) {
  await run(repoPath, ["fetch", "origin", baseBranch]);
  await run(repoPath, ["checkout", baseBranch]);
  await run(repoPath, ["reset", "--hard", `origin/${baseBranch}`]);
}

export async function createOrResetBranch(repoPath, branchName, baseBranch) {
  await run(repoPath, ["checkout", "-B", branchName, `origin/${baseBranch}`]);
}

export async function hasChanges(repoPath) {
  const { stdout } = await run(repoPath, ["status", "--porcelain"]);
  return stdout.trim().length > 0;
}

export async function commitAll(repoPath, message) {
  await run(repoPath, ["add", "-A"]);
  await run(repoPath, ["commit", "-m", message]);
}

export async function pushBranch(repoPath, branchName) {
  await run(repoPath, ["push", "-u", "origin", branchName, "--force-with-lease"]);
}

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

// 10 minutes: generous upper bound for a single issue's worth of edits.
const TIMEOUT_MS = 10 * 60 * 1000;

function buildPrompt(issue) {
  return [
    `You are working in a local clone of a git repository, already checked out on a fresh branch for this task.`,
    `Implement the following GitHub issue by creating or editing the necessary files.`,
    `Do NOT run "git commit", "git push", or open a pull request yourself — a wrapper script handles that after you finish.`,
    ``,
    `Issue #${issue.number}: ${issue.title}`,
    ``,
    issue.body || "(no description provided)",
  ].join("\n");
}

// Runs Claude Code headlessly against the given issue. Permission prompts are
// skipped (--dangerously-skip-permissions) since nothing here can answer them;
// only run this against a dedicated clone, never a workspace with unsaved edits.
export async function runClaudeOnIssue(repoPath, issue) {
  const prompt = buildPrompt(issue);
  const { stdout, stderr } = await execFileAsync(
    "claude",
    ["-p", prompt, "--dangerously-skip-permissions"],
    { cwd: repoPath, timeout: TIMEOUT_MS, maxBuffer: 1024 * 1024 * 64 }
  );
  return { stdout, stderr };
}

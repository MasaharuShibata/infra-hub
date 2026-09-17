import { Octokit } from "@octokit/rest";
import { config } from "./config.js";

const octokit = new Octokit({ auth: config.githubToken });
const owner = config.owner;
const repo = config.repo;

export async function listTargetIssues() {
  const issues = await octokit.paginate(octokit.issues.listForRepo, {
    owner,
    repo,
    state: "open",
    labels: config.targetLabel,
    sort: "created",
    direction: "asc",
    per_page: 50,
  });
  // The issues API also returns pull requests; exclude those.
  return issues.filter((issue) => !issue.pull_request);
}

export async function findExistingPullRequest(branchName) {
  const { data } = await octokit.pulls.list({
    owner,
    repo,
    state: "all",
    head: `${owner}:${branchName}`,
  });
  return data[0] ?? null;
}

export async function createPullRequest({ branchName, title, body }) {
  const { data } = await octokit.pulls.create({
    owner,
    repo,
    title,
    head: branchName,
    base: config.baseBranch,
    body,
  });
  return data;
}

export async function commentOnIssue(issueNumber, body) {
  await octokit.issues.createComment({ owner, repo, issue_number: issueNumber, body });
}

export async function swapToDoneLabel(issueNumber) {
  await octokit.issues.addLabels({
    owner,
    repo,
    issue_number: issueNumber,
    labels: [config.doneLabel],
  });
  try {
    await octokit.issues.removeLabel({
      owner,
      repo,
      issue_number: issueNumber,
      name: config.targetLabel,
    });
  } catch (err) {
    if (err.status !== 404) throw err;
  }
}

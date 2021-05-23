import { debug } from '@actions/core';
import * as exec from '@actions/exec';
import * as github from '@actions/github';
import { makeConfig } from './config';
import { createTempDirectory } from './files';
import { parseTemplate, TemplateContext } from './template';
import { invariant } from './utils';

// TODO: Convert to @octokit/types@^6
type ReposGetResponseData = any;
type PullsCreateResponseData = any;

export async function getRepoInfo(name: string): Promise<ReposGetResponseData> {
  const { githubToken } = await makeConfig();
  const octokit = github.getOctokit(githubToken);
  const [owner, repo] = name.split('/');

  const { data } = await octokit.rest.repos.get({
    owner,
    repo,
  });

  invariant(data, `${name} was not found or the token does not have access.`);

  return data;
}

export async function cloneRepository(
  name: string,
): Promise<[ReposGetResponseData, string]> {
  const { githubToken } = await makeConfig();
  const tmpDir = await createTempDirectory();
  const data = await getRepoInfo(name);

  const [owner, repo] = name.split('/');

  await exec.exec(
    `git clone https://x-access-token:${githubToken}@github.com/${owner}/${repo}.git ${tmpDir}`,
  );

  return [data, tmpDir];
}

export async function branchExists(
  branch: string,
  context: TemplateContext,
): Promise<boolean> {
  const { githubToken } = await makeConfig();
  const {
    github: { owner, name },
  } = context;
  const octokit = github.getOctokit(githubToken);
  try {
    const branchInfo = await octokit.rest.repos.getBranch({
      repo: name,
      owner: owner.login,
      branch,
    });
    debug(`Found branch ${branchInfo}`);
    return true;
  } catch (e) {
    if (e.message === 'Branch not found') {
      return true;
    }
    throw new Error(`Failed to get branch: ${e.message}`);
  }
}

export async function createBranch(
  repoDir: string,
  branchName: string,
): Promise<void> {
  await exec.exec('git checkout -b', [branchName], {
    cwd: repoDir,
  });
}

export async function checkoutBranch(
  repoDir: string,
  branchName: string,
): Promise<void> {
  await exec.exec('git checkout', [branchName], {
    cwd: repoDir,
  });
}

export async function addFileToIndex(
  repoDir: string,
  file: string,
): Promise<void> {
  await exec.exec(`git add`, [file], { cwd: repoDir });
}

export async function applyChanges(
  repoDir: string,
  context: TemplateContext,
  branchName: string,
): Promise<void> {
  const { commitMessage } = await makeConfig();
  const message = await parseTemplate(commitMessage, context);
  await exec.exec(`git config user.email`, [context.commit.author.email], {
    cwd: repoDir,
  });
  await exec.exec(`git config user.name`, [context.commit.author.name], {
    cwd: repoDir,
  });
  await exec.exec(`git commit -m`, [message, '--no-verify'], { cwd: repoDir });
  await exec.exec(`git push --force -u origin `, [branchName], {
    cwd: repoDir,
  });
}

export async function openPullRequest(
  branchName: string,
  context: TemplateContext,
): Promise<PullsCreateResponseData> {
  const { githubToken, pullRequestBody, pullRequestTitle } = await makeConfig();
  const {
    github: { owner, name, default_branch },
  } = context;
  const octokit = github.getOctokit(githubToken);
  const { data: pullRequest } = await octokit.rest.pulls.create({
    owner: owner.login,
    repo: name,
    head: branchName,
    title: await parseTemplate(pullRequestTitle, context),
    body: await parseTemplate(pullRequestBody, context),
    base: default_branch,
  });

  return pullRequest;
}

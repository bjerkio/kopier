import * as exec from '@actions/exec';
import * as github from '@actions/github';
import type { ReposGetResponseData } from '@octokit/types';
import { githubActionConfig } from './config';
import { createTempDirectory } from './files';
import { parseTemplate, TemplateContext } from './template';
import { invariant } from './utils';

export async function cloneRepository(
  name: string,
): Promise<[ReposGetResponseData, string]> {
  const { githubToken } = githubActionConfig();
  const tmpDir = await createTempDirectory();
  const octokit = github.getOctokit(githubToken);

  const [owner, repo] = name.split('/');

  const { data } = await octokit.repos.get({
    owner,
    repo,
  });

  invariant(data, `${name} was not found or the token does not have access.`);

  await exec.exec(
    `git clone https://x-access-token:${githubToken}@github.com/${owner}/${repo}.git ${tmpDir}`,
  );

  return [data, tmpDir];
}

export async function createBranch(
  repoDir: string,
  branchName: string,
): Promise<void> {
  await exec.exec(`git checkout -b`, [branchName], { cwd: repoDir });
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
): Promise<void> {
  const { commitMessage } = githubActionConfig();
  const message = await parseTemplate(commitMessage, context);
  await exec.exec(`git config user.email`, [context.commit.author.email], { cwd: repoDir });
  await exec.exec(`git config user.name`, [context.commit.author.name], { cwd: repoDir });
  await exec.exec(`git commit -m`, [message, '--no-verify'], { cwd: repoDir });
  await exec.exec(`git push`, [], { cwd: repoDir });
}

export async function openPullRequest(
  branchName: string,
  context: TemplateContext,
): Promise<number> {
  const {
    githubToken,
    pullRequestBody,
    pullRequestTitle,
  } = githubActionConfig();
  const {
    github: { owner, name, default_branch },
  } = context;
  const octokit = github.getOctokit(githubToken);
  const { data: pullRequest } = await octokit.pulls.create({
    owner: owner.login,
    repo: name,
    head: branchName,
    title: await parseTemplate(pullRequestTitle, context),
    body: await parseTemplate(pullRequestBody, context),
    base: default_branch,
  });

  return pullRequest.id;
}

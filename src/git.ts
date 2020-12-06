import * as exec from '@actions/exec';
import * as github from '@actions/github';
import type { ReposGetResponseData } from '@octokit/types';
import { githubActionConfig } from './config';
import { createTempDirectory } from './files';
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
    `git clone https://x-access-token:${githubToken}@${owner}/${repo}.git ${tmpDir}`,
  );

  return [data, tmpDir];
}

export async function createBranch(repoDir: string, branchName: string) {
  await exec.exec(`git checkout -b`, [branchName], { cwd: repoDir });
}

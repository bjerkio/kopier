import { createActionAuth } from '@octokit/auth-action';
import { Octokit } from '@octokit/core';
import { createPullRequest } from 'octokit-plugin-create-pull-request';

const KopierOktokit = Octokit.plugin(createPullRequest).defaults({
  authStrategy: createActionAuth,
  baseUrl: process.env['GITHUB_API_URL'] || 'https://api.github.com',
});

export function getOctokit(token: string) {
  return new KopierOktokit({
    auth: token,
  });
}

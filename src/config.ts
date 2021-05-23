import { debug, getInput } from '@actions/core';
import * as github from '@actions/github';
import { Array, Record, Static, String } from 'runtypes';
import { pullRequestBody } from './pr-message';

const parseMultiInput = (multilineInput) => {
  if (!multilineInput) return undefined;
  return multilineInput.split(/,|\n/).map((e) => e.trim());
};

export const GithubActionsConfig = Record({
  /**
   * Files. Defaults to `**`
   * Can be glob.
   *
   * Can be multiple lines or separated with comma (,).
   *
   * Files will be added to the receiving repository
   * according to the folder structure in this directory.
   * You can also set a base path to change this behaviour.
   */
  files: Array(String).optional(), // files

  /**
   * Github Token must be a personal one, not {{ secret.GITHUB_TOKEN }}!
   * We recommend using a service account github profile.
   */
  githubToken: String, // github-token

  /**
   * List of repositories to add files to.
   *
   * Can be defined as multiple lines or separated with comma (,).
   */
  repos: Array(String).optional(), // repos

  /**
   * Files are looked for at root of the repository
   * if base-path is not applied.
   *
   * Defaults to `**`
   */
  basePath: String.optional(), // base-path

  /**
   * Commit message.
   *
   * Defaults to 'chore(kopier): update files'
   */
  commitMessage: String.optional(),

  /**
   * Pull Request title
   *
   * Defaults to: 'chore(kopier): update files'
   */
  pullRequestTitle: String.optional(),

  /**
   * Pull Request body
   *
   * check [pr-message.ts][pr-message.ts] for default.
   */
  pullRequestBody: String.optional(),

  /**
   * Github Search
   *
   * Example: org:bjerkio topic:infrastructure
   */
  githubSearch: String.optional(),
});

export type GithubActionsConfigType = Static<typeof GithubActionsConfig>;

export const makeConfig = async (
  getRepos = false,
): Promise<GithubActionsConfigType> => {
  const input = GithubActionsConfig.check({
    files: parseMultiInput(getInput('files')),
    githubToken: getInput('github-token', { required: true }),
    repos: parseMultiInput(getInput('repos')),
    basePath: getInput('base-path'),
    githubSearch: getInput('github-search'),
  });

  if (!input.repos && getRepos && input.githubSearch) {
    debug('Running search with Github API');
    const octokit = github.getOctokit(input.githubToken);
    const res = await octokit.rest.search.repos({
      q: input.githubSearch,
    });
    input.repos = res.data.items.map((i) => i.full_name);
  }

  return {
    ...input,
    repos: input.repos ?? [],
    files: input.files ?? ['**'],
    basePath: input.basePath ?? 'templates/',
    commitMessage: input.commitMessage ?? 'chore(kopier): {{commit.subject}}',
    pullRequestTitle:
      input.pullRequestTitle ?? 'chore(kopier): {{commit.subject}}',
    pullRequestBody: input.pullRequestBody ?? pullRequestBody,
  };
};

import { getInput } from '@actions/core';
import { Array, Record, Static, String, Undefined } from 'runtypes';
import { pullRequestBody } from './pr-message';

const parseMultiInput = (multilineInput) => {
  if (!multilineInput) return multilineInput;
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
  files: Array(String).Or(Undefined), // files

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
  repos: Array(String), // repos

  /**
   * Files are looked for at root of the repository
   * if base-path is not applied.
   *
   * Defaults to `**`
   */
  basePath: String.Or(Undefined), // base-path

  /**
   * Commit message.
   *
   * Defaults to 'chore(kopier): update files'
   */
  commitMessage: String.Or(Undefined),

  /**
   * Pull Request title
   *
   * Defaults to: 'chore(kopier): update files'
   */
  pullRequestTitle: String.Or(Undefined),

  /**
   * Pull Request body
   *
   * check [pr-message.ts][pr-message.ts] for default.
   */
  pullRequestBody: String.Or(Undefined),
});

export type GithubActionsConfigType = Static<typeof GithubActionsConfig>;

export const githubActionConfig = (): GithubActionsConfigType => {
  const input = GithubActionsConfig.check({
    files: parseMultiInput(getInput('files')),
    githubToken: getInput('github-token', { required: true }),
    repos: parseMultiInput(getInput('repos', { required: true })),
    basePath: getInput('base-path'),
  });
  return {
    ...input,
    files: input.files || ['**'],
    basePath: input.basePath || 'templates/',
    commitMessage: input.commitMessage || 'chore(kopier): {{commit.subject}}',
    pullRequestTitle:
      input.pullRequestTitle || 'chore(kopier): {{commit.subject}}',
    pullRequestBody: input.pullRequestBody || pullRequestBody,
  };
};

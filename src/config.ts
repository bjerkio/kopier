import { getInput } from '@actions/core';
import { Array, Record, Static, String, Undefined } from 'runtypes';

const parseMultiInput = (multilineInput) => {
  if (!multilineInput) return multilineInput;
  return multilineInput.split(/,|\n/).map((e) => e.trim());
};

export const GithubActionsConfig = Record({
  /**
   * Files. Defaults to `templates/**`
   * Can be glob.
   *
   * Can be multiple lines or separated with comma (,).
   *
   * Files will be added to the receiving repository
   * according to the folder structure in this directory.
   * You can also set a base path to change this behaviour.
   */
  files: Array(String), // files

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
   * Files are added to the root to the directory
   * if base-path is not applied.
   */
  basePath: String.Or(Undefined), // base-path
});

export type GithubActionsConfigType = Static<typeof GithubActionsConfig>;

export const githubActionConfig = (): GithubActionsConfigType => GithubActionsConfig.check({
  files: parseMultiInput(getInput('files')) || ['templates/**'],
  githubToken: getInput('github-token', { required: true }),
  repos: parseMultiInput(getInput('repos', { required: true })),
  basePath: getInput('base-path'),
});

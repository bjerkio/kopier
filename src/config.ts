import { debug, getInput } from '@actions/core';
import * as github from '@actions/github';
import { Array, Record, Static, String } from 'runtypes';
import { pullRequestBody } from './pr-message';

const parseMultiInput = (multilineInput) => {
  if (!multilineInput) return undefined;
  return multilineInput.split(/,|\n/).map((e) => e.trim());
};

export const Config = Record({
  /**
   * `github-token`
   * Github Token must be a personal one, not {{ secret.GITHUB_TOKEN }}!
   * We recommend using a service account github profile.
   *
   */
  githubToken: String,

  /**
   * `repos`
   * List of repositories to add files to.
   *
   * Can be defined as multiple lines or separated with comma (,).
   */
  repos: Array(String).optional(),

  /**
   * `base-path`
   * Files are looked for at root of the repository
   * if base-path is not applied.
   */
  basePath: String,

  /**
   * `commit-message`
   * Commit message.
   *
   * Defaults to 'chore(kopier): update files'
   */
  commitMessage: String,

  /**
   * `title`
   * Pull Request title
   *
   * Defaults to: 'chore(kopier): update files'
   */
  title: String,

  /**
   * `body`
   * Pull Request body
   *
   * check [pr-message.ts][pr-message.ts] for default.
   */
  body: String.optional(),

  /**
   * `query`
   * Github Search Query
   *
   * Example: org:bjerkio topic:infrastructure
   */
  query: String.optional(),

  /**
   * `head`
   * A branch name the updates will be
   * created from.
   *
   * Defaults to kopier-{sha}
   */
  head: String.optional(),

  /**
   * Base branch is where the pull request should
   * be opened.
   *
   * defaults to default branch
   */
  base: String.optional(),
});

export type Config = Static<typeof Config>;

async function getRepos(token: string, q?: string) {
  if (!q) return [];
  debug('Running search with Github API');
  const octokit = github.getOctokit(token);
  const res = await octokit.rest.search.repos({ q });
  return res.data.items.map((i) => i.full_name);
}

export const makeConfig = async (): Promise<Config> => {
  const inputs = {
    githubToken: getInput('github-token', { required: true }),
    repos: parseMultiInput(getInput('repos')),
    basePath: getInput('base-path', { required: true }),
    commitMessage: getInput('commit-message', { required: true }),
    title: getInput('title', { required: true }),
    body: getInput('body'),
    query: getInput('query'),
    head: getInput('head'),
    base: getInput('base'),
  };

  return Config.check({
    ...inputs,
    repos: inputs.repos ?? (await getRepos(inputs.githubToken, inputs.query)),
    body: inputs.body ?? pullRequestBody,
  });
};

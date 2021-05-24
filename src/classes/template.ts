import { debug } from '@actions/core';
import { context as githubContext, getOctokit } from '@actions/github';
import { Endpoints } from '@octokit/types';
import * as Handlebars from 'handlebars';
import { Config } from '../config';
import { invariant } from '../utils';

type RepoInfo = Endpoints['GET /repos/{owner}/{repo}']['response']['data'];
type Commit =
  Endpoints['GET /repos/{owner}/{repo}/git/commits/{commit_sha}']['response']['data'];

export interface Context {
  github: typeof githubContext;
  origin: RepoInfo;
  repo: RepoInfo;
  commit: Commit;
}

export interface Repo {
  owner: string;
  repo: string;
}

export class Template {
  context?: Context;
  private octokit: ReturnType<typeof getOctokit>;

  constructor(
    readonly config: Config,
    readonly repo: string,
    readonly ghContext: typeof githubContext,
  ) {
    this.octokit = getOctokit(config.githubToken);
  }

  async parse(content: string) {
    invariant(this.context, 'expect context to exist');

    const template = Handlebars.compile(content);
    return template(this.context);
  }

  async getContext() {
    debug('Building context');
    this.context = {
      github: this.ghContext,
      origin: await this.getRepoInfo(this.ghContext.repo),
      repo: await this.getRepoInfo(this.getRepo()),
      commit: await this.getLastCommit(),
    };

    return this.context;
  }

  private getRepo(): Repo {
    const [owner, repo] = this.repo.split('/');
    return { owner, repo };
  }

  // Context-related functions
  private async getLastCommit() {
    const commit = await this.octokit.rest.git.getCommit({
      ...this.ghContext.repo,
      commit_sha: this.ghContext.sha,
    });
    debug(`Commit data: ${JSON.stringify(commit.data)}`);
    return commit.data;
  }

  private async getRepoInfo(repo: Repo) {
    const res = await this.octokit.rest.repos.get({
      ...repo,
    });
    return res.data;
  }
}

import * as github from '@actions/github';
import { Config } from '../config';
import { File } from './file';
import { getOctokit } from './octokit';
import { Template } from './template';

export class ChangePR {
  template: Template;

  constructor(
    readonly config: Config,
    readonly repo: string,
    readonly files: File[],
  ) {
    this.template = new Template(this.config, repo, github.context);
  }

  async createPullRequest() {
    const context = await this.template.getContext();
    const octokit = getOctokit(this.config.githubToken);

    const files = await this.parseFiles();

    await octokit.createPullRequest({
      ...this.parseRepoName(),
      title: this.template.parse(this.config.title),
      body: this.template.parse(this.config.body),
      base: this.config.base,
      head: this.config.head ?? `kopier-${context.commit.sha}`,
      createWhenEmpty: false,
      changes: [
        {
          files: files.reduce((p, c) => {
            p[c.path] = c.content;
            return p;
          }, {}),
          commit: this.template.parse(this.config.commitMessage),
        },
      ],
    });
  }

  private async parseFiles() {
    return Promise.all(this.files.map((f) => f.parse(this.template)));
  }

  private parseRepoName() {
    const [owner, repo] = this.repo.split('/');
    return {
      owner,
      repo,
    };
  }
}

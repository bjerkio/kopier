import * as core from '@actions/core';
import * as glob from '@actions/glob';
import { parseLocalFile } from './classes/file';
import { makeConfig } from './config';
import { ChangePR } from './classes/change-pr';

export async function run(): Promise<void> {
  const config = await makeConfig();

  const globber = await glob.create(config.basePath);
  const originFiles = await globber.glob();
  const files = await Promise.all(originFiles.map((f) => parseLocalFile(f)));

  Promise.all(
    config.repos.map(async (repo) => {
      const pr = new ChangePR(config, repo, files);
      return pr.createPullRequest();
    }),
  );
}

try {
  run();
} catch (error) {
  core.setFailed(error);
  throw error;
}

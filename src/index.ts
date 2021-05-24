import * as core from '@actions/core';
import * as glob from '@actions/glob';
import { isDirectory, parseLocalFile } from './classes/file';
import { makeConfig } from './config';
import { ChangePR } from './classes/change-pr';

export async function run(): Promise<void> {
  const config = await makeConfig();

  core.debug(`Running with config: ${JSON.stringify(config)}`);

  const globber = await glob.create(config.basePath);
  const globRes = await globber.glob();
  const originFiles = globRes.filter((f) => !isDirectory(f));

  core.debug(`Origin files: ${originFiles.join(', ')}`);

  const files = await Promise.all(originFiles.map(parseLocalFile));

  if (files.length === 0) {
    return core.warning('No files were found.');
  }

  core.debug(`Files: ${JSON.stringify(files.map((f) => f.getPath()))}`);

  await Promise.all(
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

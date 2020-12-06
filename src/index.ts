import * as core from '@actions/core';
import * as io from '@actions/io';
import * as chalk from 'chalk';
import { githubActionConfig } from './config';
import { getFiles, getNewPath } from './files';
import { cloneRepository, createBranch } from './git';

export async function run(): Promise<void> {
  const { repos } = githubActionConfig();

  // TODO: Analyze if changed have been made in the template-dir
  const files = await getFiles();

  const origRepoPath = process.env.GITHUB_WORKSPACE || process.cwd();

  await Promise.all(
    repos.map(async (repo) => {
      core.info(chalk.bold(repo) + chalk.magenta('Cloning repository'));
      const [, repoDir] = await cloneRepository(repo);

      const date = new Date();
      const branchName = `kopier/${date.getMilliseconds()}`;
      core.info(
        chalk.bold(repo) +
          chalk.magenta(`Creating a new branch named ${branchName} in `),
      );
      await createBranch(repoDir, branchName);

      core.info(chalk.bold(repo) + chalk.magenta('Copying files'));
      await Promise.all(
        files.map((file) => {
          io.cp(file, getNewPath(repoDir, file, origRepoPath));
        }),
      );

      // Commit the changes

      // Push the changes

      // Open Pull Request
    }),
  );
}

run();

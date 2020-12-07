import * as core from '@actions/core';
import * as io from '@actions/io';
import * as util from 'util';
import * as chalk from 'chalk';
import * as mime from 'mime-types';
import { githubActionConfig } from './config';
import { getFiles, getKopierConfig, getNewPath, saveFile } from './files';
import {
  addFileToIndex,
  cloneRepository,
  applyChanges,
  createBranch,
  openPullRequest,
} from './git';
import { parseTemplate, parseTemplateFile } from './template';
import { getLastCommit } from 'git-last-commit';

export async function run(): Promise<void> {
  const { repos, commitMessage } = githubActionConfig();

  // TODO: Analyze if changed have been made in the template-dir
  const files = await getFiles();
  const commit = await util.promisify(getLastCommit)();

  const origRepoPath = process.env.GITHUB_WORKSPACE || process.cwd();

  await Promise.all(
    repos.map(async (repo) => {
      core.info(chalk.bold(`${repo}: `) + chalk.magenta('Cloning repository'));
      const [repoInfo, repoDir] = await cloneRepository(repo);

      const context = {
        github: repoInfo,
        repo: await getKopierConfig(repoDir),
        commit,
      };

      const date = new Date();
      const branchName = `kopier/${commit.shortHash}-${date.getMilliseconds()}`;

      core.info(
        chalk.bold(`${repo}: `) +
          chalk.magenta(`Creating a new branch named ${branchName} in `),
      );

      await createBranch(repoDir, branchName);

      core.info(
        chalk.bold(`${repo}: `) + chalk.magenta('Copying and generating files'),
      );

      await Promise.all(
        files.map(async (file) => {
          const m = mime.lookup(file);
          const p = getNewPath(repoDir, file, origRepoPath);

          if (m === 'text/x-handlebars-template') {
            const fileContent = await parseTemplateFile(context, file);
            await saveFile(p, fileContent);
          } else {
            await io.cp(file, p);
          }

          addFileToIndex(repoDir, p);
        }),
      );

      // Commit the changes
      await applyChanges(repoDir, await parseTemplate(commitMessage, context));

      // Open Pull Request
      const id = await openPullRequest(branchName, context);
      core.info(
        chalk.bold(`${repo}: `) +
          chalk.magenta(`Created new pull request (${repo}#${id})`),
      );
    }),
  );
}

run();

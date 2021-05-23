import * as core from '@actions/core';
import * as io from '@actions/io';
import * as chalk from 'chalk';
import * as fs from 'fs';
import * as mime from 'mime-types';
import { makeConfig } from './config';
import {
  getCleanPath,
  getFiles,
  getKopierConfig,
  getNewPath,
  removeLastExt,
  saveFile,
} from './files';
import {
  addFileToIndex,
  cloneRepository,
  applyChanges,
  createBranch,
  openPullRequest,
  getRepoInfo,
  setUpstream,
  branchExists,
} from './git';
import { parseTemplateFile } from './template';
import { getLastCommit, sanitizeCommitMessage } from './git-commit';

export async function run(): Promise<void> {
  const { repos, branchName } = await makeConfig(true);

  core.debug(`Running kopier on these repositories: ${repos.join(', ')}`);

  // TODO: Analyze if changed have been made in the template-dir
  const files = await getFiles();
  const origRepoPath = process.env.GITHUB_WORKSPACE || process.cwd();
  const commit = await getLastCommit(origRepoPath);
  const origin = await getRepoInfo(process.env.GITHUB_REPOSITORY);

  commit.subject = sanitizeCommitMessage(commit.subject);

  await Promise.all(
    repos.map(async (repo) => {
      core.info(chalk.bold(`${repo}: `) + chalk.magenta('Cloning repository'));
      const [repoInfo, repoDir] = await cloneRepository(repo);

      const context = {
        github: repoInfo,
        repo: await getKopierConfig(repoDir),
        commit,
        origin,
      };

      let temporaryBranchName = `kopier/${commit.shortHash}`;

      let exists = true;
      if (branchName) {
        exists = await branchExists(branchName, context);
        if (!exists) {
          temporaryBranchName = branchName;
        }
      }

      core.info(
        chalk.bold(`${repo}: `) +
          chalk.magenta(`Creating a new branch named ${temporaryBranchName}`),
      );

      await createBranch(repoDir, temporaryBranchName);

      core.info(
        chalk.bold(`${repo}: `) + chalk.magenta('Copying and generating files'),
      );

      await Promise.all(
        files.map(async (file) => {
          const m = mime.lookup(file);
          const s = fs.lstatSync(file);
          const p = await getNewPath(repoDir, file, origRepoPath);

          core.debug(
            `${file} (${m}) (${p}) – does exist? ${fs.existsSync(file)}`,
          );

          try {
            core.debug(`Creating directory ${getCleanPath(p)}`);
            await io.mkdirP(getCleanPath(p));
          } catch (e) {
            core.debug(e);
          }

          if (m === 'text/x-handlebars-template') {
            const fileContent = await parseTemplateFile(context, file);
            const newFileName = removeLastExt(p);
            await saveFile(newFileName, fileContent);
            await addFileToIndex(repoDir, newFileName);
          } else if (!s.isDirectory()) {
            await io.cp(file, p);
            await addFileToIndex(repoDir, p);
          }
        }),
      );

      if (branchName && exists) {
        await setUpstream(repoDir, branchName);
      }

      // Commit the changes
      await applyChanges(repoDir, context, branchName, exists);

      // Open Pull Request
      try {
        const { html_url, number } = await openPullRequest(branchName, context);
        core.info(
          chalk.bold(`${repo}: `) +
            chalk.magenta(`Created new pull request #${number} – ${html_url}`),
        );
      } catch (e) {
        if (e.message && e.message.includes('A pull request already exists')) {
          core.info('A pull request already exists');
        } else {
          throw e;
        }
      }
    }),
  );
}

try {
  run();
} catch (error) {
  core.setFailed(error);
  throw error;
}

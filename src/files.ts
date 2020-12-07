import * as path from 'path';
import { v4 as uuidV4 } from 'uuid';
import * as core from '@actions/core';
import * as io from '@actions/io';
import * as glob from '@actions/glob';
import { githubActionConfig } from './config';
import * as fs from 'fs';

export async function getFiles(): Promise<string[]> {
  const { files: configuredFiles, basePath } = githubActionConfig();

  const f = basePath
    ? configuredFiles.map((f) => path.join(basePath, f))
    : configuredFiles;
  const globber = await glob.create(f.join('/n'));
  return globber.glob();
}

export function getNewPath(
  repoDir: string,
  file: string,
  origRepoPath: string,
): string {
  const { basePath } = githubActionConfig();
  let f = file.replace(origRepoPath, '');
  if (basePath) f = f.replace(basePath, '');
  return path.join(repoDir, f);
}

export function removeLastExt(fileName: string): string {
  return fileName.replace(path.extname(fileName), '');
}

export function getCleanPath(file: string): string {
  return file.substring(0, file.lastIndexOf(path.sep) + 1);
}

export async function saveFile(p: string, body: string): Promise<void> {
  // Make sure this directory exists
  try {
    const directory = getCleanPath(p);
    io.mkdirP(directory);
  } catch (e) {
    core.debug(e);
  }

  fs.writeFileSync(p, body);
}

export async function createTempDirectory(): Promise<string> {
  const IS_WINDOWS = process.platform === 'win32';

  let tempDirectory: string = process.env['RUNNER_TEMP'] || '';

  if (!tempDirectory) {
    let baseLocation: string;
    if (IS_WINDOWS) {
      // On Windows use the USERPROFILE env variable
      baseLocation = process.env['USERPROFILE'] || 'C:\\';
    } else {
      if (process.platform === 'darwin') {
        baseLocation = '/Users';
      } else {
        baseLocation = '/home';
      }
    }
    tempDirectory = path.join(baseLocation, 'actions', 'temp');
  }

  const dest = path.join(tempDirectory, uuidV4());
  await io.mkdirP(dest);
  return dest;
}

export async function getKopierConfig(repoDir: string): Promise<unknown> {
  const potentialNames = [
    '.kopier.json',
    '.kopier',
    '.kopierrc',
    '.kopierrc.json',
  ];
  try {
    const repoBaseDir = fs.readdirSync(repoDir);

    const fileName = repoBaseDir.find((f) =>
      potentialNames.find((pf) => pf === f),
    );

    const content = fs.readFileSync(path.join(repoDir, fileName), 'utf-8');

    return JSON.parse(content);
  } catch (e) {
    core.debug(e);
    return false;
  }
}

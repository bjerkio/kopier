import * as path from 'path';
import { v4 as uuidV4 } from 'uuid';
import * as io from '@actions/io';
import * as glob from '@actions/glob';
import { githubActionConfig } from './config';

export async function getFiles(): Promise<string[]> {
  const { files: configuredFiles } = githubActionConfig();
  const globber = await glob.create(configuredFiles.join('/n'));
  return globber.glob();
}

export function getNewPath(
  repoDir: string,
  file: string,
  origRepoPath: string,
): string {
  const { basePath } = githubActionConfig();
  const f = file.replace(origRepoPath, '');
  return basePath ? path.join(repoDir, basePath, f) : path.join(repoDir, f);
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

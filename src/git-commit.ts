import * as exec from '@actions/exec';
import issueRegex from 'issue-regex';

export interface Commit {
  shortHash: string;
  hash: string;
  subject: string;
  sanitizedSubject: string;
  body: string;
  authoredOn: string;
  committedOn: string;
  author: {
    name: string;
    email: string;
  };
  committer: {
    name: string;
    email: string;
  };
  notes?: string;
  branch: string;
  tags: string[];
}

function executeCommand(
  command: string,
  args?: string[],
  options?: exec.ExecOptions,
): Promise<string> {
  return new Promise((resolve, reject) => {
    let out = '';
    let err = '';
    options.listeners = {
      stdout: (data: Buffer) => {
        out += data.toString();
      },
      stderr: (data: Buffer) => {
        err += data.toString();
      },
    };

    exec.exec(command, args, options).then(() => {
      if (err) return reject(err);
      resolve(out);
    });
  });
}

export async function getLastCommit(cwd?: string): Promise<Commit> {
  const splitCharacter = '<##>';
  const prettyFormat = [
    '%h',
    '%H',
    '%s',
    '%f',
    '%b',
    '%at',
    '%ct',
    '%an',
    '%ae',
    '%cn',
    '%ce',
    '%N',
  ];

  const resLog = await executeCommand(
    'git',
    ['log', '-1', `--pretty=format:"${prettyFormat.join(splitCharacter)}"`],
    { cwd },
  );

  const branch = await executeCommand(
    'git',
    ['rev-parse', '--abbrev-ref', 'HEAD'],
    { cwd },
  );

  const tagsRaw = await executeCommand('git', ['tag', '--contains', 'HEAD'], {
    cwd,
  });

  const a = resLog.replace('"', '').split(splitCharacter);

  const tags = tagsRaw.split('\n');

  return {
    shortHash: a[0],
    hash: a[1],
    subject: a[2],
    sanitizedSubject: a[3],
    body: a[4],
    authoredOn: a[5],
    committedOn: a[6],
    author: {
      name: a[7],
      email: a[8],
    },
    committer: {
      name: a[9],
      email: a[10],
    },
    notes: a[11],
    branch,
    tags,
  };
}

export function sanitizeCommitMessage(
  msg: string,
  orgName: string = process.env.GITHUB_REPOSITORY,
): string {
  const refs = msg.match(issueRegex());

  refs
    .filter((r) => {
      const [org] = r.split('#');
      return !org;
    })
    .map((r) => {
      msg = msg.replace(r, `${orgName}#${r}`);
    });

  return msg;
}

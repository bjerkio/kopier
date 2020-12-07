import * as exec from '@actions/exec';

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
    '',
  ];

  const commandString = 'git log -1 --pretty=format:"' +
    prettyFormat.join(splitCharacter) +
    '"' +
    ' && git rev-parse --abbrev-ref HEAD' +
    ' && git tag --contains HEAD';

  const res = await executeCommand(commandString, [], { cwd });

  const a = res.split(splitCharacter);

  const branchAndTags = a[a.length - 1].split('\n').filter((n) => n);
  const branch = branchAndTags[0];
  const tags = branchAndTags.slice(1);

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

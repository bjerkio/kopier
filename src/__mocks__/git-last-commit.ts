import { GetLastCommitCallback } from 'git-last-commit';

export const getLastCommit = jest.fn((callback: GetLastCommitCallback) =>
  callback(null, {
    shortHash: '0ec8f1f',
    hash: '0ec8f1fe6a7b3dcf18dcf26f75e608b671bafef2',
    subject: 'first commit',
    sanitizedSubject: 'first-commit',
    body: '',
    authoredOn: '1607283087',
    committedOn: '1607283456',
    author: { name: 'Simen A. W. Olsen', email: 'cobraz@cobraz.no' },
    committer: { name: 'Simen A. W. Olsen', email: 'cobraz@cobraz.no' },
    notes: '',
    branch: 'main',
    tags: [],
  }),
);

import { parseTemplateFile } from "../template"
import type { ReposGetResponseData } from '@octokit/types';
import type { Commit } from 'git-last-commit';

jest.mock('fs', () => ({
  readFileSync: jest.fn((file: string): string => {
    if (file === '.kopier') return `{"hello": "world"}`;
    return `hello: {{repo.hello}}`;
  }),
  readdirSync: jest.fn(() => ['.kopier']),
}));

describe('Template', () => {
  it('should parse template', async () => {
    const res = await parseTemplateFile(
      {
        github: {} as ReposGetResponseData,
        repo: {
          hello: 'world',
        },
        commit: {} as Commit,
      },
      'file.hbs',
    );
    expect(res).toBe(`hello: world`);
  })
})

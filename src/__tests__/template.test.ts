import { parseTemplateFile } from '../template';
import type { Commit } from '../git-commit';

// TODO: Convert to @octokit/types@^6
type ReposGetResponseData = any;

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
        origin: {} as ReposGetResponseData,
      },
      'file.hbs',
    );
    expect(res).toBe(`hello: world`);
  });
});

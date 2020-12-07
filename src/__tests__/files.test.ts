/* eslint @typescript-eslint/ban-ts-comment: 0 */
import { getKopierConfig, getNewPath } from '../files';
import * as config from '../config';
import * as path from 'path';

jest.mock('fs', () => ({
  readFileSync: jest.fn(() => `{"hello": "world"}`),
  readdirSync: jest.fn(() => ['.kopier']),
}));

describe('files', () => {
  it('should get repo path', async () => {
    // @ts-ignore
    config.githubActionConfig = jest.fn(() => ({}));

    const p = getNewPath(
      '/tmp/the-repo',
      path.join('/tmp/the-new-repo', 'hello-file', 'up', 'there.txt'),
      '/tmp/the-new-repo',
    );

    expect(p).toBe(`/tmp/the-repo/hello-file/up/there.txt`);
  });
  it('should be able to get kopier config', async () => {
    const r = await getKopierConfig('');
    expect(r).toStrictEqual({ hello: 'world' });
  });
});

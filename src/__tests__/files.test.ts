/* eslint @typescript-eslint/ban-ts-comment: 0 */
import { getNewPath } from '../files';
import * as config from '../config';
import * as path from 'path';

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
});

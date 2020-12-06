import { run } from '..';
import { cp } from '@actions/io'

describe('Kopier Service', () => {
  it('should copy files', async () => {
    await run();
    expect(cp).toBeCalled();
  })
})

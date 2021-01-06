import { run } from '..';
import { cp } from '@actions/io'

jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(() => (`{}`)),
  readdirSync: jest.fn(() => ([
    '.kopier'
  ]))
}));

describe('Kopier Service', () => {
  it('should copy files', async () => {
    await run();
    expect(cp).toBeCalled();
  });
})

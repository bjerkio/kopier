import { ChangePR } from '../change-pr';

describe('ChangePr', () => {
  process.env.GITHUB_ACTION = 'hello';
  process.env.GITHUB_TOKEN = 'world';

  it('should construct', () => {
    const pr = new ChangePR({} as any, '', []);
    expect(pr).toBeTruthy();
  });

  it.todo('should create a pull request');
});

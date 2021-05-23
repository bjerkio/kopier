import { Template } from '../template';
import { Config } from '../../config';

describe('Template', () => {
  process.env.GITHUB_ACTION = 'hello';
  process.env.GITHUB_TOKEN = 'world';

  it('should parse template', async () => {
    const templ = new Template({} as Config, 'hello/hello', {} as any);
    templ.context = { there: 'hello' } as any;
    const res = templ.parse('hello: {{there}}');
    expect(res).toMatchInlineSnapshot(`"hello: hello"`);
  });
  it('should get context', async () => {
    const templ = new Template({} as Config, 'hello/hello', {} as any);
    const ctx = await templ.getContext();
    expect(ctx.repo.name).toMatchInlineSnapshot(`"Hello-World"`);
    expect(ctx.origin.name).toMatchInlineSnapshot(`"Hello-World"`);
  });
});

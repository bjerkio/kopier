import { makeConfig } from '../config';

describe('config', () => {
  process.env.GITHUB_ACTION = 'hello';
  process.env.GITHUB_TOKEN = 'world';

  it('should default', async () => {
    const config = await makeConfig();
    expect(config.repos).toMatchInlineSnapshot(`
      Array [
        "octokit-fixture-org/hello-world",
        "octokit-fixture-org/hello-world",
        "octokit-fixture-org/hello-world",
      ]
    `);
    expect(config.commitMessage).toMatchInlineSnapshot(
      `"chore(kopier): {{commit.subject}}"`,
    );
    expect(config.title).toMatchInlineSnapshot(
      `"chore(kopier): {{commit.subject}}"`,
    );
    expect(config.body).toMatchInlineSnapshot(`
      "Adds changes from [{{origin.name}}]({{origin.html_url}}).

      This change was done by {{commit.author.name}}.

      <details>
      <summary>Commit message</summary>
      {{commit.subject}}
      {{commit.body}}
      </details>

      ---

      This was created by [Kopier](https://github.com/bjerkio/kopier). 🎉

      "
    `);
  });
});

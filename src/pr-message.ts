export const pullRequestBody = `Adds changes from [{{origin.name}}]({{origin.html_url}}).

This change was done by {{commit.author.name}} on {{commit.authoredOn}}.

<details>
<summary>Commit message ([{{commit.shortHash}}]({{origin.html_url}}/commit/{{commit.hash}}))</summary>
**{{commit.subject}}**
{{commit.body}}
</details>

---

This was created by [Kopier](https://github.com/bjerkio/kopier). 🎉

`;

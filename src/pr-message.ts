export const pullRequestBody = `Adds changes from {{origin.name}}

This change was done by {{commit.author.name}} on {{commit.authoredOn}}.

<details>
<summary>Commit message</summary>
**{{commit.subject}}**
{{commit.body}}
</details>

---

This was created by [Kopier](https://github.com/bjerkio/kopier). 🎉

`;

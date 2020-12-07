export const pullRequestBody = `Adds changes from {{repo.name}}

### {{commit.subject}}

Authored by: {{commit.author.name}}

<details>
<summary>Commit message</summary>
{{commit.body}}
</details>

---
This was created by [Kopier](https://github.com/bjerkio/kopier). 🎉
`;

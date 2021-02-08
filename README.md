![Kopier](.github/kopier-logo.png)

[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/bjerkio/vault-action.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/bjerkio/vault-action/context:javascript)
[![codecov](https://codecov.io/gh/bjerkio/vault-action/branch/master/graph/badge.svg)](https://codecov.io/gh/bjerkio/vault-action)
![Build & Deploy](https://github.com/bjerkio/vault-action/workflows/Build%20&%20Deploy/badge.svg?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/c5fefa8af6f5a5466d2a/maintainability)](https://codeclimate.com/github/bjerkio/vault-action/maintainability)

# Kopier

Kopier is a Github Action made to generate/copy files across multiple repositories. The software is inspired
initially by [Copybara](https://github.com/google/copybara) and a continuation of [Tabetalt's Kopier](https://github.com/tabetalt/kopier).

## Features

- Copy files to multiple repositories.
- Generate files (such as Github Actions files) with a [Handlebarsjs](https://handlebarsjs.com/).
- When templates or files are changed, you can create a pull request for each repository.

## Use cases

Kopier was made to make it easier to handle repeatable tasks when working with a multi-repository setup.
In our case, we work with many microservices separated in multiple repositories. We want to make sure we are
running the same Github Actions workflow for each, but there are differences, like the name etc.

## Example Usage

```yaml
jobs:
  build:
    steps:
      - uses: bjerkio/kopier@main
        with:
          repos: |
            bjerkio/kopier
            bjerkio/oidc-react
```

## Input

### `github-token`

**Required** The Github Token (a personal one. GITHUB_TOKEN is not going to work). Needs to have access to the repositories files are moved to.

### `repos`

**Required** Repositories to push changes to.

### `base-path`

Base path for in the repositories, e.g. `.github/workflows`.

### `files`

Files to import. e.g. `templates/**`

# Documentation

Apart from this README, you can find details and examples of using the SDK in the following places:

- [Github Actions Documentation](https://help.github.com/en/actions)

# Similar tools

- [adrianjost/files-sync-action](https://github.com/adrianjost/files-sync-action)
- [andsor/copycat-action](https://github.com/marketplace/actions/copycat-action)

# Contribute

Feel free to open issues and pull requests. We appreciate all the help we can get! 🎉

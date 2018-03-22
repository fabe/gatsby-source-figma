# gatsby-source-figma

Gatsby plugin for using [Figma](https://figma.com) files as a data source.

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![npm](https://img.shields.io/npm/v/gatsby-source-figma.svg?style=flat-square)](https://npm.im/gatsby-source-figma)

---

## Installation

    yarn add gatsby-source-figma

## Usage

This is a work in progress. Currently, only querying of a single file is supported.

    // In your gatsby-config.js
    plugins: [
      {
        resolve: `gatsby-source-figma`,
        options: {
          fileId: `FIGMA_FILE_ID`,
          accessToken: `YOUR_FIGMA_ACCESS_TOKEN`,
        },
      },
    ],

Passing a `fileId` and an `accessToken` is required. You can create an access token inside your [Figma settings](https://www.figma.com/developers/docs#auth-dev-token).

## Querying

```graphql
query StyleguideQuery {
  figmaDocument {
    name
    lastModified
    thumbnailUrl
    pages {
      name
      children {
        name
      }
    }
  }
}
```

Use the built-in GraphiQL tool (http://localhost:8000/___graphql) to get an idea of what you can query.

## Todo

* [x] Query `files`.
* [ ] Query multiple `files`.
* [ ] Query file `images`.
* [ ] Query `projects`.
* [ ] Query team `projects`.
* [ ] Query file `comments`.

# gatsby-source-figma

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![npm](https://img.shields.io/npm/v/gatsby-source-figma.svg?style=flat-square)](https://npm.im/gatsby-source-figma)

Gatsby plugin for using [Figma](https://figma.com) documents as a data source.

![Screenshot](.github/screenshot.jpg)

## Installation

    yarn add gatsby-source-figma

## Usage

```javascript
// In your gatsby-config.js

plugins: [
  {
    resolve: `gatsby-source-figma`,
    options: {
      // For files:
      fileId: `FIGMA_FILE_ID`,
      // For images:
      nodeIds: [`FIGMA_NODE_IDS`],
      // optional for nodeIds: A number between 0.01 and 4, the image scaling factor
      scale: 1,
      // optional: A string enum for the image output format, can be jpg, png, svg, or pdf
      format: 'png' 
      // For projects:
      projectId: `FIGMA_PROJECT_ID`,
      // Get an access token from Figma Account Settings.
      accessToken: `YOUR_FIGMA_ACCESS_TOKEN`,
    },
  },
],
```

For all requests, you must have an `accessToken`. You can create an access token inside your [Figma settings](https://www.figma.com/developers/docs#auth-dev-token).

To access a file, also pass a `fileId`.

To get screenshots, also pass in a `fileId`, `nodeIds`. Additionally, you can pass in `scale` (number) and/or `format` (png, jpg, svg, pdf), but they're not required. 

To get a project, pass in a `projectId`.

## Querying

### Files

Make sure that `fileId` and `accessToken` are set inside `gatsby-config.js`.

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

### Images (Artboards, also known as nodes)

Make sure that `fileId`, `nodeIds`, and `accessToken` are set inside `gatsby-config.js`. You can also set `scale` and `format`.


`The node Id and file key can be parsed from any Figma node url: 
(https://www.figma.com/file/:key/:title?node-id=:id).`


```graphql
query ImageQuery {
  allFigmaImage {
    nodes {
      id
      image
    }
  }
}
```

### Projects

Make sure that `projectId` and `accessToken` are set inside `gatsby-config.js`.

```graphql
query ProjectQuery {
  allFigmaDocument {
    edges {
      node {
        name
        pages {
          name
        }
      }
    }
  }
}
```

Use the built-in GraphiQL tool (http://localhost:8000/___graphql) to get an idea of what you can query.

## Todo

* [x] Query `files`.
* [ ] Query multiple `files`.
* [x] Query one or multiple file `images`.
* [x] Query `projects`.
* [ ] Query file `comments`.

## Author

* Fabian Schultz ([@fschultz\_](https://twitter.com/fschultz_))

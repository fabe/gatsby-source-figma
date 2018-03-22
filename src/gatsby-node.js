const axios = require(`axios`);
const crypto = require(`crypto`);

const fetch = (fileId, accessToken) =>
  axios({
    method: `GET`,
    url: `https://api.figma.com/v1/files/${fileId}`,
    headers: { 'X-Figma-Token': accessToken },
  }).then(({ data }) => data);

exports.sourceNodes = async (
  { boundActionCreators, reporter },
  { fileId, accessToken }
) => {
  if (!fileId || !accessToken) {
    reporter.panic(`
"fileId" and "accessToken" are required options for gatsby-source-figma.

See docs here – https://github.com/fabe/gatsby-source-figma
    `);
  }

  const { createNode } = boundActionCreators;

  const file = await fetch(fileId, accessToken);
  const doc = file.document;

  const digest = crypto
    .createHash(`md5`)
    .update(JSON.stringify(file))
    .digest(`hex`);

  const links = {
    document___NODE: doc.id,
  };

  const node = Object.assign(
    doc,
    {
      id: doc.id,
      name: file.name,
      thumbnailUrl: file.thumbnailUrl,
      lastModified: file.lastModified,
      parent: `__SOURCE__`,
      children: [],
      pages: doc.children,
      internal: {
        type: `Figma${doc.type}`,
        contentDigest: digest,
      },
    },
    links
  );

  createNode(node);
  return;
};

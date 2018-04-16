const crypto = require(`crypto`);
const Figma = require(`./api`);

exports.sourceNodes = async (
  { boundActionCreators, reporter },
  { fileId, projectId, accessToken }
) => {
  if (!(fileId || projectId) || !accessToken) {
    reporter.panic(`
"fileId" (or "projectId") and "accessToken" are required options for gatsby-source-figma.

See docs here – https://github.com/fabe/gatsby-source-figma
    `);
  }

  const { createNode } = boundActionCreators;
  let files = [];
  let project = {};

  if (fileId) {
    const file = await Figma.fetchFile(fileId, accessToken);
    files = [file];
  } else if (projectId) {
    project = await Figma.fetchProject(projectId, accessToken);

    const projectFiles = project.files.map(file =>
      Figma.fetchFile(file.key, accessToken)
    );

    files = await Promise.all(projectFiles);
  }

  const createDocument = file => {
    const digest = crypto
      .createHash(`md5`)
      .update(JSON.stringify(file))
      .digest(`hex`);

    return Object.assign(file.document, {
      id: file.id,
      name: file.name,
      thumbnailUrl: file.thumbnailUrl,
      lastModified: file.lastModified,
      parent: `__SOURCE__`,
      children: [],
      pages: file.document.children,
      internal: {
        type: `Figma${file.document.type}`,
        contentDigest: digest,
      },
      document___NODE: file.id,
    });
  };

  files.forEach(file => createNode(createDocument(file)));
  return;
};

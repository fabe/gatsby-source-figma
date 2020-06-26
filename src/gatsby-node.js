const Figma = require(`./api`);
const { createContentDigest } = require('gatsby-core-utils');

exports.sourceNodes = async (
  { actions, reporter },
  { fileId, nodeIds, projectId, scale, format, accessToken }
) => {
  if (!(fileId || projectId) || !accessToken) {
    reporter.panic(`
"fileId" (or "projectId") and "accessToken" are required options for gatsby-source-figma.

See docs here – https://github.com/fabe/gatsby-source-figma
    `);
  } else if (fileId && projectId) {
    reporter.panic(`
Please only set either "fileId" or "projectId" inside the gatsby-source-figma options.

See docs here – https://github.com/fabe/gatsby-source-figma
    `);
  }

  const { createNode } = actions;
  let files = [];
  let images = [];
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

  if (fileId && nodeIds) {
    const imagesData = nodeIds.map(nodeId =>
      Figma.fetchNode(fileId, nodeId, scale, format, accessToken)
    );

    images = await Promise.all(imagesData);
  }

  const createDocument = file => {

    return Object.assign(file.document, {
      id: file.id,
      figmaId: file.id,
      name: file.name,
      thumbnailUrl: file.thumbnailUrl,
      lastModified: file.lastModified,
      parent: null,
      children: [],
      pages: file.document.children,
      internal: {
        type: `Figma${file.document.type}`,
        contentDigest: createContentDigest(JSON.stringify(file)),
      },
      document___NODE: file.id,
    });
  };

  const createImage = image => {
    
    // figma returns images with encoded IDs, so we have to decode
    const imageSrc = image.images[Object.keys(image.images)[0]];

    return Object.assign(image, {
      id: image.id,
      figmaId: image.id,
      name: image.name,
      image: imageSrc,
      internal: {
        type: `FigmaImage`,
        contentDigest: createContentDigest(JSON.stringify(image))
      },
      document___NODE: image.id,
    });
  }

  files.forEach(file => createNode(createDocument(file)));
  images.forEach(image => createNode(createImage(image)));

  return;
};

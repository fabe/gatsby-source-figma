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

  const { createNode, createTypes } = actions;

  const typeDefs = `
    type FigmaCOMPONENT implements Node {
      ellipses: [FigmaELLIPSE!]
      frames: [FigmaFRAME!]
      groups: [FigmaGROUP!]
      instances: [FigmaINSTANCE!]
      lines: [FigmaLINE!]
      rectangles: [FigmaRECTANGLE!]
      texts: [FigmaTEXT!]
      vectors: [FigmaVECTOR!]
    }

    type FigmaFRAME implements Node {
      components: [FigmaCOMPONENT!]
      ellipses: [FigmaELLIPSE!]
      frames: [FigmaFRAME!]
      groups: [FigmaGROUP!]
      instances: [FigmaINSTANCE!]
      lines: [FigmaLINE!]
      rectangles: [FigmaRECTANGLE!]
      texts: [FigmaTEXT!]
      vectors: [FigmaVECTOR!]
    }

    type FigmaGROUP implements Node {
      components: [FigmaCOMPONENT!]
      ellipses: [FigmaELLIPSE!]
      frames: [FigmaFRAME!]
      groups: [FigmaGROUP!]
      instances: [FigmaINSTANCE!]
      lines: [FigmaLINE!]
      rectangles: [FigmaRECTANGLE!]
      texts: [FigmaTEXT!]
      vectors: [FigmaVECTOR!]
    }

    type FigmaINSTANCE implements Node {
      ellipses: [FigmaELLIPSE!]
      frames: [FigmaFRAME!]
      groups: [FigmaGROUP!]
      instances: [FigmaINSTANCE!]
      lines: [FigmaLINE!]
      rectangles: [FigmaRECTANGLE!]
      texts: [FigmaTEXT!]
      vectors: [FigmaVECTOR!]
    }

    type FigmaPAGE implements Node {
      components: [FigmaCOMPONENT!]
      ellipses: [FigmaELLIPSE!]
      frames: [FigmaFRAME!]
      groups: [FigmaGROUP!]
      instances: [FigmaINSTANCE!]
      lines: [FigmaLINE!]
      rectangles: [FigmaRECTANGLE!]
      texts: [FigmaTEXT!]
      vectors: [FigmaVECTOR!]
    }

    type FigmaDOCUMENT implements Node {
      pages: [FigmaPAGE!]
    }
  `;

  createTypes(typeDefs)

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

  const createDocumentNodes = async (node, parentNode) => {
    const { children } = node;

    // Figma uses Canvas and Page interchangeably
    // We already use the "Page" convention, so let's stick with it
    const formattedType = (node.type === 'CANVAS') ? 'PAGE' : node.type;

    const initializeFigmaProperties = () => {
      // Here, we want to include the parent File properties on our Documents
      // and make sure to include empty array to initialize with page nodes
      if (node.type === 'DOCUMENT') {
        return {
          lastModified: parentNode.lastModified,
          pages: [],
          thumbnailUrl: parentNode.thumbnailUrl,
          version: parentNode.version,
        };
      }

      // Initialize empty arrays for nested Figma nodes inside of component/instance nodes
      // NOTE: Figma does not allow components/instances to contain nested components
      if (node.type === 'COMPONENT' || node.type === 'INSTANCE') {
        return {
          ellipses: [],
          frames: [],
          groups: [],
          instances: [],
          rectangles: [],
          texts: [],
          vectors: [],
        };
      }

      // Initialize empty arrays for nested Figma nodes inside frame, group, & page nodes
      if (node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'PAGE') {
        return {
          components: [],
          ellipses: [],
          frames: [],
          groups: [],
          instances: [],
          rectangles: [],
          texts: [],
          vectors: [],
        };
      }

      return {};
    };

    const nodeObject = Object.assign(node, {
      id: node.id,
      figmaId: node.id,
      name: node.name,
      parent: parentNode.id,
      children: [],
      internal: {
        type: `Figma${formattedType}`,
        contentDigest: createContentDigest(JSON.stringify(node)),
      },
      // document___NODE: file.id,
    }, initializeFigmaProperties());

    if (children !== undefined) {
      await children.forEach((childNode) => {
        // Figma uses Canvas and Page interchangeably
        // We already use the "Page" convention, so let's stick with it
        const formattedPropName = (childNode.type === 'CANVAS')
          ? 'pages' : `${childNode.type.toLowerCase()}s`;

        if (nodeObject[formattedPropName] === undefined) {
          nodeObject[formattedPropName] = [];
        }

        nodeObject[formattedPropName].push(childNode);
        createDocumentNodes(childNode, nodeObject);
      });
    }

    createNode(nodeObject);
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

  files.forEach(file => createDocumentNodes(file.document, file));
  images.forEach(image => createNode(createImage(image)));

  return;
};

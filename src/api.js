const axios = require(`axios`);

const fetchFile = (fileId, accessToken) =>
  axios({
    method: `GET`,
    url: `https://api.figma.com/v1/files/${fileId}`,
    headers: { 'X-Figma-Token': accessToken },
  }).then(({ data }) => {
    // Figma somehow doesn't return a unique ID, so we set it here.
    data.id = fileId;

    return data;
  });

const fetchProject = (projectId, accessToken) =>
  axios({
    method: `GET`,
    url: `https://api.figma.com/v1/projects/${projectId}/files`,
    headers: { 'X-Figma-Token': accessToken },
  }).then(({ data }) => data);

module.exports = {
  fetchFile,
  fetchProject,
};

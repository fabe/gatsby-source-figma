import React from 'react';

export default ({ data }) => {
  return (
    <div>
      {data.allFigmaDocument.edges.map(({ node }, i) => (
        <p key={i}>{node.name}</p>
      ))}
    </div>
  );
};

export const query = graphql`
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
`;

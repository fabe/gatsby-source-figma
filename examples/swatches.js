import React from 'react';

const getRgb = ({ r, g, b }) => {
  const scale = v => v * 255;
  return `rgb(${scale(r)}, ${scale(g)}, ${scale(b)})`;
};

const Swatch = ({ color }) => (
  <div
    style={{
      width: 80,
      height: 80,
      borderRadius: 8,
      marginBottom: 8,
      backgroundColor: getRgb(color),
    }}
  />
);

export default ({ data }) => {
  return (
    <div>
      {data.figmaDocument.pages[0].children.map(({ fills }, i) => (
        <Swatch key={i} color={fills[0].color} />
      ))}
    </div>
  );
};

export const query = graphql`
  query StyleguideQuery {
    figmaDocument {
      pages {
        children {
          fills {
            color {
              r
              g
              b
              a
            }
          }
        }
      }
    }
  }
`;

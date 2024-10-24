import { Meta } from '@storybook/react';
import React from 'react';

let icons = [];

const req = require.context('!@svgr/webpack!./', false, /^.\/.*svg$/);

req.keys().forEach(key => {
  const name = key.replace('./', '');
  const Svg = req(key).default;
  icons.push({
    class: Svg,
    name,
  });
});

icons = icons.sort((a, b) =>
  a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
);

export default {
  title: 'SVGs',
  argTypes: {
    color: { control: { type: 'color' } },
  },
} as Meta;

export const All = ({ color }: { color: string }) => (
  <div style={{ width: '100%', padding: '10rem', textAlign: 'center' }}>
    {icons.map((icon, i) => (
      <div
        key={i}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '150rem',
          padding: '20rem',
        }}
      >
        <div style={{ border: '1px dashed rgba(0, 0, 0, 0.5)' }}>
          <icon.class
            style={{
              display: 'block',
              width: '100rem',
              height: '100rem',
              color,
            }}
          />
        </div>
        <div
          style={{
            fontSize: '12rem',
            marginTop: '10rem',
            wordBreak: 'break-all',
          }}
        >
          {icon.name}
        </div>
      </div>
    ))}
  </div>
);

All.args = {
  color: '#000000',
};

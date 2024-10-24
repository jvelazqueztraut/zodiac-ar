import { Meta } from '@storybook/react';
import React from 'react';
import styled from 'styled-components';

import { setTypography } from './mixins';
import { fonts, Theme } from './theme';

const categories = Object.keys(fonts.scale);
const LOCALES = process.env.LOCALES as unknown as string[];

interface TypographyProps {
  category: keyof Theme['fonts']['scale'];
  locale: string;
}

const Typography = styled.div<TypographyProps>`
  ${({ category, locale }) => setTypography(category, locale)}
`;

export const Normal = (args: TypographyProps) => {
  const samples = categories.map(
    (category: keyof Theme['fonts']['scale'], index: number) => (
      <div
        key={category}
        {...(index !== categories.length - 1
          ? { style: { marginBottom: '20rem' } }
          : {})}
      >
        <div>{category}</div>
        <Typography category={category} locale={args.locale}>
          {args[category]}
        </Typography>
      </div>
    )
  );

  return <div style={{ width: '100%', padding: '10rem' }}>{samples}</div>;
};

export default {
  title: 'Typography',
  component: Normal,
  argTypes: {
    locale: {
      options: LOCALES,
      control: { type: 'select' },
    },
  },
} as Meta<typeof Normal>;

Normal.args = {
  locale: LOCALES[0],
  ...Object.fromEntries(categories.map(category => [category, category])),
} as TypographyProps;

import React from 'react';
import { ThemeProvider } from 'styled-components';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import { Preview } from '@storybook/react';

import customFonts from './../src/utils/styles/fonts';
import GlobalStyles from './../src/utils/styles/globalStyles';
import theme from './../src/utils/styles/theme';

import { RouterDecorator } from './nextRouterMock';

window.addEventListener('resize', () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
});

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        { name: 'dark', value: '#262626' },
        { name: 'medium', value: '#7f7f7f' },
        { name: 'light', value: '#ffffff' },
        { name: 'twitter', value: '#00aced' },
        { name: 'facebook', value: '#3b5998' },
        { name: 'pinterest', value: '#bd081c' },
        { name: 'xbox', value: '#52b043' },
        { name: 'starbucks', value: '#00704a' },
        { name: 'tmoble', value: '#e20074' },
      ],
    },
    knobs: {
      escapeHTML: false,
    },
    viewport: {
      viewports: INITIAL_VIEWPORTS,
    },
  },
  decorators: [
    (Story, context) => RouterDecorator(Story, context),
    (Story) => {
      return (
        <ThemeProvider theme={theme}>
          <GlobalStyles />
          <style dangerouslySetInnerHTML={{ __html: customFonts }} />

          {Story()}
        </ThemeProvider>
      );
    },
  ]
};

export default preview;

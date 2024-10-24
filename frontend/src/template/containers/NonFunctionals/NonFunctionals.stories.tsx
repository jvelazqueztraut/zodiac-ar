import { action } from '@storybook/addon-actions';
import { Meta } from '@storybook/react';
import { Router } from 'next/router';
import React from 'react';

import { useCopyStore } from 'store';
import { ROUTES } from 'utils/routes';

import JavaScriptDisabled from './JavaScriptDisabled/JavaScriptDisabled';
import MobileOnly from './MobileOnly/MobileOnly';
import NonFunctionals from './NonFunctionals';
import NotFound from './NotFound/NotFound';
import RotateDevice from './RotateDevice/RotateDevice';
import SocialBrowserUnsupported from './SocialBrowserUnsupported/SocialBrowserUnsupported';
import UnsupportedBrowser from './UnsupportedBrowser/UnsupportedBrowser';
import WebGLDisabled from './WebGLDisabled/WebGLDisabled';
import WindowTooSmall from './WindowTooSmall/WindowTooSmall';

const pages = [
  'WindowTooSmall',
  'WebGLDisabled',
  'SocialBrowserUnsupported',
  'UnsupportedBrowser',
  'RotateDevice',
  'JavaScriptDisabled',
  'NotFound',
  'MobileOnly',
] as const;

export const Normal = ({
  currentPage,
}: {
  currentPage: typeof pages[number];
}) => {
  const { head, global } = useCopyStore(state => state.copy);

  return (
    <NonFunctionals
      initialCopy={{ global, head }}
      router={{ route: ROUTES.HOME, asPath: ROUTES.HOME } as Router}
    >
      {currentPage === 'WebGLDisabled' && <WebGLDisabled />}
      {currentPage === 'UnsupportedBrowser' && (
        <UnsupportedBrowser setAccept={action('setAccept')} />
      )}
      {currentPage === 'SocialBrowserUnsupported' && (
        <SocialBrowserUnsupported setAccept={action('setAccept')} />
      )}
      {currentPage === 'RotateDevice' && <RotateDevice />}
      {currentPage === 'JavaScriptDisabled' && (
        <JavaScriptDisabled sharedCopy={{ global }} />
      )}
      {currentPage === 'NotFound' && <NotFound />}
      {currentPage === 'WindowTooSmall' && <WindowTooSmall />}
      {currentPage === 'MobileOnly' && <MobileOnly />}
    </NonFunctionals>
  );
};

export default {
  title: 'containers/NonFunctionals',
  component: Normal,
  argTypes: {
    currentPage: {
      options: pages,
      control: { type: 'radio' },
    },
  },
} as Meta<typeof Normal>;

Normal.args = {
  currentPage: pages[0],
} as { currentPage: typeof pages[number] };

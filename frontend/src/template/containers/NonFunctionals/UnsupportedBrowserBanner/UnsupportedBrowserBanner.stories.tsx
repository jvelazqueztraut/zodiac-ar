import { action } from '@storybook/addon-actions';
import { Meta } from '@storybook/react';
import React from 'react';

import UnsupportedBanner, {
  UnsupportedBannerProps,
} from './UnsupportedBrowserBanner';

export default {
  title: 'containers/NonFunctionals/UnsupportedBanner',
  component: UnsupportedBanner,
} as Meta<typeof UnsupportedBanner>;

export const Normal = (args: UnsupportedBannerProps) => (
  <UnsupportedBanner {...args} />
);

Normal.args = {
  onContentClick: action('onContentClick'),
  isVisible: true,
} as UnsupportedBannerProps;

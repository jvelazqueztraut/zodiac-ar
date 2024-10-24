import { Meta } from '@storybook/react';
import React from 'react';

import Button, { ButtonProps } from './Button';

export default {
  title: 'components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof Button>;

export const Default = (args: ButtonProps) => <Button {...args} />;

Default.args = {
  isLoading: true,
} as ButtonProps;

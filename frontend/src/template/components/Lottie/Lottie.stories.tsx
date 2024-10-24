import { Player } from '@lottiefiles/react-lottie-player';
import { action } from '@storybook/addon-actions';
import { Meta } from '@storybook/react';
import React, { useRef } from 'react';

import { LOTTIE_FILES } from 'utils/config.assets';

import Lottie, { LottieProps } from './Lottie';

export default {
  title: 'components/Lottie',
  component: Lottie,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    animation: {
      options: Object.keys(LOTTIE_FILES),
      mapping: LOTTIE_FILES,
      control: {
        type: 'select',
      },
    },
    pauseAtFrame: {
      control: {
        type: 'number',
      },
    },
  },
} as Meta<typeof Lottie>;

export const Normal = (args: LottieProps) => {
  const lottieRef = useRef<Player>(null);
  return <Lottie ref={lottieRef} {...args} />;
};

Normal.args = {
  animation: Object.values(LOTTIE_FILES)[0],
  autoPlay: true,
  loop: false,
  useCanvas: false,
  pauseAtFrame: undefined,
  forceContinue: false,
  keepLastFrame: true,
  onLoad: action('onLoad'),
  onReady: action('onReady'),
  onComplete: action('onComplete'),
  onLoadError: action('onLoadError'),
  onFrame: action('onFrame'),
} as LottieProps;

import { AnimatePresence } from 'framer-motion';
import React, { useRef } from 'react';

import { SPRITES } from 'utils/config.assets';
import { fadeMotionProps } from 'utils/styles/animations';

import * as Styled from './LoadingScreen.styles';

export interface LoadingScreenProps {
  isVisible: boolean;
  setIsReady: (isReady: boolean) => void;
}

const defaultProps: Partial<LoadingScreenProps> = {};

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isVisible,
  setIsReady,
}) => {
  const LOADING_DURATION = 2000;
  const timeoutRef = useRef(null);
  timeoutRef.current = setTimeout(() => {
    console.log('Fake loading for 2 seconds.');
    setIsReady(true);
    clearTimeout(timeoutRef.current);
  }, LOADING_DURATION);

  return (
    <AnimatePresence>
      {isVisible && (
        <Styled.Wrapper {...fadeMotionProps}>
          <img src={SPRITES.ZodiacLogo} alt="ZodiacAR logo" />
        </Styled.Wrapper>
      )}
    </AnimatePresence>
  );
};

LoadingScreen.defaultProps = defaultProps;

export default LoadingScreen;

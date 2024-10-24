import { AnimatePresence } from 'framer-motion';
import React from 'react';

import { SPRITES } from 'utils/config.assets';
import { fadeMotionProps } from 'utils/styles/animations';

import * as Styled from './LoadingScreen.styles';

export interface LoadingScreenProps {
    isVisible?: boolean;
}

const defaultProps: Partial<LoadingScreenProps> = {};

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isVisible }) => {
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

import { AnimatePresence } from 'framer-motion';
import React, { useEffect } from 'react';

import { useCopyStore } from 'store';

import * as NonFunctionalsStyles from '../NonFunctionals.styles';
import * as Styled from './WindowTooSmall.styles';

export interface WindowTooSmallProps {
  isVisible?: boolean;
}

const defaultProps: Partial<WindowTooSmallProps> = {
  isVisible: false,
};

const WindowTooSmall = ({ isVisible }: WindowTooSmallProps) => {
  const copies = useCopyStore(state => state.copy);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!copies.global) return null;
  const {
    global: {
      errors: { windowTooSmall: copy },
    },
  } = copies;

  return (
    <AnimatePresence>
      {isVisible && (
        <Styled.Wrapper>
          <NonFunctionalsStyles.Title>{copy.title}</NonFunctionalsStyles.Title>
          <br />
          <NonFunctionalsStyles.Description
            dangerouslySetInnerHTML={{ __html: copy.body }}
          />
        </Styled.Wrapper>
      )}
    </AnimatePresence>
  );
};

WindowTooSmall.defaultProps = defaultProps;

export default WindowTooSmall;

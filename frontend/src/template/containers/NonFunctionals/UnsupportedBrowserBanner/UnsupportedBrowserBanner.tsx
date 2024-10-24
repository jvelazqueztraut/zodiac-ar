import { AnimatePresence } from 'framer-motion';
import React, { useCallback, useState } from 'react';

import { useCopyStore } from 'store';
import { ReactComponent as SvgArrow } from 'svgs/arrow.svg';
import { ReactComponent as SvgWarning } from 'svgs/warning.svg';
import { getBannerMotionProps } from 'utils/styles/animations';

import * as Styled from './UnsupportedBrowserBanner.styles';

export interface UnsupportedBannerProps {
  onContentClick: () => void;
  isVisible?: boolean;
}

const defaultProps: Partial<UnsupportedBannerProps> = {
  isVisible: false,
};

const UnsupportedBanner = ({
  onContentClick,
  isVisible,
}: UnsupportedBannerProps) => {
  const [isOpen, setOpen] = useState(true);

  const onClose = useCallback(
    (isContent = false) => {
      if (isContent) onContentClick();
      setOpen(false);
    },
    [onContentClick]
  );

  const { global } = useCopyStore(state => state.copy);
  if (!global) return null;
  const {
    errors: {
      unsupportedBrowser: {
        body: { banner: copy },
      },
    },
  } = global;

  return (
    <AnimatePresence>
      {isVisible && isOpen && (
        <Styled.Wrapper {...getBannerMotionProps('top')}>
          <Styled.Left>
            <SvgWarning />
            <Styled.Description onClick={() => onClose(true)}>
              {copy}
            </Styled.Description>
          </Styled.Left>
          <Styled.Arrow onClick={() => onClose()}>
            <SvgArrow />
          </Styled.Arrow>
        </Styled.Wrapper>
      )}
    </AnimatePresence>
  );
};

UnsupportedBanner.defaultProps = defaultProps;

export default UnsupportedBanner;

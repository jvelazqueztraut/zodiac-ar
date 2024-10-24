import { AnimatePresence } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';

import { useCopyStore } from 'store';

import * as NonFunctionalsStyles from '../NonFunctionals.styles';
import * as Styled from './RotateDevice.styles';

import { isTablet } from 'template/utils/platform';

export interface RotateDeviceProps {
  isVisible?: boolean;
}

const defaultProps: Partial<RotateDeviceProps> = {
  isVisible: false,
};

const RotateDevice = ({ isVisible }: RotateDeviceProps) => {
  const [isMounted, setMounted] = useState<boolean>(false);
  const isTabletView = useMemo(() => isMounted && isTablet(), [isMounted]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    setMounted(true);

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const copies = useCopyStore(state => state.copy);

  if (!copies.global) return null;
  const {
    global: {
      errors: { rotateDevice: copy },
    },
  } = copies;

  const bodyCopy = isTabletView ? copy.body.tablet : copy.body.mobile;

  return (
    <AnimatePresence>
      {isVisible && (
        <Styled.Wrapper>
          <NonFunctionalsStyles.Title>{copy.title}</NonFunctionalsStyles.Title>
          <br />
          <NonFunctionalsStyles.Description
            dangerouslySetInnerHTML={{ __html: bodyCopy }}
          />
        </Styled.Wrapper>
      )}
    </AnimatePresence>
  );
};

RotateDevice.defaultProps = defaultProps;

export default RotateDevice;

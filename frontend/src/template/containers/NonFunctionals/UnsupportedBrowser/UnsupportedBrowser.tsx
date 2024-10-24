import React, { useEffect, useMemo, useState } from 'react';

import { useCopyStore } from 'store';

import * as NonFunctionalsStyles from '../NonFunctionals.styles';
import * as Styled from './UnsupportedBrowser.styles';

import { isDesktop } from 'template/utils/platform';

interface UnsupportedBrowserProps {
  setAccept(state: boolean): void;
}

const UnsupportedBrowserProps = ({ setAccept }: UnsupportedBrowserProps) => {
  const [isMounted, setMounted] = useState<boolean>(false);
  const isDesktopView = useMemo(() => isMounted && isDesktop(), [isMounted]);

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
      errors: { unsupportedBrowser: copy },
    },
  } = copies;

  let bodyCopy: string;
  if (isDesktopView) {
    bodyCopy = copy.body.desktop;
  } else {
    bodyCopy = copy.body.mobile;
  }

  return (
    <Styled.Wrapper>
      <NonFunctionalsStyles.Title>{copy.title}</NonFunctionalsStyles.Title>
      <br />
      <NonFunctionalsStyles.Description
        dangerouslySetInnerHTML={{ __html: bodyCopy }}
      />
      <br />
      <NonFunctionalsStyles.Button onClick={() => setAccept(true)}>
        {copy.cta}
      </NonFunctionalsStyles.Button>
    </Styled.Wrapper>
  );
};

export default UnsupportedBrowserProps;

import React, { useEffect } from 'react';

import { useCopyStore } from 'store';

import * as NonFunctionalsStyles from '../NonFunctionals.styles';
import * as Styled from './SocialBrowserUnsupported.styles';

export interface SocialBrowserUnsupportedProps {
  setAccept(state: boolean): void;
}

const defaultProps: Partial<SocialBrowserUnsupportedProps> = {};

const SocialBrowserUnsupported = ({
  setAccept,
}: SocialBrowserUnsupportedProps) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';

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

  return (
    <Styled.Wrapper>
      <NonFunctionalsStyles.Title>{copy.title}</NonFunctionalsStyles.Title>
      <br />
      <NonFunctionalsStyles.Description
        dangerouslySetInnerHTML={{ __html: copy.body.social }}
      />
      <br />
      <NonFunctionalsStyles.Button onClick={() => setAccept(true)}>
        {copy.cta}
      </NonFunctionalsStyles.Button>
    </Styled.Wrapper>
  );
};

SocialBrowserUnsupported.defaultProps = defaultProps;

export default SocialBrowserUnsupported;

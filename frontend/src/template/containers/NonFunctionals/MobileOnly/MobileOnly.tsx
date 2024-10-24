import React from 'react';

import { useCopyStore } from 'store';

import * as NonFunctionalsStyles from '../NonFunctionals.styles';
import * as Styled from './MobileOnly.styles';

const MobileOnly = () => {
  const copies = useCopyStore(state => state.copy);

  if (!copies.global) return null;
  const {
    global: {
      errors: { mobileOnly: copy },
    },
  } = copies;

  return (
    <Styled.Wrapper>
      <NonFunctionalsStyles.Title>{copy.title}</NonFunctionalsStyles.Title>
      <br />
      <NonFunctionalsStyles.Description
        dangerouslySetInnerHTML={{ __html: copy.body }}
      />
    </Styled.Wrapper>
  );
};

export default MobileOnly;

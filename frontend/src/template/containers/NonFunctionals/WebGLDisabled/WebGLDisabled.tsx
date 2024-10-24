import React from 'react';

import { useCopyStore } from 'store';

import * as NonFunctionalsStyles from '../NonFunctionals.styles';
import * as Styled from './WebGLDisabled.styles';

const WebGLDisabledProps = () => {
  const copies = useCopyStore(state => state.copy);

  if (!copies.global) return null;
  const {
    global: {
      errors: { webGLDisabled: copy },
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

export default WebGLDisabledProps;

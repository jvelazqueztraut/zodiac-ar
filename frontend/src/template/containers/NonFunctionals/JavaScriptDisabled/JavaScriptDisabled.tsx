import React from 'react';

import { SharedCopy } from 'store/copy.types';

import * as NonFunctionalsStyles from '../NonFunctionals.styles';
import * as Styled from './JavaScriptDisabled.styles';

interface JavascriptDisabled {
  sharedCopy: SharedCopy;
}

const JavascriptDisabled = ({ sharedCopy }: JavascriptDisabled) => {
  if (!sharedCopy?.global) return null;

  const {
    global: {
      errors: { javascriptDisabled: copy },
    },
  } = sharedCopy;

  return (
    <Styled.Wrapper>
      <NonFunctionalsStyles.Title>{copy.title}</NonFunctionalsStyles.Title>
      <br />
      <NonFunctionalsStyles.Description
        dangerouslySetInnerHTML={{ __html: copy.body1 }}
      />
      <br />
      <NonFunctionalsStyles.Description
        dangerouslySetInnerHTML={{ __html: copy.body2 }}
      />
    </Styled.Wrapper>
  );
};

export default JavascriptDisabled;

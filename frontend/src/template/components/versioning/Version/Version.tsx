import React, { useState } from 'react';

import * as Styled from './Version.styles';

const Version = () => {
  const [isOpen, setIsOpen] = useState(!!process.env.IS_DEBUG);
  const onToggle = () => setIsOpen(state => !state);

  return (
    <Styled.Wrapper>
      {isOpen ? (
        <Styled.Info>
          {`v. ${process.env.VERSION} - (${process.env.ENV}),
            built on ${new Date(process.env.BUILD_DATE).toUTCString()}
          `}
        </Styled.Info>
      ) : null}
      <Styled.Button onClick={onToggle}>[ {isOpen ? '-' : '+'} ]</Styled.Button>
    </Styled.Wrapper>
  );
};

Version.displayName = 'Version';

export default React.memo(Version);

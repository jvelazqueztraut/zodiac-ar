import { useRouter } from 'next/router';
import * as React from 'react';

import * as Styled from './LanguageSelector.styles';

const LanguageSelector = () => {
  const router = useRouter();
  const { locale, locales, pathname, query, asPath } = router;

  return (
    <Styled.LanguageWrapper>
      {locales.map(loc => (
        <Styled.Option
          key={loc}
          onClick={() => {
            if (loc !== locale) {
              router.push({ pathname, query }, asPath, { locale: loc });
            }
          }}
          isSelected={loc === locale}
        >
          {loc}
        </Styled.Option>
      ))}
    </Styled.LanguageWrapper>
  );
};

LanguageSelector.displayName = 'LanguageSelector';

export default React.memo(LanguageSelector);

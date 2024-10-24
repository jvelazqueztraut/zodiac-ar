import { useRouter } from 'next/router';
import React, { useCallback } from 'react';

import { useCopyStore } from 'store';
import { ROUTES } from 'utils/routes';

import * as NonFunctionalsStyles from '../NonFunctionals.styles';
import * as Styled from './NotFound.styles';

const NotFound = () => {
  const router = useRouter();
  const copies = useCopyStore(state => state.copy);

  const onClick = useCallback(() => {
    router.push(ROUTES.HOME, ROUTES.HOME, {
      locale: process.env.LOCALES.includes(router.locale)
        ? router.locale
        : process.env.DEFAULT_LOCALE,
    });
  }, [router]);

  if (!copies.global) return null;
  const {
    global: {
      errors: { notFound: copy },
    },
  } = copies;

  return (
    <Styled.Wrapper>
      <NonFunctionalsStyles.Title>{copy.title}</NonFunctionalsStyles.Title>
      <br />
      <NonFunctionalsStyles.Description
        dangerouslySetInnerHTML={{ __html: copy.body }}
      />
      <br />
      <NonFunctionalsStyles.Button onClick={onClick}>
        {copy.cta}
      </NonFunctionalsStyles.Button>
    </Styled.Wrapper>
  );
};

export default NotFound;

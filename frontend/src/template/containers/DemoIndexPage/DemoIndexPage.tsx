import * as Sentry from '@sentry/react';
import { motion } from 'framer-motion';
import { GetStaticProps } from 'next';
import Image from 'next/image';
import { Router } from 'next/router';
import React from 'react';

import { useCopyStore } from 'store';
import { getCopy } from 'store/copy.data';
import { CopyStoreType } from 'store/copy.types';
// import { cmsApiClient } from 'utils/cms/api';
// import { demoIndexPageQuery } from 'utils/cms/gql';
import { ISR_TIMEOUT } from 'utils/config';
import { Pages, ROUTES } from 'utils/routes';
import { pageMotionProps } from 'utils/styles/animations';

import * as Styled from './DemoIndexPage.styles';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    // const response = await cmsApiClient.query({
    //   query: demoIndexPageQuery({ locale }),
    // });

    // const { sharedCopy, demoIndexPage: page } = response.data;
    // if (!page || !sharedCopy) return { notFound: true };

    // const { head, copy } = page;
    const selectedLocale = process.env.LOCALES.includes(locale)
      ? locale
      : process.env.DEFAULT_LOCALE;

    const { head, global, index } = getCopy(Pages.index, selectedLocale);

    return {
      props: {
        initialCopy: {
          head,
          global,
          index,
        },
      },
      revalidate: ISR_TIMEOUT,
    };
  } catch (error) {
    Sentry.captureException(error);
    console.log('DemoIndexPage -- getStaticProps -- error:', error);

    if (process.env.ENV !== 'local') throw new Error(error);
    return { notFound: true };
  }
};

interface DemoIndexPageProps {
  initialCopy: {
    head: CopyStoreType['copy']['head'];
    global: CopyStoreType['copy']['global'];
    index: CopyStoreType['copy']['index'];
  };
  router: Router;
}

const DemoIndexPage: React.FunctionComponent<DemoIndexPageProps> = ({
  router,
}) => {
  const { copy } = useCopyStore();

  const onClick = () => {
    router.push(ROUTES.ABOUT);
  };

  if (!copy.index) return null;

  return (
    <motion.div {...pageMotionProps}>
      <Styled.Wrapper>
        <Styled.Main>
          <Image
            src="/images/logo.png"
            alt="JVT logo"
            width={200}
            height={200}
            priority
          />
          <Styled.Title
            dangerouslySetInnerHTML={{ __html: copy.index.title }}
          />
          <Styled.Description
            dangerouslySetInnerHTML={{ __html: copy.index.description }}
          />

          <Styled.Grid onClick={onClick}>
            <Styled.Card>
              <h3>{copy.index.aboutLinkLabel}</h3>
              <p>{copy.index.aboutLinkDescription}</p>
            </Styled.Card>
          </Styled.Grid>
        </Styled.Main>
      </Styled.Wrapper>
    </motion.div>
  );
};

export default DemoIndexPage;

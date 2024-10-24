import * as Sentry from '@sentry/react';
import { motion } from 'framer-motion';
import { GetStaticProps } from 'next';
import { Router } from 'next/router';
import React from 'react';

import { useCopyStore } from 'store';
import { getCopy } from 'store/copy.data';
import { CopyStoreType } from 'store/copy.types';
// import { cmsApiClient } from 'utils/cms/api';
// import { demoAboutPageQuery } from 'utils/cms/gql';
import { ISR_TIMEOUT } from 'utils/config';
import { Pages, ROUTES } from 'utils/routes';
import { pageMotionProps } from 'utils/styles/animations';

import * as Styled from './DemoAboutPage.styles';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    // const response = await cmsApiClient.query({
    //   query: demoAboutPageQuery({ locale }),
    // });

    // const { sharedCopy, demoAboutPage: page } = response.data;
    // if (!page || !sharedCopy) return { notFound: true };

    // const { head, copy } = page;
    const selectedLocale = process.env.LOCALES.includes(locale)
      ? locale
      : process.env.DEFAULT_LOCALE;

    const { head, global, about } = getCopy(Pages.about, selectedLocale);

    return {
      props: {
        initialCopy: {
          head,
          global,
          about,
        },
      },
      revalidate: ISR_TIMEOUT,
    };
  } catch (error) {
    Sentry.captureException(error);
    console.log('DemoAboutPage -- getStaticProps -- error:', error);

    if (process.env.ENV !== 'local') throw new Error(error);
    return { notFound: true };
  }
};

interface DemoAboutPageProps {
  initialCopy: {
    head: CopyStoreType['copy']['head'];
    global: CopyStoreType['copy']['global'];
    about: CopyStoreType['copy']['about'];
  };
  router: Router;
}

const DemoAboutPage: React.FunctionComponent<DemoAboutPageProps> = ({
  router,
}) => {
  const { copy } = useCopyStore();

  const onClick = () => {
    router.push(ROUTES.HOME);
  };

  if (!copy.about) return null;

  return (
    <motion.div {...pageMotionProps}>
      <Styled.Wrapper>
        <Styled.Main>
          <Styled.Title
            dangerouslySetInnerHTML={{ __html: copy.about.title }}
          />
          <Styled.Description
            dangerouslySetInnerHTML={{ __html: copy.about.description }}
          />

          <Styled.Grid onClick={onClick}>
            <Styled.Card>
              <h3>{copy.about.indexLinkLabel}</h3>
              <p>{copy.about.indexLinkDescription}</p>
            </Styled.Card>
          </Styled.Grid>
        </Styled.Main>
      </Styled.Wrapper>
    </motion.div>
  );
};

export default DemoAboutPage;

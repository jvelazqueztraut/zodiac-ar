import * as Sentry from '@sentry/react';
import { motion } from 'framer-motion';
import { GetStaticProps } from 'next';
import { Router } from 'next/router';
import React from 'react';

import Button from 'components/Button/Button';
import { useCopyStore } from 'store';
import { getCopy } from 'store/copy.data';
import { CopyStoreType } from 'store/copy.types';
// import { cmsApiClient } from 'utils/cms/api';
// import { aboutPageQuery } from 'utils/cms/gql';
import { ISR_TIMEOUT } from 'utils/config';
import { Pages, ROUTES } from 'utils/routes';
import { pageMotionProps } from 'utils/styles/animations';

import * as Styled from './AboutPage.styles';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    // const response = await cmsApiClient.query({
    //   query: aboutPageQuery({ locale }),
    // });

    // const { sharedCopy, aboutPage: page } = response.data;
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
    console.log('AboutPage -- getStaticProps -- error:', error);

    if (process.env.ENV !== 'local') throw new Error(error);
    return { notFound: true };
  }
};

interface AboutPageProps {
  initialCopy: {
    head: CopyStoreType['copy']['head'];
    global: CopyStoreType['copy']['global'];
    about: CopyStoreType['copy']['about'];
  };
  router: Router;
}

const AboutPage: React.FunctionComponent<AboutPageProps> = ({ router }) => {
  const { copy } = useCopyStore();

  const onBack = () => {
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

          <Styled.Grid>
            <Styled.Card>
              <Styled.Description
                dangerouslySetInnerHTML={{ __html: copy.about.sourceCode }}
              />
            </Styled.Card>
            <Button label={copy.about.back} onClick={onBack} />
          </Styled.Grid>
        </Styled.Main>
      </Styled.Wrapper>
    </motion.div>
  );
};

export default AboutPage;

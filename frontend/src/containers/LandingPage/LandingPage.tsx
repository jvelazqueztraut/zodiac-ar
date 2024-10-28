import * as Sentry from '@sentry/react';
import { AnimatePresence, motion } from 'framer-motion';
import { GetStaticProps } from 'next';
import router, { Router } from 'next/router';
import React, { useState } from 'react';

import Button from 'components/Button/Button';
import LoadingScreen from 'components/LoadingScreen/LoadingScreen';
import { useCopyStore } from 'store';
import { getCopy } from 'store/copy.data';
import { CopyStoreType } from 'store/copy.types';
import { ISR_TIMEOUT } from 'utils/config';
import { SPRITES } from 'utils/config.assets';
import { Pages, ROUTES } from 'utils/routes';
import {
  landingPageHeaderMotionProps,
  landingPageStartButtonMotionProps,
  pageMotionProps,
} from 'utils/styles/animations';

import * as Styled from './LandingPage.styles';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const initialCopy = await getCopy(Pages.landing, locale);

    const props: Omit<LandingPageProps, 'router'> = {
      initialCopy,
    };

    return {
      props,
      revalidate: ISR_TIMEOUT,
    };
  } catch (error) {
    Sentry.captureException(error);
    console.log('LandingPage -- getStaticProps -- error:', error);

    if (process.env.ENV !== 'local') throw new Error(error);
    return { notFound: true };
  }
};

interface LandingPageProps {
  initialCopy: {
    head: CopyStoreType['copy']['head'];
    global: CopyStoreType['copy']['global'];
  };
  router: Router;
}

const LandingPage: React.FunctionComponent<LandingPageProps> = () => {
  const { copy } = useCopyStore();
  const [isReady, setIsReady] = useState(false);

  const onCTA = () => {
    router.push(ROUTES.AR, null, { scroll: false });
  };

  return (
    <motion.div {...pageMotionProps}>
      <Styled.Wrapper>
        <LoadingScreen isVisible={!isReady} setIsReady={setIsReady} />

        <AnimatePresence>
          {isReady && (
            <motion.div {...pageMotionProps}>
              <Styled.WrapperInner>
                <Styled.Header {...landingPageHeaderMotionProps}>
                  <h1
                    dangerouslySetInnerHTML={{
                      __html: copy.landing.title,
                    }}
                  />
                  <h2
                    dangerouslySetInnerHTML={{
                      __html: copy.landing.subTitle,
                    }}
                  />
                </Styled.Header>
                <Styled.Hero>
                  <img src={SPRITES.HeroImage} alt="ZodiacAR" />
                </Styled.Hero>
                <motion.div {...landingPageStartButtonMotionProps}>
                  <Button label={copy.landing.cta} onClick={onCTA} />
                </motion.div>
              </Styled.WrapperInner>
            </motion.div>
          )}
        </AnimatePresence>
      </Styled.Wrapper>
    </motion.div>
  );
};

export default LandingPage;

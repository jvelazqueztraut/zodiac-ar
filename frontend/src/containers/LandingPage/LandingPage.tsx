import * as Sentry from '@sentry/react';
import { motion } from 'framer-motion';
import { GetStaticProps } from 'next';
import { Router } from 'next/router';
import React from 'react';

import LoadingScreen from 'components/LoadingScreen/LoadingScreen';
import { getCopy } from 'store/copy.data';
import { CopyStoreType } from 'store/copy.types';
import { ISR_TIMEOUT } from 'utils/config';
import { Pages } from 'utils/routes';
import { pageMotionProps } from 'utils/styles/animations';

import * as Styled from './LandingPage.styles';
import { initial } from 'lodash';
import { useCopyStore } from 'store';

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
    // TODO: replace placeholder
    const isReady = false;
    return (
        <motion.div {...pageMotionProps}>
            <Styled.Wrapper>
                <h1
                    dangerouslySetInnerHTML={{
                        __html: copy.landing.title,
                    }}
                />
                <LoadingScreen isVisible={!isReady} />
            </Styled.Wrapper>
        </motion.div>
    );
};

export default LandingPage;

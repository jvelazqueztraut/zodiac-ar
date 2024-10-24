import * as Sentry from '@sentry/react';
import { motion } from 'framer-motion';
import { GetStaticProps } from 'next';
import { Router } from 'next/router';
import React, { useState } from 'react';

import LoadingScreen from 'components/LoadingScreen/LoadingScreen';
import { getCopy } from 'store/copy.data';
import { CopyStoreType } from 'store/copy.types';
import { ISR_TIMEOUT } from 'utils/config';
import { Pages } from 'utils/routes';
import { pageMotionProps } from 'utils/styles/animations';

import * as Styled from './LandingPage.styles';
import { initial } from 'lodash';
import { useCopyStore, useGlobalStore } from 'store';

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

    return (
        <motion.div {...pageMotionProps}>
            <Styled.Wrapper>
                <LoadingScreen isVisible={!isReady} setIsReady={setIsReady} />
                {isReady && (<h1
                    dangerouslySetInnerHTML={{
                        __html: copy.landing.title,
                    }}
                />)}
            </Styled.Wrapper>
        </motion.div>
    );
};

export default LandingPage;

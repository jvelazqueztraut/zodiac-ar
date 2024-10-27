import * as Sentry from '@sentry/react';
import { motion } from 'framer-motion';
import { GetStaticProps } from 'next';
import { Router } from 'next/router';
import React, { useRef, useState } from 'react';

import Button from 'components/Button/Button';
import DraggableSlider from 'components/DraggableSlider/DraggableSlider';
import FaceTracker, { CanCapture } from 'components/FaceTracker/FaceTracker';
import { getCopy } from 'store/copy.data';
import { CopyStoreType } from 'store/copy.types';
import { ISR_TIMEOUT } from 'utils/config';
import { Pages } from 'utils/routes';
import { pageMotionProps } from 'utils/styles/animations';

import * as Styled from './ARPage.styles';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const initialCopy = await getCopy(Pages.ar, locale);

    const props: Omit<ARPageProps, 'router'> = {
      initialCopy,
    };

    return {
      props,
      revalidate: ISR_TIMEOUT,
    };
  } catch (error) {
    Sentry.captureException(error);
    console.log('ARPage -- getStaticProps -- error:', error);

    if (process.env.ENV !== 'local') throw new Error(error);
    return { notFound: true };
  }
};

interface ARPageProps {
  initialCopy: {
    ar: CopyStoreType['copy']['ar'];
  };
  router: Router;
}

const ARPage: React.FunctionComponent<ARPageProps> = ({ initialCopy }) => {
  const faceTrackerRef = useRef<CanCapture>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedAnchor, setSelectedAnchor] = useState<number | null>(null);

  const handleAnchorSelect = (anchorIndex: number) => {
    setSelectedAnchor(anchorIndex);
    console.log(`Selected anchor: ${anchorIndex}`);
  };

  return (
    <motion.div {...pageMotionProps}>
      <Styled.Wrapper>
        <FaceTracker ref={faceTrackerRef} isVisible={true} />
        <DraggableSlider onAnchorSelect={handleAnchorSelect} />
        <Button
          label={initialCopy.ar.cta}
          onClick={faceTrackerRef.current?.capture}
        />
      </Styled.Wrapper>
    </motion.div>
  );
};

export default ARPage;

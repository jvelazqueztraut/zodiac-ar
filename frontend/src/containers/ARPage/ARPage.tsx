import * as Sentry from '@sentry/react';
import { AnimatePresence, motion } from 'framer-motion';
import { GetStaticProps } from 'next';
import router, { Router } from 'next/router';
import React, { useRef, useState } from 'react';

import Button from 'components/Button/Button';
import DraggableSlider from 'components/DraggableSlider/DraggableSlider';
import FaceTracker, { CanCapture } from 'components/FaceTracker/FaceTracker';
import { getCopy } from 'store/copy.data';
import { CopyStoreType } from 'store/copy.types';
import { ReactComponent as SvgClose } from 'svgs/close.svg';
import { ISR_TIMEOUT } from 'utils/config';
import { Pages, ROUTES } from 'utils/routes';
import {
  arPageCaptureButtonMotionProps,
  arPageDraggableSliderMotionProps,
  arPageFaceTrackerMotionProps,
  pageMotionProps,
} from 'utils/styles/animations';

import * as Styled from './ARPage.styles';

import { FilterTypeNames, FilterTypes } from 'constants/ar-constants';

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
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterTypes | null>(
    null
  );

  const handleFilterSelect = (filterIndex: number) => {
    if (selectedFilter !== filterIndex)
      console.log(`Selected filter: ${FilterTypeNames[filterIndex]}`);
    setSelectedFilter(filterIndex);
  };

  const onClose = () => {
    faceTrackerRef.current?.close();
    router.push(ROUTES.HOME);
  };

  return (
    <motion.div {...pageMotionProps}>
      <Styled.CloseIcon onClick={onClose}>
        <SvgClose />
      </Styled.CloseIcon>
      <AnimatePresence>
        <Styled.Wrapper>
          <motion.div {...arPageFaceTrackerMotionProps}>
            <FaceTracker
              ref={faceTrackerRef}
              isVisible={true}
              setIsReady={setIsReady}
              setIsCapturing={setIsCapturing}
              selectedFilter={selectedFilter}
            />
          </motion.div>
          {isReady && (
            <>
              <motion.div {...arPageDraggableSliderMotionProps}>
                <DraggableSlider onAnchorSelect={handleFilterSelect} />
              </motion.div>
              <motion.div {...arPageCaptureButtonMotionProps}>
                <Button
                  {...arPageCaptureButtonMotionProps}
                  label={initialCopy.ar.cta}
                  isLoading={isCapturing}
                  onClick={faceTrackerRef.current?.capture}
                />
              </motion.div>
            </>
          )}
        </Styled.Wrapper>
      </AnimatePresence>
    </motion.div>
  );
};

export default ARPage;

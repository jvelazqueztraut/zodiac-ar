/* eslint-disable prettier/prettier */
import { keyframes } from 'styled-components';

export const spin = () => keyframes`
  0% { transform: rotate(0); }
  100% { transform: rotate(1turn); }
`;

export const pulse = (transform?: string) => keyframes`
  0% { opacity: 0; transform: ${transform ? `${transform} ` : ''}scale(0.5); }
  40%, 45% { opacity: 1; transform: ${transform ? `${transform} ` : ''}scale(1); }
  60%, 100% { opacity: 0; transform: ${transform ? `${transform} ` : ''}scale(0.95); }
`;

export const fadeMotionProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
};

export const pageMotionProps = {
  initial: { opacity: 0, x: '16rem' },
  animate: { opacity: 1, x: '0rem' },
  exit: { opacity: 0, x: '-16rem' },
  transition: { duration: 0.2 }
};

export const landingPageHeaderMotionProps = {
  initial: { y: '40%', opacity: 0 },
  animate: { y: '0%', opacity: 1 },
  transition: { duration: 0.8, ease: 'easeInOut', delay: 0.5 },
};

export const landingPageStartButtonMotionProps = {
  ...landingPageHeaderMotionProps,
  transition: { ...landingPageHeaderMotionProps.transition, delay: 1 },
};

export const arPageFaceTrackerMotionProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 1, ease: 'easeInOut', delay: 0.5 },
};

export const arPageDraggableSliderMotionProps = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  transition: { duration: 0.8, ease: 'easeInOut', delay: 0.5 },
};

export const arPageCaptureButtonMotionProps = {
  ...landingPageStartButtonMotionProps,
};

export const getBannerMotionProps = (from: 'top' | 'bottom') => ({
  initial: { opacity: 0, y: `${(from === 'top' ? -1 : 1) * 50}%` },
  animate: { opacity: 1, y: '0%' },
  exit: { opacity: 0, y: `${(from === 'top' ? -1 : 1) * 50}%` },
  transition: { duration: 0.6 }
});

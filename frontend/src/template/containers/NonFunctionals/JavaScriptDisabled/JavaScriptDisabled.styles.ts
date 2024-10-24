import styled, { css, keyframes } from 'styled-components';

import { fullscreenWhite } from 'utils/styles/mixins';

const tweenOpacity = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

export const fadeInWithDelay = css`
  opacity: 0;
  animation: ${tweenOpacity} 0.2s 1s ease-out;
  animation-fill-mode: forwards;
`;

/* Don't show it immediately or it'll flash briefly when the page loads  */
export const Wrapper = styled.div`
  ${fullscreenWhite()}
  height: 100%;
  ${fadeInWithDelay}
`;

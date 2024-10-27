import { motion } from 'framer-motion';
import { rgba } from 'polished';
import styled from 'styled-components';

import { setVh } from 'utils/styles/mixins';
import { colors } from 'utils/styles/theme';
export const Wrapper = styled(motion.div)`
  position: absolute;
  z-index: -1;
  height: 100%;
  max-height: ${setVh(100)};
  width: 100%;
  background: ${rgba(colors.white, 0.8)};
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;

  video {
    display: none;
    width: auto;
    min-height: 100%;
    position: relative;
    z-index: 5;
  }

  canvas {
    position: absolute;
    top: 0;
    z-index: 10;
    pointer-events: none;
    width: auto;
    min-height: 100%;
  }
`;

import { motion } from 'framer-motion';
import { rgba } from 'polished';
import styled from 'styled-components';

import { setVh } from 'utils/styles/mixins';
import { colors } from 'utils/styles/theme';
export const Wrapper = styled(motion.div)`
  position: absolute;
  height: 100%;
  max-height: ${setVh(100)};
  width: 100%;
  background: ${rgba(colors.white, 0.8)};
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  img {
    width: 90%;
  }
`;

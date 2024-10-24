import { motion } from 'framer-motion';
import styled from 'styled-components';

import { colors, layout } from 'utils/styles/theme';

export const Wrapper = styled(motion.div)`
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background-color: ${colors.black};
  color: ${colors.white};
  padding: 10rem;
  z-index: ${layout.zIndex.nonFunctionals};

  svg {
    height: 1em;
  }
`;

export const Description = styled.div`
  cursor: pointer;
`;

export const Left = styled.div`
  display: flex;
  align-items: center;

  svg {
    height: 24rem;
    margin-right: 30rem;
  }
`;

export const Arrow = styled.div`
  cursor: pointer;
`;

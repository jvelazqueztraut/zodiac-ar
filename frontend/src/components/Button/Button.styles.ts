import { motion } from 'framer-motion';
import styled from 'styled-components';

import { spinAnimation } from 'utils/styles/mixins';
import { colors } from 'utils/styles/theme';

export const Wrapper = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rem;
  background-color: ${colors.blueRibbon};
  color: ${colors.white};
  padding-inline: 30rem;
  text-transform: uppercase;
  border-radius: 25rem;
  height: 50rem;
`;

export const Label = styled.span`
  user-select: none;
`;

export const Spinner = styled.div`
  width: 30rem;
  svg {
    ${spinAnimation()}
  }
`;

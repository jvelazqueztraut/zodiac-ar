import { motion } from 'framer-motion';
import styled from 'styled-components';

import { spinAnimation } from 'utils/styles/mixins';
import { colors } from 'utils/styles/theme';

import { ButtonProps } from './Button';

export const Wrapper = styled(motion.button)<{
  type?: ButtonProps['type'];
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rem;
  background-color: ${({ type }) =>
    type === 'about' ? colors.white : colors.black};
  color: ${({ type }) => (type === 'about' ? colors.black : colors.white)};
  padding-inline: 30rem;
  text-transform: uppercase;
  border-radius: 25rem;
  border: 3px solid black;
  height: 50rem;
  margin: 10rem;
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

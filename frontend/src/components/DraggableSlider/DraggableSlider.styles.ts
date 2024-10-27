import { motion } from 'framer-motion';
import styled from 'styled-components';

export const Wrapper = styled(motion.div)`
  position: relative;
  width: 80vw;
  height: 80vw;
  margin: auto;
`;

export const Slider = styled.div<{ left: number; top: number }>`
  position: absolute;
  left: ${props => props.left}%;
  top: ${props => props.top}%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  background-color: red;
  border-radius: 50%;
  cursor: pointer;
`;

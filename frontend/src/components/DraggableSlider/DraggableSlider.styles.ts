import { motion } from 'framer-motion';
import styled from 'styled-components';

export const Wrapper = styled(motion.div)`
  position: relative;
  width: 80vw;
  height: 100vw;
  margin: auto;
`;

export const Slider = styled.div<{ left: number; top: number }>`
  position: absolute;
  left: ${props => props.left}%;
  top: ${props => props.top}%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  border-radius: 50%;
  cursor: pointer;
`;

export const Icon = styled.img`
  width: 100%;
  height: 100%;
`;

export const Text = styled.div<{
  visible: boolean;
}>`
  margin-top: -50px;
  font-size: 12rem;
  color: black;
  text-align: center;
  text-shadow: 4px 4px 5px white;
  opacity: ${props => (props.visible ? 1 : 0)};
  transition: opacity 0.3s ease;
`;

import { motion } from 'framer-motion';
import styled from 'styled-components';

import { setTypography, setVh } from 'utils/styles/mixins';
import { mediaMobileSmallHeight } from 'utils/styles/responsive';

export const Wrapper = styled.div`
  position: fixed;
  height: ${setVh(100)};
  overflow-x: hidden;
  overflow-y: scroll;
  display: grid;
`;

export const WrapperInner = styled.div`
  height: ${setVh(100)};
  display: grid;
  align-content: space-around;

  > div,
  button,
  p,
  img {
    justify-self: center;
  }

  button {
    width: 130rem;
  }

  h1 {
    ${({ theme: { locale } }) => setTypography('heading1', locale)}
    text-align: center;

    ${() =>
      mediaMobileSmallHeight(`
         font-size: 28rem;
  `)}
  }

  h2 {
    ${({ theme: { locale } }) => setTypography('heading2', locale)}
    text-align: center;
  }
`;

export const Logo = styled.div`
  z-index: 1;
  margin-top: 75rem;
  width: 75%;
  img {
    width: 100%;
  }
`;

export const Header = styled(motion.div)`
  margin-top: 15rem;
  h1: first-child {
    margin-bottom: 15rem;
  }
`;

import styled from 'styled-components';

import { setVh } from 'utils/styles/mixins';

export const Wrapper = styled.div`
  position: relative;
  height: ${setVh(100)};
  overflow-x: hidden;
  overflow-y: scroll;
  display: grid;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 20rem;

  button {
    justify-self: center;
    width: 130rem;
    bottom: 10rem;
  }
`;

export const CloseIcon = styled.div`
  svg {
    width: 30rem;
  }
  padding: 20rem;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 10;
`;

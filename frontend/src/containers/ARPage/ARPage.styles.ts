import styled from 'styled-components';

import { setVh } from 'utils/styles/mixins';

export const Wrapper = styled.div`
  height: ${setVh(100)};
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 20rem;

  > h1 {
    font-size: 25rem;
  }

  > p {
    margin-top: 10rem;
    text-align: center;
  }

  > button {
    position: fixed;
    left: 0;
    right: 0;
    margin: 0 auto;
    bottom: 50rem;
  }
`;

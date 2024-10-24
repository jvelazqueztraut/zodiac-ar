import { rgba } from 'polished';
import styled from 'styled-components';

import { colors } from 'utils/styles/theme';

export const Wrapper = styled.div`
  background: ${rgba(colors.black, 0.5)};
  bottom: 0;
  left: 0;
  color: ${colors.white};
  font-family: sans-serif;
  font-size: 11px;
  padding: 5px 10px;
  position: fixed;
  transition: right 0.5s;
  z-index: 50001;
`;

export const Button = styled.button`
  cursor: pointer;
  display: inline-block;
`;

export const Info = styled.div`
  display: inline-block;
  margin: 0 10px 0 0;
  white-space: initial;
`;

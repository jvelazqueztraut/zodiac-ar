import { createGlobalStyle, css } from 'styled-components';

import { setTypography } from './mixins';
import resetCSS from './reset';
import { setScalableFontSize } from './responsive';
import { colors } from './theme';

const style = css`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    outline: none;
    user-select: text;
  }

  ::selection {
    background: ${colors.black};
    color: ${colors.white};
    text-shadow: none;
  }

  ::-moz-selection {
    background: ${colors.black};
    color: ${colors.white};
    text-shadow: none;
  }

  html,
  body {
    width: 100%;
    height: 100%;
  }

  html {
    ${setScalableFontSize()}
    position: absolute;
    overflow-x: hidden;
  }

  body {
    background: ${colors.white};
    color: ${colors.black};
    ${({ theme: { locale } }) => setTypography('body1', locale)}
  }

  button,
  input,
  textarea,
  select,
  dialog {
    -webkit-appearance: none;
    background: none;
    font-family: inherit;
    border: none;
    color: inherit;
    font-size: inherit;
    font-weight: inherit;
    text-transform: inherit;
    outline: none;
    border-radius: 0;
  }

  svg {
    outline: none;
    display: block;
  }

  button,
  div,
  a,
  span {
    -webkit-tap-highlight-color: transparent;
  }

  a {
    color: inherit;
  }

  button {
    cursor: pointer;
  }
`;

export default createGlobalStyle`
  ${resetCSS}
  ${style}
`;

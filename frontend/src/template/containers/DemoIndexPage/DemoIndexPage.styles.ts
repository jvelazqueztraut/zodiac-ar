import styled from 'styled-components';

import { hover, setTypography, setVh } from 'utils/styles/mixins';
import { mediaTablet } from 'utils/styles/responsive';
import { colors, layout } from 'utils/styles/theme';

export const Wrapper = styled.div`
  min-height: ${setVh(100)};
  padding: 0 50rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const Card = styled.a`
  margin: 10rem;
  flex-basis: 45%;
  padding: 16rem;
  border: 1px solid ${colors.gallery};
  border-radius: ${layout.borderRadius};
  transition: color 0.15s ease, border-color 0.15s ease;
  cursor: pointer;

  ${hover(`
    color: ${colors.blueRibbon};
    border-color: ${colors.blueRibbon};
  `)}

  h3 {
    margin: 0 0 10rem 0;
    ${({ theme: { locale } }) => setTypography('heading3', locale)}
  }

  p {
    margin: 0;
    ${({ theme: { locale } }) => setTypography('body1', locale)}
  }
`;

export const Description = styled.p`
  text-align: center;

  code {
    background: ${colors.alabaster};
    border-radius: 6rem;
    padding: 8rem;
    ${({ theme: { locale } }) => setTypography('small', locale)}
  }
`;

export const Grid = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 800rem;
  margin-top: 30rem;
  text-decoration: underline;

  .grid {
    width: 100%;
    flex-direction: column;

    ${mediaTablet(`
      width: auto;
      flex-direction: unset;
    `)}
  }
`;

export const Main = styled.main`
  padding: 50rem 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const Title = styled.h1`
  margin: 0;
  ${({ theme: { locale } }) => setTypography('heading1', locale)}
  text-align: center;

  a {
    color: ${colors.blueRibbon};
    text-decoration: none;
  }

  ${hover(`
    text-decoration: underline;
  `)}
`;

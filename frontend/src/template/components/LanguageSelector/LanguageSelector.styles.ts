import styled from 'styled-components';

import { hover, setTypography } from 'utils/styles/mixins';
import { colors, layout } from 'utils/styles/theme';

export const LanguageWrapper = styled.div`
  ${({ theme: { locale } }) => setTypography('body2', locale)}
  position: fixed;
  right: 30rem;
  top: 10rem;
  z-index: ${layout.zIndex.languageSelector};
`;

export const Option = styled.p<{ isSelected: boolean }>`
  position: relative;
  display: inline-block;
  margin-left: 10rem;
  background-color: ${colors.alto};
  padding: 10rem 14rem;
  border-radius: 6rem;
  cursor: ${({ isSelected }) => (isSelected ? 'default' : 'pointer')};
  opacity: ${({ isSelected }) => (isSelected ? 1 : 0.3)};
  transition: opacity 0.2s ease-out;

  ${hover(`
    opacity: 1;
  `)}
`;

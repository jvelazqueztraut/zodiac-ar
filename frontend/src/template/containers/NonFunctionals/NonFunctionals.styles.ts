import styled from 'styled-components';

import { setTypography } from 'utils/styles/mixins';

export const Title = styled.h1`
  ${({ theme: { locale } }) => setTypography('heading1', locale)}
`;

export const Button = styled.button`
  ${({ theme: { locale } }) => setTypography('button', locale)}
`;

export const Description = styled.p`
  white-space: pre-wrap;
`;

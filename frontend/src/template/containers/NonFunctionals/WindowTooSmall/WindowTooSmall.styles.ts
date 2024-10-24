import styled from 'styled-components';

import { fullscreenWhite } from 'utils/styles/mixins';
import { layout } from 'utils/styles/theme';

export const Wrapper = styled.div`
  ${fullscreenWhite()}
  z-index: ${layout.zIndex.nonFunctionals};
`;

import React from 'react';

import * as Styled from './SliderAnchor.styles';

interface SliderAnchorProps {
  left: number;
  top: number;
  selected: boolean;
  icon: string;
  hint: string;
  isHintVisible: boolean;
}

const SliderAnchor: React.FC<SliderAnchorProps> = ({
  left,
  top,
  selected,
  icon,
  hint,
  isHintVisible,
}) => {
  return (
    <Styled.Wrapper left={left} top={top}>
      <Styled.Icon src={icon} selected={selected} alt="Anchor Icon" />
      <Styled.Text visible={isHintVisible}>{hint}</Styled.Text>
    </Styled.Wrapper>
  );
};

export default SliderAnchor;

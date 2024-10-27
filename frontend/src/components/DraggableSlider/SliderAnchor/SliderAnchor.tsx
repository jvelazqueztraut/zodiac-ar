import React from 'react';

import * as Styled from './SliderAnchor.styles';

interface SliderAnchorProps {
  left: number;
  top: number;
  selected: boolean;
  icon: string;
  text: string;
}

const SliderAnchor: React.FC<SliderAnchorProps> = ({
  left,
  top,
  selected,
  icon,
  text,
}) => {
  return (
    <Styled.Wrapper left={left} top={top} selected={selected}>
      <Styled.Icon src={icon} alt="Anchor Icon" />
      <Styled.Text>{text}</Styled.Text>
    </Styled.Wrapper>
  );
};

export default SliderAnchor;

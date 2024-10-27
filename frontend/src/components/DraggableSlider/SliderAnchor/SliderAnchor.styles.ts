import styled from 'styled-components';

export const Wrapper = styled.div<{
  left: number;
  top: number;
}>`
  position: absolute;
  left: ${props => props.left}%;
  top: ${props => props.top}%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const Icon = styled.img<{
  selected: boolean;
}>`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: ${props => (props.selected ? '3px solid' : 'none')};
`;

export const Text = styled.div<{
  visible: boolean;
}>`
  margin-top: 5px;
  font-size: 12px;
  color: white;
  text-align: center;
  visibility: ${props => (props.visible ? 'visible' : 'hidden')};
`;

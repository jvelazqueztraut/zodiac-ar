import styled from 'styled-components';

export const Wrapper = styled.div<{
  left: number;
  top: number;
  selected: boolean;
}>`
  position: absolute;
  left: ${props => props.left}%;
  top: ${props => props.top}%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background-color: ${props => (props.selected ? 'blue' : 'gray')};
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const Icon = styled.img`
  width: 100%;
  height: 100%;
`;

export const Text = styled.div`
  margin-top: 5px;
  font-size: 12px;
  color: white;
  text-align: center;
`;

import React from 'react';

import { ReactComponent as SvgEllipse } from 'svgs/ellipse.svg';

import * as Styled from './Button.styles';

export interface ButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
  type?: 'default' | 'about';
  disabled?: boolean;
  isLoading?: boolean;
  hasShadow?: boolean;
  motion?: any;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  label,
  className,
  type = 'default',
  disabled = false,
  isLoading = false,
  hasShadow = false,
  motion,
}) => {
  return (
    <Styled.Wrapper
      onClick={() => {
        if (isLoading) return;
        onClick();
      }}
      {...{
        className,
        type,
        disabled,
        hasLabel: !!label,
        hasShadow,
      }}
      {...motion}
    >
      {isLoading && (
        <Styled.Spinner>
          <SvgEllipse />
        </Styled.Spinner>
      )}
      {!isLoading && label && <Styled.Label>{label}</Styled.Label>}
    </Styled.Wrapper>
  );
};

export default Button;

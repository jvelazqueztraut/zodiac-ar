/* eslint-disable prettier/prettier */
import { kebabCase } from 'lodash';
import { css } from 'styled-components';

import { pulse, spin } from './animations';
import { MediaContent, mediaDesktop, mediaTablet } from './responsive';
import { colors, FontCategory, fonts, ResponsiveValues, Theme } from './theme';
import { minFontSize } from './vars';

// Fix Safari mobile fix, where vh values are wrongly calculated
// https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
export const setVh = (value: number) => `calc(var(--vh, 1vh) * ${value})`;

export const hover = (content: MediaContent, mustHoldOnTablet = false) => css`
  &:active {
    ${content}
  }

  ${(mustHoldOnTablet ? mediaDesktop : mediaTablet)(css`
    &:hover {
      ${content}
    }
  `)}
`;

export const setVisibility = (isVisible: boolean) => css`
  transition: opacity 0.2s ease-out;

  ${!isVisible
    ? `
    opacity: 0;
    pointer-events: none;
  `
    : ''}
`;

const getStyleString = (
  key: keyof FontCategory,
  value: FontCategory[keyof FontCategory],
  deviceType: keyof ResponsiveValues,
  isImportant?: boolean,
  locale?: string
) => {
  const isRemUnit = ['fontSize', 'wordSpacing'].includes(key);
  const isEmUnit = ['letterSpacing'].includes(key);
  const isObject = [
    'fontSize',
    'lineHeight',
    'fontWeight',
    'letterSpacing',
  ].includes(key);
  const isFontFamily = key === 'fontFamily';
  const isFontSize = key === 'fontSize';

  const parsedKey = kebabCase(key);
  const parsedValue = isObject && !Number.isFinite(value)
    ? (value as any)[deviceType]
    : isFontFamily
    ? fonts.face[
        typeof value === 'object'
          ? value[locale] || (value as any).default
          : value
      ]
    : value;
  const parsedUnit =
    (isRemUnit || isEmUnit) && parsedValue ? (isRemUnit ? 'rem' : 'em') : '';

  let parsedValueWithUnit = `${parsedValue}${parsedUnit}`;
  if (isFontSize && Number.isFinite(minFontSize[deviceType])) {
    parsedValueWithUnit = `max(${parsedValueWithUnit}, ${minFontSize[deviceType]}px)`;
  }

  return `${parsedKey}: ${parsedValueWithUnit}${
    isImportant ? ' !important' : ''
  };`;
};

const getTypographyBreakpointStyles = (
  category: keyof Theme['fonts']['scale'],
  deviceType: keyof ResponsiveValues,
  locale = process.env.DEFAULT_LOCALE,
  isImportant = false,
) => Object.entries(fonts.scale[category] as FontCategory)
    .filter(([, value]) => deviceType === 'mobile' || (value !== undefined && value[deviceType] !== undefined))
    .map(
      ([key, value]: [keyof FontCategory, FontCategory[keyof FontCategory]]) =>
        getStyleString(key, value, deviceType, isImportant, locale)
    )
    .join('\n');

export const setTypography = (
  category: keyof Theme['fonts']['scale'],
  locale = process.env.DEFAULT_LOCALE,
  isImportant = false
) => css`
  ${getTypographyBreakpointStyles(category, 'mobile', locale, isImportant)}

  ${mediaTablet(`
    ${getTypographyBreakpointStyles(category, 'tablet', locale, isImportant)}
  `)}

  ${mediaDesktop(`
    ${getTypographyBreakpointStyles(category, 'desktop', locale, isImportant)}
  `)}
`;

// Bezier curves
export const easeInSine = 'cubic-bezier(0.470, 0.000, 0.745, 0.715)';
export const easeOutSine = 'cubic-bezier(0.390, 0.575, 0.565, 1.000)';
export const easeInOutSine = 'cubic-bezier(0.445, 0.050, 0.550, 0.950)';
export const easeInQuad = 'cubic-bezier(0.550, 0.085, 0.680, 0.530)';
export const easeOutQuad = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
export const easeInOutQuad = 'cubic-bezier(0.455, 0.030, 0.515, 0.955)';
export const easeInCubic = 'cubic-bezier(0.550, 0.055, 0.675, 0.190)';
export const easeOutCubic = 'cubic-bezier(0.215, 0.610, 0.355, 1.000)';
export const easeInOutCubic = 'cubic-bezier(0.645, 0.045, 0.355, 1.000)';
export const easeInQuart = 'cubic-bezier(0.895, 0.030, 0.685, 0.220)';
export const easeOutQuart = 'cubic-bezier(0.165, 0.840, 0.440, 1.000)';
export const easeInOutQuart = 'cubic-bezier(0.770, 0.000, 0.175, 1.000)';
export const easeInQuint = 'cubic-bezier(0.755, 0.050, 0.855, 0.060)';
export const easeOutQuint = 'cubic-bezier(0.230, 1.000, 0.320, 1.000)';
export const easeInOutQuint = 'cubic-bezier(0.860, 0.000, 0.070, 1.000)';
export const easeInExpo = 'cubic-bezier(0.950, 0.050, 0.795, 0.035)';
export const easeOutExpo = 'cubic-bezier(0.190, 1.000, 0.220, 1.000)';
export const easeInOutExpo = 'cubic-bezier(1.000, 0.000, 0.000, 1.000)';
export const easeInCirc = 'cubic-bezier(0.600, 0.040, 0.980, 0.335)';
export const easeOutCirc = 'cubic-bezier(0.075, 0.820, 0.165, 1.000)';
export const easeInOutCirc = 'cubic-bezier(0.785, 0.135, 0.150, 0.860)';
export const easeInBack = 'cubic-bezier(0.600, -0.280, 0.735, 0.045)';
export const easeOutBack = 'cubic-bezier(0.175, 0.885, 0.320, 1.275)';
export const easeInOutBack = 'cubic-bezier(0.680, -0.550, 0.265, 1.550)';

export const eases = {
  easeInSine,
  easeOutSine,
  easeInOutSine,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInQuart,
  easeOutQuart,
  easeInOutQuart,
  easeInQuint,
  easeOutQuint,
  easeInOutQuint,
  easeInExpo,
  easeOutExpo,
  easeInOutExpo,
  easeInCirc,
  easeOutCirc,
  easeInOutCirc,
  easeInBack,
  easeOutBack,
  easeInOutBack,
} as const;

export const getEasingValues = (easing: keyof typeof eases) =>
  eases[easing].match(/(\d+\.?\d*)/g).map(parseFloat);

// Animations
export const spinAnimation = () => css`
  animation: ${spin()} 1s infinite linear;
`;

export const pulseAnimation = (transform?: string, duration = 3.5) => css`
  animation: ${pulse(transform)} ${duration}s ${easeOutCubic} forwards;
`;

// Other mixins
export const fullscreenWhite = () => css`
  position: fixed;
  width: 100%;
  height: ${setVh(100)};
  top: 0;
  left: 0;
  background: ${colors.white};

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  text-align: center;
`;

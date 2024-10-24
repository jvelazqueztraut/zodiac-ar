import { css, FlattenInterpolation, ThemeProps } from 'styled-components';

import { getViewportInfo } from 'template/utils/dom';
import { isBrowser, isDesktop, isIOS, isMobile } from 'template/utils/platform';

import * as VARS from './vars';

export type MediaContent = string | FlattenInterpolation<ThemeProps<any>>;

export const mqMobile = `(max-width: ${VARS.breakpointTablet - 1}px)`;
export const mediaMobile = (content: MediaContent) =>
  css`
    @media ${mqMobile} {
      ${content}
    }
  `;

export const mqMobileSmallHeight = `(max-height: ${VARS.breakpointMobileSmallHeight}px)`;
export const mediaMobileSmallHeight = (content: MediaContent) =>
  css`
    @media ${mqMobileSmallHeight} {
      ${content}
    }
  `;

export const mqTablet = `(min-width: ${VARS.breakpointTablet}px)`;
export const mediaTablet = (content: MediaContent) =>
  css`
    @media ${mqTablet} {
      ${content}
    }
  `;

export const mqDesktopTooSmall = `(max-width: ${VARS.desktopMinWidth}px) and (-webkit-max-device-pixel-ratio: 1.75)`;
export const mediaDesktopTooSmall = (content: MediaContent) =>
  css`
    @media ${mqDesktopTooSmall} {
      ${content}
    }
  `;

export const mqDesktop = `(min-width: ${VARS.breakpointDesktop}px) and (min-height: ${VARS.desktopMinHeight}px)`;
export const mediaDesktop = (content: MediaContent) =>
  css`
    @media ${mqDesktop} {
      ${content}
    }
  `;

const mqDesktopLarge = `(min-width: ${VARS.breakpointDesktopLarge}px)`;
export const mediaDesktopLarge = (content: MediaContent) =>
  css`
    @media ${mqDesktopLarge} {
      ${content}
    }
  `;

export const mqDesktopWide = `(min-width: ${VARS.breakpointDesktop}px) and (min-aspect-ratio: ${VARS.desktopWideAspectRatio})`;
export const mediaDesktopWide = (content: MediaContent) =>
  css`
    @media ${mqDesktopWide} {
      ${content}
    }
  `;

export const mqLandscape = '(orientation: landscape)';
export const mediaLandscape = (content: MediaContent) =>
  css`
    @media ${mqLandscape} {
      ${content}
    }
  `;

export const mqPortrait = '(orientation: portrait)';
export const mediaPortrait = (content: MediaContent) =>
  css`
    @media ${mqPortrait} {
      ${content}
    }
  `;

export const matchMobile = {
  match: isBrowser() && window.matchMedia(mqMobile),
  scalableFontSize: VARS.mobileScalableFontSize,
  minFontSize: VARS.minFontSize.mobile,
  setVh: false,
};

export const matchMobileSmallHeight = {
  match: isBrowser() && window.matchMedia(mqMobileSmallHeight),
  scalableFontSize: VARS.mobileSmallHeightScalableFontSize,
  minFontSize: VARS.minFontSize.mobile,
  setVh: false,
};

export const matchTablet = {
  match: isBrowser() && window.matchMedia(mqTablet),
  scalableFontSize: VARS.tabletScalableFontSize,
  minFontSize: VARS.minFontSize.tablet,
  setVh: false,
};

export const matchDesktop = {
  match: isBrowser() && window.matchMedia(mqDesktop),
  scalableFontSize: VARS.desktopScalableFontSize,
  minFontSize: VARS.minFontSize.desktop,
  setVh: false,
};

export const matchDesktopWide = {
  match: isBrowser() && window.matchMedia(mqDesktopWide),
  scalableFontSize: VARS.desktopWideScalableFontSize,
  minFontSize: VARS.minFontSize.desktop,
  setVh: true,
};

export const isMobileLayout = () =>
  isMobile() || getViewportInfo().width < VARS.breakpointTablet;

export const setScalableFontSize = () => {
  // iOS doesn't scale non-px units automatically when zooming
  const setDocumentZoom = (value: string) =>
    (isDesktop() || isIOS()) && process.env.ALLOW_USER_ZOOM
      ? `calc(var(--zoomLevel, 1) * ${value})`
      : value;

  const result = css`
    font-size: ${setDocumentZoom(`${VARS.mobileScalableFontSize}vw`)};

    ${mediaMobileSmallHeight(`
        font-size: ${setDocumentZoom(
          `${VARS.mobileSmallHeightScalableFontSize}vw`
        )};
      `)}

    ${mediaTablet(`
        font-size: ${setDocumentZoom(`${VARS.tabletScalableFontSize}vw`)};
      `)}

      ${mediaDesktopTooSmall(`
      font-size: ${setDocumentZoom(
        `${VARS.desktopTooSmallScalableFontSize}vw`
      )};
    `)}

      ${mediaDesktop(`
        font-size: ${setDocumentZoom(`${VARS.desktopScalableFontSize}vw`)};
      `)}

      ${mediaDesktopWide(`
        font-size: ${setDocumentZoom(`${VARS.desktopWideScalableFontSize}vw`)};
      `)}
  `;

  return result;
};

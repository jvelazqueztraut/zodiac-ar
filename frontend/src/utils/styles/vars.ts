export const breakpointMobileSmallHeight = 600; // px
export const breakpointTablet = 768; // px
export const breakpointDesktop = 1366; // px
export const breakpointDesktopLarge = 1600; // px

export const desktopMinHeight = 600; // px
export const desktopMinWidth = 1024; // px

export const desktopWideAspectRatio = '20 / 11';

export const minFontSize = {
  mobile: 11,
  tablet: 12,
  desktop: 12,
} as const; // px

// Scales based on the active breakpoint by default.
// If linear scaling is enabled instead, the elements will scale uniformly
// relatively to the mobile width, and ignoring the tablet and desktop breakpoints.
//
// Warning: If changed to non-linear scaling during development,
// all affected breakpoints will need to have their values updated accordingly
// in the typography scale and the components' styles.
//
// eg. If tabletScalableFontSize's calculated value changes from 0.05 to 0.1,
// all rem and em values under the tablet breakpoint (including in the typography scale)
// will become twice as big visually.

const useLinearScaling = process.env.USE_LINEAR_SCALING;

// Defaults to the most common values. Adjust to the design references'.
const designsMobileWidth = 360; // px
const designsDesktopWidth = 1920; // px
const designsTabletWidth = designsDesktopWidth; // Adjust if tablet has own design references

// Warning: These calculations affect the responsive scaling of the entire project.
export const mobileScalableFontSize = 100 / designsMobileWidth; // vw
export const mobileSmallHeightScalableFontSize = mobileScalableFontSize; // vw
export const mobileSmallHeightLandscapeScalableFontSize =
  0.5 * mobileScalableFontSize; // vw
export const tabletScalableFontSize = useLinearScaling
  ? mobileScalableFontSize
  : 100 / designsTabletWidth; // vw
export const desktopScalableFontSize = useLinearScaling
  ? mobileScalableFontSize
  : 100 / designsDesktopWidth; // vw
export const desktopWideScalableFontSize = useLinearScaling
  ? mobileScalableFontSize
  : desktopScalableFontSize; // vw
export const desktopTooSmallScalableFontSize = 2 * desktopScalableFontSize; // vw

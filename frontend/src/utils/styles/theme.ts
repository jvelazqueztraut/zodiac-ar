export enum ColorNames {
  white = 'white',
  black = 'black',
  alabaster = 'alabaster',
  alto = 'alto',
  blueRibbon = 'blueRibbon',
  gallery = 'gallery',
  red = 'red',
}

export enum FontNames {
  customFontName = 'customFontName',
  menlo = 'menlo',
}

const validFontCategories = [
  'heading1',
  'heading2',
  'heading3',
  'body1',
  'body2',
  'button',
  'input',
  'small',
  'caption',
  'label',
] as const;

export interface ResponsiveValues {
  mobile?: number;
  tablet?: number;
  desktop?: number;
}

export interface FontCategory {
  fontFamily?: FontNames | Record<string, FontNames>;
  fontSize: ResponsiveValues;
  lineHeight: ResponsiveValues;
  fontWeight: number;
  letterSpacing?: number;
  wordSpacing?: number;
  fontStretch?: 'expanded' | 'normal';
  textDecoration?: 'underline' | 'none';
  textTransform?:
    | 'none'
    | 'capitalize'
    | 'uppercase'
    | 'full-size-kana'
    | 'full-width'
    | 'lowercase';
  fontStyle?: 'normal' | 'italic' | 'oblique' | 'inherit' | 'initial' | 'unset';
}

export interface Theme {
  colors: Record<ColorNames, string>;
  fonts: {
    face: Record<FontNames, string>;
    scale: Record<typeof validFontCategories[number], FontCategory>;
  };
  layout: typeof layout;
}

// "Name that Color" names
export const colors: Theme['colors'] = {
  [ColorNames.white]: '#fff',
  [ColorNames.black]: '#000',

  [ColorNames.alabaster]: '#fafafa',
  [ColorNames.alto]: '#ddd',
  [ColorNames.blueRibbon]: '#0070f3',
  [ColorNames.gallery]: '#eaeaea',
  [ColorNames.red]: '#f00',
} as const;

export const fonts: Theme['fonts'] = {
  face: {
    [FontNames.customFontName]:
      // eslint-disable-next-line quotes
      "'Custom Font Here', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    [FontNames.menlo]:
      // eslint-disable-next-line quotes, prettier/prettier
      "Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace",
  },
  scale: {
    // fontSize: rem, letterSpacing: em
    // fontFamily: { [localeCode]: localeSpecificFont, default: defaultFont }
    heading1: {
      fontFamily: { default: FontNames.customFontName },
      fontSize: { tablet: 40, mobile: 26 },
      lineHeight: { tablet: 1.35, mobile: 1.35 },
      fontWeight: 700,
    },
    heading2: {
      fontFamily: { default: FontNames.customFontName },
      fontSize: { tablet: 24, mobile: 16 },
      lineHeight: { tablet: 1.35, mobile: 1.35 },
      fontWeight: 700,
    },
    heading3: {
      fontFamily: { default: FontNames.customFontName },
      fontSize: { tablet: 18, mobile: 12 },
      lineHeight: { tablet: 1.35, mobile: 1.35 },
      fontWeight: 600,
    },
    body1: {
      fontFamily: { default: FontNames.customFontName },
      fontSize: { tablet: 15, mobile: 10 },
      lineHeight: { tablet: 1.5, mobile: 1.5 },
      fontWeight: 600,
      letterSpacing: 0.03,
    },
    body2: {
      fontFamily: { default: FontNames.customFontName },
      fontSize: { tablet: 24, mobile: 16 },
      lineHeight: { tablet: 1.5, mobile: 1.5 },
      fontWeight: 600,
    },
    button: {
      fontFamily: { default: FontNames.customFontName },
      fontSize: { tablet: 14, mobile: 10 },
      lineHeight: { tablet: 1.5, mobile: 1.5 },
      fontWeight: 700,
      letterSpacing: 0.03,
    },
    input: {
      fontFamily: { default: FontNames.customFontName },
      fontSize: { tablet: 16, mobile: 10 },
      lineHeight: { tablet: 1.5, mobile: 1.5 },
      fontWeight: 600,
    },
    small: {
      fontFamily: { default: FontNames.menlo },
      fontSize: { tablet: 12, mobile: 8 },
      lineHeight: { tablet: 1.5, mobile: 1.5 },
      fontWeight: 700,
      letterSpacing: 0.05,
    },
    caption: {
      fontFamily: { default: FontNames.customFontName },
      fontSize: { tablet: 14, mobile: 10 },
      lineHeight: { tablet: 1.5, mobile: 1.5 },
      fontWeight: 600,
      letterSpacing: 0.05,
      textTransform: 'uppercase',
    },
    label: {
      fontFamily: { default: FontNames.customFontName },
      fontSize: { tablet: 12, mobile: 8 },
      lineHeight: { tablet: 1.5, mobile: 1.5 },
      fontWeight: 700,
      letterSpacing: 0.05,
      textTransform: 'uppercase',
    },
  },
} as const;

// Comment unit where applicable
export const layout = {
  borderRadius: 14, // rem
  lineOpacity: 0.1,
  zIndex: {
    languageSelector: 2,
    nonFunctionals: 3,
  },
} as const;

const theme: Theme = {
  colors,
  fonts,
  layout,
} as const;

export default theme;

import { HeadProps } from 'template/components/Head/Head';

export interface CopyStoreType {
  copy: {
    head: HeadProps;
    global: GlobalCopy;
    landing: LandingPageCopy;
    ar: ARPageCopy;
    about: AboutPageCopy;
  };
  setCopy(patch: Partial<CopyStoreType['copy']>): void;
}

export interface GlobalCopy {
  cookies: {
    title: string;
    description: string;
    cta: string;
  };
  errors: {
    mobileOnly: {
      title: string;
      body: string;
    };
    notFound: {
      title: string;
      body: string;
      cta: string;
    };
    javascriptDisabled: {
      title: string;
      body1: string;
      body2: string;
    };
    rotateDevice: {
      title: string;
      body: {
        mobile: string;
        tablet: string;
      };
    };
    unsupportedBrowser: {
      title: string;
      body: {
        mobile: string;
        desktop: string;
        social: string;
        banner: string;
      };
      cta: string;
    };
    windowTooSmall: {
      title: string;
      body: string;
    };
    webGLDisabled: {
      title: string;
      body: string;
    };
  };
}

export interface SharedCopy {
  global: GlobalCopy;
}

export interface LandingPageCopy {
  title: string;
  subTitle: string;
  cta: string;
  about: string;
}

export interface ARPageCopy {
  title: string;
  body: string;
  cta: string;
  sliderHint: string;
}

export interface AboutPageCopy {
  title: string;
  description: string;
  sourceCode: string;
  back: string;
}

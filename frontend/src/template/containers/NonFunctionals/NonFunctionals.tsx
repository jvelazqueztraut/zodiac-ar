import * as Sentry from '@sentry/react';
import { AnimatePresence } from 'framer-motion';
import { GetStaticProps } from 'next';
import { Router } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';

import { useCopyStore, useGlobalStore } from 'store';
import { getCopy } from 'store/copy.data';
import { CopyStoreType } from 'store/copy.types';
import useWindowSize from 'template/hooks/useWindowSize';
import {
  ALLOWED_BROWSERS,
  hasWebGl,
  isDesktop,
  isMobile,
  isStorybook,
  isSupportedBrowser,
  isTablet,
} from 'template/utils/platform';
// import { cmsApiClient } from 'utils/cms/api';
// import { notFoundPageQuery } from 'utils/cms/gql';
import { ISR_TIMEOUT } from 'utils/config';
import { Pages, ROUTES } from 'utils/routes';
import { isMobileLayout } from 'utils/styles/responsive';
import { desktopMinHeight, desktopMinWidth } from 'utils/styles/vars';

import JavaScriptDisabled from './JavaScriptDisabled/JavaScriptDisabled';
import MobileOnly from './MobileOnly/MobileOnly';
import NotFound from './NotFound/NotFound';
import RotateDevice from './RotateDevice/RotateDevice';
import SocialBrowserUnsupported from './SocialBrowserUnsupported/SocialBrowserUnsupported';
import UnsupportedBrowser from './UnsupportedBrowser/UnsupportedBrowser';
import UnsupportedBanner from './UnsupportedBrowserBanner/UnsupportedBrowserBanner';
import WebGLDisabled from './WebGLDisabled/WebGLDisabled';
import WindowTooSmall from './WindowTooSmall/WindowTooSmall';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const selectedLocale = process.env.LOCALES.includes(locale)
      ? locale
      : process.env.DEFAULT_LOCALE;

    // const result = await cmsApiClient.query({
    //   query: notFoundPageQuery({ locale: selectedLocale }),
    // });

    // const { sharedCopy, notFoundPage: page } = result.data;
    // const { head } = page;
    const { head, global } = getCopy(Pages.notFound, selectedLocale);

    return {
      props: {
        initialCopy: {
          head,
          global,
        },
      },
      revalidate: ISR_TIMEOUT,
    };
  } catch (error) {
    Sentry.captureException(error);
    console.log('NonFunctionals -- getStaticProps -- error:', error);

    throw new Error(error);
  }
};

interface NonFunctionalsProps {
  initialCopy: {
    head: CopyStoreType['copy']['head'];
    global: CopyStoreType['copy']['global'];
  };
  children: React.ReactNode | React.ReactNode[];
  isBypassed?: boolean;
  router: Router;
}

const NonFunctionals: React.FunctionComponent<NonFunctionalsProps> = ({
  initialCopy,
  children,
  isBypassed = false,
  router,
}) => {
  const [isMounted, setMounted] = useState(false);
  const [isRendered, setRendered] = useState(false);
  const [showUnsupportedBrowser, setShowUnsupportedBrowser] = useState(false);
  const [isSubStandardBrowserAccepted, setSubstandardBrowserAccepted] =
    useState(false);
  const [hasNoWebGl, setNoWebGl] = useState(false);
  const [hasBanner, setHasBanner] = useState(false);
  const [showUnsupportedSocial, setUnsupportedSocial] = useState(false);

  const hasMatchingRoute = useMemo(
    () =>
      Object.values(ROUTES).includes(
        router.route as typeof ROUTES[keyof typeof ROUTES]
      ) && router.route !== ROUTES.NOT_FOUND,
    [router.route]
  );

  const windowSize = useWindowSize(true);
  const { setCopy } = useCopyStore();
  const {
    isWindowTooSmall,
    shouldRotateDevice,
    setRotateDevice,
    setWindowTooSmall,
  } = useGlobalStore();

  const errorComponent = useMemo(() => {
    if (isMounted && !ALLOWED_BROWSERS.desktop.length && !isMobileLayout()) {
      return <MobileOnly />;
    } else if (showUnsupportedBrowser && !isSubStandardBrowserAccepted) {
      return <UnsupportedBrowser setAccept={setSubstandardBrowserAccepted} />;
    } else if (showUnsupportedSocial && !isSubStandardBrowserAccepted) {
      return (
        <SocialBrowserUnsupported setAccept={setSubstandardBrowserAccepted} />
      );
    } else if (!hasMatchingRoute) {
      return <NotFound />;
    } else if (hasNoWebGl) {
      return <WebGLDisabled />;
    }

    return null;
  }, [
    isMounted,
    hasMatchingRoute,
    hasNoWebGl,
    isSubStandardBrowserAccepted,
    showUnsupportedBrowser,
    showUnsupportedSocial,
  ]);

  useEffect(() => {
    setMounted(true);

    if (process.env.IS_DEBUG && router.asPath.match(/^\/make-frontend-error/)) {
      throw new Error('Testing Sentry');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isMounted) {
      setRendered(true);

      const { isSupported, needsUpgrade, fromSocial } = isSupportedBrowser();

      if (!isSupported && !fromSocial) {
        setShowUnsupportedBrowser(true);
      } else if (needsUpgrade) {
        setHasBanner(true);
      } else if (fromSocial) {
        setUnsupportedSocial(true);
      }

      setNoWebGl(!hasWebGl());
    }
  }, [isMounted]);

  useEffect(() => {
    const zoomLevel = process.env.ALLOW_USER_ZOOM
      ? windowSize.devicePixelRatio
      : 1;

    setWindowTooSmall(
      isDesktop() &&
        (windowSize.width < desktopMinWidth / zoomLevel ||
          windowSize.height < desktopMinHeight / zoomLevel)
    );

    setRotateDevice(
      (isMobile() && windowSize.isLandscape) ||
        (isTablet() && !windowSize.isLandscape)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowSize]);

  useEffect(() => {
    if (isStorybook() || !initialCopy) return;
    const { head, global } = initialCopy;

    // If this is an error page, set the shared copy
    if (errorComponent) {
      setCopy({ global });
    }

    // If this is the 404 page, update the head copy
    if (!hasMatchingRoute) {
      setCopy({ head });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorComponent, hasMatchingRoute]);

  const handleBannerContentClick = () => {
    setShowUnsupportedBrowser(true);
  };

  if (isBypassed)
    return (
      <AnimatePresence mode="wait" initial={false}>
        {children}
      </AnimatePresence>
    );

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        {errorComponent || children}
      </AnimatePresence>
      {!isRendered && (
        <noscript>
          <JavaScriptDisabled sharedCopy={{ global: initialCopy?.global }} />
        </noscript>
      )}
      {isRendered && (
        <UnsupportedBanner
          onContentClick={handleBannerContentClick}
          isVisible={hasBanner && !isSubStandardBrowserAccepted}
        />
      )}
      {isRendered && <WindowTooSmall isVisible={isWindowTooSmall} />}
      {isRendered && <RotateDevice isVisible={shouldRotateDevice} />}
    </>
  );
};

export default React.memo(NonFunctionals);

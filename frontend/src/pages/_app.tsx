import isValidProp from '@emotion/is-prop-valid';
import * as Sentry from '@sentry/react';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import type { AppProps } from 'next/app';
import Error from 'next/error';
import React, { useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from 'styled-components';

import { setupStoreDevTools, useCopyStore } from 'store';
import { ROUTES } from 'utils/routes';
import customFonts from 'utils/styles/fonts';
import GlobalStyles from 'utils/styles/globalStyles';
import theme from 'utils/styles/theme';

import 'intersection-observer';
import ErrorBoundary from 'template/components/ErrorBoundary/ErrorBoundary';
import Head from 'template/components/Head/Head';
import LanguageSelector from 'template/components/LanguageSelector/LanguageSelector';
import BuildInfo from 'template/components/versioning/BuildInfo/BuildInfo';
import Version from 'template/components/versioning/Version/Version';
import NonFunctionals from 'template/containers/NonFunctionals/NonFunctionals';

if (process.env.ENV !== 'local') {
  Sentry.init({
    enabled: process.env.NODE_ENV !== 'development',
    dsn: process.env.SENTRY_DSN,
    environment: process.env.ENV,
    release: process.env.VERSION,
  });
}

// - Use ?debugStore={any} to enable the store debugging tools even on non-debug envs

const App = ({ Component, pageProps, router }: AppProps) => {
  const [isMounted, setMounted] = useState(false);
  const { copy, setCopy } = useCopyStore();

  const ErrorBoundaryComponent = useMemo(
    () => (process.env.ENV === 'local' ? ErrorBoundary : Sentry.ErrorBoundary),
    []
  );

  useEffect(() => {
    setupStoreDevTools();
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pageProps.initialCopy) setCopy(pageProps.initialCopy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageProps.initialCopy]);

  return (
    <React.StrictMode>
      <ThemeProvider theme={{ ...theme, locale: router.locale }}>
        <MotionConfig isValidProp={isValidProp}>
          <GlobalStyles />
          <style dangerouslySetInnerHTML={{ __html: customFonts }} />

          <ErrorBoundaryComponent
            {...(process.env.ENV !== 'local'
              ? { fallback: <Error statusCode={isMounted ? 400 : 500} /> }
              : {})}
          >
            <Head {...(pageProps.initialCopy || copy).head} />
            <LanguageSelector />

            <NonFunctionals
              // If the non-functionals are the page component, pass the initial copy
              // fetched from the server instead of the stored copy
              initialCopy={
                router.route === ROUTES.NOT_FOUND ? pageProps.initialCopy : copy
              }
              router={router}
            >
              <AnimatePresence mode="wait" initial={false}>
                <Component key={router.route} router={router} {...pageProps} />
              </AnimatePresence>
            </NonFunctionals>
          </ErrorBoundaryComponent>

          {process.env.IS_DEBUG && <Version />}
          {isMounted
            ? process.env.IS_DEBUG &&
              window.location.hash === '#buildInfo' && <BuildInfo />
            : null}
        </MotionConfig>
      </ThemeProvider>
    </React.StrictMode>
  );
};

export default App;

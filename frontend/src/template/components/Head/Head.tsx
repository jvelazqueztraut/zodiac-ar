import NextHead from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';

import { colors } from 'utils/styles/theme';

import useWindowSize from 'template/hooks/useWindowSize';
import { isAndroid, isInputFocused } from 'template/utils/platform';

export interface HeadProps {
  title: string;
  description: string;
  ogType: string;
  ogImage: {
    url: string;
  };
}

// eslint-disable-next-line prettier/prettier
const defaultViewport = `width=device-width, initial-scale=1.0, shrink-to-fit=no${process.env.ALLOW_USER_ZOOM
    ? ''
    : ',minimum-scale=1.0,maximum-scale=1.0,user-scalable=0'
}, viewport-fit=cover`;

const Head: React.FunctionComponent<HeadProps> = ({
  title,
  description,
  ogType,
  ogImage,
}) => {
  const [isMounted, setMounted] = useState<boolean>(false);
  const [viewport, setViewport] = useState<string>(defaultViewport);
  const router = useRouter();
  const windowSize = useWindowSize();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Prevent Android keyboard shrinking the viewport
    if (isAndroid() && !isInputFocused()) {
      setViewport(
        // eslint-disable-next-line prettier/prettier
        `height=${windowSize.height},width=${windowSize.width
        },initial-scale=1.0${
          process.env.ALLOW_USER_ZOOM
            ? ''
            : ',minimum-scale=1.0,maximum-scale=1.0,user-scalable=0'
        }`
      );
    }
  }, [windowSize]);

  const fullPath = useMemo(
    () => (isMounted && window.location.href) || '',
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMounted, router.asPath]
  );

  const domain = useMemo(
    () => (isMounted && window.location.host) || '',
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMounted, router.asPath]
  );

  return (
    <NextHead>
      <title>{title || ''}</title>
      <meta name="description" content={description || ''} />

      <meta name="theme-color" content={colors.blueRibbon} />
      <meta name="msapplication-TileColor" content={colors.blueRibbon} />
      <link rel="icon" href={'/favicon.ico'} />
      <link
        rel="manifest"
        href={'/manifest.json'}
        crossOrigin="use-credentials"
      />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href={'/favicon-32x32.png'}
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={'/favicon-16x16.png'}
      />
      <link
        rel="mask-icon"
        href={'/safari-pinned-tab.svg'}
        color={colors.blueRibbon}
      />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
      />
      <link
        rel="apple-touch-icon"
        sizes="120x120"
        href={'/apple-icon-120x120.png'}
      />
      <link
        rel="apple-touch-icon"
        sizes="152x152"
        href={'/apple-icon-152x152.png'}
      />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href={'/apple-icon-180x180.png'}
      />

      <meta property="og:url" content={fullPath} />
      <meta property="og:type" content={ogType || ''} />
      <meta property="og:title" content={title || ''} />
      <meta property="og:description" content={description || ''} />
      {ogImage?.url && <meta property="og:image" content={ogImage.url} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:domain" content={domain} />
      <meta property="twitter:url" content={fullPath} />
      <meta property="twitter:title" content={title || ''} />
      <meta property="twitter:description" content={description || ''} />
      {ogImage?.url && <meta name="twitter:image" content={ogImage.url} />}

      <meta name="viewport" content={viewport} />
    </NextHead>
  );
};

export default Head;

import React, { useEffect } from 'react';

import useWindowSize from 'template/hooks/useWindowSize';
import {
  documentZoom,
  isAppleMobile,
  isAppleTablet,
  isDesktop,
  isMobile,
  isRecentIPadSafari,
  isRecentIPhoneSafari,
  isSupportedBrowser,
  isTablet,
  isTouchDevice,
  UA,
} from 'template/utils/platform';

interface CodeStyleProps {
  fontFamily: string;
  textAlign:
    | 'start'
    | 'end'
    | 'left'
    | 'right'
    | 'center'
    | 'justify'
    | 'match-parent';
  fontSize: string;
  fontWeight: number;
  whiteSpace:
    | 'normal'
    | 'pre'
    | 'nowrap'
    | 'pre-wrap'
    | 'pre-line'
    | 'break-spaces';
  background: string;
  padding: string;
  marginTop: string;
}

const codeStyle: CodeStyleProps = {
  fontFamily: 'monospace',
  textAlign: 'left',
  fontSize: '18rem',
  fontWeight: 500,
  whiteSpace: 'pre-wrap',
  background: '#eee',
  padding: '1em',
  marginTop: '22rem',
};

const BuildInfo = () => {
  const {
    width: windowWidth,
    height: windowHeight,
    devicePixelRatio,
  } = useWindowSize();
  const {
    availHeight,
    availWidth,
    colorDepth,
    height,
    orientation,
    pixelDepth,
    width,
  } = window.screen;
  const availLeft = window.screen['availLeft'];
  const availTop = window.screen['availTop'];
  const { angle, onchange, type } = orientation || {};

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 99999,
        backgroundColor: '#fff',
        color: '#000',
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        top: '0',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          lineHeight: '1.25',
          width: '80%',
          margin: '70rem auto',
        }}
      >
        <div
          style={{ fontSize: '135rem', fontWeight: 900, marginBottom: '45rem' }}
        >
          VERSION {process.env.VERSION}
        </div>
        <div
          style={{
            fontSize: '30rem',
            fontWeight: 600,
            marginBottom: '30rem',
          }}
        >
          built on {new Date(process.env.BUILD_DATE).toUTCString()}
        </div>
        <div style={{ fontSize: '30rem', marginBottom: '30rem' }}>
          <span style={{ fontWeight: 600 }}>env</span> : {process.env.NODE_ENV}
        </div>
        <div style={{ fontSize: '30rem', marginBottom: '30rem' }}>
          <span style={{ fontWeight: 600 }}>domain</span> : {process.env.ENV}
        </div>
        <div style={{ fontSize: '30rem', marginBottom: '30rem' }}>
          <span style={{ fontWeight: 600 }}>url</span> :{' '}
          {window.location.pathname}
        </div>
        <div style={{ fontSize: '30rem', marginBottom: '30rem' }}>
          <span style={{ fontWeight: 600 }}>user configuration</span> :
          <pre style={codeStyle}>
            {JSON.stringify(
              {
                ...UA.getResult(),
                language: navigator.language,
                languages: navigator.languages,
                isDesktop: isDesktop(),
                isTouchDevice: isTouchDevice(),
                isMobile: isMobile(),
                isTablet: isTablet(),
                isAppleTablet: isAppleTablet(),
                isRecentIPadSafari: isRecentIPadSafari(),
                isAppleMobile: isAppleMobile(),
                isRecentIPhoneSafari: isRecentIPhoneSafari(),
                isSupportedBrowser: isSupportedBrowser(),
              },
              null,
              ' '
            )}
          </pre>
        </div>
        <div style={{ fontSize: '30rem', marginBottom: '30rem' }}>
          <span style={{ fontWeight: 600 }}>user screen</span> :
          <pre style={codeStyle}>
            {JSON.stringify(
              {
                availHeight,
                availLeft,
                availTop,
                availWidth,
                colorDepth,
                height,
                orientation: {
                  angle: angle ?? window.orientation,
                  onchange,
                  type,
                },
                pixelDepth,
                width,
                innerHeight: windowHeight,
                innerWidth: windowWidth,
                documentZoom: documentZoom(),
                devicePixelRatio,
              },
              null,
              ' '
            )}
          </pre>
        </div>
      </div>
    </div>
  );
};

BuildInfo.displayName = 'BuildInfo';

export default React.memo(BuildInfo);

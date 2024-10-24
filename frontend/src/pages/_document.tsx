import { fromPairs } from 'lodash';
import NextDocument, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import React from 'react';
import { ServerStyleSheet } from 'styled-components';

export default class Document extends NextDocument {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      const cspHeader =
        ctx && ctx.res && ctx.res.getHeaders
          ? (ctx.res.getHeaders()['content-security-policy'] as string) || ''
          : '';
      const cspRules: Record<string, string[]> = fromPairs(
        cspHeader
          .split(';')
          .map(rule => rule.split(' '))
          .map(rule => [rule.slice(0, 1), rule.slice(1)])
      );

      const scriptSrcRules = cspRules['script-src'];
      const nonce = scriptSrcRules
        ? scriptSrcRules.find(rule => rule.match('nonce')) || ''
        : '';

      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: App => props => sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await NextDocument.getInitialProps(ctx);
      return {
        ...initialProps,
        nonce,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    const nonce: string = this.props['nonce']
      ? this.props['nonce'].replace('nonce-', '').replace(/'/g, '')
      : '';
    // Uncomment to enforce the 'nonce' prop on the App component
    // this.props.__NEXT_DATA__.props['nonce'] = nonce;

    return (
      <Html>
        <Head {...(nonce ? { nonce } : {})} />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

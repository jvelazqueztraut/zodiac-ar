//**********************************************************************************//
//
// Below you can find the default and recommended configuration of Security Headers.
// All settings are based on articles and suggestions from the following sources,
// among others:
//
// https://developer.mozilla.org/en-US/docs/Web/HTTP
// https://helmetjs.github.io/
// https://csp-evaluator.withgoogle.com/
// https://webbkoll.dataskydd.net/
// https://content-security-policy.com/
//
// IMPORTANT NOTE!
// If you need to change something here, probably you want to choose an easy way,
// which is never a good option when it comes to the security of your app.
// Rethink your implementation, never use unsafe-inline, and ask DevOps,
// System Architect or one from our Tech Leads for review.
//
// Security Scanners:
// Content Security Policy Evaluator: https://csp-evaluator.withgoogle.com/
// The Mozilla Observatory: https://observatory.mozilla.org/
// Webbkoll: https://webbkoll.dataskydd.net/
// SSL Labs Scanner: https://www.ssllabs.com/ssltest/
//
//**********************************************************************************//

// Vendor CSP rules from https://archive-csp.github.io

const helmet = require('helmet');
const config = require('./../utils/config');
// const { generateRandomString } = require('./../utils/string');

module.exports = function configSecurityHeaders(server) {
  // X-XSS-Protection header is legacy and it is disabled by default by helmet
  // You can find more info about other security headers, which are added by default by helmet here:
  // https://helmetjs.github.io/
  server.use(
    helmet({
      // Strict-Transport-Security header
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      // X-Frame-Options header
      frameguard: {
        action: 'deny',
      },
      // Referrer-Policy header
      referrerPolicy: {
        policy: 'no-referrer',
      },
      // Enabled by default in helmet v5+
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
      originAgentCluster: false,
      // Content-Security-Policy header
      contentSecurityPolicy: {
        // Enabled by default in helmet v5+
        useDefaults: false,
        directives: {
          defaultSrc: ["'self'", 'blob:'],
          fontSrc: ["'self'", 'data:', 'fonts.gstatic.com'],
          scriptSrc: [
            "'self'",
            'blob:',
            // process.env.ENV === 'local' ? "'unsafe-eval'" : '',
            // () => `'nonce-${Buffer.from(generateRandomString()).toString('base64')}'`,
            "'unsafe-eval'",
            "'unsafe-inline'",
            '*.google-analytics.com',
            '*.googletagmanager.com',
            'https://browser.sentry-cdn.com',
          ],
          scriptSrcAttr: ["'none'"],
          objectSrc: ['data:'],
          frameSrc: ['*.google-analytics.com', '*.googletagmanager.com'],
          connectSrc: [
            "'self'",
            'data:',
            'ws:',
            '*.sentry.io',
            ...(config.ENV === 'local'
              ? [
                  'localhost:3000',
                  'localhost:3001',
                  'localhost:1337',
                  'ws://bs-local.com:3000',
                  'wss://bs-local.com:3001',
                  ...(config.LOCAL_IP
                    ? [
                        `${config.LOCAL_IP}:3000`,
                        `${config.LOCAL_IP}:3001`,
                        `${config.LOCAL_IP}:1337`,
                        `ws://${config.LOCAL_IP}:3000`,
                        `wss://${config.LOCAL_IP}:3001`,
                      ]
                    : []),
                ]
              : []),
            'storage.googleapis.com',
            '*.google-analytics.com',
            '*.googletagmanager.com',
            'fonts.gstatic.com',
            'data:',
            'blob:',
            config.PUBLIC_URL,
            config.CMS_GRAPHQL_URL,
          ],
          imgSrc: [
            "'self'",
            'data:',
            'blob:',
            '*.google-analytics.com',
            '*.googletagmanager.com',
            'storage.googleapis.com',
          ],
          mediaSrc: ["'self'", 'blob:', 'storage.googleapis.com'],
          styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          workerSrc: ["'self'", 'blob:'],
          manifestSrc: ["'self'"],
          reportUri: config.SENTRY_CSP_ENDPOINT
            ? [`${config.SENTRY_CSP_ENDPOINT}&sentry_environment=${config.ENV}`]
            : [],
          blockAllMixedContent: [],
        },
      },
    })
  );
};

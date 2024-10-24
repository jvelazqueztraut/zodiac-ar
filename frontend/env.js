const pkg = require('./package.json');
const os = require('os');

const ipList = os.networkInterfaces()['Wi-Fi']
  ? os.networkInterfaces()['Wi-Fi']
  : Object.values(os.networkInterfaces());
const matchingIp = ipList.flat().find(i => i.family === 'IPv4' && !i.internal);
const IP = matchingIp ? matchingIp.address : 'localhost';

let ciEnv;
try {
  ciEnv = require('./.env.json');
} catch (e) {
  ciEnv = {};
}

Object.keys(ciEnv).forEach(key => {
  try {
    ciEnv[key] = JSON.parse(ciEnv[key]);
  } catch (e) {}
});

const ENV = ciEnv.ENV || ciEnv.NODE_ENV || process.env.NODE_ENV || 'local';
const IS_DEBUG = !['staging', 'production'].includes(ENV);
const DEFAULT_LOCALE = 'en';
const LOCAL_HTTPS = false;
const LOCAL_PORT = +(ciEnv.PORT || process.env.PORT || 3000);
const PUBLIC_URL =
  ciEnv.PUBLIC_URL ||
  process.env.PUBLIC_URL ||
  `http${LOCAL_HTTPS ? 's' : ''}://${IP}:${LOCAL_HTTPS ? LOCAL_PORT + 1 : LOCAL_PORT}`;

if (ENV === 'local' && LOCAL_HTTPS) {
  // Important: only on local. Disables SSL validity checks
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
}

/**
 * Begin user config.
 */
const DEFAULT_ENV = {
  ENV,
  IS_DEBUG,
  VERSION:
    ciEnv.BITBUCKET_BUILD_NUMBER ||
    process.env.BITBUCKET_BUILD_NUMBER ||
    pkg.version,
  BUILD_DATE: new Date(),
  LOCAL_IP: IP,
  LOCAL_HTTPS,
  LOCAL_PORT,

  PWA: false,
  ALLOW_USER_ZOOM: false,
  USE_LINEAR_SCALING: false,

  DEFAULT_LOCALE,
  LOCALES: [DEFAULT_LOCALE],
  USE_BROWSER_LOCALE: true,
  USE_GEOIP_LOCALE: false,
  GEOIP_MAPPING: {},

  PUBLIC_URL,
  PUBLIC_PATH: '/_next/static',
  CMS_GRAPHQL_URL:
    ciEnv.CMS_GRAPHQL_URL ||
    process.env.CMS_GRAPHQL_URL ||
    `http://${IP}:1337/graphql`,
  SENTRY_DSN: ciEnv.SENTRY_DSN || process.env.SENTRY_DSN,
  SENTRY_CSP_ENDPOINT: ciEnv.SENTRY_DSN_CSP || process.env.SENTRY_DSN_CSP,
  API_URL: ciEnv.API_URL || process.env.API_URL || PUBLIC_URL,

  GTM_ID: 'GTM-XXXXXXX',
};

const env = {
  // Default / local values
  ...DEFAULT_ENV,

  // Override with process.env
  ...ciEnv,
};

Object.keys(env).forEach(key => (process.env[key] = env[key]));

console.log('env variables config');
console.log(env);

console.log('final env variables');
console.log(process.env);

module.exports = env;

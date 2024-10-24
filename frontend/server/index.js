const express = require('express');
const next = require('next');
const basicAuth = require('express-basic-auth');

const fs = require('fs');
const path = require('path');
const proxy = require('http-proxy');

const config = require('./utils/config');
const configureSecurityHeaders = require('./middlewares/configureSecurityHeaders');
// const forceHttps = require('./middlewares/forceHttps');
const localeDetection = require('./middlewares/localeDetection');

const dev = process.env.NODE_ENV === 'local';
const port = (dev ? config.LOCAL_PORT : process.env.PORT) ?? config.LOCAL_PORT;
const httpsPort = port + 1;
const app = next({
  dev,
  port: config.LOCAL_HTTPS ? httpsPort : port,
  hostname: config.PUBLIC_URL.replace(/^http(s)?:\/\//, '').replace(/:\d+$/, ''),
});
const handle = app.getRequestHandler();

(async () => {
  await app.prepare();
  const server = express();

  if (
    !dev &&
    config.BASIC_AUTH_PASSWORD !== '' &&
    config.BASIC_AUTH_PASSWORD !== undefined &&
    config.BASIC_AUTH_PASSWORD !== 'disable'
  ) {
    const basicAuthConfig = {
      users: {
        [config.BASIC_AUTH_USERNAME]: config.BASIC_AUTH_PASSWORD,
      },
      challenge: true,
    };
    server.use(basicAuth(basicAuthConfig));
  }

  // if (!dev) server.use(forceHttps); // Enabled by default with Cloud Run
  if (config.USE_BROWSER_LOCALE || config.USE_GEOIP_LOCALE)
    server.use(localeDetection);

  configureSecurityHeaders(server);
  // Add any middleware requiring a CSP check here

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  if (dev && config.LOCAL_HTTPS) {
    proxy
      .createServer({
        xfwd: true,
        ws: true,
        target: {
          host: config.LOCAL_IP,
          port,
        },
        ssl: {
          key: fs.readFileSync(
            path.join(__dirname, './certificates/localhost-key.pem'),
            'utf8'
          ),
          cert: fs.readFileSync(
            path.join(__dirname, './certificates/localhost.pem'),
            'utf8'
          ),
        },
      })
      .listen(httpsPort);

    console.log(`> SSL ready on https://${config.LOCAL_IP}:${httpsPort}`);
  }

  server.listen(port);
  console.log(`> Ready on http://${config.LOCAL_IP}:${port}`);
})();

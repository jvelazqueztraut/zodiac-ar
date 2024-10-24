const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');

const env = require('./env');
const AssetManifestPlugin = require('./scripts/generate_asset_manifest');

const isPWA = env.PWA && env.ENV === 'production';

const withPWA = require('next-pwa')({
  disable: !isPWA,
  dest: 'public',
  scope: '/',
  buildExcludes: [/chunks\/images\/.*$/], //we are using next-optimized-images
});
const withImages = require('next-images');
const withVideos = require('next-videos');

const nextConfig = {
  env,
  productionBrowserSourceMaps: env.ENV !== 'production',
  publicRuntimeConfig: {
    ...Object.fromEntries(
      Object.entries(env).filter(([key]) => [
        'PUBLIC_URL',
        'API_URL',
      ].includes(key))
    ),
  },
  serverRuntimeConfig: {
    ...env,
  },
  i18n: {
    locales: env.LOCALES,
    defaultLocale: env.DEFAULT_LOCALE,
    localeDetection: !env.USE_BROWSER_LOCALE && !env.USE_GEOIP_LOCALE,
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['storage.googleapis.com'],
    path: '/_next/image',
    loader: 'default',
    disableStaticImages: true,
  },
  webpack: (config, options) => {
    if (!options.isServer) {
      config.resolve.alias['@sentry/node'] = '@sentry/browser';
    }

    config.module.rules = [
      ...config.module.rules
        .map(rule => {
          const svgOrMatchRegex = /(svg\|)|(\|svg)/;
          if (rule.test && rule.test.toString().match(svgOrMatchRegex)) {
            return {
              ...rule,
              test: new RegExp(rule.test.source.replace(svgOrMatchRegex, '')),
            };
          }

          return rule;
          // Filter out pre-existing rules we need to customise
        })
        .filter(
          rule =>
            !rule.test ||
            (rule.test && ['.svg', '.mp3'].every(ext => !rule.test.test(ext)))
        ),
      {
        test: /\.svg$/,
        use: [require.resolve('@svgr/webpack'), require.resolve('url-loader')],
      },
      {
        test: /\.mp3$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1000000,
              publicPath: `${env.PUBLIC_PATH}/sounds/`,
              outputPath: 'static/sounds/',
            },
          },
        ],
      },
      {
        test: /\.glb$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath: `${env.PUBLIC_PATH}/models/`,
              outputPath: 'static/models/',
            },
          },
        ],
      },
      {
        test: /\.hdr$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath: `${env.PUBLIC_PATH}/hdri/`,
              outputPath: 'static/hdri/',
            },
          },
        ],
      },
    ];

    config.plugins.push(new AssetManifestPlugin({ isPWA }));

    if (env.ENV !== 'local') {
      config.plugins.push(sentryWebpackPlugin({
        org: env.BITBUCKET_REPOSITORY_OWNER,
        project: `${env.BITBUCKET_REPOSITORY_SLUG}-frontend`,
        authToken: env.SENTRY_AUTH_TOKEN,
        environment: env.ENV,
        release: env.VERSION,
      }));
    }

    return config;
  },
};

module.exports = [withPWA, withImages, withVideos].reduce(
  (config, plugin) => plugin(config),
  nextConfig
);

const { dirname, join } = require('path');
const webpack = require('webpack');

const env = require('./../env');
const AssetManifestPlugin = require('./../scripts/generate_asset_manifest');

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
*/
function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

// https://github.com/storybookjs/storybook/issues/12270#issuecomment-1039631674
function injectEnv(definitions) {
  const envKey = 'process.env';

  if (!definitions[envKey]) {
    return {
      ...definitions,
      [envKey]: JSON.stringify(
        Object.fromEntries(
          Object.entries(definitions)
            .filter(([key, value]) => key.startsWith(envKey) && value)
            .map(([key, value]) => [key.substring(envKey.length + 1), JSON.parse(value)]),
        ),
      ),
    }
  }

  return definitions;
}

const addWebpack5Overrides = (config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    modules: ['node_modules', './../src'],
    fallback: {
      ...config.resolve.fallback,
      buffer: require.resolve('buffer'),
      stream: require.resolve('stream-browserify'),
    },
  },
  module: {
    ...config.module,
    rules: [
      ...(
        config.module.rules.map((rule) => {
          const svgOrMatchRegex = /(svg\|)|(\|svg)/;
          if (rule.test && rule.test.toString().match(svgOrMatchRegex)) {
            return {
              ...rule,
              test: new RegExp(rule.test.source.replace(svgOrMatchRegex, ''))
            }
          }

          return rule;
          // Filter out pre-existing rules we need to customise
        }).filter((rule) => !rule.test || (rule.test && ['.svg', '.png', '.jpg', '.mp3'].every(ext => !rule.test.test(ext))))
      ),
      {
        test: /\.svg$/,
        use: [require.resolve('@svgr/webpack'), require.resolve('url-loader')],
      },
      {
        test: /\.(png|jpg|mp3)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1000000,
            },
          },
        ],
      },
      {
        test: /\.glb$/,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.hdr$/,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    ...config.plugins.map((plugin) => {
      if (plugin instanceof webpack.DefinePlugin) {
        return new webpack.DefinePlugin(
          injectEnv({
            ...plugin.definitions,
            ...Object.fromEntries(
              Object.entries({
                ...env,
                IS_STORYBOOK: true,
              }).map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)]),
            ),
          })
        );
      }

      return plugin;
    }),
    new AssetManifestPlugin({
      outputFile: 'asset-manifest.json',
      isStorybook: true,
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
});

module.exports = {
  stories: [
    './../src/**/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],
  addons: [
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-actions'),
    getAbsolutePath('@storybook/addon-backgrounds'),
    getAbsolutePath('@storybook/addon-viewport'),
  ],
  staticDirs: ['./../public'],
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: false,
  },
  babel: async (options) => ({
    ...options,
    presets: [
      [
        // https://stackoverflow.com/a/60990210
        '@babel/preset-env',
        {
          shippedProposals: true,
          loose: true,
          targets: {
            esmodules: true,
          },
        }
      ],
      ...options.presets.slice(1),
      '@babel/preset-typescript',
      '@babel/preset-react',
    ],
  }),
  webpackFinal: async (config) => {
    return addWebpack5Overrides(config);
  },
  framework: {
    name: getAbsolutePath('@storybook/nextjs'),
    options: {
      fastRefresh: true,
      strictMode: true,
    },
  },
};

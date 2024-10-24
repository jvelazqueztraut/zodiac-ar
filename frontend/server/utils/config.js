const getNextConfig = require('next/config').default;

let env = {};

try {
  env = require('../../.env.json');
} catch (e) {}

module.exports = {
  ...getNextConfig().serverRuntimeConfig,
  ...env,
};

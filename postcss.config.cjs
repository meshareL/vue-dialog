/* eslint-disable */
const presetEnv = require('postcss-preset-env');

module.exports = {
    plugins: [ presetEnv({ minimumVendorImplementations: 2 }) ]
};

/**
 * Webpack production specific build configurations
 * Specifies JS entry point out of which the bundle is created.
 * React/ReactDOM are added as external libraries, so they are not included in the bundle.
 */

const merge = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'production'
});

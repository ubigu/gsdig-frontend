/**
 * Webpack production specific build configurations
 */
require('dotenv').config();
const merge = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development',
  ...(process.env.WATCH_MODE === 'poll'
    ? {
        watchOptions: {
          poll: 1000,
        },
      }
    : {}),
  devtool: 'inline-source-map',
  devServer: {
    host: '0.0.0.0',
    contentBase: './dist',
    historyApiFallback: true,
    port: process.env.PORT ?? 8081,
    proxy: {
      '/api': {
        target: process.env.API_URL ?? 'http://127.0.0.1:8080',
        pathRewrite: {"^/api": ""}
      },
      '/ws': {
        target: process.env.WS_URL ?? 'ws://server:3000',
        ws: true,
      },
    },
  },
});

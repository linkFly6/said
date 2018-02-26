const utils = require('./utils')
const webpack = require('webpack')
const config = require('./config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const version = JSON.stringify(require('../package.json').version)
const env = process.env.NODE_ENV || 'development'

// add hot-reload related code to entry chunks
if (env === 'development') {
  Object.keys(baseWebpackConfig.entry).forEach(function (name) {
    baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name])
  })
}


var plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(env),
    'process.env.VERSION': version,
    'process.env.LOGIN': "'http://common-mfe.didistatic.com/static/mfe/common-login/0.3.21/login.test.js'"
  })]

if (env === 'development') {
  plugins.push(new webpack.HotModuleReplacementPlugin())
}
plugins.push(new webpack.NoEmitOnErrorsPlugin(),
  new HtmlWebpackPlugin({
    version,
    filename: config[env].index,
    template: './client/index.template.html',
    inject: true
  }),
  new FriendlyErrorsPlugin())

module.exports = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config[env].cssSourceMap })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: '#cheap-module-eval-source-map',
  plugins: plugins
})

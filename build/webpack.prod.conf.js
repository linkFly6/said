const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('./config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const version = JSON.stringify(require('../package.json').version)
const env = process.env.NODE_ENV || 'production'


let plugins = [
  // http://vuejs.github.io/vue-loader/en/workflow/production.html
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(env),
    'process.env.VERSION': version,
  }),
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    },
    output: {
      ascii_only: true
    }
    // sourceMap: true
  }),
  // extract css into its own file
  new ExtractTextPlugin({
    filename: utils.assetsPath('[name].[hash:7].css')
  }),
  // Compress extracted CSS. We are using this plugin so that possible
  // duplicated CSS from different components can be deduped.
  new OptimizeCSSPlugin({
    cssProcessorOptions: {
      safe: true
    }
  }),
  // split vendor js into its own file
  new webpack.optimize.CommonsChunkPlugin({
    name: 'app',
    // 提取公共木块
    async: 'vendors',
    /**
     * 异步组件里面引用的 node_modules 不会被提取成公共模块
     * fuck webpack https://github.com/webpack/webpack/issues/4850
     * https://github.com/webpack/webpack/issues/5109#issuecomment-311154920
     * https://github.com/lyyourc/webpack-code-splitting-demo/issues/2
     * https://github.com/webpack/webpack/issues/5101
     * 因为 ^webpack 2.5.1 以后必须 name 和 entry chunk name 保持一致才可以抽离，mmp 网上那些文章全是错的
     */
    minChunks: function (module, count) {
      // if (module.resource && /^.*\.(css|scss|styl)$/.test(module.resource)) {
      //   return false
      // }
      // return module.context && module.context.indexOf("node_modules") !== -1
      return count >= 2
    },
    children: true
  }),
  // // extract webpack runtime and module manifest to its own file in order to
  // // prevent vendor hash from being updated whenever app bundle is updated
  new webpack.optimize.CommonsChunkPlugin({
    name: 'manifest',
    chunks: ['vendor']
  }),
  // generate dist index.html with correct asset hash for caching.
  // you can customize output by editing /index.html
  // see https://github.com/ampedandwired/html-webpack-plugin
  new HtmlWebpackPlugin({
    version,
    filename: config[env].index,
    template: './client/index.template.html',
    inject: true,
    minify: {
      minifyJS: true,
      // 我屮艸芔茻... 把 removeComments 写成 true 就各种 js 报错，写成 false 就没事了，4 个小时的 debug 我擦！
      removeComments: false,
      collapseWhitespace: true,
      removeAttributeQuotes: true
      // more options:
      // https://github.com/kangax/html-minifier#options-quick-reference
    },
    // necessary to consistently work with multiple chunks via CommonsChunkPlugin
    chunksSortMode: 'dependency'
  }),
  // copy custom static assets
  // new CopyWebpackPlugin([
  //   {
  //     from: path.resolve(__dirname, '../static'),
  //     to: config.build.assetsSubDirectory,
  //     ignore: ['.*']
  //   }
  // ])
]
var webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config[env].sourceMap,
      extract: true
    })
  },
  // devtool: config.build.productionSourceMap ? '#source-map' : false,
  output: {
    // path: config.build.assetsRoot,
    // filename: utils.assetsPath('js/[name].[chunkhash].js'),
    // chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
    filename: '[name].[chunkHash:7].js',
    chunkFilename: '[name].[chunkHash:7].js'
  },
  plugins,
})

// if (config.build.productionGzip) {
//   var CompressionWebpackPlugin = require('compression-webpack-plugin')

//   webpackConfig.plugins.push(
//     new CompressionWebpackPlugin({
//       asset: '[path].gz[query]',
//       algorithm: 'gzip',
//       test: new RegExp(
//         '\\.(' +
//         config.build.productionGzipExtensions.join('|') +
//         ')$'
//       ),
//       threshold: 10240,
//       minRatio: 0.8
//     })
//   )
// }

if (config[env].bundleAnalyzerReport) {
  var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(  // 如果要查看报告就打开，否则注释掉
    new BundleAnalyzerPlugin({
      // Can be `server`, `static` or `disabled`. 
      // In `server` mode analyzer will start HTTP server to show bundle report. 
      // In `static` mode single HTML file with bundle report will be generated. 
      // In `disabled` mode you can use this plugin to just generate Webpack Stats JSON file by setting `generateStatsFile` to `true`. 
      analyzerMode: 'server',
      // Host that will be used in `server` mode to start HTTP server. 
      analyzerHost: '127.0.0.1',
      // Port that will be used in `server` mode to start HTTP server. 
      analyzerPort: 8888,
      // Path to bundle report file that will be generated in `static` mode. 
      // Relative to bundles output directory. 
      reportFilename: 'report.html',
      // Module sizes to show in report by default. 
      // Should be one of `stat`, `parsed` or `gzip`. 
      // See "Definitions" section for more information. 
      defaultSizes: 'parsed',
      // Automatically open report in default browser 
      openAnalyzer: true,
      // If `true`, Webpack Stats JSON file will be generated in bundles output directory 
      generateStatsFile: false,
      // Name of Webpack Stats JSON file that will be generated if `generateStatsFile` is `true`. 
      // Relative to bundles output directory. 
      statsFilename: 'stats.json',
      // Options for `stats.toJson()` method. 
      // For example you can exclude sources of your modules from stats file with `source: false` option. 
      // See more options here: https://github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21 
      statsOptions: null,
      // Log level. Can be 'info', 'warn', 'error' or 'silent'. 
      logLevel: 'info'
    }))
}

module.exports = webpackConfig

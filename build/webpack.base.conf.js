const path = require('path')
const utils = require('./utils')
const config = require('./config')
const vueLoaderConfig = require('./vue-loader.conf')
const tsImportPluginFactory = require('ts-import-plugin')
const env = process.env.NODE_ENV || 'production'

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  entry: {
    app: './client/app.ts'
  },
  output: {
    path: config[env].assetsRoot,
    publicPath: config[env].assetsPublicPath,
    crossOriginLoading: "anonymous",
    filename: '[name].js',
    chunkFilename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json', '.styl'],
    alias: {
      'vue$': 'vue/dist/vue.runtime.esm.js',
      '@': resolve('client'),
      'views': resolve('client/views'),
      'api': resolve('client/api'),
      'components': resolve('client/components'),
      'utils': resolve('client/utils'),
      'models': resolve('client/models'),
      'types': resolve('types')
    }
  },
  module: {
    rules: [
      // {
      //   test: /\.(js|vue)$/,
      //   loader: 'eslint-loader',
      //   enforce: 'pre',
      //   include: [resolve('src'), resolve('test')],
      //   options: {
      //     formatter: require('eslint-friendly-formatter')
      //   }
      // },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig,
        exclude: /node_modules\/(?!(?:mfe-|@didi\/))/
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: [/node_modules\/(?!(?:mfe-|@didi\/))/, /node_modules\/@didi\/(?!mfe-vuex-ts-decorators)/],
        options: {
          appendTsSuffixTo: [/\.vue$/],
          transpileOnly: true,
          // mfd 组件做了按需加载，按需加载有问题，参见这里：https://github.com/Brooooooklyn/ts-import-plugin
          // 所以使用这个解决
          getCustomTransformers: () => ({
            before: [tsImportPluginFactory({
              "libraryName": "@didi/mand-mobile",
              "style": true
            })]
          }),
        }
      },
      /**
       * 理论上来说已经不再需要 babel，但是考虑到兼容性，使用 babel 兜底
       * 起因： ada 提供的包不是编译后的包，所以需要使用 babel 自行编译，考虑到可能还有其他一些 es6 的包引入的风险，所以使用 babel 兜底
       */
      {
        test: /\.js$/,
        loader: 'babel-loader?cacheDirectory',
        // include: [resolve('src'), resolve('test')]
        exclude: /node_modules\/(?!(?:mfe-|@didi\/))/,
      },
      {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
        include: [resolve('client/assets/icons')],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        },
        exclude: [/node_modules\/(?!(?:mfe-|@didi\/))/, resolve('client/assets/icons')],
      },
      {
        test: /\.(wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        },
        exclude: /node_modules\/(?!(?:mfe-|@didi\/))/,
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        },
        exclude: /node_modules\/(?!(?:mfe-|@didi\/))/,
      }
    ]
  }
}

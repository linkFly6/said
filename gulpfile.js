// 使用 gulp 将 src/view 中的 pug copy 到 dist 目录中
// 只用与开发环境，因为发生产在打包的时候直接 copy view 到 dist 就可以了，只有开发环境需要 watch 变动

const path = require('path')
const gulp = require('gulp')
const webpack = require('webpack')
const PluginError = require('plugin-error');
const log = require('fancy-log');
var isProduct = process.env.NODE_ENV === 'production'

var createWebpackEntry = () => {
  // var pre = ['./src/public/js/main.ts']
  return {
    // 'blog-detail': pre.concat('./src/public/js/blog-detail.ts'),
    'blog-detail': ['./src/public/js/blog-detail.ts'],
    'main': ['./src/public/js/main.ts'],
    'blog-index': ['./src/public/js/blog-index.ts'],
    'said-detail': ['./src/public/js/said-detail.ts'],
    'home-about': ['./src/public/js/home-about.ts'],
    // 移动页面
    './mobile/app-mobile': ['./src/public/js/mobile/app-mobile.ts'],
    './mobile/said-mobile-index': ['./src/public/js/mobile/said-mobile-index.ts'],
    './mobile/said-mobile-detail': ['./src/public/js/mobile/said-mobile-detail.ts'],
    './mobile/blog-mobile-detail': ['./src/public/js/mobile/blog-mobile-detail.ts'],
    './mobile/blog-mobile-detail': ['./src/public/js/mobile/blog-mobile-detail.ts'],
    './mobile/home-about-mobile': ['./src/public/js/mobile/home-about-mobile.ts'],
  }
}

function resolve (dir) {
  return path.join(__dirname, dir)
}
function resolveNodeModules () {
  return path.join(__dirname, path.join.apply(path, arguments))
}

var webpackConfig = {
  watch: false,
  // devtool: '#cheap-module-eval-source-map',
  entry: createWebpackEntry(),
  output: {
    path: __dirname + '/dist/public/js',
    // publicPath
    filename: '[name].js',
    // filename: '[name].[chunkHash:7].js',
    // chunkFilename: '[name].[chunkHash:7].js'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      // sb 的 scrollmagic 和 gsap 包管理
      'TweenLite': resolveNodeModules('node_modules', 'gsap/src/uncompressed/TweenLite.js'),
      'TweenMax': resolveNodeModules('node_modules', 'gsap/src/uncompressed/TweenMax.js'),
      'TimelineLite': resolveNodeModules('node_modules', 'gsap/src/uncompressed/TimelineLite.js'),
      'TimelineMax': resolveNodeModules('node_modules', 'gsap/src/uncompressed/TimelineMax.js'),
      'ScrollMagic': resolveNodeModules('node_modules', 'scrollmagic/scrollmagic/uncompressed/ScrollMagic.js'),
      'scrollmagic.animation.gsap': resolveNodeModules('node_modules', 'scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap.js'),
      'debug.addIndicators': resolveNodeModules('node_modules', 'scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators.js'),
    }
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: [
          {
            loader: 'babel-loader?cacheDirectory&babelrc=false',
            options: {
              // babel 新的设置方式，默认编译目标参考 https://github.com/ai/browserslist#queries
              presets: [
                '@babel/preset-env'
                // [
                //   '@babel/preset-env', {
                //     "targets": {
                //       "browsers": ["ie 8"]
                //     },
                //   }
                // ]
              ],
              plugins: [
                // '@babel/transform-runtime'
                ['@babel/transform-runtime', {
                  esmodules: true,
                }]
              ],
            }
          },
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                sourceMap: !isProduct
              },
            }
          }
        ],
        exclude: /node_modules/,
      },
    ]
  },
  plugins: []
  // plugins: {
  //   new webpack.optimize.UglifyJsPlugin({
  //     compress: {
  //       warnings: false
  //     },
  //     output: {
  //       ascii_only: true
  //     }
  //     // sourceMap: true
  //   }),
  //   new webpack.optimize.CommonsChunkPlugin({
  //     name: 'app',
  //     // 提取公共木块
  //     async: 'vendors',
  //     /**
  //      * 异步组件里面引用的 node_modules 不会被提取成公共模块
  //      * fuck webpack https://github.com/webpack/webpack/issues/4850
  //      * https://github.com/webpack/webpack/issues/5109#issuecomment-311154920
  //      * https://github.com/lyyourc/webpack-code-splitting-demo/issues/2
  //      * https://github.com/webpack/webpack/issues/5101
  //      * 因为 ^webpack 2.5.1 以后必须 name 和 entry chunk name 保持一致才可以抽离，mmp 网上那些文章全是错的
  //      */
  //     minChunks: function (module, count) {
  //       // if (module.resource && /^.*\.(css|scss|styl)$/.test(module.resource)) {
  //       //   return false
  //       // }
  //       // return module.context && module.context.indexOf("node_modules") !== -1
  //       return count >= 2
  //     },
  //     children: true
  //   }),
  // }
}
if (isProduct) {
  webpackConfig.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      output: {
        ascii_only: true
      }
      // sourceMap: true
    }),
  )
}

// webpack 编译器
const devCompiler = webpack(webpackConfig)



// copy pug 文件
gulp.task('copy-views', function () {
  return gulp.src('./src/views/**').pipe(gulp.dest('./dist/views/'))
})

// copy 图片资源
gulp.task('copy-images', function () {
  return gulp.src('./src/public/images/**').pipe(gulp.dest('./dist/public/images/'))
})

// 字体文件
gulp.task('copy-fonts', function () {
  return gulp.src('./src/public/fonts/**').pipe(gulp.dest('./dist/public/fonts/'))
})

// copy 后端文件
gulp.task('copy-backend-static', function () {
  return gulp.src('./src/public/backend/**').pipe(gulp.dest('./dist/public/backend/'))
})

// .env
gulp.task('copy-env-file', function () {
  return gulp.src('./.env').pipe(gulp.dest('./dist/'))
})


// 编译客户端 js
gulp.task('compile-client-ts', function (cb) {
  // return gulp.src('./src/public/js/*.ts')
  //   .pipe(devCompiler.run())
  //   .pipe(gulp.dest('./dist/public/js/'))
  devCompiler.run(function (err, status) {
    if (err) {
      cb(err)
      throw PluginError('webpack:build', err, { showStack: true });
    }
    log('[webpack:build-dev]', status.toString({
      colors: true
    }));
    cb()
  })
})

function watch () {
  gulp.watch('src/views/**', gulp.series('copy-views'))
  gulp.watch('src/public/images/**', gulp.series('copy-images'))
  gulp.watch('./src/public/backend/**', gulp.series('copy-backend-static'))
  gulp.watch('./src/public/js/**', gulp.series('compile-client-ts'))
}

gulp.task('build', gulp.series(
  'copy-env-file',
  'copy-views',
  'copy-images',
  'copy-fonts',
  'copy-backend-static',
  'compile-client-ts'))

gulp.task('default', gulp.series('build', watch))

/**
 * production 版的打包
 */
gulp.task('build-production', gulp.series('build'))

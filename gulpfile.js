// 使用 gulp 将 src/view 中的 pug copy 到 dist 目录中
// 只用与开发环境，因为发生产在打包的时候直接 copy view 到 dist 就可以了，只有开发环境需要 watch 变动

var gulp = require('gulp')
var watch = require('gulp-watch')
var webpack = require('webpack-stream')

// copy pug 文件
gulp.task('copy-views', function () {
  gulp.src('./src/views/**').pipe(gulp.dest('./dist/views/'))
})
// copy 图片资源
gulp.task('copy-images', function () {
  gulp.src('./src/public/images/**').pipe(gulp.dest('./dist/public/images/'))
})

var createWebpackEntry = () => {
  // var pre = ['./src/public/js/main.ts']
  return {
    // 'blog-detail': pre.concat('./src/public/js/blog-detail.ts'),
    'blog-detail': ['./src/public/js/blog-detail.ts'],
    'main': ['./src/public/js/main.ts'],
    'blog-index': ['./src/public/js/blog-index.ts'],
    'said-detail': ['./src/public/js/said-detail.ts'],
  }
}


// 编译客户端 js
gulp.task('compile-client-ts', function () {
  return gulp.src('./src/public/js/*.ts')
    .pipe(webpack({
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
        extensions: ['.ts', '.js']
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
              'ts-loader'
            ],
            exclude: /node_modules/,
          },
        ]
      },
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
    }))
    .pipe(gulp.dest('./dist/public/js/'))
})

gulp.task('default', function () {
  watch('src/views/**', function () {
    gulp.run('copy-views')
  })
  watch('src/public/images/**', function () {
    gulp.run('copy-images')
  })
  watch('./src/public/js/**', function () {
    gulp.run('compile-client-ts')
  })
  gulp.run('copy-views')
  gulp.run('copy-images')
  gulp.run('compile-client-ts')
})

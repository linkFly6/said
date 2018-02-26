// 使用 gulp 将 src/view 中的 pug copy 到 dist 目录中
// 只用与开发环境，因为发生产在打包的时候直接 copy view 到 dist 就可以了，只有开发环境需要 watch 变动

var gulp = require('gulp')
var watch = require('gulp-watch')
var webpack = require('webpack-stream')

gulp.task('copy-views', function () {
  gulp.src('./src/views/**').pipe(gulp.dest('./dist/views/'))
})
gulp.task('copy-images', function () {
  gulp.src('./src/public/images/**').pipe(gulp.dest('./dist/public/images/'))
})

gulp.task('compile-client-ts', function () {
  return gulp.src('./src/public/js/*.ts')
    .pipe(webpack({
      entry: {
        'blog-detail': './src/public/js/blog-detail.ts',
        'main.ts': './src/public/js/main.ts'
      },
      output: {
        path: __dirname + '/dist/public/js',
        // publicPath
        filename: '[name].js',
      },
      resolve: {
        extensions: ['.ts']
      },
      module: {
        rules: [
          {
            test: /\.ts?$/,
            loader: 'ts-loader',
            exclude: [/node_modules\//],
          }
        ]
      }
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
})

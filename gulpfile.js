// 使用 gulp 将 src/view 中的 pug copy 到 dist 目录中
// 只用与开发环境，因为发生产在打包的时候直接 copy view 到 dist 就可以了，只有开发环境需要 watch 变动

var gulp = require('gulp')
var watch = require('gulp-watch')

gulp.task('copy-views', function () {
  gulp.src('./src/views/**').pipe(gulp.dest('./dist/views/'))
})
gulp.task('copy-images', function () {
  gulp.src('./src/public/images/**').pipe(gulp.dest('./dist/public/images/'))
})

gulp.task('default', function () {
  watch('src/views/**', function () {
    gulp.run('copy-views')
  })
  watch('src/public/images/**', function () {
    gulp.run('copy-images')
  })
})

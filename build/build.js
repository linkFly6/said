// https://github.com/shelljs/shelljs
require('shelljs/global')

const path = require('path')
const config = require('./config')
const ora = require('ora')
const webpack = require('webpack')
const webpackConfig = require('./webpack.prod.conf')
const env = process.env.NODE_ENV || 'production'

const spinner = ora('building output for ' + env + '...')
spinner.start()
const assetsPath = path.join(config[env].assetsRoot)
// var assetsSubDirectory = config[env].assetsSubDirectory

rm('-rf', assetsPath)
mkdir('-p', assetsPath)
// cp('-R', assetsSubDirectory, assetsPath + '/' + assetsSubDirectory)

webpack(webpackConfig, function (err, stats) {
  spinner.stop()
  if (err) console.log(err.stack)
  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n')
})

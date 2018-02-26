var utils = require('./utils')
const config = require('./config')
const env = process.env.NODE_ENV || 'production'

module.exports = {
  loaders: utils.cssLoaders({
    sourceMap: config[env].sourceMap,
    extract: env === 'production'
  }),
  transformToRequire: {
    video: 'src',
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  }
}

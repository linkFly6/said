// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path')


function staticUrl(env, namespace) {
  var prefix, result
  switch (env) {
    case 'production':
      prefix = '//tasaid.com'
      result = `${prefix}/${namespace}/`
      break
    case 'pre':
    case 'preview':
      prefix = `//tasaid.com/${namespace}/pre`
      result = `${prefix}/`
      break
      break
    default:
      result = '/'
      break
  }
  return result
}

var NAME_SPACE = require('../package.json').displayName

const publicPath = staticUrl(process.env.NODE_ENV || 'production', NAME_SPACE)


module.exports = {
  development: {
    assetsRoot: path.resolve(__dirname, '../output.client'),
    assetsPublicPath: publicPath,
    index: 'index.html',
    sourceMap: false,
    proxyTable: {},
    autoOpenBrowser: true,
    // ports
  },
  test: {
    assetsRoot: path.resolve(__dirname, '../output.client'),
    assetsPublicPath: publicPath,
    index: 'index.html',
    sourceMap: false,
    proxyTable: {},
    // ports
  },
  pre: {
    assetsRoot: path.resolve(__dirname, '../output.client'),
    assetsPublicPath: publicPath,
    index: 'index.html',
    sourceMap: false,
    proxyTable: {},
    // ports
  },
  production: {
    assetsRoot: path.resolve(__dirname, '../output.client'),
    assetsPublicPath: publicPath,
    index: path.resolve(__dirname, '../output.client/index.html'),
    sourceMap: false,
    proxyTable: {},
    // 是否查看报告，注意！！上线环境中禁止打开，否则会阻塞打包代码（因为会尝试打开浏览器并监听端口），只有性能调优才可以打开
    bundleAnalyzerReport: false,
    // ports
  }
}

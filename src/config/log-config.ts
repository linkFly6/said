// const rln = /\[(.*)\]/
// const rkv = /\]\s([\s\S]*)$/
import { Configuration } from 'log4js'

const createConfig = function (basePath: string): Configuration {
  return {
    appenders: {
      debug: {
        type: 'console',
        layout: {
          type: 'pattern',
          pattern: '[%r] [%[%5.5p%]] - %m%n'
        },
      },
      access: {
        // 这里应该自定义输出 cookie，参见这里是 tokens: https://log4js-node.github.io/log4js-node/layouts.html
        type: 'dateFile',
        filename: `${basePath}/access/access.log`,
        category: 'access',
      },
      info: {
        type: 'dateFile',
        filename: `${basePath}/info/info.log`,
        category: 'info'
      },
      warn: {
        type: 'dateFile',
        filename: `${basePath}/warn/warn.log`,
        category: 'warn'
      },
      error: {
        type: 'dateFile',
        filename: `${basePath}/error/error.log`,
        category: 'error'
      }
    },
    categories: {
      default: { appenders: ['info'], level: 'all' },
      debug: { appenders: ['debug'], level: 'debug' },
      access: { appenders: ['access'], level: 'all' },
      info: { appenders: ['info'], level: 'all' },
      warn: { appenders: ['warn'], level: 'all' },
      error: { appenders: ['error'], level: 'all' },
    },
    /**
     * 参见这里：http://blog.yourtion.com/fix-log4js-with-pm2-not-work.html
     * 文档：https://github.com/log4js-node/log4js-node/blob/v2.5.3/docs/api.md
     * 环境需要安装：pm2 install pm2-intercom
     * 在 pm2 cluster 模式（集群模式） 下，会出现 pm2 不写日志的问题
     */
    pm2: process.env.NODE_ENV === 'production'
  }
  
}

export default createConfig

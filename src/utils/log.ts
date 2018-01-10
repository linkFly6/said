import * as log4js from 'log4js'
import { Logger } from 'log4js'
import createConfig from '../config/log-config'
import * as path from 'path'


log4js.configure(createConfig(path.resolve('./logs')))

interface ILog {
  namespace: string
  info(title: string, desc: string): void
  warn(title: string, desc: string): void
  error(title: string, desc: string): void
}

const env = process.env.NODE_ENV || 'production'
const isPro = env !== 'development'
const isDisableLog = process.env.LOG_STATUS === 'off'

if (env === 'development') {
  // const colors = import('colors')
  const colors = require('colors')
  colors.setTheme({
    info: 'green',
    warn: 'yellow',
    error: 'red',
    bold: 'bold',
  })
}



export const accessLogger = log4js.getLogger('access')
export const infoLogger = log4js.getLogger('info')
export const errorLogger = log4js.getLogger('error')
/**
 * log4js 实例
 */
export const Log4js = log4js


export class Log implements ILog {
  public static makeMsg(logger: Logger, fn: string, namespace: string, title = 'msg', desc = '') {
    let description: string
    if (typeof desc !== 'string') {
      description = desc + ''
    } else {
      description = desc
    }
    const msg = `[${namespace.toUpperCase()} - ${title}]:  ${description.replace(/[\r\n]/g, ' ')}`
    if (isPro || isDisableLog) {
      logger[fn](msg)
    } else {
      const type: any = `[${fn.toUpperCase()} ${namespace}]`
      if (~type.indexOf('WARN')) {
        console.log(type.warn + ` ${msg}\n`)
      } else if (~type.indexOf('ERROR')) {
        console.log(type.error + ` ${msg}\n`)
      } else {
        console.log(type.info + ` ${msg}\n`)
      }
    }
  }
  public namespace: string
  constructor(namespace: string) {
    this.namespace = namespace
  }
  public info(title: string, desc: any = ''): void {
    Log.makeMsg(infoLogger, 'info', this.namespace, title, JSON.stringify(desc))
  }
  public warn(title: string, desc: any = ''): void {
    Log.makeMsg(infoLogger, 'warn', this.namespace, title, JSON.stringify(desc))
  }
  public error(title: string, desc: any): void {
    let errMsg = ''
    if (desc instanceof Error) {
      errMsg = JSON.stringify({
        message: desc.message,
        stack: desc.stack,
      })
    } else {
      errMsg = JSON.stringify(desc)
    }
    Log.makeMsg(errorLogger, 'error', this.namespace, title, errMsg)
  }
}

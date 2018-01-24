import 'reflect-metadata'
import * as path from 'path'
import * as fs from 'fs'
import { eachDir } from './utils'


import { RouterError, ActionHandler, Route } from './models'
import { Request, Response, NextFunction, Router, Express } from 'express'
import { allSignature, defaultSymbol } from './signature'
import { createController } from './controller'

/**
 * router 配置
 */
export interface RouterOptions {
  /**
   * 请求根目录，默认为 /
   */
  base?: string
  /**
   * controller 文件根目录
   */
  root: string
  /**
   * express 应用
   */
  app: Express | Router,
  /**
   * action 句柄，在 action 处理过程中统一注入执行上下文
   * 类似于每个会话的前置请求/后置结果处理
   * BHR: 前置处理，返回参数会在 action 的第二个参数中注入
   * EHR: 后置处理，可以自行包装结果
   */
  handler?: ActionHandler,

  /**
   * controller 文件名后缀，默认为 -controller
   */
  postfix?: string | RegExp
  /**
   * controller 匹配规则
   */
  match?: (fileName: string, postfix: string | RegExp) => boolean
}


let routerMounted = false


/**
 * 路由中间件
 * @param {RouterOptions} options - 路由配置
 * @param {string} base = [root] - 默认根目录
 * @returns {function}
 */
const routerMount = (options: RouterOptions) => {
  if (routerMounted) {
    throw `[router:mount]Repeat mount routing is not allowed`
  }
  Object.keys(allSignature).forEach(key => {
    let filter = allSignature[key]
    /**
     * 没有中间件逻辑
     */
    if (!filter.path || !filter.use) {
      return
    }
    if (!options.app[filter.method]) {
      throw `[router:method]Property method does not support this value:${filter.method}`
    }
    const path =
      options.base.length && filter.path.startsWith(options.base)
        ? filter.path : `${options.base}/${filter.path.replace(/^\//g, '')}`
    options.app[filter.method](path, filter.use)
  })

  routerMounted = true
}

const DEFAULTS = {
  // root: path.resolve('./controllers'),
  postfix: '-controller',
  base: '/',
  match: (fileName: string, postfix: string | RegExp) => {
    if (!fileName.match(postfix)) return false
    if (/\.map$/.test(fileName)) return false
    return true
  },
}


/**
 * 自动挂载路由，并且可以通过装饰器为路由注入其他东西 => Router => Controller
 * 设计思想：
 * 通过 signature 签名生成自己的装饰器
 *  - 挂载为 express 中间件
 *  - 获取处理路由细节
 * 自动读取路由 (Controller) 目录
 * 自动处理参数和返回结果上下文，并且可以通过装饰器重写和扩展自己的处理上下文
 * 
 * 核心的目的只有一个： Controller 中只处理自己的业务逻辑，路由和其他的细节处理都应该自动完成
 */
export default (options: RouterOptions) => {
  options = Object.assign({}, DEFAULTS, options)
  if (options.base) {
    // options.base = options.base.startsWith('/') ? options.base : '/' + options.base
    // options.base = options.base.length > 1 && options.base.endsWith('/') ? options.base.substring(0, options.base.length - 2) : options.base
    // options.base = options.base.replace(/^\/|\/$/g, '')
    // 去掉尾部的空格，前面的空格不去(因为会命中 express 不同的规则)
    options.base = options.base.replace(/\/$/g, '')
  }
  if (!options.app) {
    throw `[options:app]Express app is required`
  }
  if (!options.root) {
    throw `[options:root]The controller root directory is required`
  }


  const routes = eachDir(options.root).reduce((previous: Route[], filePath: string): Route[] => {
    // /root/linkFly/mfe-tinker-webapp/controller/index.js => index.js，绝对路径转相对路径
    const fileName = path.relative(__dirname, filePath)
    if (!options.match(fileName, options.postfix)) return previous
    const constructor = require(fileName)
    // ../controller/create-provider-controller.js => create-provider-controller => create-provider => createProvider
    const controllerName = fileName
      .replace(/\.*\/([^\/]+\/)*|\.js/g, '')
      .replace(options.postfix, '')
      .replace(/\-(\w)/g, (_, letter) => {
        return letter.toUpperCase()
      })
    return previous.concat(createController(
      options,
      constructor.default ? constructor.default : constructor,
      controllerName))
  }, [])

  /**
   * 先生成 controller 触发 signature 的逻辑(得到装饰器的 key 和中间件)
   * 这时候可以保证中间件已经被挂载到了 signature.allSignature 中
   * 否则会因为 nodeJS 的优化，装饰器的签名代码尚未执行，controller 就已经生成了
   */
  routerMount(options)

  routes.forEach(route => {
    if (!options.app[route.method]) {
      throw `[router:method]Property method does not support this value:${route.method}, route: ${route.path}`
    }
    options.app[route.method].apply(options.app, [route.path].concat(route.actions as any))
  })
  return options.app
}
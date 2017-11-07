import * as path from 'path'
import * as fs from 'fs'
import { eachDir } from '../utils'
import {
  symbolPathKey,
  symbolHttpMethodsKey,
  symbolAuthKey,
  symbolProxyKey,
  sysmbolRouterConfigProxyKey,
  symbolTokenKey,
} from '../utils/router-decorator'
import { Request, Response, Express, NextFunction } from 'express'

/**
 * 生成获取 metadata 的工厂方法
 * @param {any} target - 对象/类
 * @param {string} propertyKey - 属性
 * @returns {function}
 */
const factoryGetMetadata = (target: any, propertyKey: string) => {
  return (metadataKey: Symbol | string) => {
    return Reflect.getMetadata(metadataKey, target, propertyKey)
  }
}

/**
 * 判断返回的结果是不是 error (结构为 { code, msg })
 * @param {any} target - 要判断的对象
 * @returns {function}
 */
const isErrorResult = (err: any) => {
  if (err == null) return false
  return err.msg !== undefined && err.code !== undefined
}

type Route = {
  path: string,
  method: string | 'all',
  transport: (req: Request, res: Response, next: NextFunction) => any,
  auth: boolean | false
}

/**
 * 反射对象，生成路由相关信息
 * @returns {routers[]}
 */
const createController = (controller: any, controllerName: string) => {
  const routes: any = []
  // router 的 class 定义了名字，并且 name 不是编译过后的 default
  if (controller.name && !controller.name.startsWith('default')) {
    // Main => main
    controllerName = controller.name.replace(/^\w/, (letter: string) => {
      return letter.toLowerCase()
    })
  }
  Object.keys(controller).map(staticPropertyKey => {
    // 获取静态属性的类型
    const getMetadata = factoryGetMetadata(controller, staticPropertyKey)
    const metaDesignType = getMetadata('design:type')
    // 方法才包装
    if (typeof metaDesignType === 'function') {
      const method = controller[staticPropertyKey]
      const router: Route = {
        path: '/*',
        method: '',
        transport: null,
        auth: false,
      }
      // 如果配置了超级配置
      const configs = getMetadata(sysmbolRouterConfigProxyKey)
      if (configs) {
        Object.assign(router, configs)
      }
      // 配置 auth
      if (getMetadata(symbolAuthKey)) {
        router.auth = true
      }

      // 配置 proxy
      const proxyMeta = getMetadata(symbolProxyKey)
      if (typeof proxyMeta === 'function') {
        router.proxy = proxyMeta
      }

      // http methods
      const httpMethod = getMetadata(symbolHttpMethodsKey)
      if (httpMethod) {
        router.method = httpMethod
      }

      // path
      let path = getMetadata(symbolPathKey)
      if (path) {
        router.path = path
      } else {
        const token = getMetadata(symbolTokenKey)
        if (token) {
          // 如果 method 为 index，则直接挂到 router 下，例如 main 的 index 方法则会生成 /api/user/main
          path = `/api/user/${controllerName}${staticPropertyKey === 'index' ? '' : `/${staticPropertyKey}`}`
        } else {
          path = `/api/${controllerName}${staticPropertyKey === 'index' ? '' : `/${staticPropertyKey}`}`
        }
      }
      // nginx proxy tinker => project
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        // /tinker/api/query => api/query
        path = `/tinker/${path.replace(/^\/?(tinker\/)?/, '')}`
      }
      router.path = path

      // 方法包装
      router.transport = function (req: Request, res: Response, next: Function) {
        const params = Object.assign({}, req.body, req.query)
        // 标记是否已经结束了整个 router 操作
        try {
          const methodResult = method.call(this, params, {
            // output: data => {
            //   if (isEnd) return
            //   isEnd = true
            //   output(res, data)
            // },
            // invalid: err => {
            //   if (isEnd) return
            //   isEnd = true
            //   invalid(res, err)
            // },
            // next: (data) => {
            //   isEnd = true
            //   next(data)
            // },
            log,
            req,
            res,
          }, next)

          if (methodResult == null) {
            output(res, {})
          } else {
            // async 方法返回的 promise
            if (methodResult.then || methodResult instanceof Promise) {
              methodResult.then(data => {
                // 返回带 code 和 msg
                if (isErrorResult(data)) {
                  invalid(res, data)
                } else {
                  output(res, data == null ? {} : data)
                }
              }).catch(error => {
                log.error('async routers-catch', error)
                invalid(res, { code: 100001, msg: '服务出了点小问题' })
              })
            } else {
              if (isErrorResult(methodResult)) {
                invalid(res, methodResult)
              } else {
                output(res, methodResult == null ? {} : methodResult)
              }
            }
          }
        } catch (error) {
          log.error('routers-error', error)
          invalid(res, { code: 90000, msg: '服务出了点小问题' })
        }
      }

      routes.push(router)
    }
  })
  return routes
}

const baseRoutePath = path.resolve(__dirname, '../controller')

const routes = eachDir(baseRoutePath).reduce((previous: string[], filePath: string): any[] => {
  // /root/linkFly/mfe-tinker-webapp/controller/index.js => index.js，绝对路径转相对路径
  const fileName = path.relative(__dirname, filePath)
  if (/base-controller\.js$/.test(fileName)) return previous
  if (/\.js\.map$/.test(fileName)) return previous
  const controller = require(fileName)
  // ../controller/create-provider-controller.js => create-provider-controller => create-provider => createProvider
  const controllerName = fileName
    .replace(/\.+\/([^\/]+\/)?|\.js/g, '')
    .replace('-controller', '')
    .replace(/\-(\w)/g, (_, letter) => {
      return letter.toUpperCase()
    })
  return previous.concat(createController(new controller.default, controllerName))
}, [])

// export default routes.concat({
//   path: '/*',
//   method: 'get',
//   transport: renderPage,
//   auth: false,
// })

export default function (app: Express) {
  // 先挂载中间件


  // 再挂载 routers
  routes.forEach((route: Route) => {
    if (route.path && typeof app[route.path] === 'function') {
      app[route.path](route.path, route.transport)
    } else {
      app.use(route.transport)
    }
  })
}



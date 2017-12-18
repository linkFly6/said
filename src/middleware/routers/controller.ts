import { Route } from './models'
import {
  symbolPathKey,
  symbolHttpMethodsKey,
  sysmbolRouterConfigProxyKey,
} from './router-decorator'
import { RouterOptions } from './'

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
 * 反射对象，生成路由相关信息
 * @returns {routers[]}
 */
export const createController = (options: RouterOptions, constructor: any, controllerName: string): Route[] => {
  const routes: Route[] = []
  // router 的 class 定义了名字，并且 name 不是编译过后的 default
  if (constructor.name && !constructor.name.startsWith('default')) {
    // Main => main
    controllerName = constructor.name.replace(/^\w/, (letter: string) => {
      return letter.toLowerCase()
    })
  }

  let controller = new constructor()
  if (controller == null) return routes


  // 循环所有属性
  Object.keys(controller).map(propertyKey => {
    // 获取静态属性的类型
    const getMetadata = factoryGetMetadata(controller, propertyKey)
    const metaDesignType = getMetadata('design:type')
    // 方法才包装
    if (typeof metaDesignType === 'function') {
      const method = controller[propertyKey]
      const router = new Route()
      // 如果配置了超级配置
      const configs = getMetadata(sysmbolRouterConfigProxyKey)
      if (configs) {
        Object.assign(router, configs)
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
          path = `/api/user/${controllerName}${propertyKey === 'index' ? '' : `/${propertyKey}`}`
        } else {
          path = `/api/${controllerName}${propertyKey === 'index' ? '' : `/${propertyKey}`}`
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
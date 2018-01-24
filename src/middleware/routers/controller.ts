import { Route, RouterError, ActionHandler } from './models'
import {
  symbolPathKey,
  symbolHttpMethodsKey,
  sysmbolRouterConfigProxyKey,
  router,
} from './router-decorator'
import { RouterOptions } from './'
import { allSignature, defaultSymbol, getFilterAndOptions } from './signature'
import {
  Express,
  Request,
  Response,
  Router,
} from 'express'

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
 * 判断返回的结果是不是 error (结构为 { code, message })
 * @param {any} target - 要判断的对象
 * @returns {function}
 */
const isErrorResult = (err: any) => {
  if (err == null) return false
  return err.msg !== undefined && err.code !== undefined
}

/**
 * 统一正确的输出
 * @param res 
 * @param data 
 */
const output = (res: Response, data: any) => {
  res.json({
    code: 0,
    message: '',
    data,
  })
}

/**
 * 统一错误的输出
 * @param res 
 * @param err 
 */
const invalid = (res: Response, err: RouterError) => {
  res.json(err.toJSON())
}


/**
 * 生成统一的错误处理函数
 * @param req 
 * @param res 
 * @param route 
 * @param handle 
 */
const factoryCreateExceptionHandle = (req: Request, res: Response, route: Route, handler?: ActionHandler) => {
  return (error: Error) => {
    if (handler && typeof handler.onResultExecuted === 'function') {
      let temp = handler.onResultExecuted(error, req, route)
      if (RouterError.isLike(temp)) {
        invalid(res, new RouterError(temp))
        return
      }
    }
    if (RouterError.isLike(error)) {
      invalid(res, new RouterError(error))
    } else {
      invalid(res, new RouterError(100000, 'The server was unable to process the request'))
    }
  }
}

/**
 * 执行并封装真正的 router
 * @param route 路由配置
 * @param req Express
 * @param res Express
 * @param next Express
 * @param action 执行函数
 * @param handler 钩子句柄
 */
export const routeAction = (route: Route,
  req: Request, res: Response, next: Function,
  action: ((req: Request, res: Response, next: Function) => void) | null,
  handler?: ActionHandler) => {

  const params = Object.assign({}, req.body, req.query)
  let injectionParams = { req, res }
  // 标记是否已经结束了整个 router 操作
  if (handler && typeof handler.onActionExecuting === 'function') {
    let tmp = handler.onActionExecuting(req, route)
    if (tmp) {
      injectionParams = Object.assign(injectionParams, tmp)
    }
  }

  /**
   * 统一包装的错误函数
   * @param error 
   */
  const exceptionHandle = factoryCreateExceptionHandle(req, res, route, handler)

  try {
    let isNext = false
    const methodResult = action.call(this, params, injectionParams, (...args: any[]) => {
      isNext = true
      next(...args)
    })
    if (methodResult == null) {
      // 中间件逻辑，执行了 next
      if (isNext) return
      output(res, {})
    } else {
      // async 方法返回的 promise
      if (methodResult.then || methodResult instanceof Promise) {
        methodResult.then((data: any) => {
          if (isNext) return
          // 返回带 code 和 msg
          if (RouterError.isLike(data)) {
            invalid(res, data)
          } else {
            output(res, data == null ? {} : data)
          }
        }).catch((error: Error) => {
          exceptionHandle(error)
        })
      } else {
        if (isNext) return
        if (isErrorResult(methodResult)) {
          invalid(res, methodResult)
        } else {
          output(res, methodResult == null ? {} : methodResult)
        }
      }
    }
  } catch (error) {
    exceptionHandle(error)
  }
}

/**
 * 反射对象，生成路由相关信息
 * @param options 
 * @param constructor 
 * @param controllerName 
 */
export const createController = <BHR, EHR>(options: RouterOptions, constructor: any, controllerName: string): Route[] => {
  const routes: Route[] = []
  // router 的 class 定义了名字，并且 name 不是编译过后的 default
  if (constructor.name && !constructor.name.startsWith('default')) {
    // Main => main
    controllerName = constructor.name.replace(/^\w/, (letter: string) => {
      return letter.toLowerCase()
    })
  }

  // 循环所有属性
  let controller = new constructor()
  if (controller == null) return routes

  // 默认声明的 class 都是不可枚举的，只能通过这种 hack 的方式获取
  Object.getOwnPropertyNames(constructor.prototype).forEach(propertyKey => {
    if (propertyKey === 'constructor') return
    // 获取静态属性的类型
    // const getMetadata = factoryGetMetadata(controller, propertyKey)
    // const metaDesignType = getMetadata('design:type')
    // 方法才包装
    if (typeof controller[propertyKey] === 'function') {
      const action = controller[propertyKey]
      let route = new Route()
      route.controllerName = controllerName
      route.name = propertyKey === 'index' ? '' : propertyKey
      route.path = `${options.base}/${controllerName}${propertyKey === 'index' ? '' : `/${propertyKey}`}`
      route.method = 'all'
      route.actions = []
      const configs = getFilterAndOptions(controller, propertyKey)
      if (configs.length) {
        route = configs.reduce((router, config) => {
          if (typeof config.filter.handler === 'function') {
            let newRoute = config.filter.handler(config.options, router)
            if (!(newRoute instanceof Route)) {
              throw `[Filter:handle]Filter handle needs to return the Route object, route: ${JSON.stringify(newRoute)}`
            }
            // 自动修正 path
            newRoute.path = options.base.length && newRoute.path.startsWith(options.base)
              ? newRoute.path : `${options.base}/${newRoute.path.replace(/^\//g, '')}`
            return newRoute
          }
          // 没有配 path，但是配了 use 的，应用到对应的 router 上
          if (config.filter.use && !config.filter.path) {
            route.actions.push(config.filter.use)
          }
          return router
        }, route)
      }
      route.actions.push(function (req: Request, res: Response, next: Function) {
        return routeAction(route, req, res, next, action, options.handler)
      })
      routes.push(route)
    }
  })
  return routes
}
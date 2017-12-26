import { Route, RouterError, ActionHandler } from './models'
import {
  symbolPathKey,
  symbolHttpMethodsKey,
  sysmbolRouterConfigProxyKey,
} from './router-decorator'
import { RouterOptions } from './'
import { allSignature, defaultSymbol, getFilterAndOptions } from './signature'
import { Request, Response, Router } from 'express'

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

const output = (res: Response, data: any) => {
  res.json({
    code: 0,
    message: '',
    data,
  })
}

const invalid = (res: Response, err: RouterError) => {
  res.json(err.toJSON())
}

/**
 * 执行并封装真正的 router
 * @param route 路由配置
 * @param req Express
 * @param res Express
 * @param next Express
 * @param action 执行函数
 * @param handle 钩子句柄
 */
export const routeAction = <BHR, EHR>(route: Route,
  req: Request, res: Response, next: Function,
  action: ((req: Request, res: Response, next: Function) => void) | null,
  handle?: ActionHandler<BHR, EHR>) => {

  const params = Object.assign({}, req.body, req.query)
  let injectionParams = { req, res }
  // 标记是否已经结束了整个 router 操作
  if (handle && typeof handle.onActionExecuting === 'function') {
    let tmp = handle.onActionExecuting(req, route)
    if (tmp) {
      injectionParams = Object.assign(injectionParams, tmp)
    }
  }

  /**
   * 统一包装的错误函数
   * @param error 
   */
  const exceptionHandle = (error: Error) => {
    if (handle && typeof handle.onResultExecuted === 'function') {
      let temp = handle.onResultExecuted(error, req, route)
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

  try {
    let isNext = false
    const methodResult = action.call(this, params, injectionParams, (...args: any[]) => {
      isNext = true
      next(...args)
    })
    if (methodResult == null) {
      // 中间件逻辑，执行了 next
      if (isNext) return
      res.json({})
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
export const createController = <BHR, EHR>(options: RouterOptions<BHR, EHR>, constructor: any, controllerName: string): Route[] => {
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
      const action = controller[propertyKey]
      let route = new Route()
      route.name = controllerName
      route.path = `${options.base}/${controllerName}/${propertyKey === 'index' ? '' : `/${propertyKey}`}`
      route.method = 'all'
      route.action = function (req: Request, res: Response, next: Function) {
        return routeAction(route, req, res, next, action, options.handler)
      }
      const configs = getFilterAndOptions(controller)
      if (configs.length) {
        route = configs.reduce((router, config) => {
          if (typeof config.filter.handler === 'function') {
            let newRoute = config.filter.handler(config.options, router)
            if (!(newRoute instanceof Route)) {
              throw `[Filter:handle]Filter handle needs to return the Route object, route: ${JSON.stringify(newRoute)}`
            }
            return newRoute
          }
          return router
        }, route)
      }
      routes.push(route)
    }
  })
  return routes
}
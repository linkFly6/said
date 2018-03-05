import { Log } from '../utils/log'
import { Request, Response, NextFunction, Express } from 'express'


const log = new Log('app')

/**
 * 捕获全局 Promise error
 */
process.on('unhandledRejection', (error: any) => {
  log.error('unhandledRejection.error', error)
})

/**
 * 全局路由错误处理句柄
 * @param err 
 * @param req 
 * @param res 
 * @param next 
 */
export const routerErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  log.error('router.error', err)
  // 服务器异常跳到服务器异常页
  res.redirect('/500', 500)
}


/**
 * 安全执行路由句柄
 * async/await 生成出来的路由是 promise 的，express 默认绑定 promise 路由是不会做任何处理的
 * 如果异步路由发生异常，会导致全局 unhandledRejection 报错，并且进程卡死
 * 这个函数可以把路由句柄包装成经过错误处理的函数
 * @param func 
 */
export const safeRouterHandler = (func: (req: Request, res: Response, next: NextFunction) => (Promise<any> | any)) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      let result = func(req, res, next)
      if (result && result.catch) {
        result.catch((error: any) => {
          log.error('server.err', error)
          res.redirect('/500', 500)
        })
      }
    } catch (error) {
      log.error('server.err', error)
      res.redirect('/500', 500)
    }
  }
}
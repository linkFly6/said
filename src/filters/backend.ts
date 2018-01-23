import { signature, signatureWithOption } from '../middleware/routers/signature'
import { Request, Response, NextFunction, Express } from 'express'
import { Filter, Route } from '../middleware/routers/models'
import { default as AdminDb, AdminModel } from '../models/admin'
import { default as AdminRecordDb, AdminRecordModel } from '../models/admin-record'
import { getUserInfoById, getUserIdByToken } from '../services/admin-service'
import { ServiceError } from '../models/server/said-error'
import { Returns } from '../models/Returns'
import { Log } from '../utils/log'

const ERRORS = {
  NOTOKEN: 10000,
  NORECORD: 10001,
  CHECKTOKENFAIL: 10002,
  QUERYUSERFAIL: 10003,
}


const log = new Log('filter/backend')

// interface UserRequest extends Request {
//   query: any & { user: { name: string, age: number } }
//   body: any & { user: { name: string, age: number } }
// }


// export interface Admin { }

export const admin = signature(
  new Filter(
    '/back/api/user/*',
    (req: Request, res: Response, next: NextFunction) => {
      const params = req.method === 'GET'
        ? req.query : req.body
      let token = ''
      log.error('321', req.body)
      req.assert('token', '请求信息不正确').notEmpty()
      const errors = req.validationErrors()
      if (errors) {
        // if (~req.header('content-type').indexOf('multipart/form-data;')) {

        // }
        console.log(req.cookies)
        const returns = new Returns(null, {
          code: ERRORS.NOTOKEN,
          msg: '请求信息不正确',
          data: null,
        })
        return res.json(returns.toJSON())
      }

      try {
        let tokenInfo = getUserIdByToken(params.token)
        if (!tokenInfo || !tokenInfo.id) {
          return
        }
        getUserInfoById(tokenInfo.id).then(res => {
          log.info('admin.getUserInfoByToken', res)
          params.admin = res
          next()
        }).catch(err => {
          log.error('getUserInfoById.catch', err)
          const returns = new Returns(null, {
            code: ERRORS.QUERYUSERFAIL,
            msg: '查询用户失败',
            data: null,
          })
          return res.json(returns.toJSON())
        })

      } catch (error) {
        if (ServiceError.is(error)) {
          log.error((error as ServiceError).title, (error as ServiceError).data)
        } else {
          log.error('catch', error)
        }
        // next(error)
        const returns = new Returns(null, {
          code: ERRORS.CHECKTOKENFAIL,
          msg: '查询用户失败',
          data: null,
        })
        return res.json(returns.toJSON())
      }
    },
    'all',
    (options: null, route: Route) => {
      route.path = `/back/api/user/${route.controllerName}${route.name ? `/${route.name}` : ''}`
      return route
    }))



/**
 * 配置路径
 */
export const path = signatureWithOption<string>(new Filter(void 0, void 0, 'all', (path: any, route: Route) => {
  route.path = path
  return route
}))

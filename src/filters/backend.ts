import { signature, signatureWithOption } from '../middleware/routers/signature'
import { Request, Response, NextFunction, Express } from 'express'
import { Filter, Route } from '../middleware/routers/models'
import { default as AdminDb, AdminModel } from '../models/admin'
import { default as AdminRecordDb, AdminRecordModel } from '../models/admin-record'
import { getUserInfoById, getUserIdByToken } from '../services/admin-service'
import { ServiceError } from '../models/server/said-error'
import { Returns } from '../models/Returns'
import { Log } from '../utils/log'
import * as multer from 'multer'

const ERRORS = {
  NOTOKEN: new Returns(null, {
    code: 10000,
    msg: '获取用户信息失败',
    data: null,
  }),
  NORECORD: new Returns(null, {
    code: 10001,
    msg: '获取用户信息失败',
    data: null,
  }),
  CHECKTOKENFAIL: new Returns(null, {
    code: 10002,
    msg: '获取用户信息失败',
    data: null,
  }),
  QUERYUSERFAIL: new Returns(null, {
    code: 10003,
    msg: '获取用户信息失败',
    data: null,
  }),
  FORMDATAERROR: new Returns(null, {
    code: 10004,
    msg: '获取提交信息失败',
    data: null,
  }),
}


const log = new Log('filter/backend')

// interface UserRequest extends Request {
//   query: any & { user: { name: string, age: number } }
//   body: any & { user: { name: string, age: number } }
// }


const upload = multer().any()

/**
 * 签名 admin
 * 如果通过 form-data 发送请求(multipart/form-data)，则会解析 formdata（包括上传文件）
 */
export const admin = signature(
  new Filter(
    '/back/api/user/*',
    (req: Request, res: Response, next: NextFunction) => {
      let params = req.method === 'GET'
        ? req.query : req.body
      // 如果前面有其他 filter 处理过则不再处理
      if (params.admin) {
        next()
        return
      }
      const token = params.token || req.cookies.token
      const promise = Promise.resolve(token)
      // bodyParser 不会解析 multipart/form-data 的请求，所以在 form-data 下取不到 token
      promise.then((token: string) => {
        // 还取不到 token，并且是通过 form-data 上传的数据，则通过 multer 取 req.body 的数据
        if (~req.header('content-type').indexOf('multipart/form-data')) {
          return new Promise(resolve => {
            upload(req, res, (err: any) => {
              if (err) {
                log.error('formdata.error', err)
                resolve(null)
                return
              }
              log.info('formdata.call', req.body)
              params = req.body
              resolve(token || req.body.token)
            })
          })
        }
        return token
      }).then((token: string | null) => {
        if (!token) {
          return res.json(ERRORS.NOTOKEN.toJSON())
        }
        try {
          let tokenInfo = getUserIdByToken(token)
          if (!tokenInfo || !tokenInfo.id) {
            return
          }
          getUserInfoById(tokenInfo.id).then(res => {
            log.info('admin.getUserInfoByToken', res)
            // 挂载到 params 下
            params.admin = res
            next()
          }).catch(err => {
            log.error('getUserInfoById.catch', err)
            return res.json(ERRORS.QUERYUSERFAIL.toJSON())
          })

        } catch (error) {
          if (ServiceError.is(error)) {
            log.error((error as ServiceError).title, (error as ServiceError).data)
          } else {
            log.error('catch', error)
          }
          // next(error)
          return res.json(ERRORS.CHECKTOKENFAIL.toJSON())
        }
      })
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

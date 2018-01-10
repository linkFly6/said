import { signature, signatureWithOption } from '../middleware/routers/signature'
import { Request, Response, NextFunction, Express } from 'express'
import { Filter, Route } from '../middleware/routers/models'
import { default as AdminDb, AdminModel } from '../models/admin'
import { default as AdminRecordDb, AdminRecordModel } from '../models/admin-record'
import { Returns } from '../models/Returns'


const ERRORS = {
  NOTOKEN: 10000,
  NORECORD: 10001,
}


// interface UserRequest extends Request {
//   query: any & { user: { name: string, age: number } }
//   body: any & { user: { name: string, age: number } }
// }


// export interface Admin { }

export const admin = signature(
  new Filter(
    'user/*',
    (req: Request, res: Response, next: NextFunction) => {
      const params = req.method === 'GET'
        ? req.query : req.body

      // const model = new AdminDb()
      // model.nickName = '32321'
      // model.userName = 'linkFly'
      // model.save(err => {
      //   if (err) {

      //   }
      // })

      req.assert('token', '请求信息不正确').notEmpty()
      const errors = req.validationErrors()
      if (errors) {
        const returns = new Returns(null, {
          code: ERRORS.NOTOKEN,
          msg: '请求信息不正确',
          data: null,
        })
        return res.json(returns.toJSON())
      }
      AdminRecordDb.findOne({ token: params.token }).populate('admin').exec((err, admin: AdminModel) => {
        if (err) {
          return next(err)
        }
        if (!admin) {
          const returns = new Returns(null, {
            code: ERRORS.NORECORD,
            msg: '请求信息不正确',
            data: null,
          })
          return res.json(returns.toJSON())
        }
        next()
      })
    },
    'all',
    (options: null, route: Route) => {
      route.path = `user/${route.controllerName}${route.name ? `/${route.name}` : ''}`
      return route
    }))



/**
 * 配置路径
 */
export const path = signatureWithOption<string>(new Filter(void 0, void 0, 'all', (path: any, route: Route) => {
  route.path = path
  return route
}))

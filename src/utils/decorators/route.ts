import { signature, signatureWithOption } from '../../middleware/routers/signature'
import { Request, Response, NextFunction, Express } from 'express'
import { Filter, Route } from '../../middleware/routers/models'


const debug = (name: string, value: string) => {
  console.log(`\n\n=========================${name}=============================\n`)
  console.log(`========= ${value} =========`)
  console.log('=============================\n\n')
}

export const get = signature(new Filter(void 0, void 0, void 0, (_, route) => {
  route.method = 'get'
  return route
}))

// interface UserRequest extends Request {
//   query: any & { user: { name: string, age: number } }
//   body: any & { user: { name: string, age: number } }
// }

export const user = signature(
  new Filter(
    'user/*',
    (req: Request, res: Response, next: NextFunction) => {
      const params = req.method === 'GET'
        ? req.query : req.body
      params.user = {
        name: 'test',
        age: 18,
      }
      next()
    },
    'all',
    (options: null, route: Route) => {
      route.path = `user/${route.controllerName}${route.name ? `/${route.name}` : ''}`
      return route
    }))
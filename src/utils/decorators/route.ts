import { signature, signatureWithOption } from '../../middleware/routers/signature'
import { Request, Response, NextFunction } from 'express'
import { Filter } from '../../middleware/routers/models'


const debug = (name: string, value: string) => {
  console.log(`\n\n=========================${name}=============================\n`)
  console.log(`========= ${value} =========`)
  console.log('=============================\n\n')
}

/**
 * 校验用户 token
 */
export const token = signature(new Filter(
  'user',
  (req: Request, res: Response, next: NextFunction) => {
    console.log(token)
  }
))

export const get = signature(new Filter(void 0, void 0, void 0, (_, route) => {
  route.method = 'get'
  return route
}))

export const user = signature(new Filter(void 0, (req: Request, res: Response, next: NextFunction) => {
  const params = req.method === 'GET'
    ? req.query : req.body
  params.user = {
    name: 'test',
    age: 18,
  }
}))
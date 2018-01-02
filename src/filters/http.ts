import { signature, signatureWithOption } from '../middleware/routers/signature'
import { Request, Response, NextFunction, Express } from 'express'
import { Filter, Route } from '../middleware/routers/models'


/**
 * http get 请求
 */
export const get = signature(new Filter(void 0, void 0, void 0, (_, route) => {
  route.method = 'get'
  return route
}))
import { signature, signatureWithOption } from '../middleware/routers/signature'
import { Filter, Route } from '../middleware/routers/models'


/**
 * http get 请求
 */
export const get = signature(new Filter(void 0, void 0, void 0, (_, route) => {
  route.method = 'get'
  return route
}))

export const post = signature(new Filter(void 0, void 0, void 0, (_, route) => {
  route.method = 'post'
  return route
}))
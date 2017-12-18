import * as path from 'path'
import * as fs from 'fs'
import { eachDir } from './utils'


import { RouterError } from './models'
import { Request, Response, NextFunction, Router, Express } from 'express'

/**
 * router 配置
 */
export interface RouterOptions {
  base?: string
  router: Router
  express: Express
}

/**
 * 路由中间件
 * @param {RouterOptions} options - 路由配置
 * @param {string} base = [root] - 默认根目录
 * @returns {function}
 */
export default (options: RouterOptions) => {
  if (!options.base) {
    options.base = path.resolve('./')
  }
  return (req: Request, res: Response, next: NextFunction) => {
    // options.express.use(function () {
      
    // })
  }
}
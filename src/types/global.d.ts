import { Express } from 'express'
import { DEVICE } from '../models/server/enums'
import { IUser } from '../models/user'
import { SimpleAdmin } from './admin'

/**
 * vs code 会全局自动引入
 */

declare module 'express' {
  interface Response {
    locals: {
      /**
       * 管理员信息（如果有的话）
       */
      admin: SimpleAdmin | null,
      /**
       * 当前访问的设备
       */
      device: DEVICE,
      /**
       * 访问用户
       */
      user: IUser,
    }
  }
}
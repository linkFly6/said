import * as mongoose from 'mongoose'

/**
 * 用户角色
 */
export enum UserRole {
  /**
   * 普通用户
   */
  NORMAL = 0,
  /**
   * 后台用户
   */
  ADMIN = 1
}

/**
 * 用户类(前台)
 */
export type UserModel = mongoose.Document & {
  _id: string
  /**
   * email
   */
  email: string
  /**
   * 用户站点
   */
  site?: string
  /**
   * 用户昵称
   */
  nickName: string
  /**
   * 用户角色
   */
  role: UserRole
  /**
   * 用户会话 token
   */
  token: string
  /**
   * 用户渠道 ID（用于用户分享）
   */
  channelId: string
}

export const UserSchema = new mongoose.Schema({
  email: String,
  site: String,
  nickName: String,
  role: UserRole,
  token: String,
  channelId: String,
})


const Model = mongoose.model('User', UserSchema)

export default Model
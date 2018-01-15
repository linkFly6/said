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
export interface UserModel extends mongoose.Document {
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
  role: Number,
  token: String,
  channelId: String,
})

// console.log('======================================================================')
// console.log('======================================================================')
// console.log('======================================================================')
// console.log('================================1111111111111111111=====================================')
// console.log('======================================================================')
// console.log('======================================================================')
// console.log('======================================================================')
// console.log('======================================================================')
// console.log('======================================================================')
// console.log('======================================================================')
// console.log('')
// console.log('')
// console.log('')
// console.log('')
// console.log('')
// console.log('')

const Model = mongoose.model<UserModel>('User', UserSchema)

export default Model
import { UserModel, UserSchema } from './user'
import * as mongoose from 'mongoose'


/**
 * 管理员访问权限
 */
export enum AdminRule {
  /**
   * 不限制访问
   */
  GLOBAL = 0,
  /**
   * 只可以访问自己的 blog
   */
  BLOG = 1,
  /**
   * 只可以访问自己的 Said
   */
  SAID = 2
}

/**
 * 后台管理员（作者类）
 */
export interface IAdmin {
  /**
   * mongoDB 默认 ID
   */
  _id: any
  /**
   * 用户名
   */
  username: string
  /**
   * password 根据 said 私有公匙和私有私匙进行 RSA 加密
   */
  password: string
  /**
   * 昵称
   */
  nickName: string

  /**
   * 头像文件名（待定）
   */
  avatar?: string
  /**
   * 作者邮箱
   */
  email: string
  /**
   * 个人简介
   */
  bio?: string

  /**
   * 访问权限
   */
  rule: AdminRule
}


export interface AdminModel extends IAdmin, mongoose.Document { }

export const AdminSchema = new mongoose.Schema({
  userName: String,
  password: String,
  nickName: String,
  avatar: { type: String, required: false },
  email: String,
  bio: String,
  rule: Number,
})


const Model = mongoose.model<AdminModel>('Admin', AdminSchema)

export default Model
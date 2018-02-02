import { AdminRule } from '../models/admin'

/**
 * 后台管理员（作者类）
 */
export interface SimpleAdmin {
  /**
   * mongoDB 默认 ID
   */
  _id: any
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
  email?: string
  /**
   * 个人简介
   */
  bio?: string

  /**
   * 访问权限
   */
  rule: AdminRule
}
import { AdminSchema, AdminModel } from './admin'
import * as mongoose from 'mongoose'


export enum OperationType {
  /**
   * 查询数据
   */
  Select = 0,
  /**
   * 修改数据
   */
  Update = 1,
  /**
   * 登录
   */
  Login = 2,
  /**
   * 创建数据
   */
  Create = 3,
  /**
   * 删除数据
   */
  Delete = 4,
  /**
   * 不正常操作
   */
  Warning = 5
}


/**
 * 管理员操作记录类
 */
export interface IAdminRecord {
  /**
   * mongoDB 默认 ID
   */
  _id: any,

  /**
   * 用户登录 token
   */
  token: string,
  /**
   * IP 信息
   */
  ip: string,

  /**
   * header 信息
   */
  headers: string,
  /**
   * 创建时间戳
   */
  createTime: number,
  /**
   * 操作类型
   */
  type: OperationType,

  /**
   * 管理员信息
   */
  admin: AdminModel,

}

/**
 * 管理员操作记录类
 */
// tslint:disable-next-line:no-empty-interface
export interface AdminRecordModel extends IAdminRecord, mongoose.Document { }

export const AdminRecordSchema = new mongoose.Schema({
  token: String,
  ip: String,
  headers: String,
  createTime: Number,
  type: Number,
  admin: AdminSchema as any,
})


const Model = mongoose.model<AdminRecordModel>('AdminRecord', AdminRecordSchema)

export default Model
import * as mongoose from 'mongoose'

/**
 * like 的内容类型
 */
export enum LikeType {
  /**
   * 文章
   */
  ARTICLE = 0,
  /**
   * 日志
   */
  BLOG = 1
}

/**
 * 用户 like 记录
 */
export interface IUserLike {
  _id: any,
  /**
   * 用户 ID
   */
  userId: any,
  /**
   * like 的内容类型
   */
  type: LikeType,
  /**
   * 被 like 的对象 ID
   */
  targetId: any,
  /**
   * like 时间
   */
  createTime: number
}

/**
 * 用户 like 记录
 */
export interface UserLikeModel extends IUserLike, mongoose.Document {
}

export const UserLikeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: Number,
  targetId: mongoose.Schema.Types.ObjectId,
  createTime: Number,
})


const Model = mongoose.model<UserLikeModel>('UserLike', UserLikeSchema)

export default Model
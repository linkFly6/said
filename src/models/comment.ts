import { ReplySchema, IReply } from './reply'
import { UserSchema, IUser } from './user'
import * as mongoose from 'mongoose'

/**
 * 评论对象
 */
export interface IComment {
  _id?: any
  /**
   * 用户
   */
  user: IUser
  /**
   * blog ID
   */
  blogId: string,
  /**
   * 评论源码
   */
  context: string
  /**
   * 评论 HTML
   */
  contextHTML: string
  /**
   * 评论 hash（每个 blog 下不重复）
   */
  hash: string
  /**
   * 针对评论的回复
   */
  replys: IReply[]
  /**
   * 创建时间
   */
  createTime: number
}


/**
 * 用户评论
 */
export interface CommentModel extends IComment, mongoose.Document {
  _id: any
}

export const CommentSchema = new mongoose.Schema({
  user: UserSchema as any,
  blogId: mongoose.SchemaTypes.ObjectId,
  context: String,
  contextHTML: String,
  hash: String,
  replys: [ReplySchema],
  createTime: Number
})


const Model = mongoose.model<CommentModel>('Comment', CommentSchema)

export default Model
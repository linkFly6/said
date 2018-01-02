import { ReplyModel, ReplySchema } from './reply'
import { UserModel, UserSchema } from './user'
import * as mongoose from 'mongoose'


/**
 * 用户评论
 */
export interface CommentModel extends mongoose.Document {
  _id: string
  /**
   * 用户
   */
  user: UserModel
  /**
   * 评论源码
   */
  context: string
  /**
   * 评论 HTML
   */
  contextHTML: string
  /**
   * 针对评论的回复
   */
  replys: ReplyModel[],

  /**
   * 创建时间
   */
  createTime: number,
}

export const CommentSchema = new mongoose.Schema({
  user: UserSchema as any,
  context: String,
  contextHTML: String,
  replys: [ReplySchema],
  createTime: Number
})


const Model = mongoose.model<CommentModel>('Comment', CommentSchema)

export default Model
import { UserModel, UserSchema } from './user'
import * as mongoose from 'mongoose'

/**
 * 用户针对评论的回复
 */
export type ReplyModel = mongoose.Document & {
  _id: string
  /**
   * 回复评论的用户
   */
  user: UserModel
  /**
   * 针对回复的回复
   */
  toReply?: ReplyModel
  /**
   * 回复源码
   */
  context: string
  /**
   * 回复 HTML
   */
  contextHTML: string
  /**
   * 创建时间
   */
  createTime: Date,
}

export const ReplySchema = new mongoose.Schema({
  user: [UserSchema],
  // TODO 自引用怎么破？
  // toReply,
  context: String,
  contextHTML: String,
  createTime: { type: Date, default: Date.now },
})


const Model = mongoose.model('Reply', ReplySchema)

export default Model
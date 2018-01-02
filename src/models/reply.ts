import { UserModel, UserSchema } from './user'
import * as mongoose from 'mongoose'

/**
 * 用户针对评论的回复
 */
export interface ReplyModel extends mongoose.Document {
  _id: string
  /**
   * 回复评论的用户
   */
  user: UserModel
  /**
   * 针对回复的回复，只有一级回复
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
  createTime: Number,
}

export const ReplySchema = new mongoose.Schema({
  user: { type: UserSchema },
  toReply: [this],
  // or
  // toReply: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Reply'
  // },
  context: String,
  contextHTML: String,
  createTime: Number,
})


const Model = mongoose.model<ReplyModel>('Reply', ReplySchema)

export default Model
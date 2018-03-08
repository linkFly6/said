import { UserSchema, IUser } from './user'
import * as mongoose from 'mongoose'

/**
 * 用户针对评论的回复
 */
export interface IReply {
  _id?: any
  /**
   * 回复评论的用户
   */
  user: IUser
  /**
   * 针对回复的回复，只有一级回复
   */
  toReply?: IReply
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



export interface ReplyModel extends IReply, mongoose.Document {
  _id: any,
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
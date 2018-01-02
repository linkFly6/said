import * as mongoose from 'mongoose'

/**
 * 标签
 */
export interface TagModel extends mongoose.Document {
  /**
   * tag
   */
  _id: string
  /**
   * 标签名称
   */
  name: string
}

export const TagSchema = new mongoose.Schema({
  name: String
})


const Model = mongoose.model<TagModel>('Tag', TagSchema)

export default Model
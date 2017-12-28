import * as mongoose from 'mongoose'

/**
 * 标签
 */
export type TagModel = mongoose.Document & {
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


const Model = mongoose.model('Tag', TagSchema)

export default Model
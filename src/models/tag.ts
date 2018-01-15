import * as mongoose from 'mongoose'

export interface ITag {
  /**
   * tag
   */
  _id: any
  /**
   * 标签名称
   */
  name: string
}

/**
 * 标签
 */
export interface TagModel extends ITag, mongoose.Document { }

export const TagSchema = new mongoose.Schema({
  name: String
})


const Model = mongoose.model<TagModel>('Tag', TagSchema)

export default Model
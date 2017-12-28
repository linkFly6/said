import * as mongoose from 'mongoose'

/**
 * 分类
 */
export type CategoryModel = mongoose.Document & {
  _id: string
  /**
   * 分类 icon 文件名
   */
  icon: string
  /**
   * 分类名
   */
  name: string
}

export const CategorySchema = new mongoose.Schema({
  icon: String,
  name: String,
})


const Model = mongoose.model('Category', CategorySchema)

export default Model
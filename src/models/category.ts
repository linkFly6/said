import * as mongoose from 'mongoose'

/**
 * 分类
 */
export interface CategoryModel extends mongoose.Document {
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


const Model = mongoose.model<CategoryModel>('Category', CategorySchema)

export default Model
import * as mongoose from 'mongoose'

/**
 * 分类
 */
export interface ICategory {
  _id?: string
  /**
   * 分类 icon 文件名
   */
  icon: string
  /**
   * 分类名
   */
  name: string

  /**
   * 创建时间
   */
  createTime: number
}

/**
 * 分类
 */
export interface CategoryModel extends ICategory, mongoose.Document {
  _id: string
}

export const CategorySchema = new mongoose.Schema({
  icon: String,
  name: String,
  createTime: Number,
})


const Model = mongoose.model<CategoryModel>('Category', CategorySchema)

export default Model
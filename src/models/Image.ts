import * as mongoose from 'mongoose'

/**
 * 图片资源
 */
export interface ImageModel extends mongoose.Document {
  /**
    * 图片名称
    */
  name: string,
  /**
   * 图片文件名
   */
  fileName: string,
  /**
   * 图片大小
   */
  size: number,
  /**
   * 图片类型
   */
  type: ImageType,
}

/**
 * 图片类型枚举
 */
export enum ImageType {
  /**
   * 系统图
   */
  System = 0,
  /**
   * Blog图
   */
  Blog = 1,
  /**
   * Music图
   */
  Music = 2,
  /**
   * Said图片
   */
  Said = 3,
  /**
   * Icon
   */
  Icon = 4,
  /**
   * 页面引用图
   */
  Page = 5,
  /**
   * 实验室图
   */
  Lab = 6,
  /**
   * 其他图
   */
  Other = 7
}


export const ImageSchema = new mongoose.Schema({
  name: String,
  fileName: String,
  size: Number,
  type: Number,
})

const Image = mongoose.model<ImageModel>('Image', ImageSchema)
export default Image
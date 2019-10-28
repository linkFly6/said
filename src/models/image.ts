import * as mongoose from 'mongoose'


export interface IImage {
  _id: any,
  /**
   * 图片 md5
   */
  name: string,
  /**
   * 图片文件名 => demo.jpg
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
  /**
   * 存储图片名称，该名称对应为资源路径
   * 例如完整路径为 https://tasaid.com/static/blog/demo.jpg
   * 则存储路径为 static/blog/demo.jpg(注意不带前面的 /)
   * 因为这个 key 对应的七牛云存储的文件 key
   */
  key: string,
}
/**
 * 图片资源
 */
export interface ImageModel extends IImage, mongoose.Document { }

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
   * Said 图片
   */
  Article = 3,
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
  key: String,
})

const Image = mongoose.model<ImageModel>('Image', ImageSchema)
export default Image
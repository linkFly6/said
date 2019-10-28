import { IImage } from '../models/image'

/**
 * 输出给前端的图片
 */
export interface OutputImage extends IImage {
  /**
   * 图片 url
   */
  url?: string
  /**
   * 图片缩略图 url
   */
  thumb?: string
}

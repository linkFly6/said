import { IImage } from '../models/Image'

/**
 * 入参 Blog
 */
export interface OutputImage extends IImage {
  /**
   * 图片 url
   */
  url: string
  /**
   * 图片缩略图 url
   */
  thumb: string
}
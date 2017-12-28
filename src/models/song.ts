import { ImageModel, ImageSchema } from './image'
import * as mongoose from 'mongoose'

/**
 * 歌曲
 */
export type SongModel = mongoose.Document & {
  /**
   * url
   */
  url: string,
  /**
   * 名称
   */
  name: string,
  /**
   * 文件类型
   */
  fileType: number,
  /**
   * 大小（kb）
   */
  size: number,
  /**
   * 歌手
   */
  artist: string,
  /**
   * 专辑
   */
  album: string,
  /**
   * 发行日期
   */
  releaseDate: Date,
  /**
   * 时长（ms）
   */
  duration: number,
  /**
   * 歌曲图片
   */
  image: ImageModel
}

export const SongSchema = new mongoose.Schema({
  url: String,
  name: String,
  fileType: Number,
  size: Number,
  artist: String,
  album: String,
  releaseDate: Date,
  duration: Number,
  image: [ImageSchema],
})


const Model = mongoose.model('Song', SongSchema)

export default Model
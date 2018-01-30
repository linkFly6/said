import { ImageModel, ImageSchema, IImage } from './image'
import * as mongoose from 'mongoose'

export interface ISong {
  _id: any,
  /**
   * url，返回给前端才有
   */
  // url: string,
  /**
   * 名称，md5
   */
  name: string,
  /**
   * 存储的资源名称
   * 例如完整路径为 https://tasaid.com/static/said/demo.mp3
   * 则存储路径为 static/said/demo.mp3(注意不带前面的 /)
   * 因为这个 key 对应的七牛云存储的文件 key
   */
  key: string,
  /**
   * 歌曲名称
   */
  title: string,
  /**
   * 文件类型
   */
  mimeType: string,
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
   * 时长（ms）
   */
  duration: number,
  /**
   * 歌曲图片
   */
  image: IImage
}

/**
 * 歌曲
 */
export interface SongModel extends ISong, mongoose.Document {
}

export const SongSchema = new mongoose.Schema({
  name: String,
  key: String,
  title: String,
  mimeType: String,
  size: Number,
  artist: String,
  album: String,
  duration: Number,
  image: ImageSchema as any,
})


const Model = mongoose.model<SongModel>('Song', SongSchema)

export default Model
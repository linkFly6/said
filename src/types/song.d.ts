import { ISong } from '../models/song'
import { OutputImage } from './image'

/**
 * 输出给前端的歌曲
 */
export interface OutputSong extends ISong {
  /**
   * 歌曲 url
   */
  url: string
  image: OutputImage
}
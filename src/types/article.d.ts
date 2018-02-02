import { AdminRule } from '../models/admin'
import { ImageType } from '../models/image'

/**
 * 前端入参
 */
export interface SimpleArticle {
  _id?: string,
  title: string,
  context: string,
  summary: string,
  songId: string,
  posterId: string,
}

/**
 * 输出对象
 */
export interface OutputArticle {
  _id: string,
  title: string,
  context: string,
  key: string,
  author: {
    _id?: string,
    nickName: string,
    avatar?: string,
    email?: string,
    bio?: string,
    rule: AdminRule,
  },
  summary: string,
  poster: {
    _id: string,
    size: number,
    fileName: string,
    type: ImageType,
    name: string,
    key: string,
  },
  song: {
    _id: string,
    key: string,
    title: string,
    mimeType: string,
    size: number,
    artist: string,
    album: string,
    duration: number,
    image: {
      _id: string,
      size: number,
      fileName: string,
      type: ImageType,
      name: string,
      key: string,
    }
  },
  other: {
    xml: string,
    html: string,
    summaryHTML: string
  },
  info: {
    likeCount: number,
    createTime: number,
    updateTime: number,
  },
  // config: {
  //   script: string,
  //   css: string,
  // }
}
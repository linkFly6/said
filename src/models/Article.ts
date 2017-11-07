import * as image from './Image'
import * as bcrypt from 'bcrypt-nodejs'
import * as crypto from 'crypto'
import * as mongoose from 'mongoose'


/**
 * 听说（文章）
 */
export type ArticleModel = mongoose.Document & {
  /**
   * 标题
   */
  title: string,
  /**
   * markdown 源码
   */
  context: string,
  /**
   * 标签
   */
  tags: Array<{
    /**
     * 标签名
     */
    name: string,
  }>,
  /**
   * 描述
   */
  summary: string,
  /**
   * 文件名
   */
  fileName: string,
  /**
   * 处理过后的资源
   */
  other: {
    /**
     * 处理后的 XML
     */
    xml: string,
    /**
     * 处理后的 HTML
     */
    html: string,
    /**
     * 处理后的描述 HTML
     */
    summaryHTML: string,
  },
  /**
   * 听说图片
   */
  images: image.ImageModel,
  /**
   * 创建时间
   */
  createDate: Date,
  /**
   * 最后修改时间
   */
  updateDate: Date,
  /**
   * 相关信息
   */
  info: {
    /**
     * 访问量
     */
    pv: number,
    /**
     * 喜欢数
     */
    likeCount?: number,
    /**
     * 评论数
     */
    commentCount?: number,
  },

  /**
   * 歌曲
   */
  song: {
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
    image: image.ImageModel
  }

  /**
   * 配置
   */
  config: {
    /**
     * 是否私有
     */
    isPrivate?: boolean,
    /**
     * 是否转载
     */
    isReprint?: boolean,
    /**
     * 排序规则
     */
    sort?: number,
    /**
     * script 脚本
     */
    script: string,
    /**
     * css 脚本
     */
    css: string,
    /**
     * 密码
     */
    password: string,
  },
}


const ArticleSchema = new mongoose.Schema({
  title: String,
  context: String,
  tags: [{}],
  summary: String,
  fileName: String,
  other: {
    xml: String,
    html: String,
    summaryHTML: String,
  },
  image: [image.ImageSchema],
  createDate: { type: Date, default: Date.now },
  updateDate: { type: Date, default: Date.now },
  info: {
    pv: Number,
    likeCount: Number,
    commentCount: Number,
  },
  song: {
    url: String,
    name: String,
    fileType: Number,
    size: Number,
    artist: String,
    album: String,
    releaseDate: Date,
    duration: Number,
    image: [image.ImageSchema],
  },
  config: {
    isPrivate: { type: Boolean, required: false },
    isReprint: { type: Boolean, required: false },
    sort: { type: Number, required: false },
    script: { type: String, required: false },
    css: { type: String, required: false },
    password: { type: String, required: false }
  }
})


const Article = mongoose.model('Article', ArticleSchema)
export default Article
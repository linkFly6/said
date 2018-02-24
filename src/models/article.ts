import { AdminSchema, IAdmin } from './admin'
import { CategoryModel, CategorySchema } from './category'
import { CommentModel, CommentSchema } from './comment'
import { SongModel, SongSchema } from './song'
import { ImageSchema, ImageModel } from './image'
import * as mongoose from 'mongoose'


export interface IArticle {

  /**
   * said 标题
   */
  title: string,
  /**
   * 文章正文
   */
  context: string,
  /**
   * 标记，可以自定义，也可以自动生成，url 中使用
   */
  key: string,
  /**
 * 作者信息
   */
  author: IAdmin
  /**
   * 描述
   */
  summary: string,

  /**
   * said 配图海报
   */
  poster: ImageModel

  /**
   * said 引用的歌曲
   */
  song: SongModel
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
   * 相关信息
   */
  info: {
    /**
     * 访问量
     */
    pv?: number,
    /**
     * 喜欢数
     */
    likeCount: number,
    /**
     * 创建时间
     */
    createTime: number,
    /**
     * 最后一次更新时间
     */
    updateTime: number,
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
     * 排序规则
     */
    sort?: number,
    /**
     * script 脚本
     */
    script?: string,
    /**
     * css 脚本
     */
    css?: string,
    /**
     * 访问密码
     */
    password: string,
  }
}

/**
 * Said Model(听说)
 */
export interface ArticleModel extends IArticle,mongoose.Document {
  /**
   * mongoDB 默认 ID
   */
  _id: string,
}



export const ArticleSchema = new mongoose.Schema({
  title: String,
  context: String,
  key: String,
  author: { type: AdminSchema },
  summary: String,
  poster: ImageSchema as any,
  song: SongSchema as any,
  other: {
    xml: String,
    html: String,
    summaryHTML: String,
  },
  info: {
    pv: Number,
    likeCount: Number,
    createTime: Number,
    updateTime: Number,
  },
  config: {
    isPrivate: Boolean,
    sort: Number,
    script: String,
    css: String,
    password: String
  }
})


const Model = mongoose.model<ArticleModel>('Article', ArticleSchema)

export default Model
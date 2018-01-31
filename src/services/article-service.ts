import article, { default as AriticleDb, ArticleModel, IArticle } from '../models/article'
import { Log } from '../utils/log'
import { ServiceError } from '../models/server/said-error'
import { AdminRule, IAdmin } from '../models/admin'
import { authentication } from '../services/admin-service'
import { queryByTagNames, createTags } from '../services/tag-service'
import * as moment from 'moment'
import { convertMarkdown2HTML, convertSummaryToHTML } from '../utils/html'
import { OutputArticle } from '../types/article'

const log = new Log('service/article')

export const article2SimpleArticle = (article: any): OutputArticle => {
  // mongoDB 返回的对象无法改结构，而且附带了其他乱七八糟的属性，所以在这里做一下 clean
  return {
    _id: article._id,
    title: article.title,
    context: article.context,
    key: article.key,
    author: {
      _id: article.author._id,
      nickName: article.author.nickName,
      rule: article.author.rule,
    },
    summary: article.summary,
    fileName: article.fileName,
    poster: {
      _id: article.poster._id,
      size: article.poster.size,
      fileName: article.poster.fileName,
      type: article.poster.type,
      name: article.poster.name,
      key: article.poster.key,
    },
    song: {
      _id: article.song._id,
      key: article.song.key,
      title: article.song.title,
      mimeType: article.song.mimeType,
      size: article.song.size,
      artist: article.song.artist,
      album: article.song.album,
      duration: article.song.duration,
      image: {
        _id: article.song.image._id,
        size: article.song.image.size,
        fileName: article.song.image.fileName,
        type: article.song.image.type,
        name: article.song.image.name,
        key: article.song.image.key,
      },
    },
    other: {
      xml: article.other.xml,
      html: article.other.html,
      summaryHTML: article.other.summaryHTML,
    },
    info: {
      likeCount: article.info.likeCount,
      createTime: article.info.createTime,
      updateTime: article.info.updateTime,
    },

  }
}

/**
 * 查询全部
 * @param admin 
 */
export const queryAllArticles = (admin: IAdmin) => {
  log.info('queryAllArticles.call', admin)
  return AriticleDb.find().sort('-_id').exec()
}


/**
 * 根据歌曲 ID 查询文章列表
 * @param songId 
 * @param admin 
 */
export const queryArticlesBySong = (songId: string, admin: IAdmin) => {
  log.info('queryArticleBySong', { songId, admin })
  return AriticleDb.find({ song: { _id: songId } }).exec()
}
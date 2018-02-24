import { default as AriticleDb, ArticleModel, IArticle } from '../models/article'
import { Log } from '../utils/log'
import { ServiceError } from '../models/server/said-error'
import { AdminRule, IAdmin } from '../models/admin'
import { authentication } from '../services/admin-service'
import * as moment from 'moment'
import { convertMarkdown2HTML, convertSummaryToHTML } from '../utils/html'
import { OutputArticle, SimpleArticle } from '../types/article'
import { SongModel } from '../models/song'
import { ImageModel } from '../models/image'
import { querySongById, song2outputSong } from '../services/song-service'
import { queryImageById, image2outputImage } from '../services/image-service'
import { IUser } from '../models/User'

const log = new Log('service/article')

/**
 * 将 mongoose 返回的 model 进行处理
 * mongoDB 返回的对象无法改结构，而且附带了其他乱七八糟的属性，所以对外输出要经过这个函数处理
 * 当然，源查出来的 Mongoose Doc 对象也可以自行通过 toObject() 来处理
 * @param article 
 */
export const article2SimpleArticle = (article: any): OutputArticle => {
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
    poster: image2outputImage(article.poster),
    song: song2outputSong(article.song),
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
 * 根据管理员信息查列表
 * @param adminId 
 */
export const queryAllArticleByAdmin = (admin: IAdmin) => {
  log.info('queryAllArticleByAdmin.call', admin)
  const denied = authentication(admin, AdminRule.SAID)
  if (!denied) {
    throw new ServiceError('queryAllArticleByAdmin.authentication.denied', admin, 'access denied')
  }
  if (admin.rule == AdminRule.GLOBAL) {
    return AriticleDb.find().sort('-_id').exec()
  } else {
    return AriticleDb.find({ author: { _id: admin._id } }).sort('-_id').exec()
  }
}

/**
 * 根据 key 检查是否存在对应的文章
 * @param articleKey 文章 key 
 */
export const existsByArticleKey = (articleKey: string) => {
  log.info('existsByArticleKey.call', { articleKey })
  return AriticleDb.count({ key: articleKey }).exec()
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

/**
 * 验证文章附属的歌曲和图片是否有效
 * @param article 
 * @param admin 
 */
const validateArticle = async (article: SimpleArticle, admin: IAdmin) => {
  let song: SongModel
  let poster: ImageModel
  if (article.songId) {
    song = await querySongById(article.songId, admin)
    if (!song) {
      throw new ServiceError('validateArticle.querySongById.empty', { article, admin }, '歌曲信息不正确')
    }
  } else {
    throw new ServiceError('validateArticle.songId.empty', { article, admin }, '歌曲未找到')
  }

  if (article.posterId) {
    poster = await queryImageById(article.posterId)
    if (!poster) {
      throw new ServiceError('validateArticle.queryImageById.empty', { article, admin }, '文章图片不正确')
    }
  } else {
    throw new ServiceError('validateArticle.posterId.empty', { article, admin }, '文章图片信息未找到')
  }
  return {
    song,
    poster,
  }
}

/**
 * 新增文章，要求 article 参数已经做过非空校验
 * @param article 要新增的文章对象，要求已经做过非空校验
 * @param admin 
 */
export const createArticle = async (article: SimpleArticle, admin: IAdmin) => {
  log.info('createArticle.call', { article, admin })
  const denied = authentication(admin, AdminRule.SAID)
  if (!denied) {
    throw new ServiceError('createArticle.authentication.denied', { article, admin }, '您没有权限进行该操作')
  }
  const validateRes = await validateArticle(article, admin)
  // 文章的唯一 key
  let key = ''

  let i = 0
  // 最多重试 3 次
  while (i++ < 3) {
    // 15 ~ 16 位
    key = moment().format('YYYYMMDDHHmmss' + Math.floor(Math.random() * 100))
    let existsCount = await existsByArticleKey(key)
    if (existsCount > 0) {
      key = ''
      continue
    }
    break
  }
  if (!key) {
    throw new ServiceError('createArticle.createUrKey', { article, admin })
  }

  const html = convertMarkdown2HTML(article.context)
  const summaryHTML = convertSummaryToHTML(article.summary)
  const now = Date.now()

  const db = new AriticleDb({
    title: article.title,
    context: article.context,
    key,
    author: admin,
    summary: article.summary,
    poster: validateRes.poster,
    song: validateRes.song,
    other: {
      xml: '',
      html,
      summaryHTML,
    },
    comments: [],
    info: {
      pv: 0,
      likeCount: 0,
      createTime: now,
      updateTime: now,
    },
    config: {
      isPrivate: false,
      sort: 0,
      script: '',
      css: '',
      password: '',
    }
  })
  return db.save()
}

/**
 * 修改，要求 article 参数已经做过非空校验
 * @param article 要求已经做过非空校验
 * @param admin 
 */
export const updateArtice = async (article: SimpleArticle, admin: IAdmin) => {
  log.info('updateArtice.call', { article, admin })
  const denied = authentication(admin, AdminRule.SAID)
  if (!denied) {
    throw new ServiceError('updateArtice.authentication.denied', { article, admin }, '您没有权限进行该操作')
  }
  // 全局管理员
  const articleInfo = admin.rule === AdminRule.GLOBAL ?
    AriticleDb.findOne({ _id: article._id })
    : AriticleDb.findOne({ _id: article._id, author: { _id: admin._id } })

  // 检查这篇文章是否归属当前用户
  const oldArticle = await articleInfo.exec()
  if (!oldArticle) {
    throw new ServiceError(
      'updateArtice.checkArticle.empty',
      admin,
      admin.rule === AdminRule.GLOBAL ?
        '没有查到对应文章信息' : '您没有权限操作该文章')
  }

  // 如果有错误则 validateArticle 会抛出异常
  const validateRes = await validateArticle(article, admin)

  const html = convertMarkdown2HTML(article.context)
  const summaryHTML = convertSummaryToHTML(article.summary)

  const newArticle = {
    title: article.title,
    context: article.context,
    summary: article.summary,
    poster: validateRes.poster,
    song: validateRes.song,
    // 这个 update 模式... 给跪了 ...
    'other.html': html,
    'other.summaryHTML': summaryHTML,
    'info.updateTime': Date.now(),
  }

  log.info('updateArtice.update', {
    before: oldArticle,
    now: newArticle,
    admin,
  })

  // 不想使用上面的 2b set 的话，也可以试试这种思路
  // lodash.merge(oldArticle, newArticle)
  // oldArticle.save()
  // TODO 增量更新 https://cnodejs.org/topic/5539bde663b7692e48bbb6b0
  return articleInfo.update(newArticle).exec()
}


/**
 * 删除文章
 * @param articleId 
 * @param admin 
 */
export const removeArticle = async (articleId: string, admin: IAdmin) => {
  log.warn('removeArticle.call', { articleId, admin })
  const denied = authentication(admin, AdminRule.SAID)
  if (!denied) {
    throw new ServiceError('removeArticle.authentication.denied', admin, '您没有权限进行该操作')
  }

  // 管理员直接删除
  if (admin.rule === AdminRule.GLOBAL) {
    const articleInfo = AriticleDb.findById(articleId)
    const oldArticle = await articleInfo.exec()
    if (!oldArticle) {
      throw new ServiceError('removeArticle.admin.delete.fail', { articleId, admin }, '没有找到文章')
    }
    log.warn('removeArticle.admin.ready', { oldArticle, admin })
    return articleInfo.remove().exec()
  }

  // 鉴权
  const articleInfo = AriticleDb.findOne({ _id: articleId, author: { _id: admin._id } })
  const oldArticle = await articleInfo.exec()
  log.warn('removeArticle.articleInfo.ready', { articleInfo, admin })
  if (!oldArticle) {
    throw new ServiceError('removeArticle.checkArticle.empty', admin, '删除文章失败')
  }
  return articleInfo.remove().exec()
}


/**
 * 查询文章
 * @param articleId 
 * @param admin 
 */
export const queryArticleById = async (articleId: string, admin: IAdmin) => {
  log.info('queryArticleById.call', { articleId, admin })
  if (!authentication(admin, AdminRule.SAID)) {
    throw new ServiceError('queryArticleById.authentication.denied', { articleId, admin }, '您没有权限访问该模块')
  }
  if (admin.rule === AdminRule.GLOBAL) {
    return AriticleDb.findById(articleId).exec()
  }

  // 鉴权
  const article = await AriticleDb.findOne({ _id: articleId, author: { _id: admin._id } }).exec()
  if (!article) {
    throw new ServiceError('queryArticleById.checkArticle.empty', { articleId, admin }, '无法访问该文章')
  }
  return article //  .toObject()
}

/**
 * 根据 key 查找文章
 * @param key 
 */
export const getArticleByKey = (key: string) => {
  return AriticleDb.findOne({ key }).exec()
}

/**
 * 累加文章的浏览量
 * @param key 
 */
export const updateArticlePV = (key: string) => {
  return AriticleDb.findOne({ key }).update({
    '$inc': { 'info.pv': 1 }
  })
}

/**
 * 累加 Like 了文章
 * @param key 
 */
export const updateArticleLike = (key: string, user: IUser) => {
  log.info('updateArticleLike.call', { key, user })
  return AriticleDb.findOne({ key }).update({
    '$inc': { 'info.likeCount': 1 }
  })
}

/** 
 * 查询所有文章个数
 */
export const queryAllArticleCount = () => {
  return AriticleDb.find().count().exec()
}

/**
 * 根据条件查询文章个数
 * @param where 
 */
export const queryArticleCountByWhere = (where: any) => {
  return AriticleDb.find(where).count().exec()
}

/**
 * 分页查询
 * @param limit 指定查询结果的数量
 * @param offset 执行查询结果的偏移量（limit * (页码 -1)），从 0 开始计算
 */
export const queryAllArticleByPage = (limit = 10, offset = 0) => {
  return AriticleDb.find().sort('-_id').limit(limit).skip(offset).exec()
}

/**
 * 根据条件分页查询
 * @param where 查询条件
 * @param limit 指定查询结果的数量
 * @param offset 执行查询结果的偏移量（limit * (页码 -1)），从 0 开始计算
 */
export const queryArticleByPageAndWhere = (where: any, limit = 10, offset = 0) => {
  return AriticleDb.find(where).sort('-_id').limit(limit).skip(offset).exec()
}
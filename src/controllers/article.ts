import { Request, Response } from 'express'
import { DEVICE } from '../models/server/enums'
import { getArticleByKey, updateArticlePV, queryAllArticleByPage, queryAllArticleCount, updateArticleLike } from '../services/article-service'
import { image2outputImage } from '../services/image-service'
import { Log } from '../utils/log'
import { IArticle } from '../models/article'
import * as moment from 'moment'
import { song2outputSong } from '../services/song-service'
import { parseTime, date2Local } from '../utils/format'
import { Returns } from '../models/Returns'
import { userLiked, createUserLike } from '../services/user-like-service'
import { LikeType } from '../models/user-like'
import { SafeSimpleArticle, IViewArticle } from 'article'

const ERRORS = {
  SERVER: new Returns(null, {
    code: 1,
    msg: 'server error',
    data: null,
  }),
  NOTFOUND: new Returns(null, {
    code: 2,
    msg: 'invalid',
    data: null,
  }),
}



/**
 * 匹配 mongoDB 的 ID
 */
const regMongodbId = /^[0-9a-zA-Z]{10,30}$/

const log = new Log('router/article')

/**
 * 将文章对象的日期/头像/歌曲等信息进行处理
 * @param article 
 */
const convertArticle2View = (article: IArticle): IViewArticle => {
  (article.info as any).createTimeString = moment(article.info.createTime).format('YYYY-MM-DD HH:mm') as any
  (article.info as any).localDate = date2Local(article.info.createTime)
  article.poster = image2outputImage(article.poster) as any
  article.song = song2outputSong(article.song) as any
  article.song.duration = parseTime(article.song.duration) as any
  return article as IViewArticle
}


/**
 * 将歌曲对象的日期/头像/歌曲等信息进行处理，并且将 HTML 等无关信息删除
 * 用于 API 接口返回文章的数据
 * @param article 
 */
const convertArticle2APIResult = (article: IArticle): SafeSimpleArticle => {
  const viewArticle = convertArticle2View(article)
  return {
    _id: viewArticle._id,
    title: viewArticle.title,
    key: viewArticle.key,
    author: {
      nickName: viewArticle.author.nickName,
    },
    summary: viewArticle.summary,
    poster: viewArticle.poster,
    song: viewArticle.song,
    other: {
      summaryHTML: viewArticle.other.summaryHTML,
    },
    info: {
      likeCount: viewArticle.info.likeCount,
      createTime: viewArticle.info.createTime,
      updateTime: viewArticle.info.updateTime,
      pv: viewArticle.info.pv,
      createTimeString: viewArticle.info.createTimeString,
      localDate: viewArticle.info.localDate,
    }
  }
}



/**
 * 匹配正常范围内的页码,忽略 0 开头的页码
 */
const regPageRange = /^[1-9]\d{0,10}$/

/**
 * GET /said
 * GET /said/page/:page
 * Home page.
 */
export const index = async (req: Request, res: Response) => {
  let limit = 10
  let offset = 0
  const articleSum = await queryAllArticleCount()
  // 求出最大页数
  const maxPage = articleSum % limit === 0 ? articleSum / limit : Math.floor(articleSum / limit) + 1
  if (res.locals.device === DEVICE.MOBILE) {
    // 移动端不支持分页（因为是瀑布流）
    const articleModels = await queryAllArticleByPage(limit, offset)
    // 细节加工处理
    const articles = articleModels.map(articleModel => {
      return convertArticle2View(articleModel.toJSON() as IArticle)
    })
    res.render('said/said-mobile-index', {
      title: '听说 - 秋天该很好，你若尚在场',
      articles,
      maxPage,
    })
  } else {
    if (req.params.page && regPageRange.test(req.params.page)) {
      offset = (req.params.page - 1) * limit
    }
    const articleModels = await queryAllArticleByPage(limit, offset)
    // 细节加工处理
    const articles = articleModels.map(articleModel => {
      return convertArticle2View(articleModel.toJSON() as IArticle)
    })
    res.render('said/said-index', {
      title: '听说 - 秋天该很好，你若尚在场',
      pageIndex: 2,
      articles,
      page: +req.params.page || 1,
      maxPage,
    })
  }
}


/**
 * /said/get/:page
 * 分页加载数据
 * @param req 
 * @param res 
 */
export const getArticlesByPage = async (req: Request, res: Response) => {
  const page = req.params.page
  if (!page || !regPageRange.test(req.params.page)) {
    return res.json(ERRORS.NOTFOUND.toJSON())
  }
  let limit = 10
  let offset = (page - 1) * limit

  // const articleSum = await queryAllArticleCount()
  // // 求出最大页数
  // const maxPage = articleSum % limit === 0 ? articleSum / limit : Math.floor(articleSum / limit) + 1

  // 分页查询
  const articleModels = await queryAllArticleByPage(limit, offset)


  let returns = new Returns(null, {
    code: 0,
    msg: '',
    data: {
      // 不用传给前端 max，因为在页面加载的时候已经输到页面中了
      // max: maxPage,
      lists: articleModels.map(article => convertArticle2APIResult(article.toJSON() as IArticle)),
    }
  })
  return res.json(returns.toJSON())
}



// 匹配 key，10~20位数字，key 范围在 15~16 位，老 said 的 key 在 14 位
const regMatchKey = /^\d{10,20}$/
/**
 * GET /said/{key}.html
 * Home page.
 */
export const detail = async (req: Request, res: Response) => {
  if (!regMatchKey.test(req.params.key)) {
    res.redirect('/error', 404)
    return
  }
  const articleModel = await getArticleByKey(req.params.key)
  if (!articleModel) {
    res.redirect('/error', 404)
    return
  }

  // 查询用户是否 like 了这篇文章
  const userLike = await userLiked(res.locals.user._id, articleModel._id, LikeType.ARTICLE)
  let likeIt = false
  if (userLike > 0) {
    likeIt = true
  }

  // 累加文章 pv
  await updateArticlePV(articleModel._id)

  const article = convertArticle2View(articleModel.toJSON() as IArticle)
  article.info.pv++

  if (res.locals.device === DEVICE.MOBILE) {
    res.render('said/said-mobile-detail', {
      title: `${article.title} - 听说`,
      likeIt,
      article,
    })
  } else {
    res.render('said/said-detail', {
      title: `${article.title} - 听说`,
      pageIndex: 2,
      likeIt,
      article,
    })
  }
}

/**
 * POST /said/like/ articleId=string
 * 用户 like 了文章
 * @param req 
 * @param res 
 */
export const userLike = async (req: Request, res: Response) => {
  const articleId = req.body.articleId
  if (!articleId || !regMongodbId.test(articleId)) {
    return res.json(ERRORS.NOTFOUND.toJSON())
  }
  try {
    let likeCounts = await updateArticleLike(articleId, res.locals.user)

    // 将用户 like 记录添加到数据库
    if (likeCounts && (likeCounts as any).nModified) {
      const userlike = await createUserLike({
        userId: res.locals.user._id,
        targetId: articleId,
        type: LikeType.ARTICLE,
      })
      log.info('userLike.createUserLike.res', userlike)
    }

    let returns = new Returns(null, {
      code: 0,
      msg: '',
      // mmp mongose 返回的是 {"n":1,"nModified":1,"ok":1} 格式，tsd 却显示 number
      data: likeCounts && (likeCounts as any).nModified,
    })
    return res.json(returns.toJSON())
  } catch (error) {
    log.error('userLike.catch', error)
    return res.json(ERRORS.SERVER.toJSON())
  }
}
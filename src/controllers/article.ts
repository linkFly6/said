import { Request, Response } from 'express'
import { DEVICE } from '../models/server/enums'
import { getArticleByKey, updateArticlePV, queryAllArticleByPage, queryAllArticleCount } from '../services/article-service'
import { image2outputImage } from '../services/image-service'
import { Log } from '../utils/log'
import { IArticle } from '../models/article'
import * as moment from 'moment'
import { song2outputSong } from '../services/song-service'
import { parseTime, date2Local } from '../utils/format'

const log = new Log('router/article')

/**
 * 将文章对象的日期/头像/歌曲等信息进行处理
 * @param article 
 */
const convertArticle2View = (article: IArticle) => {
  article.info.createTime = moment(article.info.createTime).format('YYYY-MM-DD HH:mm') as any
  (article.info as any).localDate = date2Local(article.info.createTime)
  article.poster = image2outputImage(article.poster) as any
  article.song = song2outputSong(article.song) as any
  article.song.duration = parseTime(article.song.duration) as any
  return article
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
  const maxPage =  articleSum % limit === 0 ? articleSum / limit : Math.floor(articleSum / limit) + 1 
  if (res.locals.device === DEVICE.MOBILE) {
    // 移动端不支持分页（因为是瀑布流）
    const articleModels = await queryAllArticleByPage(limit, offset)
    // 细节加工处理
    const articles = articleModels.map(articleModel => {
      return convertArticle2View(articleModel.toJSON() as IArticle)
    })
    res.render('said/said-mobile-index', {
      title: '听说',
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
      title: '听说',
      pageIndex: 2,
      articles,
      page: +req.params.page || 1,
      maxPage,
    })
  }
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
  await updateArticlePV(req.params.key)
  const article = convertArticle2View(articleModel.toJSON() as IArticle)
  article.info.pv++
  if (res.locals.device === DEVICE.MOBILE) {
    res.render('said/said-mobile-detail', {
      title: '听说',
      article,
    })
  } else {
    res.render('said/said-detail', {
      title: '听说',
      pageIndex: 2,
      article,
    })
  }
}
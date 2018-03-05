import { Request, Response, NextFunction } from 'express'
import { DEVICE } from '../models/server/enums'
import { queryAllBlogCount, queryAllBlogByPage } from '../services/blog-service'
import { queryAllArticleCount, queryAllArticleByPage } from '../services/article-service'
import { Log } from '../utils/log'
import { IBlog } from '../models/blog'
import { image2outputImage } from '../services/image-service'
import { IArticle } from '../models/article'
import { date2Local } from '../utils/format'
import * as path from 'path'

const log = new Log('router/home')

/**
 * GET /
 * Home page.
 */
export const index = async (req: Request, res: Response) => {
  // const blogCount = await queryAllBlogCount()
  let blogs = await queryAllBlogByPage(3).then(blogs => {
    return blogs.map(blog => {
      let item: IBlog = blog.toJSON() as any
      item.info.createTime = date2Local(item.info.createTime) as any
      return item
    })
  })
  // const articleCount = await queryAllArticleCount()
  let articles = await queryAllArticleByPage(3).then(articles => {
    return articles.map(article => {
      // article.poster.
      let item: IArticle = article.toJSON() as any
      item.poster = image2outputImage(item.poster) as any
      item.info.createTime = date2Local(item.info.createTime) as any
      return item
    })
  })
  if (res.locals.device === DEVICE.MOBILE) {
    // 移动页面
    res.render('home/index-mobile', {
      title: '听说',
      blogs,
      articles,
    })
  } else {
    res.render('home/index', {
      title: '听说',
      blogs,
      articles,
    })
  }
}

/**
 * 404 页
 * @param req 
 * @param res 
 */
export const noFound = (req: Request, res: Response) => {
  res.status(404)
  res.render('home/404', {
    // src/views/partials/layout.pug
    override: true,
  })
}


/**
 * 错误页
 * @param req 
 * @param res 
 */
export const error = (req: Request, res: Response) => {
  res.status(500)
  res.render('home/error', {
    // src/views/partials/layout.pug
    override: true,
  })
}




/**
 * GET /link?url=String
 * 跳转页，用于统计，参数带 url 进行统计
 * @param req 
 * @param res 
 */
export const link = (req: Request, res: Response) => {
  log.info('redirect.call', Object.assign({}, req.params, req.query, req.body))
  if (!req.query.url) {
    log.error('redirect.params.url.invalid', req.query)
    res.redirect('/404')
    return
  }
  try {
    res.redirect(req.query.url)
  } catch (error) {
    log.error('redirect.catch', req.query)
    res.redirect('/404')
  }
}

/**
 * GET /back
 * 发送后端 HTML
 * @param req 
 * @param res 
 */
export const backend = (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, '../views/backend/index.html'))
}

/**
 * GET /rebots.txt
 * @param req 
 * @param res 
 */
export const rebots = (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, '../rebots.txt'))
}
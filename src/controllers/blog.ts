import { Request, Response } from 'express'
import { DEVICE } from '../models/server/enums'
import * as moment from 'moment'
import { Log } from '../utils/log'
import { getBlogByKey, updateBlogPV, queryAllBlog, queryBlogsByByCategoryName, updateBlogLike } from '../services/blog-service'
import { IBlog, BlogModel } from '../models/blog'
import { date2Local, date2day } from '../utils/format'
import { checkCategoryName, queryCategoryAll } from '../services/category-service'
import { CategoryModel } from '../models/category'
import { Returns } from '../models/Returns'
import { createUserLike, userLiked } from '../services/user-like-service'
import { LikeType } from '../models/user-like'
import { IViewBlog } from '../types/blog'

const ERRORS = {
  SERVER: new Returns(null, {
    code: 1,
    msg: 'server error',
    data: null,
  }),
  BLOGNOTFOUND: new Returns(null, {
    code: 2,
    msg: 'invalid',
    data: null,
  }),
}

/**
 * 匹配 mongoDB 的 ID
 */
const regMongodbId = /^[0-9a-zA-Z]{10,30}$/

const log = new Log('router/blog')


/**
 * 将文章对象的日期/头像/歌曲等信息进行处理
 * @param blog 
 */
const convertBlog2View = (blog: IBlog): IViewBlog => {
  const createTime = moment(blog.info.createTime);
  (blog as IViewBlog).info.day = date2day((blog.info as any).createTime);
  (blog as IViewBlog).info.time = createTime.format('HH:mm');
  (blog as IViewBlog).info.tag = createTime.format('YYYY年MM月');
  (blog as IViewBlog).info.localDate = date2Local(blog.info.createTime);
  (blog as IViewBlog).info.createTimeString = moment(blog.info.createTime).format('YYYY-MM-DD HH:mm')
  return blog as IViewBlog
}


/**
 * GET /blog
 * GET /blog/cate/:category
 * Home page.
 */
export const index = async (req: Request, res: Response) => {
  let blogModels: BlogModel[]
  let categoryName = ''
  // 是否展开分类列表
  let isOpenCategory = false

  // 有分类查询条件，并且分类名称符合规范，并且不是移动端访问
  if (req.params.category && checkCategoryName(req.params.category) && res.locals.device !== DEVICE.MOBILE) {
    categoryName = req.params.category.trim()
    blogModels = await queryBlogsByByCategoryName(categoryName)
  } else {
    blogModels = await queryAllBlog()
  }
  const blogs: IBlog[] = blogModels.map(blogModel => convertBlog2View(blogModel.toJSON() as any))
  if (res.locals.device === DEVICE.MOBILE) {
    res.render('blog/blog-mobile-index', {
      title: 'blog - 每一行代码都恰到好处',
      blogs,
    })
  } else {
    let categorys = await queryCategoryAll()
    let currentCategory: CategoryModel
    // 如果有分类查询，则标记出分类
    if (categoryName) {
      isOpenCategory = true
      currentCategory = categorys.find(category => {
        if (category.name === categoryName) {
          return true
        }
        return false
      })
    }
    // 没有查到文章列表，则默认页展开分类列表
    if (!blogs.length) {
      isOpenCategory = true
    }
    res.render('blog/blog-index', {
      title: 'blog - 每一行代码都恰到好处',
      pageIndex: 1,
      blogs,
      categorys,
      isOpenCategory,
      currentCategory,
    })
  }
}

// 匹配 key，10~20位数字，key 范围在 15~16 位，老 said 的 key 在 14 位
const regMatchKey = /^\d{10,20}$/


/**
 * GET /blog/:key.html
 * Home page.
 */
export const detail = async (req: Request, res: Response) => {
  if (!regMatchKey.test(req.params.key)) {
    res.redirect('/error', 404)
    return
  }
  const blogModel = await getBlogByKey(req.params.key)
  if (!blogModel) {
    res.redirect('/error', 404)
    return
  }
  // 查询用户是否 like 了这篇文章
  const userLike = await userLiked(res.locals.user._id, blogModel._id, LikeType.BLOG)
  let likeIt = false
  if (userLike > 0) {
    likeIt = true
  }

  // 累加 blog pv
  await updateBlogPV(blogModel._id)

  const blog = blogModel.toJSON() as IBlog
  (blog as IViewBlog).info.createTimeString = moment(blog.info.createTime).format('YYYY-MM-DD HH:mm')
  blog.info.pv++

  if (res.locals.device === DEVICE.MOBILE) {
    res.render('blog/blog-mobile-detail', {
      title: `${blog.title} - blog`,
      likeIt,
      blog,
    })
  } else {
    res.render('blog/blog-detail', {
      title: `${blog.title} - blog`,
      pageIndex: 1,
      likeIt,
      blog,
    })
  }
}


/**
 * POST /blog/like/ blogId=string
 * 用户 like 了文章
 * @param req 
 * @param res 
 */
export const userLike = async (req: Request, res: Response) => {
  log.info('userLike.call', Object.assign(req.query, req.body))
  const blogId = req.body.blogId
  if (!blogId || !regMongodbId.test(blogId)) {
    return res.json(ERRORS.BLOGNOTFOUND.toJSON())
  }
  let likeCounts = await updateBlogLike(blogId, res.locals.user)
  if (likeCounts && (likeCounts as any).nModified) {
    const userlike = await createUserLike({
      userId: res.locals.user._id,
      targetId: blogId,
      type: LikeType.BLOG,
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
}
import { Request, Response } from 'express'
import { DEVICE } from '../models/server/enums'
import * as moment from 'moment'
import { Log } from '../utils/log'
import { getBlogByKey, updateBlogPV, queryAllBlog, queryBlogsByByCategoryName } from '../services/blog-service'
import { IBlog, BlogModel } from '../models/blog'
import { date2Local, date2day } from '../utils/format'
import { checkCategoryName, queryCategoryAll } from '../services/category-service'
import { CategoryModel } from '../models/category'

const log = new Log('router/blog')



/**
 * GET /
 * Home page.
 */
export const index = async (req: Request, res: Response) => {
  let blogModels: BlogModel[]
  let categoryName = ''
  // 分类查询
  if (req.params.category && checkCategoryName(req.params.category)) {
    categoryName = req.params.category.trim()
    blogModels = await queryBlogsByByCategoryName(categoryName)
  } else {
    blogModels = await queryAllBlog()
  }
  const blogs: IBlog[] = blogModels.map(blogModel => {
    let blog = blogModel.toJSON() as any
    const createTime = moment(blog.info.createTime)
    blog.info.day = date2day(blog.info.createTime)
    blog.info.time = createTime.format('HH:mm')
    blog.info.tag = createTime.format('YYYY年MM月')
    blog.info.localDate = date2Local(blog.info.createTime)
    return blog
  })
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
      currentCategory = categorys.find(category => {
        if (category.name === categoryName) {
          return true
        }
        return false
      })
    }
    res.render('blog/blog-index', {
      title: 'blog - 每一行代码都恰到好处',
      pageIndex: 1,
      blogs,
      categorys,
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
  await updateBlogPV(req.params.key)
  const blog = blogModel.toJSON() as IBlog
  blog.info.createTime = moment(blog.info.createTime).format('YYYY-MM-DD HH:mm') as any
  blog.info.pv++
  if (res.locals.device === DEVICE.MOBILE) {
    res.render('blog/blog-mobile-detail', {
      title: 'blog - 每一行代码都恰到好处',
      blog,
    })
  } else {
    res.render('blog/blog-detail', {
      title: 'blog - 每一行代码都恰到好处',
      pageIndex: 1,
      blog,
    })
  }
}


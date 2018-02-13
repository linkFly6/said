import { Request, Response } from 'express'
import { blogContent } from '../models/mock'
import { DEVICE } from '../models/server/enums'

/**
 * GET /
 * Home page.
 */
export const index = (req: Request, res: Response) => {
  if (res.locals.device === DEVICE.MOBILE) {
    res.render('blog/blog-mobile-index', {
      title: 'blog - 每一行代码都恰到好处'
    })
  } else {
    res.render('blog/blog-index', {
      title: 'blog - 每一行代码都恰到好处'
    })
  }
}


/**
 * GET /blog/:id.html
 * Home page.
 */
export const detail = (req: Request, res: Response) => {
  if (res.locals.device === DEVICE.MOBILE) {
    res.render('blog/blog-mobile-detail', {
      title: 'blog - 每一行代码都恰到好处',
      content: blogContent,
    })
  } else {
    res.render('blog/blog-detail', {
      title: 'blog - 每一行代码都恰到好处',
      content: blogContent,
    })
  }
}


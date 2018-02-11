import { Request, Response } from 'express'
import { blogContent } from '../models/mock'

/**
 * GET /
 * Home page.
 */
export const index = (req: Request, res: Response) => {
  res.render('blog/blog-index', {
    title: 'blog - 每一行代码都恰到好处'
  })
}


/**
 * GET /blog/:id
 * Home page.
 */
export const detail = (req: Request, res: Response) => {
  res.render('blog/blog-detail', {
    title: 'blog - 每一行代码都恰到好处',
    content: blogContent,
  })
}


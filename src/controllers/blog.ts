import { Request, Response } from 'express'

/**
 * GET /
 * Home page.
 */
export const index = (req: Request, res: Response) => {
  res.render('blog', {
    title: 'blog - 每一行代码都恰到好处'
  })
}
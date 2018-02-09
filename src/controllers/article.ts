import { Request, Response } from 'express'

/**
 * GET /
 * Home page.
 */
export const index = (req: Request, res: Response) => {
  res.render('said/said-index', {
    title: '听说'
  })
}
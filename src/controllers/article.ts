import { Request, Response } from 'express'
import { blogContent } from '../models/mock'

/**
 * GET /
 * Home page.
 */
export const index = (req: Request, res: Response) => {
  res.render('said/said-index', {
    title: '听说'
  })
}

/**
 * GET /said/{id}.html
 * Home page.
 */
export const detail = (req: Request, res: Response) => {
  res.render('said/said-detail', {
    title: '听说',
    content: blogContent,
  })
}
import { Request, Response } from 'express'
import { blogContent } from '../models/mock'
import { DEVICE } from '../models/server/enums'

/**
 * GET /
 * Home page.
 */
export const index = (req: Request, res: Response) => {
  if (res.locals.device === DEVICE.MOBILE) {
    res.render('said/said-mobile-index', {
      title: '听说'
    })
  } else {
    res.render('said/said-index', {
      title: '听说'
    })
  }
}

/**
 * GET /said/{id}.html
 * Home page.
 */
export const detail = (req: Request, res: Response) => {
  if (res.locals.device === DEVICE.MOBILE) {
    res.render('blog/said-mobile-detail', {
      title: '听说'
    })
  } else {
    res.render('said/said-detail', {
      title: '听说',
      content: blogContent,
    })
  }
}
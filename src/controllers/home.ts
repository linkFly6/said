import { Request, Response } from 'express'
import { DEVICE } from '../models/server/enums'

/**
 * GET /
 * Home page.
 */
export const index = (req: Request, res: Response) => {
  if (res.locals.device === DEVICE.MOBILE) {
    // 移动页面
    res.render('home-mobile', {
      title: '听说'
    })
  } else {
    res.render('home', {
      title: '听说'
    })
  }
}

import { signature, signatureWithOption, Filter } from '../../middleware/routers/signature'
import { Request, Response, NextFunction } from 'express'


const debug = (name: string, value: string) => {
  console.log(`\n\n=========================${name}=============================\n`)
  console.log(`========= ${value} =========`)
  console.log('=============================\n\n')
}

export const token = signature(new Filter(
  'user',
  (req: Request, res: Response, next: NextFunction) => {
    
  },
))
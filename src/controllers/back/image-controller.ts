import { get, post } from '../../filters/http'
import { admin } from '../../filters/backend'
import { Log } from '../../utils/log'
import { ServiceError } from '../../models/server/said-error'
import { RouterError } from '../../middleware/routers/models'
import { createRecordNoError } from '../../services/admin-record-service'
import { Request, Response } from 'express'
import { OperationType } from '../../models/admin-record'
import { AdminRule, IAdmin } from '../../models/admin'
import { authentication } from '../../services/admin-service'
import * as multer from 'multer'

const ERRORS = {
  SERVER: new RouterError(1, '服务异常，请稍后重试'),
  PARAMS: new RouterError(2, '请求信息不正确'),
  DENIED: new RouterError(3, '无权进行该操作'),
  REMOVEFAIL: new RouterError(10, '删除失败，请稍后重试')
}

const upload = multer({ dest: './uploads/' }).single('img')

export default class {
  @get
  @admin
  public async query(params: { admin: IAdmin }, { log }: { log: Log }) {

  }


  @post
  @admin
  public async upload(params: { admin: IAdmin }, { log, req, res }: { log: Log, req: Request, res: Response }) {
    const promise = new Promise((resolve, reject) => {
      upload(req, res, (err: any) => {
        console.log(req)
        console.log(res)
        resolve(1)
      })
    })
    return promise
  }
}
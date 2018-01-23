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
import { ImageType } from '../../models/image'
import { Express } from 'express'
import { queryImagesByType, deleteImage, tempFolder, uploadImage } from '../../services/image-service'

const ERRORS = {
  SERVER: new RouterError(1, '服务异常，请稍后重试'),
  PARAMS: new RouterError(2, '请求信息不正确'),
  DENIED: new RouterError(3, '无权进行该操作'),
  CREATEFAIL: new RouterError(4, '上传图片失败'),
  REMOVEFAIL: new RouterError(10, '删除失败，请稍后重试')
}

const filterFileTypes = [
  'image/jpeg',
  'image/gif',
  'image/png',
  'image/webp'
]

const upload = multer({
  dest: tempFolder,
  // 对文件格式进行过滤
  fileFilter: (req, file, cb) => {
    cb(null, !!~filterFileTypes.indexOf(file.mimetype))
  }
}).single('img')

export default class {
  @get
  @admin
  public async query(params: { admin: IAdmin, imageType: ImageType }, { log }: { log: Log }) {
    if (isNaN(parseInt(params.imageType as any))) {
      return ERRORS.PARAMS
    }
    const res = await queryImagesByType(params.imageType)
    return res
  }

  @post
  @admin
  public async upload(params: { admin: IAdmin }, { log, req, res }: { log: Log, req: Request, res: Response }) {
    if (authentication(params.admin, AdminRule.GLOBAL)) {
      // 校验权限 
    }
    const uploader = await new Promise<{
      imageType: ImageType,
      img: Express.Multer.File
    } | null>((resolve, reject) => {
      upload(req, res, (err: any) => {
        if (err) {
          log.error('upload.reject', err)
          resolve(null)
        }
        log.info('upload.call', req.body)
        resolve({
          imageType: req.body.imageType,
          img: req.file
        })
      })
    })
    if (!uploader) {
      return ERRORS.PARAMS
    }
    try {
      return uploadImage(uploader.imageType, uploader.img)
    } catch (error) {
      if (ServiceError.is(error)) {
        log.error((error as ServiceError).title, (error as ServiceError).data)
        return new RouterError(100, (error as ServiceError).message)
      } else {
        log.error('catch', error)
      }
      return ERRORS.CREATEFAIL
    }
  }

  @post
  @admin
  public async delete(
    params: { admin: IAdmin, imageId: string, token: string },
    { log, req, res }: { log: Log, req: Request, res: Response }) {
    if (!params.imageId) {
      return ERRORS.PARAMS
    }
    if (authentication(params.admin, AdminRule.GLOBAL)) {
      return ERRORS.DENIED
    }
    const deleteInfo = await deleteImage(params.imageId, params.admin)
    await createRecordNoError('blog.remove', params, OperationType.Delete, req)
    log.info('res', res)
    return null
  }
}
import { get, post } from '../../filters/http'
import { admin } from '../../filters/backend'
import { Log } from '../../utils/log'
import { ServiceError } from '../../models/server/said-error'
import { RouterError } from '../../middleware/routers/models'
import { createRecordNoError } from '../../services/admin-record-service'
import { Request, Response, Express } from 'express'
import { OperationType } from '../../models/admin-record'
import { AdminRule, IAdmin } from '../../models/admin'
import { authentication } from '../../services/admin-service'
import image, { ImageType, IImage } from '../../models/image'
import { queryImagesByType, deleteImage, uploadImage, getFullUrlByQiniuImage, getThumbUrlByQiniuImage } from '../../services/image-service'
import { OutputImage } from '../../types/image'

const ERRORS = {
  SERVER: new RouterError(1, '服务异常，请稍后重试'),
  PARAMS: new RouterError(2, '请求信息不正确'),
  DENIED: new RouterError(3, '无权进行该操作'),
  CREATEFAIL: new RouterError(4, '上传图片失败'),
  DELETEFAIL: new RouterError(5, '删除失败，请稍后重试'),
}


/**
 * 把图片转换为前端格式图片
 * 新增属性： url/thumb
 */
const image2outputImage = (image: IImage): OutputImage => {
  return {
    _id: image._id,
    fileName: image.fileName,
    name: image.name,
    key: image.key,
    size: image.size,
    type: image.type,
    url: getFullUrlByQiniuImage(image.key),
    thumb: getThumbUrlByQiniuImage(image.key),
  }
}

// const upload = multer({
//   dest: tempFolder,
//   // 对文件格式进行过滤
//   fileFilter: (req, file, cb) => {
//     cb(null, !!~filterFileTypes.indexOf(file.mimetype))
//   }
// }).single('img')

export default class {
  @get
  @admin
  public async query(params: { admin: IAdmin, imageType: ImageType }, { log }: { log: Log }) {
    if (isNaN(parseInt(params.imageType as any))) {
      return ERRORS.PARAMS
    }
    const res = await queryImagesByType(params.imageType)
    log.info('res', res)
    return res.map<OutputImage>(img => image2outputImage(img))
  }

  @post
  @admin
  public async upload(
    params: { admin: IAdmin, imageType: ImageType },
    { log, req, res }: { log: Log, req: Request, res: Response }) {
    if (
      !authentication(params.admin, AdminRule.GLOBAL)
    ) {
      // 对应用户只有对应资源的上传权限
      if (params.admin.rule === AdminRule.BLOG && params.imageType != ImageType.Blog) {
        return ERRORS.DENIED
      }
      if (params.admin.rule === AdminRule.SAID && params.imageType != ImageType.Article) {
        return ERRORS.DENIED
      }
    }
    try {
      if (!req.files || !(req.files as Express.Multer.File[]).length) return ERRORS.PARAMS
      const image = await uploadImage(+params.imageType, req.files[0])
      log.info('res', image)
      // 把 七牛 key 转换成完整域名路径
      return image2outputImage(image)
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
    if (!authentication(params.admin, AdminRule.GLOBAL)) {
      return ERRORS.DENIED
    }

    try {
      const deleteInfo = await deleteImage(params.imageId, params.admin)
      await createRecordNoError('image.remove', params, OperationType.Delete, req)
      log.info('res', deleteInfo)
      return null
    } catch (error) {
      if (ServiceError.is(error)) {
        log.error((error as ServiceError).title, (error as ServiceError).data)
        return new RouterError(100, (error as ServiceError).message)
      } else {
        log.error('catch', error)
      }
      return ERRORS.DELETEFAIL
    }
  }
}
import { get, post } from '../../filters/http'
import { admin } from '../../filters/backend'
import { Log } from '../../utils/log'
import { SimpleAdmin } from '../../types/admin'
import { SimpleBlog } from '../../types/blog'
import { ServiceError } from '../../models/server/said-error'
import { queryAllBlogByAdmin, createBlog, updateBlog, removeBlog } from '../../services/blog-service'
import { RouterError } from '../../middleware/routers/models'
import { createRecordNoError } from '../../services/admin-record-service'
import { Request } from 'express'
import { OperationType } from '../../models/admin-record'
import { AdminRule } from '../../models/admin'
import { authentication } from '../../services/admin-service'

const ERRORS = {
  SERVER: new RouterError(1, '服务异常，请稍后重试'),
  PARAMS: new RouterError(2, '请求信息不正确'),
  DENIED: new RouterError(3, '无权进行该操作'),
  REMOVEFAIL: new RouterError(10, '删除失败，请稍后重试')
}


const validateParams = (params: { entity: SimpleBlog, admin: SimpleAdmin }, req: Request, log: Log) => {
  if (!params.entity) {
    log.error('params', params)
    return ERRORS.PARAMS
  }
  req.check('entity.title')
    .notEmpty().withMessage('文章标题必须填写')
    .isLength({ max: 40 }).withMessage('文章标题必须在 40 个字符内')
  req.check('entity.context').notEmpty().withMessage('文章内容不允许为空')
  req.check('entity.summary').notEmpty().withMessage('文章描述不能为空')
  req.check('entity.category').notEmpty().withMessage('分类不能为空')

  const errors = req.validationErrors()
  if (errors) {
    log.error('params', { params, errors })
    return new RouterError(2, errors[0].msg)
  }
  if (!Array.isArray(params.entity.tags)) {
    log.error('params', params)
    return new RouterError(2, '标签信息不正确')
  }
  return null
}


export default class {
  @get
  @admin
  public async query(params: { admin: SimpleAdmin }, { log }: { log: Log }) {
    try {
      if (!authentication(params.admin, AdminRule.BLOG)) {
        log.error('authentication.denied', params)
        return ERRORS.DENIED
      }
      let res = await queryAllBlogByAdmin(params.admin)
      log.info('res', res)
      return res
    } catch (error) {
      log.error('catch', error)
      return ERRORS.SERVER
    }
  }

  @post
  @admin
  public async create(
    params: { entity: SimpleBlog, admin: SimpleAdmin, token: string },
    { log, req }: { log: Log, req: Request }) {
    validateParams(params, req, log)
    if (!params.entity.config) {
      params.entity.config = {}
    }
    try {
      let res = await createBlog(params.entity, params.admin)
      await createRecordNoError('blog.create', params, OperationType.Create, req)
      log.info('res', res)
      return res
    } catch (error) {
      log.error('catch', error)
      return ERRORS.SERVER
    }
  }

  @post
  @admin
  public async update(
    params: { entity: SimpleBlog, admin: SimpleAdmin, token: string },
    { log, req }: { log: Log, req: Request }) {

    validateParams(params, req, log)

    try {
      let res = await updateBlog(params.entity, params.admin)
      await createRecordNoError('blog.update', params, OperationType.Update, req)
      log.info('res', res)
      return res
    } catch (error) {
      log.error('catch', error)
      return ERRORS.SERVER
    }
  }

  @post
  @admin
  public async remove(
    params: { id: string, admin: SimpleAdmin, token: string },
    { log, req }: { log: Log, req: Request }) {
    if (!params.id) {
      log.error('params', params)
      return ERRORS.PARAMS
    }
    try {
      let res = await removeBlog(params.id, params.admin)
      await createRecordNoError('blog.remove', params, OperationType.Delete, req)
      log.info('res', res)
      return res
    } catch (error) {
      log.error('catch', error)
      return ERRORS.REMOVEFAIL
    }
  }
}


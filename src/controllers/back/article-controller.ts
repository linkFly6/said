import { get, post } from '../../filters/http'
import { admin } from '../../filters/backend'
import { Log } from '../../utils/log'
import { ServiceError } from '../../models/server/said-error'
import { queryAllArticleByAdmin, createArticle, updateArtice, removeArticle, queryArticleById, article2SimpleArticle } from '../../services/article-service'
import { RouterError } from '../../middleware/routers/models'
import { createRecordNoError } from '../../services/admin-record-service'
import { Request } from 'express'
import { OperationType } from '../../models/admin-record'
import { AdminRule, IAdmin } from '../../models/admin'
import { authentication } from '../../services/admin-service'
import { BlogModel } from '../../models/blog'
import { SimpleArticle } from '../../types/article'
import { ArticleModel } from '../../models/article'

const ERRORS = {
  SERVER: new RouterError(1, '服务异常，请稍后重试'),
  PARAMS: new RouterError(2, '请求信息不正确'),
  DENIED: new RouterError(3, '无权进行该操作'),
  QUERYFAIL: new RouterError(4, '查询信息失败'),
  REMOVEFAIL: new RouterError(10, '删除失败，请稍后重试')
}

/**
 * 验证新增和修改文章的基本参数
 * @param params 
 * @param req 
 * @param log 
 */
const validateParams = (params: { entity: SimpleArticle, admin: IAdmin }, req: Request, log: Log) => {
  if (!params.entity) {
    log.error('params', params)
    return ERRORS.PARAMS
  }
  req.check('entity.title')
    .notEmpty().withMessage('文章标题必须填写')
    .isLength({ max: 40 }).withMessage('文章标题必须在 40 个字符内')
  req.check('entity.context').notEmpty().withMessage('文章内容不允许为空')
  req.check('entity.summary')
    .notEmpty().withMessage('文章描述不能为空')
    .isLength({ max: 200 }).withMessage('文章描述只能在 200 字以内')
  req.check('entity.songId').notEmpty().isLength({ max: 100 }).withMessage('歌曲信息不正确')
  req.check('entity.posterId').notEmpty().isLength({ max: 100 }).withMessage('文章图片不正确')

  const errors = req.validationErrors()
  if (errors) {
    log.error('params', { params, errors })
    return new RouterError(2, errors[0].msg)
  }

  return null
}


export default class {
  @get
  @admin
  public async query(params: { admin: IAdmin }, { log }: { log: Log }) {
    try {
      if (!authentication(params.admin, AdminRule.SAID)) {
        log.error('authentication.denied', params)
        return ERRORS.DENIED
      }

      // TODO article2SimpleArticle
      let res = await queryAllArticleByAdmin(params.admin)
      log.info('res', res)
      return res.map(a => article2SimpleArticle(a))
    } catch (error) {
      log.error('catch', error)
      return ERRORS.SERVER
    }
  }

  @post
  @admin
  public async create(
    params: { entity: SimpleArticle, admin: IAdmin, token: string },
    { log, req }: { log: Log, req: Request }) {
    if (!authentication(params.admin, AdminRule.SAID)) {
      log.error('authentication.denied', params)
      return ERRORS.DENIED
    }
    const validateResult = validateParams(params, req, log)
    if (validateResult) {
      return validateResult
    }

    try {
      let res = await createArticle(params.entity, params.admin)
      await createRecordNoError('article.create', params, OperationType.Create, req)
      log.info('res', res)
      return res
    } catch (error) {
      if (ServiceError.is(error)) {
        log.error((error as ServiceError).title, (error as ServiceError).data)
        return new RouterError(100, (error as ServiceError).message)
      } else {
        log.error('catch', error)
      }
      return ERRORS.SERVER
    }
  }

  @post
  @admin
  public async update(
    params: { entity: SimpleArticle, admin: IAdmin, token: string },
    { log, req }: { log: Log, req: Request }) {
    if (!authentication(params.admin, AdminRule.SAID)) {
      log.error('authentication.denied', params)
      return ERRORS.DENIED
    }
    if (!params.entity._id) {
      log.error('article._id.empty', params)
      return ERRORS.PARAMS
    }
    const validateResult = validateParams(params, req, log)
    if (validateResult) {
      return validateResult
    }


    try {
      let res = await updateArtice(params.entity, params.admin)
      await createRecordNoError('article.update', params, OperationType.Update, req)
      log.info('res', res)
      return res
    } catch (error) {
      if (ServiceError.is(error)) {
        log.error((error as ServiceError).title, (error as ServiceError).data)
        return new RouterError(100, (error as ServiceError).message)
      } else {
        log.error('catch', error)
      }
      return ERRORS.SERVER
    }
  }

  @post
  @admin
  public async remove(
    params: { articleId: string, admin: IAdmin, token: string },
    { log, req }: { log: Log, req: Request }) {
    if (!authentication(params.admin, AdminRule.SAID)) {
      log.error('authentication.denied', params)
      return ERRORS.DENIED
    }
    if (!params.articleId) {
      log.error('params', params)
      return ERRORS.PARAMS
    }
    try {
      let res = await removeArticle(params.articleId, params.admin)
      await createRecordNoError('article.remove', params, OperationType.Delete, req)
      log.info('res', res)
      return null
    } catch (error) {
      if (ServiceError.is(error)) {
        log.error((error as ServiceError).title, (error as ServiceError).data)
        return new RouterError(100, (error as ServiceError).message)
      } else {
        log.error('catch', error)
      }
      return ERRORS.REMOVEFAIL
    }
  }

  /**
   * 查询编辑文章需要的基础数据
   * @param params 
   * @param param1 
   */
  @admin
  public async base(params: { articleId: string, admin: IAdmin }, { log }: { log: Log }) {
    if (!authentication(params.admin, AdminRule.SAID)) {
      log.error('authentication.denied', { params, admin })
      return ERRORS.DENIED
    }
    if (!params.articleId) {
      log.error('empty.articleId', { params, admin })
      return ERRORS.PARAMS
    }
    let article: ArticleModel | null = null

    try {
      // TODO article2SimpleArticle
      article = await queryArticleById(params.articleId, params.admin)
    } catch (error) {
      if (ServiceError.is(error)) {
        log.error((error as ServiceError).title, (error as ServiceError).data)
        return new RouterError(100, (error as ServiceError).message)
      } else {
        log.error('catch', error)
      }
      return ERRORS.QUERYFAIL
    }

    log.info('res.base', { article })
    return { article: article2SimpleArticle(article) }
  }
}


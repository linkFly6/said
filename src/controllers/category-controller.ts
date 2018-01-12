import { get, post } from '../filters/http'
import { admin } from '../filters/backend'
import { Log } from '../utils/log'
import { SimpleAdmin } from '../types/admin'
import { ServiceError } from '../models/server/said-error'
import { queryCategoryAll, createCategory, updateCategoryById, removeCategory } from '../services/category-service'
import { RouterError } from '../middleware/routers/models'
import { createRecordNoError } from '../services/admin-record-service'
import { Request } from 'express'
import { OperationType } from '../models/admin-record'

const ERRORS = {
  SERVER: new RouterError(1, '服务异常，请稍后重试'),
  PARAMS: new RouterError(2, '请求信息不正确'),
  PARAMSLENGTH: new RouterError(3, '类型名称或图片名称过长'),
  REMOVEFAIL: new RouterError(10, '删除失败，请稍后重试')
}


export default class {
  @get
  @admin
  public async query(params: { user: SimpleAdmin }, { log }: { log: Log }) {
    try {
      let res = await queryCategoryAll()
      log.info('query', res)
      return res
    } catch (error) {
      log.error('catch', error)
      return ERRORS.SERVER
    }
  }

  @post
  @admin
  public async create(
    params: { entity: { icon: string, name: string }, user: SimpleAdmin, token: string },
    { log, req }: { log: Log, req: Request }) {
    if (!params.entity || !params.entity.icon || !params.entity.name) {
      log.error('params', params)
      return ERRORS.PARAMS
    }
    if ((params.entity.icon + '').length > 36 || (params.entity.name + '').length > 18) {
      return ERRORS.PARAMSLENGTH
    }
    try {
      let res = await createCategory({
        icon: params.entity.icon,
        name: params.entity.name,
        createTime: Date.now()
      })
      await createRecordNoError(params, OperationType.Create, req)
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
    params: { entity: { id: string, icon: string, name: string }, user: SimpleAdmin, token: string },
    { log, req }: { log: Log, req: Request }) {
    if (!params.entity || !params.entity.id || (!params.entity.icon && !params.entity.name)) {
      log.error('params', params)
      return ERRORS.PARAMS
    }

    if ((params.entity.icon + '').length > 36 || (params.entity.name + '').length > 18) {
      return ERRORS.PARAMSLENGTH
    }

    try {
      let res = await updateCategoryById(params.entity.id, {
        icon: params.entity.icon,
        name: params.entity.name,
      })
      await createRecordNoError(params, OperationType.Update, req)
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
    params: { id: string, user: SimpleAdmin, token: string },
    { log, req }: { log: Log, req: Request }) {
    if (!params.id) {
      log.error('params', params)
      return ERRORS.PARAMS
    }
    try {
      let res = await removeCategory(params.id)
      await createRecordNoError(params, OperationType.Delete, req)
      log.info('res', res)
      return res
    } catch (error) {
      log.error('catch', error)
      return ERRORS.REMOVEFAIL
    }
  }
}


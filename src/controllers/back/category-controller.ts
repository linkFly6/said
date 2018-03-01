import { get, post } from '../../filters/http'
import { admin } from '../../filters/backend'
import { Log } from '../../utils/log'
import { ServiceError } from '../../models/server/said-error'
import { queryCategoryAll, createCategory, updateCategoryById, removeCategory, checkCategoryName, getIcons, inIcons } from '../../services/category-service'
import { RouterError } from '../../middleware/routers/models'
import { createRecordNoError } from '../../services/admin-record-service'
import { Request } from 'express'
import { OperationType } from '../../models/admin-record'
import { IAdmin } from '../../models/admin'

const ERRORS = {
  SERVER: new RouterError(1, '服务异常，请稍后重试'),
  PARAMS: new RouterError(2, '请求信息不正确'),
  PARAMSLENGTH: new RouterError(3, '图片名称过长，或类型名称不正确，只允许包含以下项：字母、数字、点(.)、下划线(_)'),
  REMOVEFAIL: new RouterError(10, '删除失败，请稍后重试')
}


export default class {
  @get
  @admin
  public async base(params: { admin: IAdmin }, { log }: { log: Log }) {
    try {
      let categorys = await queryCategoryAll()
      let icons = getIcons()
      log.info('res', { categorys, icons })
      return {
        categorys,
        icons,
      }
    } catch (error) {
      log.error('catch', error)
      return ERRORS.SERVER
    }
  }

  @post
  @admin
  public async create(
    params: { entity: { icon: string, name: string }, admin: IAdmin, token: string },
    { log, req }: { log: Log, req: Request }) {
    if (!params.entity || !params.entity.icon || !params.entity.name) {
      log.error('params', params)
      return ERRORS.PARAMS
    }
    let icons = getIcons()
    // 没有在系统支持的 icon 列表中找到 icon
    if (!inIcons(params.entity.icon) || !checkCategoryName(params.entity.name)) {
      return ERRORS.PARAMSLENGTH
    }
    try {
      let res = await createCategory({
        icon: params.entity.icon,
        name: params.entity.name,
        createTime: Date.now()
      })
      await createRecordNoError('category.create', params, OperationType.Create, req)
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
    params: { entity: { id: string, icon: string, name: string }, admin: IAdmin, token: string },
    { log, req }: { log: Log, req: Request }) {
    if (!params.entity || !params.entity.id || (!params.entity.icon && !params.entity.name)) {
      log.error('params', params)
      return ERRORS.PARAMS
    }

    if (!inIcons(params.entity.icon) || !checkCategoryName(params.entity.name)) {
      return ERRORS.PARAMSLENGTH
    }

    try {
      // TODO 这里应该把所有的分类引用都修改，比如 blog 里面的
      let res = await updateCategoryById(params.entity.id, {
        icon: params.entity.icon,
        name: params.entity.name,
      })
      await createRecordNoError('category.update', params, OperationType.Update, req)
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
    params: { id: string, admin: IAdmin, token: string },
    { log, req }: { log: Log, req: Request }) {
    if (!params.id) {
      log.error('params', params)
      return ERRORS.PARAMS
    }
    try {
      // 这里应该把文章里所有的分类都删除并且重新引用
      let res = await removeCategory(params.id)
      await createRecordNoError('create.remove', params, OperationType.Delete, req)
      log.info('res', res)
      return res
    } catch (error) {
      log.error('catch', error)
      return ERRORS.REMOVEFAIL
    }
  }
}


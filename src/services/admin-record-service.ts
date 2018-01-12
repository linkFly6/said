import { default as AdminRecordDb, AdminRecordModel, OperationType, IAdminRecord } from '../models/admin-record'
import { Log } from '../utils/log'
import { Request } from 'express'

const log = new Log('service/admin-record')

/**
 * 新增记录
 * @param record 
 */
export const createRecord = (record: IAdminRecord) => {
  log.info('createRecord.call', record)
  const recordDb = new AdminRecordDb(record)
  return recordDb.save()
}


/**
 * 新增记录，但是不抛出异常，错误会写 log，用于不阻塞业务操作
 * @param record 
 */
export const createRecordNoError = (params: any, type: OperationType, req: Request) => {
  log.warn('createRecordNoError.call', params)
  const recordDb = new AdminRecordDb({
    token: params.token,
    ip: req.ip,
    headers: req.rawHeaders.join('\n'),
    createTime: Date.now(),
    type,
    admin: {
      _id: params.user.id,
    }
  })
  return recordDb.save().catch(err => {
    log.error('createRecordNoError.catch', err)
    return null
  })
}
import { default as AdminRecordDb, AdminRecordModel, OperationType, IAdminRecord } from '../models/admin-record'
import { Log } from '../utils/log'
import { Request } from 'express'
import { IAdmin } from '../models/admin'

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
export const createRecordNoError = (title: string, params: { token: string, admin: IAdmin }, type: OperationType, req: Request) => {
  log.warn(`${title}.createRecordNoError.call`, params)
  const recordDb = new AdminRecordDb({
    title,
    token: params.token,
    ip: req.ip,
    headers: req.rawHeaders.join('\n'),
    createTime: Date.now(),
    type,
    admin: {
      _id: params.admin._id,
    }
  })
  return recordDb.save().catch(err => {
    log.error('createRecordNoError.catch', err)
    return null
  })
}
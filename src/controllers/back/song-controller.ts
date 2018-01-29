import { get, post } from '../../filters/http'
import { admin } from '../../filters/backend'
import { Log } from '../../utils/log'
import { ServiceError } from '../../models/server/said-error'
import { RouterError } from '../../middleware/routers/models'
import { createRecordNoError } from '../../services/admin-record-service'
import { Request, Response } from 'express'
import { OperationType } from '../../models/admin-record'
import { AdminRule, IAdmin } from '../../models/admin'
import { authentication, } from '../../services/admin-service'
import { uploadSong, getFullUrlByQiniuKey } from '../../services/song-service'

const ERRORS = {
  SERVER: new RouterError(1, '服务异常，请稍后重试'),
  PARAMS: new RouterError(2, '请求信息不正确'),
  DENIED: new RouterError(3, '无权进行该操作'),
  CREATEFAIL: new RouterError(4, '上传歌曲文件失败'),
  DELETEFAIL: new RouterError(5, '删除失败，请稍后重试'),
}


export default class {
  @get
  @admin
  public async query(params: { admin: IAdmin }, { log }: { log: Log }) {
    return {}
  }

  @post
  @admin
  public async upload(
    params: { admin: IAdmin },
    { log, req, res }: { log: Log, req: Request, res: Response }
    ) {
    if (
      !authentication(params.admin, AdminRule.SAID)
    ) {
      return ERRORS.DENIED
    }
    try {
      if (!req.files || !(req.files as Express.Multer.File[]).length) return ERRORS.PARAMS
      const song = await uploadSong(req.files[0])
      log.info('res', song)
      // 把 七牛 key 转换成完整域名路径
      return {
        url: getFullUrlByQiniuKey(song.key),
        ...song,
      }
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

}
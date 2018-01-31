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
import { uploadSong, saveSong, queryAll, song2outputSong, removeSong } from '../../services/song-service'
import song, { ISong } from '../../models/song'
import { getFullUrlByQiniuKey } from '../../utils/file'
import { article2SimpleArticle } from '../../services/article-service'

const ERRORS = {
  SERVER: new RouterError(1, '服务异常，请稍后重试'),
  PARAMS: new RouterError(2, '请求信息不正确'),
  DENIED: new RouterError(3, '无权进行该操作'),
  UPLOADFAIL: new RouterError(4, '上传歌曲文件失败'),
  DELETEFAIL: new RouterError(5, '删除失败，请稍后重试'),
  SAVEFAIL: new RouterError(6, '保存歌曲信息失败，请稍后重试'),
}


/**
 * 验证 blog 基本参数
 * @param params 
 * @param req 
 * @param log 
 */
const validateParams = (params: { entity: ISong, admin: IAdmin }, req: Request, log: Log) => {
  if (!params.entity) {
    log.error('params', params)
    return ERRORS.PARAMS
  }
  req.check('entity.name')
    .notEmpty()
    .isLength({ max: 100 }).withMessage('存储 name 不正确')
  req.check('entity.name')
    .notEmpty()
    .isLength({ max: 100 }).withMessage('存储 key 不正确')
  req.check('entity.title').notEmpty().isLength({ max: 100 }).withMessage('歌曲名称不正确')
  req.check('entity.artist').notEmpty().isLength({ max: 100 }).withMessage('歌手名称不正确')
  req.check('entity.album').notEmpty().isLength({ max: 100 }).withMessage('专辑名称不正确')
  req.check('entity.size').notEmpty().isLength({ max: 100 }).withMessage('歌曲文件信息不正确')
  req.check('entity.mimeType').notEmpty().isLength({ max: 100 }).withMessage('歌曲文件类型不正确')
  req.check('entity.duration').notEmpty().isLength({ max: 100 }).withMessage('歌曲时长不正确')
  req.check('entity.image._id').notEmpty().isLength({ max: 100 }).withMessage('歌曲封面信息不正确')

  const errors = req.validationErrors()
  if (errors) {
    log.error('params', { params, errors })
    return new RouterError(2, errors[0].msg)
  }
  if (isNaN(+params.entity.duration)) {
    log.error('params', params)
    return new RouterError(3, '歌曲时长信息不正确')
  }
  if (isNaN(+params.entity.size)) {
    log.error('params', params)
    return new RouterError(4, '歌曲文件信息不正确')
  }
  return null
}


export default class {
  @get
  @admin
  public async query(params: { admin: IAdmin }, { log }: { log: Log }) {
    if (!authentication(params.admin, AdminRule.SAID)) {
      log.error('authentication.denied', params)
      return ERRORS.DENIED
    }
    const res = await queryAll(params.admin)
    log.info('res', res)
    return res.map(song2outputSong)
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
      log.error('authentication.denied', params)
      return ERRORS.DENIED
    }
    try {
      if (!req.files || !(req.files as Express.Multer.File[]).length) return ERRORS.PARAMS
      const song = await uploadSong(req.files[0])
      log.info('res', song);
      // 把 七牛 key 转换成完整域名路径
      (song as any).url = getFullUrlByQiniuKey(song.key)
      return song
    } catch (error) {
      if (ServiceError.is(error)) {
        log.error((error as ServiceError).title, (error as ServiceError).data)
        return new RouterError(100, (error as ServiceError).message)
      } else {
        log.error('catch', error)
      }
      return ERRORS.UPLOADFAIL
    }
  }

  @post
  @admin
  public async save(
    params: { entity: ISong, admin: IAdmin },
    { log, req }: { log: Log, req: Request }
    ) {
    if (
      !authentication(params.admin, AdminRule.SAID)
    ) {
      log.error('authentication.denied', params)
      return ERRORS.DENIED
    }

    const validateResult = validateParams(params, req, log)
    if (validateResult) {
      return validateResult
    }
    try {
      const song = await saveSong(params.entity, params.admin)
      log.info('res', song)
      return song2outputSong(song)
    } catch (error) {
      if (ServiceError.is(error)) {
        log.error((error as ServiceError).title, (error as ServiceError).data)
        return new RouterError(100, (error as ServiceError).message)
      } else {
        log.error('catch', error)
      }
      return ERRORS.SAVEFAIL
    }

  }

  @post
  @admin
  public async removeFile(
    params: { md5: string, admin: IAdmin },
    { log, req }: { log: Log, req: Request }
    ) {
    if (!params.md5) {
      log.error('params.md5.empty', params)
      return false
    }
    if (
      !authentication(params.admin, AdminRule.GLOBAL)
    ) {
      log.error('authentication.denied', params)
      return ERRORS.DENIED
    }
    // 记录一条日志，不做删除处理
    log.warn('removeFile.call', params)
    return true
  }

  @post
  @admin
  public async delete(
    params: { songId: string, admin: IAdmin },
    { log, req }: { log: Log, req: Request }
    ) {
    if (!params.songId) {
      log.error('params.songId.empty', params)
      return false
    }
    if (
      !authentication(params.admin, AdminRule.GLOBAL)
    ) {
      log.error('authentication.denied', params)
      return ERRORS.DENIED
    }
    try {
      const song = await removeSong(params.songId, params.admin)
      log.info('res', song)
      return true
    } catch (error) {
      if (ServiceError.is(error)) {
        log.error(error!.title, error!.data)
        // 歌曲正在被文章引用
        if (error.title === 'removeSong.queryArticlesBySong.exists') {
          // 同时把文章数据返回给前端，以便前端展现
          return new RouterError(101, error!.message, error!.data.map(article2SimpleArticle))
        }
        return new RouterError(100, error!.message)
      } else {
        log.error('catch', error)
      }
      return ERRORS.SAVEFAIL
    }
  }
}

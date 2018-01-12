import { get } from '../../filters/http'
import { path } from '../../filters/backend'
import { Log } from '../../utils/log'
import { Request } from 'express'
import { login, getUserInfoByToken } from '../../services/admin-service'
import { ServiceError } from '../../models/server/said-error'
import { RouterError } from '../../middleware/routers/models'


const ERRORS: { [prop: string]: RouterError } = {
  SERVER: new RouterError(1, '服务异常'),
  PARAMS: new RouterError(2, '登录信息不正确'),
  SERVICEERROR: new RouterError(3, '登录失败'),
  NOTUSER: new RouterError(4, '暂无用户信息'),
  TOKENFAIL: new RouterError(5, '获取用户信息不正确'),
  LOGINFAIL: new RouterError(6, '用户登录信息已失效，请重新登录'),
}

export default class {
  @get
  @path('/back/api/login')
  public async login({ username, password }: { username: string, password: string }, { log, req }: { log: Log, req: Request }) {
    req.assert('username')
      .notEmpty()
      .isLength({ max: 40 })
    req.assert('password')
      .notEmpty()
      .isLength({ max: 30 })
    const errors = req.validationErrors()
    if (errors) {
      return ERRORS.PARAMS
    }
    try {
      const record = await login(username, password, req.ips.join(','), req.rawHeaders.join('\n'))
      log.info('login.res', record)
      if (!record) {
        return ERRORS.NOTUSER
      }
      return {
        token: record.token,
        nickName: record.admin.nickName,
        avatar: record.admin.avatar || '',
        email: record.admin.email || '',
        bio: record.admin.bio || '',
        rule: record.admin.rule,
      }
    } catch (error) {
      if (ServiceError.is(error)) {
        log.error((error as ServiceError).title, (error as ServiceError).data)
      } else {
        log.error('catch', error)
      }
      return ERRORS.SERVER
    }
  }

  @get
  @path('/back/api/getUserByToken')
  public async getUserByToken({ token }: { token: string }, { log }: { log: Log }) {
    if (!token) {
      return ERRORS.TOKENFAIL
    }
    try {
      // return ERRORS.LOGINFAIL
      let res = getUserInfoByToken(token)
      log.info('getUserInfoByToken.res', res)
      return res
    } catch (error) {
      if (ServiceError.is(error)) {
        log.error((error as ServiceError).title, (error as ServiceError).data)
      } else {
        log.error('catch', error)
      }
      return ERRORS.LOGINFAIL
    }
  }
}
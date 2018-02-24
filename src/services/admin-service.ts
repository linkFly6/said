import admin, { default as AdminDb, AdminModel, AdminRule, IAdmin } from '../models/admin'
import { default as AdminRecordDb, AdminRecordModel, OperationType, IAdminRecord } from '../models/admin-record'
import { Log } from '../utils/log'
import * as jwt from 'jsonwebtoken'
import { ServiceError } from '../models/server/said-error'
import * as crypto from 'crypto'
import { SimpleAdmin } from '../types/admin'
const log = new Log('service/admin')


/**
 * 加密密码
 */
export const cryptoPassword = (password: string) => {
  // 先 md5 不可逆加密
  const md5 = crypto.createHash('md5')
  md5.update(password, 'utf8')
  const md5Str = md5.digest('hex')
  // 再 aes 对称加密(密匙私有!)
  const aes = crypto.createCipher('aes-256-cbc', process.env.PASSWORD_SECRET)
  return aes.update(md5Str, 'utf8', 'hex') + aes.final('hex')
}

/**
 * 用户登录
 * @param username 
 * @param password 
 * @param ip 
 * @param headers 
 */
export const login = (username: string, password: string, ip: string, headers: string) => {
  log.info('login.call', { username, ip, headers })

  // 对密码进行加密
  password = cryptoPassword(password)

  return AdminDb.findOne({ username, password }).exec((err, admin) => {
    if (err) {
      throw new ServiceError('login.findOne', err)
    }
    return admin
  }).then<IAdminRecord | null>((admin: AdminModel | null) => {
    if (!admin) return null
    let token: string
    try {
      token = jwt.sign({
        id: admin._id,
      }, process.env.JWT_SECRET, {
          expiresIn: '45 days'
        })
    } catch (error) {
      throw new ServiceError('login.findOne.jwt.sign', error)
    }
    const record: IAdminRecord = {
      token,
      ip,
      headers,
      createTime: Date.now(),
      type: OperationType.Login,
      admin: {
        _id: admin._id,
      }
    } as any
    log.info('login.record.model', record)
    const recordDb = new AdminRecordDb(record)
    return new Promise<IAdminRecord>(resolve => {
      recordDb.save(err => {
        if (err) {
          throw new ServiceError('service.login.record.save', err)
        }
        record.admin = {
          id: admin._id,
          nickName: admin.nickName,
          avatar: admin.avatar,
          email: admin.email,
          bio: admin.bio,
          rule: admin.rule,
        } as any
        resolve(record)
      })
    })
  })
}

/**
 * 根据 token 获取用户 ID
 * @param token 
 */
export const getAdminIdByToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET) as { id: string }
}

/**
 * 根据用户 ID 获取用户信息
 * @param adminId
 */
export const getAdminInfoById = (adminId: string) => {
  return AdminDb.findById(adminId).exec()
}

/**
 * 对用户鉴权
 */
export const authentication = (admin: IAdmin, rule: AdminRule) => {
  if (admin.rule === AdminRule.GLOBAL) return true
  return admin.rule === rule
}


/**
 * 根据 token 获取用户信息
 * @param token 
 */
export const getAdminInfoByToken = async (token: string) => {
  log.info('getAdminInfoByToken.call', token)
  try {
    let tokenInfo = getAdminIdByToken(token)
    log.info('getAdminInfoByToken.getUserIdByToken', { token, tokenInfo })
    if (!tokenInfo || !tokenInfo.id) {
      throw new ServiceError('getAdminInfoByToken.tokenInfo.empty', { tokenInfo, token }, '获取用户信息失败')
    }
    const resAdmin: IAdmin = await getAdminInfoById(tokenInfo.id)
    if (!resAdmin) {
      throw new ServiceError('getAdminInfoByToken.getAdminInfoById.empty', { tokenInfo, token }, '获取用户信息失败')
    }
    log.info('getAdminInfoByToken.getAdminInfoById.res', resAdmin)
    const admin: SimpleAdmin = {
      _id: resAdmin._id,
      nickName: resAdmin.nickName,
      rule: resAdmin.rule
    }
    if (resAdmin.avatar) {
      admin.avatar = resAdmin.avatar
    }
    if (resAdmin.email) {
      admin.email = resAdmin.email
    }
    if (resAdmin.bio) {
      admin.bio = resAdmin.bio
    }
    return admin
  } catch (error) {
    if (ServiceError.is(error)) {
      log.error(`getAdminInfoByToken.${(error as ServiceError).title}`, (error as ServiceError).data)
    } else {
      log.error('getAdminInfoByToken.catch', error)
    }
    throw error
  }
}

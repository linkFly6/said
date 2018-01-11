import { default as AdminDb, AdminModel, AdminRule } from '../models/admin'
import { default as AdminRecordDb, AdminRecordModel, OperationType, IAdminRecord } from '../models/admin-record'
import { Log } from '../utils/log'
import * as jwt from 'jsonwebtoken'
import { ServiceError } from '../models/server/said-error'
import * as crypto from 'crypto'

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
  log.info('service.login.call', { username, ip, headers })

  // 对密码进行加密
  password = cryptoPassword(password)

  return AdminDb.findOne({ username, password }).exec((err, admin) => {
    if (err) {
      throw new ServiceError('service.login.findOne', err)
    }
    return admin
  }).then<IAdminRecord | null>((admin: AdminModel | null) => {
    if (!admin) return null
    let token: string
    try {
      token = jwt.sign({
        nickName: admin.nickName,
        avatar: admin.avatar,
        bio: admin.bio,
        rule: admin.rule,
        email: admin.email,
      }, process.env.JWT_SECRET, {
          expiresIn: '45 days'
        })
    } catch (error) {
      throw new ServiceError('service.login.findOne.jwt.sign', error)
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
    log.info('service.login.record.model', record)
    const recordDb = new AdminRecordDb(record)
    return new Promise<IAdminRecord>(resolve => {
      recordDb.save(err => {
        if (err) {
          throw new ServiceError('service.login.record.save', err)
        }
        record.admin = {
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
 * 根据 token 获取用户信息
 * @param token 
 */
export const getUserInfoByToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET) as {
    nickName: string,
    avatar: string,
    bio: string,
    rule: AdminRule,
    email: string,
  }
}
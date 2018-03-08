import userDb, { IUser, UserModel, UserSchema, UserRole } from '../models/user'
import { Log } from '../utils/log'
import * as jwt from 'jsonwebtoken'
import { ServiceError } from '../models/server/said-error'

const log = new Log('service/user')


/**
 * 验证评论对象
 * @param nickname 昵称
 * @param site 站点
 * @param email email
 */
export const validateInputUser = (nickname: string, site: string, email: string) => {
  // nickname = String(nickname).trim()
  // site = String(site).trim()
  // email = String(email).trim()
  if (nickname.length > 30) {
    return {
      success: false,
      message: '昵称不允许超过 30 个字符'
    }
  }
}


/**
 * 创建一个新用户
 * @param user 
 */
export const createUser = (user: {
  email?: string,
  site?: string,
  nickName?: string,
  role: UserRole,
}): Promise<{
  token: string,
  user: IUser,
} | null> => {
  const userInfo = new userDb({
    email: user.email || '',
    site: user.site || '',
    nickName: user.nickName || '',
    role: user.role
  })
  return userInfo.save().then(res => {
    try {
      const token = jwt.sign({
        id: res.id,
      }, process.env.JWT_USER_SECRET, {
          expiresIn: '10y'
        })
      return {
        token,
        user: res.toJSON() as IUser,
      }
    } catch (error) {
      throw error
    }
  }).catch(error => {
    log.error('createUser.catch', error)
    return null
  })
}

/**
 * 根据用户 ID 查询用户信息
 * @param id 
 */
export const getUserById = (id: string) => {
  return userDb.findById(id)
}

/**
 * 获取用户信息
 * @param token 
 */
export const getUserInfoByToken = async (token: string): Promise<IUser | null> => {
  log.info('getUserInfoByToken.call', token)
  try {
    let tokenInfo = jwt.verify(token, process.env.JWT_USER_SECRET) as { id: string }
    log.info('getUserInfoByToken.jwt.verify', { token, tokenInfo })
    if (!tokenInfo || !tokenInfo.id) {
      throw new ServiceError('getUserInfoByToken.tokenInfo.empty', { tokenInfo, token }, '获取用户信息失败')
    }
    const resAdmin: UserModel = await getUserById(tokenInfo.id)
    if (!resAdmin) {
      throw new ServiceError('getUserInfoByToken.getUserById.empty', { tokenInfo, token }, '获取用户信息失败')
    }
    log.info('getAdminInfoByToken.getUserById.res', resAdmin)
    return resAdmin.toJSON() as IUser
  } catch (error) {
    if (ServiceError.is(error)) {
      log.error(`getUserInfoByToken.${(error as ServiceError).title}`, (error as ServiceError).data)
    } else {
      log.error('getUserInfoByToken.catch', error)
    }
    throw error
  }
}

/**
 * 修改用户信息
 * @param user - 当前用户
 * @param newUserinfo - 要修改的用户资料
 */
export const updateUserInfo = async (user: IUser, newUserinfo: {
  nickName?: string
  email?: string,
  site?: string
}) => {
  log.info('updateUserInfo.updateUserInfo', {
    before: user,
    now: newUserinfo,
  })
  /**
   * @TODO 这里应该把所有引用这个用户的地方全部修改
   * 比如 comment/reply
   */
  return userDb.findByIdAndUpdate(user._id, newUserinfo, { new: true }).exec()
}


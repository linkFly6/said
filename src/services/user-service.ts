import userDb, { IUser, UserModel, UserSchema, UserRole } from '../models/user'
import { Log } from '../utils/log'
import * as jwt from 'jsonwebtoken'
import { ServiceError } from '../models/server/said-error'

const log = new Log('service/user')

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


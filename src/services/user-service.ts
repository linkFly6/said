import userDb, { IUser, UserModel, UserRole } from '../models/user'
import { Log } from '../utils/log'
import * as jwt from 'jsonwebtoken'
import { ServiceError } from '../models/server/said-error'
import { getMd5 } from '../utils'
import { updateCommentsUserInfo } from './comment-service'
import * as _ from 'lodash'
import { SimpleAdmin } from '../types/admin'

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

type UpdateUser =  {
  nickName?: string
  email?: string,
  site?: string,
  role?: UserRole,
}



/**
 * 对比两个和 user 类似的对象，增量更新用户信息
 * @param oldUser 旧的用户对象
 * @param newUserInfo 新的用户信息对象
 * @returns { updated: 是否更新, user: 更新后的用户信息 }
 */
export const diffUserAndUpdate = async (oldUser: IUser, newUserInfo: UpdateUser) => {
  log.info('diffUserAndUpdate.update', {
    before: oldUser,
    now: newUserInfo,
  })
  let updates: UpdateUser = {}
  if (newUserInfo.nickName !== oldUser.nickName) {
    updates.nickName = newUserInfo.nickName
  }
  if (newUserInfo.email !== oldUser.email) {
    updates.email = newUserInfo.email
  }
  if (newUserInfo.site && newUserInfo.site != oldUser.site) {
    updates.site = newUserInfo.site
  }
  if (newUserInfo.role != null && oldUser.role !== newUserInfo.role) {
    updates.role = newUserInfo.role
  }
  if (!_.isEmpty(updates)) {
    const newUserInfo = await updateUserInfo(oldUser, updates)
    return {
      updated: true,
      user: newUserInfo.toJSON() as IUser,
    }
  }
  return {
    updated: false,
    user: oldUser,
  }
}

/**
 * 修改用户信息
 * @param user - 当前用户
 * @param newUserinfo - 要修改的用户资料
 */
export const updateUserInfo = async (user: IUser, newUserinfo: UpdateUser) => {
  log.info('updateUserInfo.update', {
    before: user,
    now: newUserinfo,
  })
  /**
   * @TODO 这里应该把所有引用这个用户的地方全部修改
   * 比如 comment/reply
   */
  const userModel = await userDb.findByIdAndUpdate(user._id, newUserinfo, { new: true }).exec()
  await updateCommentsUserInfo(userModel.toJSON() as any)
  return userModel
}


/**
 * 根据当前用户信息加密一组数据
 * @param user 
 */
export const encodeByUser = (user: IUser, data: string | Buffer | object) => {
  const md5Id = getMd5(user._id)
  return jwt.sign(data, md5Id + process.env.JWT_USER_SECRET, {
    expiresIn: '10y'
  })
}

/**
 * 根据当前用户信息解密一组数据
 * @param user 
 * @param token 
 */
export const decodeByUser = <T=any>(user: IUser, token: string): T => {
  const md5Id = getMd5(user._id)
  return jwt.verify(token, md5Id + process.env.JWT_USER_SECRET) as any
}
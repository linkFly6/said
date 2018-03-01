import UserLikeDb, { IUserLike, UserLikeSchema, UserLikeModel, LikeType } from '../models/user-like'
import { Log } from '../utils/log'
import { ServiceError } from '../models/server/said-error'

const log = new Log('service/user-like')

/**
 * 根据用户和内容查询用户 like 这个内容的记录
 * @param userId 用户 ID
 * @param targetId 内容 ID
 */
export const queryUserLikeByUserIdAndTargetId = (userId: string, targetId: string, type: LikeType) => {
  log.info('queryUserLikeByUserIdAndTargetId.call', { userId, targetId, type })
  return UserLikeDb.findOne({ userId, targetId, type }).exec()
}

/**
 * 查询用户是否 like 过某内容
 * @param userId 
 * @param targetId 
 */
export const userLiked = (userId: string, targetId: string, type: LikeType) => {
  log.info('userLiked.call', { userId, targetId, type })
  return UserLikeDb.count({ userId, targetId, type }).exec()
}



/**
 * 用户 like
 * @param model 
 */
export const createUserLike = (model: {
  userId: string,
  type: LikeType,
  targetId: string,
}) => {
  log.info('createUserLike.call', model)
  const userLike = new UserLikeDb({
    userId: model.userId,
    type: model.type,
    targetId: model.targetId,
    createTime: Date.now()
  })
  return userLike.save()
}
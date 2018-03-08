import { default as CommentDb, CommentModel, IComment } from '../models/comment'
import { Log } from '../utils/log'
import { ServiceError } from '../models/server/said-error'

const log = new Log('service/comment')


/**
 * 新增评论
 * @param comment 
 */
export const createComment = async (comment: IComment) => {
  log.info('createComment.call', comment)
  const commentModel = new CommentDb(comment)
  return commentModel.save()
}
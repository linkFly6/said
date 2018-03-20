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

/**
 * 根据 blog 查询评论列表
 * @param blogId 
 */
export const queryCommentsByBlog = async (blogId: string) => {
  return CommentDb.find({ blogId }).exec()
}

/**
 * 根据 ID 查询
 * @param commentId 
 */
export const queryCommentById = async (commentId: string) => {
  return CommentDb.findById(commentId).exec()
}
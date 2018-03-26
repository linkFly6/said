import { default as CommentDb, CommentModel, IComment } from '../models/comment'
import { Log } from '../utils/log'
import { ServiceError } from '../models/server/said-error'
import { IUser } from '../models/user'
import { IReply, ReplyModel } from '../models/reply'

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
  return CommentDb.find({ blogId }).sort('-_id').exec()
}

/**
 * 根据 ID 查询
 * @param commentId 
 */
export const queryCommentById = async (commentId: string) => {
  return CommentDb.findById(commentId).exec()
}

/**
 * 新增评论中的回复对象
 * @param comment 
 */
export const addCommentReplys = (comment: CommentModel, reply: IReply) => {
 return comment.update({
    '$push':
      {
        replys: reply
      }
  }).select({ 'replys': { '$slice': -1 }}).exec()
}

/**
 * 修改用户下所有的评论用户名
 * @param comment 
 */
export const updateCommentsUserInfo = async (user: IUser) => {
  await CommentDb.update({ 'user._id': user._id },
    {
      '$set': {
        user,
        'replys.$.user': user
      },
    })
  await CommentDb.update({ 'replys.user._id': user._id }, { '$set': { 'replys.$.user': user } })
  await CommentDb.update({ 'replys.toReply.user._id': user._id }, { '$set': { 'replys.$.toReply.user': user } })
  return 1
}

/**
 * 查询评论下面的某个回复信息
 * @param commentId 评论 ID
 * @param replyId 回复 ID
 */
export const queryReplyByReplyId = async (commentId: string, replyId: string): Promise<ReplyModel> => {
  return await CommentDb.findOne({ 'replys._id': replyId, _id: commentId }, { 'replys.$': 1 }).exec()
}

/**
 * 修改评论中的回复对象
 * @param comment 
 */
// export const updateCommentReplys = async (comment: CommentModel) => {
//   return comment.update()
// }
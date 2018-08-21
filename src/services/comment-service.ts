import { default as CommentDb, CommentModel, IComment } from '../models/comment'
import { Log } from '../utils/log'
// import { ServiceError } from '../models/server/said-error'
import { IUser } from '../models/user'
import { IReply, ReplyModel } from '../models/reply'
import { BlogModel } from '../models/blog'
import { convertCommentToHTML } from '../utils/html'
import { sendReplyEmail } from './email-service'
import { shortId } from '../utils/format'
import { SimpleAdmin } from '../types/admin'


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
  // return CommentDb.find({ blogId }).sort('-_id').exec()
  /**
   * 评论就按照时间正序来排列吧
   */
  return CommentDb.find({ blogId }).sort('_id').exec()
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
export const addCommentReplysByCommentId = (commentId: string, reply: IReply) => {
  log.info('addCommentReplysByCommentId.call', reply)
  return CommentDb.findByIdAndUpdate(
    commentId,
    {
      '$push':
      {
        replys: reply
      }
    },
    { new: true }).exec()
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
        // 'replys.$.user': user
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
export const queryCommentByReplyId = async (commentId: string, replyId: string): Promise<CommentModel> => {
  /**
   * 注意这里返回的是 commentModel
   * 但是里面的 replys 只有一项，就是和 replyId 匹配的 reply
   */
  return await CommentDb.findOne({ 'replys._id': replyId, _id: commentId }).select('replys.$').exec()
}

/**
 * 修改评论中的回复对象
 * @param comment 
 */
// export const updateCommentReplys = async (comment: CommentModel) => {
//   return comment.update()
// }


/**
 * 用户评论文章
 * @param context - 评论内容
 * @param user - 当前用户
 * @param blog - 被评论的日志对象
 */
export const commentToBlog = async (context: string, user: IUser, blog: BlogModel) => {
  const contextHTML = convertCommentToHTML(context)
  const comment = await createComment({
    user,
    context: context,
    blogId: blog.id,
    contextHTML,
    replys: [],
    /**
     * 生成一个
     */
    hash: shortId(),
    createTime: Date.now(),
  })
  /**
   * 文章作者有 email 的话，则发送邮件通知
   */
  if (blog.author.email) {
    sendReplyEmail({
      to: blog.author.email,
      subject: `Said - 用户评论了文章《${blog.title}》`,
      data: {
        nickname: blog.author.nickName,
        title: blog.title,
        titleHref: `https://tasaid.com/blog/${blog.key}.html`,
        body: contextHTML,
        moreHref: `https://tasaid.com/blog/${blog.key}.html`,
      }
    })
  }
  return comment
}


/**
 * 回复评论
 * @param context - 用户评论
 * @param user - 当前用户
 * @param blog - 被评论的日志对象
 * @param commentModel - 被回复的评论对象
 */
export const replyToComment = async (context: string, user: IUser, blog: BlogModel, commentModel: CommentModel) => {
  const contextHTML = convertCommentToHTML(context)
  /**
   * 添加到数据库
   */
  const newCommentModel = await addCommentReplysByCommentId(commentModel._id, {
    user,
    context,
    contextHTML,
    hash: shortId(),
    createTime: Date.now(),
  })
  log.info('replyToComment.newCommentModel', newCommentModel)
  const newReplyModel = newCommentModel.replys[newCommentModel.replys.length - 1]
  // 如果当前评论的用户和回复这条评论的 ID 是一样，则不发送邮件，因为这表示自己在回复自己
  if (commentModel.user._id.toString() !== newReplyModel.user._id.toString()) {
    sendReplyEmail({
      to: commentModel.user.email,
      subject: `Said - 您在文章《${blog.title}》的评论中收到新的回复`,
      data: {
        nickname: commentModel.user.nickName,
        title: blog.title,
        titleHref: `https://tasaid.com/blog/${blog.key}.html?sv=email#${commentModel.hash}`,
        body: contextHTML,
        moreHref: `https://tasaid.com/blog/${blog.key}.html?sv=email#${commentModel.hash}`,
      }
    })
  }
  return newReplyModel
}

/**
 * 回复其他的回复
 * @param context - 评论用户
 * @param user - 当前评论用户对象
 * @param blog - 被评论的日志对象
 * @param commentModel - 评论对象
 * @param replyModel - 被回复的回复对象
 */
export const replyToReply = async (
  context: string,
  user: IUser,
  blog: BlogModel,
  commentModel: CommentModel,
  replyModel: ReplyModel) => {
  // 用户自娱自乐，自己在回复自己
  if (replyModel.user._id.toString() == user._id.toString()) {
    // 修正到评论逻辑
    return replyToComment(context, user, blog, commentModel)
  }
  if (replyModel.toReply) {
    // 为了防止回复对象层次太深
    replyModel.toReply = undefined
  }
  const contextHTML = convertCommentToHTML(context)
  /**
   * 添加到数据库
   */
  const newCommentModel = await addCommentReplysByCommentId(commentModel._id, {
    user,
    toReply: replyModel,
    context,
    contextHTML,
    hash: shortId(),
    createTime: Date.now(),
  })
  log.info('replyToReply.newCommentModel', newCommentModel)
  const newReplyModel = newCommentModel.replys[newCommentModel.replys.length - 1]
  // 有被回复的对象，则对该对象回复
  sendReplyEmail({
    to: newReplyModel.toReply.user.email,
    subject: `Said - 您在文章《${blog.title}》的评论中收到新的回复`,
    data: {
      nickname: newReplyModel.toReply.user.nickName,
      title: blog.title,
      titleHref: `https://tasaid.com/blog/${blog.key}.html?sv=email#${newReplyModel.hash}`,
      body: context,
      moreHref: `https://tasaid.com/blog/${blog.key}.html?sv=email#${newReplyModel.hash}`,
    }
  })
  return newReplyModel
}

/**
 * 删除评论
 * @param blog 
 * @param commentId 
 */
export const deleteComment = async (blog: BlogModel, commentId: string, admin: SimpleAdmin) => {
  log.warn('deleteComment.call', { blog, commentId, admin })
  const comment = await CommentDb.findById(commentId)
  log.warn('deleteComment.comment', {
    comment,
    admin,
  })
  return comment.remove()
}

/**
 * 删除回复
 * @param blog 
 * @param commentId 
 * @param replyId 
 */
export const deleteReply = async (blog: BlogModel, commentId: string, replyId: string, admin: SimpleAdmin) => {
  log.warn('deleteReply.call', { blog, commentId, replyId, admin })
  const comment = await queryCommentByReplyId(commentId, replyId)
  if (!comment) {
    throw `deleteReply.error: ${JSON.stringify({ blog, commentId, replyId, admin })}`
  }
  /**
   * 前面的查询主要是为了这个 log，因为有这个 log 才可以还原
   */
  log.warn('deleteReply.reply', {
    comment,
    admin,
  })
  /**
   * 这个 updateInfo 其实只是一个修改行数，不是 model
   */
  const updateInfo = await CommentDb.update({ _id: commentId }, {
    $pull: {
      'replys': {
        _id: replyId,
      }
    }
  })
  return updateInfo
}
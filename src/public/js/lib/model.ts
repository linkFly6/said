export interface IReplyUserInfo {
  /**
   * 用户角色
   */
  role: 0 | 1,
  /**
   * 用户昵称
   */
  nickname: string,
  /**
   * 用户站点
   */
  site?: string
}

/**
 * 回复对象
 */
export interface IReplyInfo {
  /**
   * 评论 ID
   */
  commentId: string
  /**
   * 回复 ID
   */
  replyId?: string
  /**
   * 日志 ID
   */
  blogId: string
  /**
   * 回复时间
   */
  date: number
  /**
   * 本地显示时间
   */
  localDate: string
  /**
   * 评论内容
   */
  context: string
  /**
   * 用户信息
   */
  user: IReplyUserInfo
  /**
   * 被回复的回复
   */
  reply?: {
    /**
     * 被回复的回复 ID
     */
    commentId: string
    /**
     * 被回复的回复 ID
     */
    replyId?: string
    /**
     * 被回复的用户
     */
    user: IReplyUserInfo,
  }
}


/**
 * 基本评论信息对象
 */
export interface IComment {
  nickname: string
  email: string
  context: string
  site?: string
}
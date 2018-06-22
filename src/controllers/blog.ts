import { Request, Response } from 'express'
import { DEVICE } from '../models/server/enums'
import * as moment from 'moment'
import { Log } from '../utils/log'
import { getBlogByKey, updateBlogPV, queryAllBlog, queryBlogsByByCategoryName, updateBlogLike } from '../services/blog-service'
import { IBlog, BlogModel } from '../models/blog'
import { date2Local, date2day } from '../utils/format'
import { checkCategoryName, queryCategoryAll } from '../services/category-service'
import { CategoryModel } from '../models/category'
import { Returns } from '../models/Returns'
import { createUserLike, userLiked } from '../services/user-like-service'
import { LikeType } from '../models/user-like'
import { IViewBlog } from '../types/blog'
import { checkUri, resolveHTTPUri, checkEmail } from '../utils/validate'
import { createComment, queryCommentsByBlog, queryCommentById, addCommentReplysByCommentId, queryCommentByReplyId } from '../services/comment-service'
import { diffUserAndUpdate } from '../services/user-service'
import { UserRole } from '../models/user'
import { IComment } from '../models/comment'
import { IReply } from '../models/reply'
import * as _ from 'lodash'

const ERRORS = {
  SERVER: new Returns(null, {
    code: 1,
    msg: 'server error',
    data: null,
  }),
  BLOGNOTFOUND: new Returns(null, {
    code: 2,
    msg: 'invalid',
    data: null,
  }),
  COMMENTERROR: new Returns(null, {
    code: 3,
    msg: 'params invalid',
    data: null,
  }),
  COMMENTNOTFOUND: new Returns(null, {
    code: 4,
    msg: 'not found',
    data: null,
  }),
  // 回复没有找到
  REPLYNOTFOUND: new Returns(null, {
    code: 5,
    msg: 'not found',
    data: null,
  }),
}

/**
 * 匹配 mongoDB 的 ID
 */
const regMongodbId = /^[0-9a-zA-Z]{10,30}$/

const log = new Log('router/blog')


/**
 * 将文章对象的日期/头像/歌曲等信息进行处理
 * @param blog 
 */
const convertBlog2View = (blog: IBlog): IViewBlog => {
  const createTime = moment(blog.info.createTime);
  (blog as IViewBlog).info.day = date2day((blog.info as any).createTime);
  (blog as IViewBlog).info.time = createTime.format('HH:mm');
  (blog as IViewBlog).info.tag = createTime.format('YYYY年MM月');
  (blog as IViewBlog).info.localDate = date2Local(blog.info.createTime);
  (blog as IViewBlog).info.createTimeString = moment(blog.info.createTime).format('YYYY-MM-DD HH:mm')
  return blog as IViewBlog
}


/**
 * GET /blog
 * GET /blog/cate/:category
 * Home page.
 */
export const index = async (req: Request, res: Response) => {
  let blogModels: BlogModel[]
  let categoryName = ''
  // 是否展开分类列表
  let isOpenCategory = false

  // 有分类查询条件，并且分类名称符合规范，并且不是移动端访问
  if (req.params.category && checkCategoryName(req.params.category) && res.locals.device !== DEVICE.MOBILE) {
    categoryName = req.params.category.trim()
    blogModels = await queryBlogsByByCategoryName(categoryName)
  } else {
    blogModels = await queryAllBlog()
  }
  const blogs: IBlog[] = blogModels.map(blogModel => convertBlog2View(blogModel.toJSON() as any))
  if (res.locals.device === DEVICE.MOBILE) {
    res.render('blog/blog-mobile-index', {
      title: 'blog - 每一行代码都恰到好处',
      blogs,
    })
  } else {
    let categorys = await queryCategoryAll()
    let currentCategory: CategoryModel
    // 如果有分类查询，则标记出分类
    if (categoryName) {
      isOpenCategory = true
      currentCategory = categorys.find(category => {
        if (category.name === categoryName) {
          return true
        }
        return false
      })
    }
    // 没有查到文章列表，则默认页展开分类列表
    if (!blogs.length) {
      isOpenCategory = true
    }
    res.render('blog/blog-index', {
      title: 'blog - 每一行代码都恰到好处',
      pageIndex: 1,
      blogs,
      categorys,
      isOpenCategory,
      currentCategory,
    })
  }
}

// 匹配 key，10~20位数字，key 范围在 15~16 位，老 said 的 key 在 14 位
const regMatchKey = /^\d{10,20}$/


/**
 * GET /blog/:key.html
 * Home page.
 */
export const detail = async (req: Request, res: Response) => {
  if (!regMatchKey.test(req.params.key)) {
    res.redirect('/error', 404)
    return
  }
  const blogModel = await getBlogByKey(req.params.key)
  if (!blogModel) {
    res.redirect('/error', 404)
    return
  }
  const commentModels = await queryCommentsByBlog(blogModel._id)
  // 为每个评论和回复对象加上 localDate 属性，用于显示本地时间
  const comments = commentModels.map(comment => {
    const item = comment.toJSON() as IComment
    (item as any).localDate = date2Local(item.createTime)
    if (item.replys.length) {
      item.replys = item.replys.map(reply => {
        (reply as any).localDate = date2Local(reply.createTime)
        return reply
      })
    }
    return item
  })

  // 查询用户是否 like 了这篇文章
  const userLike = await userLiked(res.locals.user._id, blogModel._id, LikeType.BLOG)
  let likeIt = false
  if (userLike > 0) {
    likeIt = true
  }

  // 累加 blog pv
  await updateBlogPV(blogModel._id)

  const blog = blogModel.toJSON() as IBlog
  (blog as IViewBlog).info.createTimeString = moment(blog.info.createTime).format('YYYY-MM-DD HH:mm')
  blog.info.pv++

  if (res.locals.device === DEVICE.MOBILE) {
    res.render('blog/blog-mobile-detail', {
      title: `${blog.title} - blog`,
      likeIt,
      blog,
      comments,
      user: res.locals.user,
    })
  } else {
    res.render('blog/blog-detail', {
      title: `${blog.title} - blog`,
      pageIndex: 1,
      likeIt,
      blog,
      comments,
      user: res.locals.user,
    })
  }
}


/**
 * POST /blog/like/ blogId=string
 * 用户 like 了文章
 * @param req 
 * @param res 
 */
export const userLike = async (req: Request, res: Response) => {
  log.info('userLike.call', Object.assign({}, req.query, req.body))
  const blogId = req.body.blogId
  if (!blogId || !regMongodbId.test(blogId)) {
    return res.json(ERRORS.BLOGNOTFOUND.toJSON())
  }
  let likeCounts = await updateBlogLike(blogId, res.locals.user)
  if (likeCounts && (likeCounts as any).nModified) {
    const userlike = await createUserLike({
      userId: res.locals.user._id,
      targetId: blogId,
      type: LikeType.BLOG,
    })
    log.info('userLike.createUserLike.res', userlike)
  }

  let returns = new Returns(null, {
    code: 0,
    msg: '',
    // mmp mongose 返回的是 {"n":1,"nModified":1,"ok":1} 格式，tsd 却显示 number
    data: likeCounts && (likeCounts as any).nModified,
  })
  return res.json(returns.toJSON())
}

/**
 * 评论
 * POST /blog/comment
 * blogId - 日志 ID
 * nickname - 用户昵称
 * email - 用户 email
 * site - 用户站点
 * context - 评论内容
 * commentId - 针对评论的回复
 * replyId - 针对回复的回复
 * @param req 
 * @param res 
 */
export const comment = async (req: Request, res: Response) => {
  const params = Object.assign({}, req.query, req.body)
  log.info('comment.call', params)

  // 验证 blog ID
  const blogId = req.body.blogId
  if (!blogId || !regMongodbId.test(blogId)) {
    return res.json(ERRORS.BLOGNOTFOUND.toJSON())
  }

  // 校验昵称和 email
  req.check('nickname')
    .trim()
    .notEmpty().withMessage('昵称不能为空')
    .isLength({ max: 30 }).withMessage('昵称不允许超过 30 个字符')
  req.check('email')
    .trim()
    .notEmpty().withMessage('email 不能为空')
    .isLength({ max: 60 }).withMessage('email 不允许超过 60 个字符')
  req.check('context')
    .trim()
    .notEmpty().withMessage('评论内容不能为空')
    .isLength({ max: 140 }).withMessage('评论内容不允许超过 140 个字符')

  const errors = req.validationErrors()
  if (errors) {
    log.error('comment.params', { params, errors })
    // 不需要返回太详细的信息，因为前端已经做过校验
    return res.json(ERRORS.COMMENTERROR.toJSON())
  }

  /**
   * 站点
   */
  let site = params.site
  // 传入了站点，则校验站点
  if (site && site.trim() && !checkUri(site)) {
    return res.json(ERRORS.COMMENTERROR.toJSON())
  } else {
    // 修正站点信息
    site = site ? resolveHTTPUri(site) : site
  }

  const nickname = params.nickname.trim()
  const email = params.email.trim()
  if (!checkEmail(email)) {
    return res.json(ERRORS.COMMENTERROR.toJSON())
  }
  /**
   * @TODO 替换用户输入的链接地址
   */
  const context = params.context.trim()

  // 看看用户信息是否有更新，如果有更新，则对整个用户信息进行更新
  const newUserInfo = await diffUserAndUpdate(res.locals.user, {
    // 修正管理员数据
    role: res.locals.admin ? UserRole.ADMIN : UserRole.NORMAL,
    nickName: nickname,
    email,
    site,
  })
  // 有修改，则修正全局引用
  if (newUserInfo.updated) {
    res.locals.user = newUserInfo.user
  }

  // ===== 回复逻辑
  if (params.commentId) {
    let newReply: IReply
    if (!regMongodbId.test(params.commentId)) {
      return res.json(ERRORS.COMMENTERROR.toJSON())
    }
    // 进入回复逻辑分支
    const commentModel = await queryCommentById(params.commentId)
    if (!commentModel) {
      return res.json(ERRORS.COMMENTNOTFOUND.toJSON())
    }
    if (params.replyId) {
      // 回复类型 1：针对评论中回复的回复
      if (!regMongodbId.test(params.replyId)) {
        return res.json(ERRORS.COMMENTERROR.toJSON())
      }
      // 查找对应的回复对象
      // const comment = await queryCommentByReplyId(commentModel._id, params.replyId)
      let reply: IReply
      // 可以直接遍历上面的 commentModel 对象...不用再查数据库了
      if (commentModel.replys.length) {
        reply = commentModel.replys.find(reply => {
          // 数据库中是 _id，为什么这里是 id 呢？
          return (reply as any).id === params.replyId
        })
      }
      if (!reply) {
        return res.json(ERRORS.REPLYNOTFOUND.toJSON())
      }
      /**
       * 这个被回复的对象，也是别人回复的
       */
      if (reply.toReply) {
        // 为了防止回复对象层次太深
        reply.toReply = undefined
      }
      newReply = {
        user: newUserInfo.user,
        toReply: reply,
        context,
        contextHTML: context,
        createTime: Date.now(),
      }
    } else {
      // 回复类型 2：针对评论的回复
      newReply = {
        user: newUserInfo.user,
        context,
        contextHTML: context,
        createTime: Date.now(),
      }
    }
    const newCommentModel = await addCommentReplysByCommentId(commentModel._id, newReply)
    log.info('comment.newCommentModel', newCommentModel)
    const newReplyModel = newCommentModel.replys[newCommentModel.replys.length - 1]
    // @TODO 发邮件
    let returns = new Returns(null, {
      code: 0,
      msg: '',
      data: {
        commentId: commentModel._id,
        replyId: newReplyModel._id,
        blogId,
        date: newReply.createTime,
        localDate: date2Local(newReply.createTime),
        context,
        user: {
          role: newUserInfo.user.role,
          nickname: newUserInfo.user.nickName,
          site: newUserInfo.user.site,
        },
        // 如果有被回复对象
        toReply: newReplyModel.toReply ? 
         {
           replyId: newReplyModel.toReply._id,
           user: {
            // 获取被回复对象的信息
            role: newReplyModel.toReply.user.role,
            nickname: newReplyModel.toReply.user.nickName,
            site: newReplyModel.toReply.user.site,
          },
         } : null,
      }
    })
    return res.json(returns.toJSON())
  }


  // ===== 新增评论
  // @TODO 发邮件
  const comment = await createComment({
    user: newUserInfo.user,
    context: context,
    blogId,
    // @TODO 这里要试着做一些格式解析
    contextHTML: context,
    replys: [],
    createTime: Date.now(),
  })
  // @TODO ，上面应该加一层 try catch

  log.warn('comment.create', { user: newUserInfo.user, comment })
  let returns = new Returns(null, {
    code: 0,
    msg: '',
    data: {
      commentId: comment._id,
      blogId,
      date: comment.createTime,
      localDate: date2Local(comment.createTime),
      context,
      user: {
        role: newUserInfo.user.role,
        nickname: newUserInfo.user.nickName,
        site: newUserInfo.user.site,
      }
    }
  })
  return res.json(returns.toJSON())
}
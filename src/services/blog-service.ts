import { default as BlogDb } from '../models/blog'
import { Log } from '../utils/log'
import { ServiceError } from '../models/server/said-error'
import { AdminRule, IAdmin } from '../models/admin'
import { authentication } from './admin-service'
import { SimpleBlog } from 'blog'
import { queryCategoryById } from './category-service'
import { CategoryModel } from '../models/category'
import { TagModel, ITag } from '../models/tag'
import { queryByTagNames, createTags } from './tag-service'
import * as moment from 'moment'
import { convertMarkdown2HTML, convertSummaryToHTML } from '../utils/html'
import { IUser } from '../models/user'


const log = new Log('service/blog')


/**
 * 查询
 */
export const queryAllBlog = () => {
  log.info('queryAllBlog.call', null)
  return BlogDb.find().sort('-_id').exec()
}

/**
 * 根据管理员信息查列表
 * @param adminId
 */
export const queryAllBlogByAdmin = (admin: IAdmin) => {
  log.info('queryAllBlogByAdminId.call', admin)
  const denied = authentication(admin, AdminRule.BLOG)
  if (!denied) {
    throw new ServiceError('queryAllBlogByAdmin.authentication.denied', admin, 'access denied')
  }
  if (admin.rule == AdminRule.GLOBAL) {
    return BlogDb.find().sort('-_id').exec()
  } else {
    return BlogDb.find({ author: { _id: admin._id } }).sort('-_id').exec()
  }
}

/**
 * 根据 key 检查是否存在对应的 Blog
 * @param blogKey
 */
export const existsByBlogKey = (blogKey: string) => {
  log.info('existsByBlogKey.call', { blogKey })
  return BlogDb.count({ key: blogKey }).exec()
}

const validateBlog = async (blog: SimpleBlog, admin?: IAdmin) => {
  let category: CategoryModel
  let tags: TagModel[] = []
  // 验证分类
  if (blog.category) {
    category = await queryCategoryById(blog.category, admin)
    if (!category) {
      throw new ServiceError('validateBlog.queryCategoryById', category, '类型不正确')
    }
  } else {
    throw new ServiceError('validateBlog.category.empty', category, '类型未找到')
  }

  if (blog.tags.length) {
    tags = await queryByTagNames(blog.tags)
    if (!tags) {
      throw new ServiceError('validateBlog.queryByTagIds', category, '标签未找到')
    }
  }
  // 查找的 tag 长度不一样，证明有新增 tags
  if (tags.length !== blog.tags.length) {
    // 得到新增的 tags
    let insertTags = blog.tags
      .filter(blogTagName => !~tags.findIndex(tag => tag.name == blogTagName))
      .map(tagName => {
        return {
          name: tagName,
        } as ITag
      })
    log.info('validateBlog.createTags', insertTags)
    let newTags = await createTags(insertTags)
    if (!newTags.length) {
      throw new ServiceError('validateBlog.createTags', insertTags, '新增标签信息失败')
    }
    tags = tags.concat(newTags)
    // throw new ServiceError('validateBlog.queryByTagIds', category, 'tags not match')
  }
  return {
    tags,
    category
  }
}


/**
 * 新增
 */
export const createBlog = async (blog: SimpleBlog, admin: IAdmin) => {
  log.info('createBlog.call', { blog, admin })
  const denied = authentication(admin, AdminRule.BLOG)
  if (!denied) {
    throw new ServiceError('createBlog.authentication.denied', { blog, admin }, '您没有权限进行该操作')
  }
  // 如果有错误则 validateBlog 会抛出异常
  const validateRes = await validateBlog(blog, admin)

  // blog 的唯一 key
  let key = ''

  let i = 0
  // 最多重试 3 次
  while (i++ < 3) {
    key = moment().format('YYYYMMDDHHmmss' + Math.floor(Math.random() * 100))
    let existsCount = await existsByBlogKey(key)
    if (existsCount > 0) {
      key = ''
      continue
    }
    break
  }

  if (!key) {
    throw new ServiceError('createBlog.createUrKey', { blog, admin })
  }

  const html = convertMarkdown2HTML(blog.context)
  const summaryHTML = convertSummaryToHTML(blog.summary)
  const now = Date.now()
  const db = new BlogDb({
    title: blog.title,
    context: blog.context,
    key,
    author: admin,
    summary: blog.summary,
    tags: validateRes.tags,
    category: validateRes.category,
    other: {
      xml: '',
      html,
      summaryHTML,
    },
    comments: [],
    info: {
      pv: 0,
      likeCount: 0,
      createTime: now,
      updateTime: now,
    },
    config: {
      isPrivate: false,
      isReprint: false,
      sort: 0,
      script: blog.config.script || '',
      css: blog.config.css || '',
      password: '',
    }
  })
  return db.save()
}

/**
 * 修改
 * @param blog
 * @param admin
 */
export const updateBlog = async (blog: SimpleBlog, admin: IAdmin) => {
  log.info('updateBlogById.call', { blog, admin })
  const denied = authentication(admin, AdminRule.BLOG)
  if (!denied) {
    throw new ServiceError('updateBlogById.authentication.denied', { blog, admin }, '您没有权限进行该操作')
  }
  // 全局管理员
  const blogInfo = admin.rule === AdminRule.GLOBAL ?
    BlogDb.findOne({ _id: blog._id })
    : BlogDb.findOne({ _id: blog._id, author: { _id: admin._id } })
  // 检查这个 blog 是否归属当前用户
  const oldBlog = await blogInfo.exec()
  if (!oldBlog) {
    throw new ServiceError(
      'updateBlogById.checkBlog.empty',
      admin,
      admin.rule === AdminRule.GLOBAL ?
        '没有查到对应 Blog 信息' : '您没有权限操作该 Blog')
  }

  // 如果有错误则 validateBlog 会抛出异常
  const validateRes = await validateBlog(blog, admin)

  const html = convertMarkdown2HTML(blog.context)
  const summaryHTML = convertSummaryToHTML(blog.summary)

  const newBlog = {
    title: blog.title,
    context: blog.context,
    summary: blog.summary,
    tags: validateRes.tags,
    category: validateRes.category,
    'other.html': html,
    'other.summaryHTML': summaryHTML,
    'info.updateTime': Date.now(),
    'config.script': blog.config.script || '',
    'config.css': blog.config.css || '',
  }

  log.info('updateBlogById.update', {
    before: oldBlog,
    now: newBlog,
    admin,
  })

  return blogInfo.update(newBlog).exec()
}


/**
 * 批量修改 blog 中的类型
 * @param category
 */
export const updateBlogsCategory = async (category: CategoryModel) => {
  return BlogDb.find({ 'category._id': category._id }).update({ category }).exec()
}

/**
 * 删除
 */
export const removeBlog = async (blogId: string, admin: IAdmin) => {
  log.warn('removeBlogById.call', { blogId, admin })
  const denied = authentication(admin, AdminRule.BLOG)
  if (!denied) {
    throw new ServiceError('removeBlogById.authentication.denied', { blogId, admin }, '您没有权限进行该操作')
  }

  // 管理员直接删除
  if (admin.rule === AdminRule.GLOBAL) {
    const blogInfo = BlogDb.findById(blogId)
    const oldBlog = await blogInfo.exec()
    if (!oldBlog) {
      throw new ServiceError('removeBlogById.admin.delete.fail', { blogId, admin }, '没有找到文章')
    }
    log.warn('removeBlogById.admin.ready', { oldBlog, admin })
    return blogInfo.remove().exec()
  }

  // 鉴权
  const blogInfo = BlogDb.findOne({ _id: blogId, author: { _id: admin._id } })
  const oldBlog = await blogInfo.exec()
  log.warn('removeBlogById.blogInfo.ready', { blogInfo, admin })
  if (!oldBlog) {
    throw new ServiceError('updateBlogById.checkBlog.empty', admin, '删除日志失败')
  }
  return blogInfo.remove().exec()
}

/**
 * 查询 Blog，会鉴权，后台使用
 * @param blogId
 * @param admin
 */
export const queryBlogByIdInBack = async (blogId: string, admin: IAdmin) => {
  log.info('queryBlogById.call', { blogId, admin })
  if (!authentication(admin, AdminRule.BLOG)) {
    throw new ServiceError('queryBlogById.authentication.denied', { blogId, admin }, '您没有权限访问该模块')
  }
  if (admin.rule === AdminRule.GLOBAL) {
    return BlogDb.findById(blogId).exec()
  }
  // 鉴权
  const blog = await BlogDb.findOne({ _id: blogId, author: { _id: admin._id } }).exec()
  if (!blog) {
    throw new ServiceError('queryBlogById.checkBlog.empty', { blogId, admin }, '无法访问该日志')
  }
  return blog
}

/**
 * 根据 ID 查询 blog
 * @param blogId
 */
export const queryBlogById = async (blogId: string) => {
  return BlogDb.findById(blogId).exec()
}


/**
 * 根据 key 查找文章
 * @param key
 */
export const getBlogByKey = (key: string) => {
  return BlogDb.findOne({ key }).exec()
}

/**
 * 累加文章的浏览量
 * @param id
 */
export const updateBlogPV = (id: string) => {
  return BlogDb.findById(id).update({
    '$inc': { 'info.pv': 1 }
  }).exec()
}

/**
 * 用户 Like 了日志
 * @param key
 */
export const updateBlogLike = (id: string, user: IUser) => {
  log.info('updateBlogLike.call', { id, user })
  // mmp mongose 返回的是 {"n":1,"nModified":1,"ok":1} 格式，tsd 却显示 number
  return BlogDb.findById(id).update({
    '$inc': { 'info.likeCount': 1 }
  }).exec()
}

/**
 * 根据分类查询
 * @param categoryName
 */
export const queryBlogsByByCategoryName = (categoryName: string) => {
  return BlogDb.find({ 'category.name': categoryName }).exec()
}


/**
 * 查询所有 blog 的个数
 */
export const queryAllBlogCount = () => {
  return BlogDb.find().count().exec()
}

/**
 * 根据条件查询 blog 个数
 * @param where
 */
export const queryBlogCountByWhere = (where: any) => {
  return BlogDb.find(where).count().exec()
}

/**
 * 分页查询
 * @param limit 指定查询结果的数量
 * @param offset 执行查询结果的偏移量（limit * (页码 -1)），从 0 开始计算
 */
export const queryAllBlogByPage = (limit = 10, offset = 0) => {
  return BlogDb.find().sort('-_id').limit(limit).skip(offset).exec()
}

/**
 * 根据条件分页查询
 * @param where 查询条件
 * @param limit 指定查询结果的数量
 * @param offset 执行查询结果的偏移量（limit * (页码 -1)），从 0 开始计算
 */
export const queryBlogByPageAndWhere = (where: any, limit = 10, offset = 0) => {
  return BlogDb.find(where).sort('-_id').limit(limit).skip(offset).exec()
}


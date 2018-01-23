import { default as BlogDb, BlogModel, IBlog } from '../models/blog'
import { Log } from '../utils/log'
import { ServiceError } from '../models/server/said-error'
import { AdminRule, IAdmin } from '../models/admin'
import { authentication } from '../services/admin-service'
import { SimpleBlog } from '../types/blog'
import { queryCategoryById } from '../services/category-service'
import { CategoryModel } from '../models/category'
import { TagModel, ITag } from '../models/tag'
import { queryByTagNames, createTags } from '../services/tag-service'
import * as moment from 'moment'
import { convertMarkdown2HTML, convertSummaryToHTML } from '../utils/html'


const log = new Log('service/blog')




/**
 * 查询
 */
export const queryAllBlog = () => {
  log.info('queryAllBlog.call', null)
  return BlogDb.find().exec()
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
    return BlogDb.find().exec()
  } else {
    return BlogDb.find({ author: { _id: admin._id } }).exec()
  }
}


/**
 * 根据 urlKey 检查是否存在对应的 Blog
 * @param blogKey 
 */
export const existsByBlogKey = (blogKey: string) => {
  log.info('existsByBlogKey.call', { blogKey })
  return BlogDb.count({ urlKey: blogKey }).exec()
}

const validateBlog = async (blog: SimpleBlog, admin?: IAdmin) => {
  let category: CategoryModel
  let tags: TagModel[] = []
  // 验证分类
  if (blog.category) {
    category = await queryCategoryById(blog.category)
    if (!category) {
      throw new ServiceError('validateBlog.queryCategoryById', category, 'category not found')
    }
  }

  if (blog.tags.length) {
    tags = await queryByTagNames(blog.tags)
    if (!tags) {
      throw new ServiceError('validateBlog.queryByTagIds', category, 'tags not found')
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
    throw new ServiceError('createBlog.authentication.denied', admin, 'access denied')
  }
  // 如果有错误则 validateBlog 会抛出异常
  const validateRes = await validateBlog(blog, admin)

  // blog 的唯一 key
  let urlKey = ''

  let i = 0
  // 最多重试 3 次
  while (i++ < 3) {
    urlKey = moment().format('YYYYMMDDHHmmss')
    let existsCount = await existsByBlogKey(urlKey)
    if (existsCount > 0) {
      urlKey = ''
      continue
    }
    break
  }

  if (!urlKey) {
    throw new ServiceError('createBlog.createUrKey', null)
  }

  const html = convertMarkdown2HTML(blog.context)
  const summaryHTML = convertSummaryToHTML(blog.summary)
  const now = Date.now()
  const db = new BlogDb({
    title: blog.title,
    context: blog.context,
    urlKey,
    author: {
      _id: admin._id,
    },
    summary: blog.summary,
    fileName: urlKey,
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
 * @param category 
 */
export const updateBlog = async (blog: SimpleBlog, admin: IAdmin) => {
  log.info('updateBlogById.call', { blog, admin })
  const denied = authentication(admin, AdminRule.BLOG)
  if (!denied) {
    throw new ServiceError('updateBlogById.authentication.denied', admin, 'access denied')
  }

  // 检查是否是自己的 blog

  // 如果有错误则 validateBlog 会抛出异常
  const validateRes = await validateBlog(blog, admin)

  const html = convertMarkdown2HTML(blog.context)
  const summaryHTML = convertSummaryToHTML(blog.summary)

  // 全局管理员
  if (admin.rule === AdminRule.GLOBAL) {
    return BlogDb.findByIdAndUpdate(blog._id, {
      title: blog.title,
      context: blog.context,
      summary: blog.summary,
      tags: validateRes.tags,
      category: validateRes.category,
      other: {
        html,
        summaryHTML,
      },
      info: {
        updateTime: Date.now(),
      },
      config: {
        script: blog.config.script || '',
        css: blog.config.css || '',
      }
    }).exec()
  }

  // 否则检查这个 blog 是否归属当前用户
  const blogInfo = BlogDb.findOne({ _id: blog._id, author: { _id: admin._id } })
  const oldBlog = await blogInfo.exec()
  if (!oldBlog) {
    throw new ServiceError('updateBlogById.checkBlog.denied', admin, 'access denied')
  }
  return blogInfo.update({
    title: blog.title,
    context: blog.context,
    summary: blog.summary,
    tags: validateRes.tags,
    category: validateRes.category,
    other: {
      html,
      summaryHTML,
    },
    info: {
      updateTime: Date.now(),
    },
    config: {
      script: blog.config.script || '',
      css: blog.config.css || '',
    }
  }).exec()
}


/**
 * 删除
 */
export const removeBlog = async (blogId: string, admin: IAdmin) => {
  log.warn('removeBlogById.call', { blogId, admin })
  const denied = authentication(admin, AdminRule.BLOG)
  if (!denied) {
    throw new ServiceError('removeBlogById.authentication.denied', admin, 'access denied')
  }

  // 管理员直接删除
  if (admin.rule === AdminRule.GLOBAL) {
    return BlogDb.findByIdAndRemove(blogId).exec()
  }

  // 鉴权
  const blogInfo = BlogDb.findOne({ _id: blogId, author: { _id: admin._id } })
  const oldBlog = await blogInfo.exec()
  if (!oldBlog) {
    throw new ServiceError('updateBlogById.checkBlog.denied', admin, 'access denied')
  }
  // TODO 这里的返回结果为什么不一样？
  return blogInfo.remove().exec()
}



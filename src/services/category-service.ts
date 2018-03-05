import { default as CategoryDb, CategoryModel, ICategory } from '../models/category'
import { Log } from '../utils/log'
import { ServiceError } from '../models/server/said-error'
import { IAdmin } from '../models/admin'
import { updateBlogsCategory } from './blog-service'



const log = new Log('service/category')

/**
 * 匹配分类名称合法性，匹配字母、下划线、数字和.号
 */
const regCategoryName = /^[\d\w\.]{1,18}$/i



/**
 * 分类图标列表，都是 512 * 512 的
 */
const remoteIcons = {
  /**
   * default 在前端有特殊处理，所以单独抽出来
   */
  defaults: 'default.png',
  icons: [
    /**
     * 存储在 oss 存储服务中资源，前缀都是 https://static.tasaid.com/static/images/logos/
     */
    'default.png',
    'angular.png',
    'apple.png',
    'csharp.png',
    'css.png',
    'git.png',
    'google.png',
    'html.png',
    'js.png',
    'microsoft.png',
    'mongodb.png',
    'nodejs.png',
    'react.png',
    'ts.png',
    'v8.png',
    'vscode.png',
    'vue.png',
  ]
}

/**
 * 将 icon 拼接成完成的 url
 * @param icon 
 */
export const getIconUrl = (icon: string) => {
  // !icon 是七牛云的处理样式，原图是 512 * 512 的，七牛云配了 !icon 样式显示的图片是 30 * 30 的
  return '//static.tasaid.com/static/images/logos/' + icon + '!icon'
}

/**
 * 获取分类图标 url 列表
 */
export const getIcons = () => {
  return {
    defaults: getIconUrl(remoteIcons.defaults),
    icons: remoteIcons.icons.map(icon => {
      return getIconUrl(icon)
    })
  }
}

/**
 * 判断 url 是否在 icon 列表中
 * @param url 
 */
export const inIcons = (url: string) => {
  return !!~remoteIcons.icons.findIndex(icon => {
    return getIconUrl(icon) === url
  })
}

/**
 * 检查分类名称是否合法
 */
export const checkCategoryName = (categoryName: string) => {
  return regCategoryName.test(categoryName)
}


/**
 * 查询
 */
export const queryCategoryAll = () => {
  log.info('queryAll.call')
  return CategoryDb.find().sort('-_id').exec()
}


/**
 * 根据 ID 查询分类
 * @param categoryId 
 */
export const queryCategoryById = (categoryId: string, admin: IAdmin) => {
  log.info('queryAll.queryCategoryById', categoryId)
  return CategoryDb.findById(categoryId).exec()
}

/**
 * 新增
 */
export const createCategory = async (category: ICategory) => {
  log.info('createCategory.call', category)
  let old = await CategoryDb.count({ name: category.name }).exec()
  if (old > 0) {
    // log.error('createCategory.exists', category)
    throw new ServiceError('createCategory.exists', category, '分类已存在')
  }
  const categorydb = new CategoryDb(category)
  return categorydb.save()
}

/**
 * 修改
 * @param category 
 */
export const updateCategoryById = async (id: string, category: { icon?: string, name?: string }) => {
  log.info('updateCategoryById.call', { id, category })
  let olds = await CategoryDb.find({ name: category.name, }).exec()
  if (olds.length && ~olds.findIndex(category => {
    return category._id.toString() !== id
  })) {
    // log.error('createCategory.exists', category)
    throw new ServiceError('updateCategoryById.exists', { id, category }, '分类已存在')
  }
  let categoryModel = await CategoryDb.findByIdAndUpdate(id, category, { new: true }).exec()
  log.info('updateCategoryById.findByIdAndUpdate', categoryModel)
  const rows = await updateBlogsCategory(categoryModel)
  log.info('FFFFFFFFFFFFFFFFF', rows)
  return categoryModel
}


/**
 * 删除
 */
export const removeCategory = (id: string) => {
  log.info('removeCategory.call', id)
  return CategoryDb.findByIdAndRemove(id).exec()
}


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
  let old = await CategoryDb.count({ name: category.name, }).exec()
  if (old > 0) {
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


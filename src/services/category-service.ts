import { default as CategoryDb, CategoryModel, ICategory } from '../models/category'
import { Log } from '../utils/log'
import { ServiceError } from '../models/server/said-error'
import { IAdmin } from '../models/admin'

const log = new Log('service/category')


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
export const createCategory = (category: ICategory) => {
  log.info('addCategory.call', category)
  const categorydb = new CategoryDb(category)
  return categorydb.save()
}

/**
 * 修改
 * @param category 
 */
export const updateCategoryById = (id: string, category: { icon?: string, name?: string }) => {
  log.info('editCategory.call', { id, category })
  return CategoryDb.findByIdAndUpdate(id, category).exec()
}


/**
 * 删除
 */
export const removeCategory = (id: string) => {
  log.info('removeCategory.call', id)
  return CategoryDb.findByIdAndRemove(id).exec()
}


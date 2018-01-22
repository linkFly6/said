import { default as TagDb, ITag, TagModel } from '../models/tag'
import { Log } from '../utils/log'
import { ServiceError } from '../models/server/said-error'

const log = new Log('service/tag')


/**
 * 查询全部
 */
export const queryAllTags = () => {
  log.info('queryByTagNames.call')
  return TagDb.find().exec()
}


/**
 * 根据一组 tagName 查询标签列表
 * @param tagIds 
 */
export const queryByTagNames = (tagNames: string[]) => {
  log.info('queryByTagNames.call', { tagNames })
  return TagDb.find({
    name: { '$in': tagNames }
  }).exec()
}


/**
 * 插入一组 tag
 * @param tags 
 */
export const createTags = (tags: ITag[]) => {
  log.info('createTags', tags)
  return TagDb.insertMany(tags)
  // return TagDb.collection.insertMany(tags)
}
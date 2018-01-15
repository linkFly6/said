import { default as TagDb, ITag, TagModel } from '../models/tag'
import { Log } from '../utils/log'
import { ServiceError } from '../models/server/said-error'

const log = new Log('service/tag')


/**
 * 根据一组 tagId 查询标签列表
 * @param tagIds 
 */
export const queryByTagIds = (tagIds: string[]) => {
  log.info('queryByTagIds.call', { tagIds })
  return TagDb.find({
    _id: { '$in': tagIds }
  }).exec()
}
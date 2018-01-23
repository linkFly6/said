import image, { default as ImageDb, ImageModel, IImage, ImageType } from '../models/image'
import { Log } from '../utils/log'
import { ServiceError } from '../models/server/said-error'
import { AdminRule, IAdmin } from '../models/admin'
import { authentication } from '../services/admin-service'


const log = new Log('service/image')


/**
 * 根据分类查询图片
 */
export const queryImagesByType = (imageType: ImageType) => {
  return ImageDb.find({ type: imageType }).exec()
}

/**
 * 删除图片
 * @param imageId 
 * @param admin 
 */
export const deleteImage = (imageId: string, admin: IAdmin) => {
  if (authentication(admin, AdminRule.BLOG)) {
    throw new ServiceError('deleteImage.authentication', admin)
  }
  // TODO 要检查图片引用
  return ImageDb.findByIdAndRemove(imageId)
}


/**
 * 上传图片
 */
export const uploadImage = () => {

}
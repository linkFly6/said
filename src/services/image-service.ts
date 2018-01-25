import image, { default as ImageDb, ImageModel, IImage, ImageType } from '../models/image'
import { Log } from '../utils/log'
import { ServiceError } from '../models/server/said-error'
import { AdminRule, IAdmin } from '../models/admin'
import { authentication } from '../services/admin-service'
import { Express } from 'express'
import * as path from 'path'
import { getFileMd5 } from '../utils'
import * as fs from 'fs-extra'
import { uploadImageToQiniu, deleteImageForQiniu } from '../utils/file'


const log = new Log('service/image')

/**
 * 图片过滤类型
 */
const filterFileTypes = [
  'image/jpeg',
  'image/gif',
  'image/png',
  // 'image/webp' // 因为使用了 https://www.npmjs.com/package/gm 处理，默认不处理 webp
]

/**
 * 根据七牛存储的 key ，获取完整 Url 路径
 * blog/demo.jpg => //xx.com/blog/demo.jpg
 * @param qiniuKey 
 */
export const getFullUrlByQiniuImage = (qiniuKey: string) => {
  return `//${process.env.QINIU_DOMAIN}/${qiniuKey}`
}

/**
 * 获取七牛存储的 key 缩略图的完整路径
 * blog/demo.jpg => //xx.com/blog/demo.jpg!thumb
 * @param qiniuKey 
 */
export const getThumbUrlByQiniuImage = (qiniuKey: string) => {
  return `//${process.env.QINIU_DOMAIN}/${qiniuKey}${process.env.QINIU_THUMBNAILNAME}`
}

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
export const deleteImage = async (imageId: string, admin: IAdmin) => {
  if (!authentication(admin, AdminRule.GLOBAL)) {
    throw new ServiceError('deleteImage.authentication', admin, '您无权限进行该操作')
  }
  // TODO 要检查图片引用
  const image = await ImageDb.findById(imageId).exec()
  log.warn('deleteImage.image', image)
  if (!image) {
    throw new ServiceError('deleteImage.findById.empty', { admin, imageId }, '没有该图片信息')
  }
  try {
    // 删除七牛的图片
    const res = await deleteImageForQiniu(image.key)
    log.info('deleteImage.deleteImageForQiniu', res)
  } catch (error) {
    throw new ServiceError('deleteImage.deleteImageForQiniu.error', error, '图片删除失败')
  }
  return image.remove()
}

/**
 * 根据图片类型获取图片访问路径 => /blog/demo.jpg
 * @param imageType 
 */
export const getImagePath = (imageType: ImageType, filename: string) => {
  let folderName = ''
  switch (imageType) {
    case ImageType.Blog:
      folderName = 'blogs'
      break
    case ImageType.Icon:
      folderName = 'icons'
      break
    case ImageType.Lab:
      folderName = 'labs'
      break
    case ImageType.Music:
      folderName = 'musics'
      break
    case ImageType.Other:
      folderName = 'others'
      break
    case ImageType.Page:
      folderName = 'pages'
      break
    case ImageType.Article:
      folderName = 'articles'
      break
    case ImageType.System:
      folderName = 'systems'
      break
  }
  if (!folderName) {
    throw new ServiceError('uploadImage.getImagePath', { imageType }, '图片分类不正确')
  }
  /**
   * 这个路径就是上传到七牛的文件 key
   * 注意不带前面的 /
   */
  return `${folderName}/${filename}`
}


/**
 * 查找数据库中是否存在同名的图片 (name 就是文件 md5)
 * @param name 
 */
export const imageExistsByName = (name: string) => {
  return ImageDb.count({ name }).exec()
}


/**
 * 上传图片
 */
export const uploadImage = async (imageType: ImageType, img: Express.Multer.File) => {
  const params = {
    destination: img.destination,
    encoding: img.encoding,
    fieldname: img.fieldname,
    filename: img.filename,
    mimetype: img.mimetype,
    originalname: img.originalname,
    path: img.path,
    size: img.size,
  }
  log.info('uploadImage', { imageType, img: params })
  // 图片大于 2mb 不处理
  if (img.size > 2 * 1024 * 1024) {
    throw new ServiceError('uploadImage.maxsize', params, '图片不允许大于 2MB')
  }
  if (!~filterFileTypes.indexOf(img.mimetype)) {
    throw new ServiceError('uploadImage.mimetype', params)
  }
  const md5 = getFileMd5(img.buffer)

  // 通过文件 md5 生成文件名，所以进数据库校验一遍是否重名
  const existsNumer = await imageExistsByName(md5)
  if (existsNumer) {
    throw new ServiceError('uploadImage.existsNumer', null, '图片已存在')
  }
  const filename = md5 + '.' + img.mimetype.split('/')[1]
  /**
   * 生成 path，七牛是 { key: value } 扁平存储的图片
   * 所以没有路径空间的概念，上传的文件名里面就可以带上 key
   */
  const path = getImagePath(imageType, filename)

  log.info('uploadImage.ready', {
    md5,
    path,
  })
  try {
    // 保存到七牛
    const res = await uploadImageToQiniu(path, img.buffer)
    log.info('uploadImageToQiniu.uploadImageToQiniu', res)
  } catch (error) {
    throw new ServiceError('uploadImage.uploadImageToQiniu.error', error, '图片保存失败')
  }

  const image = new ImageDb({
    name: md5,
    fileName: filename,
    size: img.size,
    type: imageType,
    key: path,
  })
  return image.save()
}
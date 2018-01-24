import image, { default as ImageDb, ImageModel, IImage, ImageType } from '../models/image'
import { Log } from '../utils/log'
import { ServiceError } from '../models/server/said-error'
import { AdminRule, IAdmin } from '../models/admin'
import { authentication } from '../services/admin-service'
import { Express } from 'express'
import * as path from 'path'
import { getFileMd5 } from '../utils'
import * as fs from 'fs-extra'


const log = new Log('service/image')

/**
 * 图片过滤类型
 */
const filterFileTypes = [
  'image/jpeg',
  'image/gif',
  'image/png',
  'image/webp'
]

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
  if (authentication(admin, AdminRule.GLOBAL)) {
    throw new ServiceError('deleteImage.authentication', admin)
  }
  // TODO 要检查图片引用
  return ImageDb.findByIdAndRemove(imageId)
}

/**
 * 根据图片类型获取图片路径
 * @param imageType 
 */
export const getImageFolder = (imageType: ImageType) => {
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
  return {
    // 原图存储路径
    original: path.resolve(path.join(__dirname, '../public/images/sources/original')),
    // 缩略图存储路径
    thumb: path.resolve(path.join(__dirname, '../public/images/sources/thumb'))
  }
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
  if (!~filterFileTypes.indexOf(img.mimetype)) {
    throw new ServiceError('uploadImage.mimetype', params)
  }
  const folder = getImageFolder(imageType)
  const md5 = getFileMd5(img.buffer)
  // 通过文件 md5 生成文件名，所以进数据库校验一遍是否重名
  const existsNumer = await imageExistsByName(md5)
  if (existsNumer) {
    throw new ServiceError('uploadImage.existsNumer', null, '图片已存在')
  }
  // 生成全新文件名
  const newFileName = md5 + '.' + img.mimetype.split('/')[1]

  // 保存到本地
  await fs.outputFile(path.join(folder.original, newFileName), img.buffer)
  // if (saveIsOK) {
  //   log.error('uploadImage.saveFileToLocal.error', saveIsOK)
  // }
  // TODO 生成缩略图
  log.info('uploadImage.ready', {
    md5,
    img,
    folder
  })
  const image = new ImageDb({
    name: md5,
    fileName: newFileName,
    size: img.size,
    type: imageType,
  })
  return image.save()
}
import image, { default as ImageDb, ImageModel, IImage, ImageType } from '../models/image'
import { Log } from '../utils/log'
import { ServiceError } from '../models/server/said-error'
import { AdminRule, IAdmin } from '../models/admin'
import { authentication } from '../services/admin-service'
import { Express } from 'express'
import * as path from 'path'
import { getFileMd5 } from '../utils'
import * as fs from 'fs-extra'
import { saveThumb } from '../utils/file'


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
export const getImagePaths = (imageType: ImageType, filename: string) => {
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
    /**
     * 原图存储路径(含文件名)
     */
    original: path.resolve(path.join(__dirname, '../public/images/sources/original', filename)),
    /**
     * 缩略图存储路径(含文件名)
     */
    thumb: path.resolve(path.join(__dirname, '../public/images/sources/thumb', filename))
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
  // 生成全新文件名
  const paths = getImagePaths(imageType, filename)

  log.info('uploadImage.ready', {
    md5,
    paths,
  })
  // 保存到本地
  try {
    await fs.outputFile(paths.original, img.buffer)
  } catch (error) {
    // log.error('uploadImage.outputFile.error', error)
    throw new ServiceError('uploadImage.outputFile.error', error, '图片保存失败')
  }
  // 生成缩略图
  try {
    await saveThumb({
      path: paths.original,
      newFilePath: paths.thumb,
      width: 400,
      height: 100,
      quality: 100,
    })
  } catch (error) {
    // 把生成缩略图有问题，则删除原图
    fs.remove(paths.original)
    throw new ServiceError('uploadImage.saveThumb.error', error, '图片转存失败')
  }
  const image = new ImageDb({
    name: md5,
    fileName: filename,
    size: img.size,
    type: imageType,
  })
  return image.save()
}
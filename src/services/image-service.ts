import image, { default as ImageDb, ImageModel, IImage, ImageType } from '../models/image'
import { Log } from '../utils/log'
import { ServiceError } from '../models/server/said-error'
import { AdminRule, IAdmin } from '../models/admin'
import { authentication } from '../services/admin-service'
import { Express } from 'express'
import * as path from 'path'
import { getFileMd5 } from '../utils'
import * as fs from 'fs'

const log = new Log('service/image')

/**
 * 上传的图片临时存储的文件夹
 */
export const tempFolder = path.resolve('./public/images/temp')

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
    original: path.resolve('./public/images/sources/original'),
    // 缩略图存储路径
    thumb: path.resolve('./public/images/sources/thumb')
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
 * 重命名图片
 * @param oldPath 
 * @param newPath 
 */
export const renameImage = (oldPath: string, newPath: string) => {
  return new Promise<boolean>((resolve, reject) => {
    fs.rename(oldPath, newPath, err => {
      if (err) {
        reject(err)
        return
      }
      resolve(true)
    })
  })
}

/**
 * 上传图片
 */
export const uploadImage = async (imageType: ImageType, img: Express.Multer.File) => {
  const folder = getImageFolder(imageType)
  const md5 = getFileMd5(img.buffer)
  // 通过文件 md5 生成文件名，所以进数据库校验一遍是否重名
  const existsNumer = await imageExistsByName(md5)
  if (existsNumer) {
    throw new ServiceError('uploadImage.existsNumer', null, '图片已存在')
  }
  // 生成全新文件名
  const newFileName = path.join(md5, img.mimetype.split('/')[1])
  // 进行重命名保存
  const renameIsOK = await renameImage(
    path.join(tempFolder, img.filename),
    // mimetype => image/jpeg, image/png, image/gif
    path.join(folder.original, newFileName))

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
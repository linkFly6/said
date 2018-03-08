import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'


/**
 * 根据文件计算得到文件 Md5
 * @param fileBuffer 
 */
export const getFileMd5 = (fileBuffer: Buffer) => {
  const fsMd5 = crypto.createHash('md5')
  fsMd5.update(fileBuffer)
  return fsMd5.digest('hex')
}

/**
 * 判断是否是空对象
 * @example isEmptyObject({})
 * @param obj 
 */
export const isEmptyObject = (obj: any) => {
  var name
  for (name in obj) {
    return false
  }
  return true
}
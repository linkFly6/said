import * as fs from 'fs'
import * as gm from 'gm'
// /**
//  * 写入文件
//  * @param path 
//  * @param file 
//  */
// export const saveFileToLocal = (path: string, file: Buffer) => {
//   return new Promise<boolean>((resolve, reject) => {
//     fs.writeFile(path, file, err => {
//       if (err) {
//         reject(err)
//         return
//       }
//       resolve(true)
//     })
//   })
// }

/**
 * 保存缩略图
 * @param
 */
export const saveThumb = (
  {
    path,
    newFilePath,
    width,
    height,
    quality,
}: {
      path: string | Buffer,
      newFilePath: string,
      width: number,
      height: number,
      quality: number,
    }) => {
  return new Promise<boolean>((resolve, reject) => {
    gm(path).thumb(width, height, newFilePath, quality, 'center', err => {
      if (err)
        reject(err)
      else
        resolve(true)
    })
  })

}
import * as fs from 'fs'

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
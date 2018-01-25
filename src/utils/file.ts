import * as fs from 'fs'
import * as qiniu from 'qiniu'

/**
 * 七牛云存储 key
 */
// qiniu.conf.ACCESS_KEY = process.env.QINIU_ACCESSKEY
// qiniu.conf.SECRET_KEY = process.env.QINIU_SECRETKEY


/**
 * 七牛云存储的空间
 */
const qiniuNamespace = 'said'
// 获得鉴权 mac
const mac = new qiniu.auth.digest.Mac(process.env.QINIU_ACCESSKEY, process.env.QINIU_SECRETKEY)

//构建上传策略函数
function uptoken(key: string) {
  // 根据 said 命名空间生成策略函数
  // 文档： https://developer.qiniu.com/kodo/manual/1206/put-policy
  const putPolicy = new qiniu.rs.PutPolicy({
    scope: `${qiniuNamespace}:${key}`,
    // 新增模式，不允许重名文件覆盖
    insertOnly: 1,
  })
  return putPolicy.uploadToken(mac)
}

/**
 * 七牛操作配置
 */
const qiniuConfig = new qiniu.conf.Config({
  // 是否使用 https 域名
  // useHttpsDomain: true,
  // 是否使用 cdn 加速
  useCdnDomain: true,
})

/**
 * 上传文档：https://developer.qiniu.com/kodo/sdk/1289/nodejs
 * @param filename 
 * @param file 
 */
export const uploadImageToQiniu = (filename: string, file: Buffer) => {
  return new Promise<{ respBody: any, respInfo: any }>((resolve, reject) => {
    const formUploader = new qiniu.form_up.FormUploader(qiniuConfig)
    const putExtra = new qiniu.form_up.PutExtra()
    formUploader.put(
      uptoken(filename),
      filename,
      file,
      new qiniu.form_up.PutExtra(),
      (err, respBody, respInfo) => {
        if (err) {
          reject(err)
          return
        }
        resolve({ respBody, respInfo })
      }
    )
  })
}

/**
 * 删除七牛空间中的图片
 */
export const deleteImageForQiniu = (key: string) => {
  // 七牛空间存储管理
  const bucketManager = new qiniu.rs.BucketManager(mac, qiniuConfig)
  return new Promise<{ respBody: any, respInfo: any }>((resolve, reject) => {
    bucketManager.delete(qiniuNamespace, key, (err, respBody, respInfo) => {
      if (err) {
        reject(err)
        return
      }
      resolve({ respBody, respInfo })
    })
  })

}

// /**
//  * 保存缩略图
//  * @param
//  */
// export const saveThumb = (
//   {
//     path,
//     newFilePath,
//     width,
//     height,
//     quality,
// }: {
//       path: string | Buffer,
//       newFilePath: string,
//       width: number,
//       height: number,
//       quality: number,
//     }) => {
//   return new Promise<boolean>((resolve, reject) => {
//     gm(path).thumb(width, height, newFilePath, quality, 'center', err => {
//       if (err)
//         reject(err)
//       else
//         resolve(true)
//     })
//   })
// }
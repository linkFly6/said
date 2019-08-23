import * as qiniu from 'qiniu'
// import * as musicmetadata from 'musicmetadata'
import * as mm from 'music-metadata'
import * as Stream from 'stream'

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
function uptoken(key: string, returnBody?: string) {
  // 根据 said 命名空间生成策略函数
  // 文档： https://developer.qiniu.com/kodo/manual/1206/put-policy
  const putPolicy = new qiniu.rs.PutPolicy({
    scope: `${qiniuNamespace}:${key}`,
    // 新增模式，不允许重名文件覆盖
    insertOnly: 1,
    returnBody: returnBody ? returnBody : void 0
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
export const uploadFileToQiniu = <B = any, I =any>(filename: string, file: Buffer, returnBody?: string) => {
  return new Promise<{ respBody: B, respInfo: I }>((resolve, reject) => {
    const formUploader = new qiniu.form_up.FormUploader(qiniuConfig)
    const putExtra = new qiniu.form_up.PutExtra()
    // if (returnBody) {
    //   putExtra.returnBody = returnBody
    // }
    formUploader.put(
      uptoken(filename, returnBody),
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
export const deleteFileForQiniu = (key: string) => {
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

/**
 * buffer 转 steam，从 https://github.com/creeperyang/buffer-to-stream 上找的代码
 * @param buf 
 * @param chunkSize 
 */
function buffer2stream(buf: any, chunkSize?: any) {
  if (typeof buf === 'string') {
    buf = Buffer.from(buf, 'utf8')
  }
  if (!Buffer.isBuffer(buf)) {
    throw new TypeError(`"buf" argument must be a string or an instance of Buffer`)
  }

  const reader = new Stream.Readable()
  const hwm = (reader as any)._readableState.highWaterMark

  // If chunkSize is invalid, set to highWaterMark.
  if (!chunkSize || typeof chunkSize !== 'number' || chunkSize < 1 || chunkSize > hwm) {
    chunkSize = hwm
  }

  const len = buf.length
  let start = 0

  // Overwrite _read method to push data from buffer.
  reader._read = function () {
    while (reader.push(
      buf.slice(start, (start += chunkSize))
    )) {
      // If all data pushed, just break the loop.
      if (start >= len) {
        reader.push(null)
        break
      }
    }
  }
  return reader
}

// /**
//  * 获取音频文件的 metadata
//  * 这个库不能获取经过裁剪过后音频 duration（会卡着进程不懂），所以 duration 还要单独部署
//  * 可以通过七牛云上传后帮助获取这些信息： duration
//  * @param path
//  */
// export const getAudioMetadata = (buffer: Buffer) => {
//   return new Promise<MM.Metadata>((resolve, reject) => {
//     musicmetadata(buffer2stream(buffer) as Readable, (err, metadata) => {
//       if (err) {
//         reject(err)
//       } else {
//         resolve(metadata)
//       }
//     })
//   })
// }

/**
 * 获取音频文件的 metadata
 * 这个库不能获取经过裁剪过后音频 duration（会卡着进程不懂），所以 duration 还要单独部署
 * 可以通过七牛云上传后帮助获取这些信息： duration
 * @param path
 */
export const getAudioMetadata = (buffer: Buffer) => {
  return mm.parseBuffer(buffer)
}

/**
 * 根据七牛存储的 key ，获取完整 Url 路径
 * blog/demo.jpg => //xx.com/blog/demo.jpg
 * @param qiniuKey 
 */
export const getFullUrlByQiniuKey = (qiniuKey: string) => {
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
 * 获取七牛存储的 key 专辑封面的完整路径
 * blog/demo.jpg => //xx.com/blog/demo.jpg!thumb
 * @param qiniuKey 
 */
export const getAlbumUrlByQiniuImage = (qiniuKey: string) => {
  return `//${process.env.QINIU_DOMAIN}/${qiniuKey}${process.env.QINIU_ALBUMNAME}`
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
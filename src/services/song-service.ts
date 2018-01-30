import SongDb, { ISongModel, SongSchema, SongModel } from '../models/song'
import { Log } from '../utils/log'
import { ServiceError } from '../models/server/said-error'
import { AdminRule, IAdmin } from '../models/admin'
import { authentication } from '../services/admin-service'
import { Express } from 'express'
import * as path from 'path'
import { getFileMd5 } from '../utils'
import { uploadFileToQiniu, deleteFileForQiniu, getAudioMetadata } from '../utils/file'
import { queryImageById } from '../services/image-service'



const log = new Log('service/image')


/**
 * 根据七牛存储的 key ，获取完整 Url 路径
 * blog/demo.mp3 => //xx.com/blog/demo.mp3
 * @param qiniuKey 
 */
export const getFullUrlByQiniuKey = (qiniuKey: string) => {
  return `//${process.env.QINIU_DOMAIN}/${qiniuKey}`
}


/**
 * 上传图片七牛云返回的结果
 */
export interface QiqniuResBody {
  info: {
    MultiAudios: false,
    /**
     * 音频
     */
    audio: {
      /**
       * @example "224000"
       */
      bit_rate: number
      /**
       * @example "MP3 (MPEG audio layer 3)"
       */
      codec_long_name: string
      /**
       * @example "mp3"
       */
      codec_name: string
      /**
       * @example "1/44100"
       */
      codec_time_base: string
      /**
       * @example "audio"
       */
      codec_type: string
      /**
       * 时长
       * @example 7.907679
       */
      duration: string
      /**
       * @example "s16p"
       */
      sample_fmt: string
      /**
       * @example "44100"
       */
      sample_rate: string
      /**
       * @example "0.000000"
       */
      start_time: string
      /**
       * @example {}
       */
      tags: object
    },
    /**
     * 格式化过后的
     */
    format: {
      /**
       * @example "228143"
       */
      bit_rate: string
      /**
       * @example "7.907679"
       */
      duration: string
      /**
       * @example "MP2/3 (MPEG audio layer 2/3)"
       */
      format_long_name: string
      /**
       * @example "mp3"
       */
      format_name: string
      /**
       * @example "225511"
       */
      size: string

    }
  }
}

/**
 * 支持的音乐文件列表
 */
export const acceptSongMimetypes = [
  'audio/mp3',
  'audio/mpeg',
  'audio/ogg'
]

/**
 * 获取资源访问路径 (7牛存储路径)
 * @param imageType 
 */
export const getPath = (filename: string) => {
  /**
   * 这个路径就是上传到七牛的文件 key
   * 注意不带前面的 /
   */
  return `song/${filename}`
}

/**
 * 查询全部
 */
export const queryAll = (admin: IAdmin) => {
  log.info('queryAll.call', admin)
  return SongDb.find().sort('-_id').exec()
}


/**
 * 查找数据库中是否存在同名的图片 (name 就是文件 md5)
 * @param name 
 */
export const existsByName = (name: string) => {
  return SongDb.count({ name }).exec()
}

/**
 * 保存并解析得到歌曲文件信息，这里只是将歌曲文件上传并解析对应的歌曲信息（时长/歌手/专辑等）
 * 将歌曲保存到数据库需要调用 save()
 * @param file 
 */
export const uploadSong = async (file: Express.Multer.File): Promise<ISongModel> => {
  const params = {
    destination: file.destination,
    encoding: file.encoding,
    fieldname: file.fieldname,
    filename: file.filename,
    mimetype: file.mimetype,
    originalname: file.originalname,
    path: file.path,
    size: file.size,
  }
  log.info('uploadSong.call', params)
  /**
   * 歌曲最大 10mb，超过 10mb 不再处理
   */
  if (file.size > 10 * 1024 * 1024) {
    throw new ServiceError('uploadSong.maxsize', params, '歌曲文件不允许大于 10MB')
  }
  if (!~acceptSongMimetypes.indexOf(file.mimetype)) {
    throw new ServiceError('uploadSong.mimetype', params, '不支持上传的文件')
  }
  const md5 = getFileMd5(file.buffer)
  // 通过文件 md5 生成文件名，所以进数据库校验一遍是否重名
  const existsNumer = await existsByName(md5)
  if (existsNumer) {
    throw new ServiceError('uploadSong.existsNumer', null, '歌曲已存在')
  }
  const filename = md5 + '.' + file.mimetype.split('/')[1]

  /**
   * 生成 path，七牛是 { key: value } 扁平存储的图片
   * 所以没有路径空间的概念，上传的文件名里面就可以带上 key
   */
  const path = getPath(filename)

  log.info('uploadSong.ready', {
    md5,
    path,
  })

  try {

    const metadata = await getAudioMetadata(file.buffer)
    log.info('uploadSong.getAudioMetadata.metadata', metadata)
    // 保存到七牛
    const res = await uploadFileToQiniu<QiqniuResBody>(
      path,
      file.buffer,
      /**
       * 七牛云魔法变量：
       * https://developer.qiniu.com/kodo/manual/1235/vars#xvar
       */
      '{ "info": $(avinfo) }')
    log.info('uploadSong.uploadFileToQiniu', res)
    // 判断格式是否合法
    if (isNaN(+res.respBody.info.format.duration)) {
      // TODO 要把 7牛云的图片给删掉
      throw new ServiceError('uploadSong.uploadFileToQiniu.durationNaN', { params, res }, '歌曲文件转存失败')
    }
    return {
      // _id: '',
      // image: null as any,
      /**
       * mimetype
       */
      mimeType: file.mimetype,
      /**
       * 存储的资源名称 (7牛)
       */
      key: path,
      /**
       * 准备要存储的 md5
       */
      name: md5,
      /**
       * 专辑
       */
      album: metadata.album,
      /**
       * 歌手
       */
      artist: metadata.artist ? metadata.artist.join('&') : '',
      /**
       * 标题
       */
      title: metadata.title,
      /**
       * 大小 kb
       */
      size: file.size,
      /**
       * 时长(s)
       */
      duration: +res.respBody.info.format.duration,
    } as any
  } catch (error) {
    throw new ServiceError('uploadSong.uploadFileToQiniu.error', error, '歌曲文件保存失败')
  }

  // const image = new ImageDb({
  //   name: md5,
  //   fileName: filename,
  //   size: img.size,
  //   type: imageType,
  //   key: path,
  // })
  // return image.save()
}


/**
 * 保存歌曲信息，上传歌曲文件请参阅 uploadSong() 接口
 * @param song 
 */
export const saveSong = async (song: ISongModel, admin: IAdmin) => {
  log.info('save.call', { song, admin })
  const denied = authentication(admin, AdminRule.SAID)
  if (!denied) {
    throw new ServiceError('save.authentication.denied', { song, admin }, '您没有权限进行该操作')
  }
  // 验证图片是否存在
  const image = await queryImageById(song.image._id)
  if (!image) {
    throw new ServiceError('save.queryImageById.empty', { song, admin }, '歌曲封面图信息不正确')
  }
  const db = new SongDb(song)
  return db.save()
}


export const removeFile = (md5: string, admin: IAdmin) => {
  // const denied = authentication(admin, AdminRule.SAID)
  // if (!denied) {
  // throw new ServiceError('save.authentication.denied', { md5, admin }, '您没有权限进行该操作')
  // }
  log.warn('removeFile.call', { md5, admin })
  return true
}
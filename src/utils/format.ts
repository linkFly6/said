import * as moment from 'moment'
/**
 * 用来生成评论楼层的 hash (否则 #1、#2 这种 hash 会经常变动)
 * @see https://github.com/dylang/shortid
 */
import * as shortid from 'shortid'

export function pad(num: string | number, length: number, fill: string | number = '0') {
  var len = ('' + num).length
  return (Array(
    length > len ? length - len + 1 || 0 : 0
  ).join(fill as string) + num)
}


/**
 * 时间格式化
 * @example format 支持下面的格式：
 * 年份：dateFormat(date, yyyy) => 2018
 * 2 位数月份：dateFormat(date, MM) => 02
 * 1 位数月份：dateFormat(date, M) => 2
 * 2 位数日期：dateFormat(date, dd) => 07
 * 1 位数日期：dateFormat(date, d) => 7
 * 2 位数 24 小时：dateFormat(date, HH) => 09
 * 1 位数 24 小时：dateFormat(date, H) => 11
 * 2 位数 12 小时(上下午会在小时前加 AM/PM)：dateFormat(date, hh) => 02
 * 1 位数 12 小时(上下午会在小时前加 AM/PM)：dateFormat(date, h) => 2
 * 2 位数分钟：dateFormat(date, mm) => 08
 * 1 位数分钟：dateFormat(date, mm) => 8
 * 2 位数秒：dateFormat(date, ss) => 06
 * 1 位数秒：dateFormat(date, s) => 6
 * 3 位数毫秒：dateFormat(date, S) => 000
 * 季度：dateFormat(date, q) => 1
 * @param date 
 * @param format 
 */
export const dateFormat = (date: Date | string | number, format = 'yyyy-MM-dd') => {
  if (!date) return ''
  let converDate: Date
  if (!(date instanceof Date)) {
    let tmp: any = String(date).replace(/\-/g, '/')
    if (!isNaN(tmp)) {
      tmp = parseInt(tmp, 10)
    }
    converDate = new Date(tmp)
  } else {
    converDate = date
  }
  if (!(converDate! instanceof Date)) return ''
  converDate = converDate! as Date
  const hours = converDate.getHours()
  const hours12 = hours > 11 ? 'PM' + (hours - 12) : 'AM' + hours // 12 小时制 1 位数
  const hours12double = hours > 11 ? 'PM ' + pad(hours - 12, 2) : 'AM ' + pad(hours, 2) // 12 小时制 2 位数

  const o = {
    'M+': converDate.getMonth() + 1, // 月份
    'd+': converDate.getDate(), // 日
    'H+': converDate.getHours(), // 小时
    'm+': converDate.getMinutes(), // 分
    's+': converDate.getSeconds(), // 秒
    'q+': Math.floor((converDate.getMonth() + 3) / 3), // 季度
    'S': converDate.getMilliseconds(), // 毫秒
  }

  format = format
    .replace('yyyy', converDate.getFullYear() as any) // 4位数年份
    .replace('hh', hours12double) // 12 小时制 2 位数
    .replace('h', hours12) // 12 小时制 1 位数

  for (const k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return format
}



/**
 * 匹配 00:01:00
 */
const regTime = /(0\d|2[0-3])?:?(0\d|[1-5]\d):(0\d|[1-5]\d)/

// 当前时间固定时间戳 2018-01-30 00:00:00（一定要 00:00:00，否则计算可能存在误差）
const lockDateNow = 1517241600000

/**
 * 转换一个时间到秒，例如：00:01:00 => 60
 * 原理就是锁定一个默认的标准时间，然后正则解析出字符串后设置对应的时分秒
 * @param value 
 */
export const parseSeconds = (value: string) => {
  const date = new Date()
  // 设置到固定时间
  date.setTime(lockDateNow)
  const res = regTime.exec(value)
  if (res) { // ["22:31:43", "22", "31", "43"]
    date.setHours(res[1] ? +res[1] : 0)
    date.setMinutes(res[2] ? +res[2] : 0)
    date.setSeconds(res[3] ? +res[3] : 0)
    return (date.getTime() - lockDateNow) / 1000
  }
  return 0
}

/**
 * 转换一个秒数到时间，例如：60 => 00:01:00
 * @param seconds 
 */
export const parseTime = (seconds: number, format = 'HH:mm:ss') => {
  const date = new Date()
  date.setTime(lockDateNow)
  date.setSeconds(seconds)
  return dateFormat(date, format)
}
/**
 * 转换一个字节单位到合适阅读的单位
 * @param value 
 */
export const parseBit = (value: number) => {
  const radix = 1024
  let v: string = value as any;
  ['B', 'KB', 'MB', 'GB'].some((unitStr, i) => {
    if (value < Math.pow(radix, i + 1)) {
      v = (value / Math.pow(radix, i)).toFixed(2) + unitStr
      return true
    }
    return false
  })
  return v
}


export const date2Local = (date: string | number) => {
  const timespan = moment().diff(date)
  if (timespan <= 12e4) { // 2分钟
    return '刚才'
  }
  if (timespan <= 864e5) { // 1 天
    return moment(date).format('今天 HH:mm')
  }
  if (timespan <= 1728e5) { // 2天
    return moment(date).format('昨天 HH:mm')
  }
  if (timespan <= 2592e5) { // 3天
    return moment(date).format('前天 HH:mm')
  }
  return moment(date).format('YYYY-MM-DD HH:mm')
}

/**
 * 将时间转化为日
 * @param date 
 */
export const date2day = (date: string | number) => {
  const timespan = moment().diff(date)
  if (timespan <= 12e4) { // 2分钟
    return '刚才'
  }
  if (timespan <= 864e5) { // 1 天
    return moment(date).format('今天')
  }
  if (timespan <= 1728e5) { // 2天
    return moment(date).format('昨天')
  }
  if (timespan <= 2592e5) { // 3天
    return moment(date).format('前天')
  }
  return moment(date).format('DD日')
}

/**
 * 生成短 ID
 */
export const shortId = () => {
  /**
   * 默认是从这些值里面生成的（64位值）
   * 生成的值满足这些条件：7-14 位、A-Z, a-z, 0-9, _-
   * 默认值：0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_
   */
  return shortid.generate()
}
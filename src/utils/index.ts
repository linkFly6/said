import * as fs from 'fs'
import * as path from 'path'

/*
 * 日期格式化 yyyy-MM-dd HH:mm:ss 若不传 fmt 则返回时间戳
 * @param {String} time - 毫秒
 * @returns {Date|String}
 */
export const formateDate = function (time: string | number, fmt?: string): any {
  if (!time) {
    return ''
  }

  time = String(time)

  if (fmt) {
    const date: Date = new Date(time)
    const o = {
      'M+': date.getMonth() + 1, // 月份
      'd+': date.getDate(), // 日
      'h+': date.getHours(), // 小时
      'm+': date.getMinutes(), // 分
      's+': date.getSeconds(), // 秒
      'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
      'S': date.getMilliseconds(), // 毫秒
    }
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
    }

    for (const k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
      }
    }

    return fmt
  } else { // 字符串转时间戳
    const timeParts = time.split(/\s+/)

    timeParts[0] = timeParts[0].replace(':', '/')

    const date: Date = new Date(`${timeParts[0]} ${timeParts[1]} || ''`)
    return date.getTime()
  }
}

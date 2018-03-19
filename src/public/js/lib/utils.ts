
const slice = Array.prototype.slice

/**
 * format(str,object) - 格式化一组字符串，参阅C# string.format()
 * @example format(str,object) - 通过对象格式化
 * @example format(str,Array) - 通过数组格式化
 * @param str - 格式化模板(字符串模板)
 * @param object - object - 使用对象的key格式化字符串，模板中使用${name}占位：${data},${value}
 * @param object - Array - 使用数组格式化，模板中使用${Index}占位：${0},${1}
 */
export const format = function <T=object | Array<any>>(str: string, object: T): string {
  /// <summary>
  /// 1: 
  /// &#10; 1.1 - format(str,object) - 通过对象格式化
  /// &#10; 1.2 - format(str,Array) - 通过数组格式化
  /// </summary>
  /// <param name="str" type="String">
  /// 格式化模板(字符串模板)
  /// </param>
  /// <param name="object" type="Object">
  /// Object:使用对象的key格式化字符串，模板中使用${name}占位：${data},${value}
  /// Array:使用数组格式化，模板中使用${Index}占位：${0},${1}
  /// </param>
  /// <returns type="String" />
  if (typeof str !== 'string') return ''
  var array = slice.call(arguments, 1)
  //可以被\符转义
  return str.replace(/\\?\${([^{}]+)\}/gm, function (match, key) {
    //匹配转义符"\"
    if (match.charAt(0) == '\\')
      return match.slice(1)
    var index = Number(key)
    if (index >= 0)
      return array[index]
    return object[key] !== undefined ? object[key] : match
  })
}


/**
 * 函数节流 -  把原函数封装为拥有函数节流阀的函数，当重复调用函数，只有到达这个阀值（wait毫秒）才会执行
 * 引自underscore
 * @param {function} func - 回调函数
 * @param {int} wait - 阀值(ms)
 * @param {object} options = null - 想禁用第一次首先执行的话，传递{leading: false}，还有如果你想禁用最后一次执行的话，传递{trailing: false}
 * @returns {function}
 */
export const throttle = function <T=any>(
  func: T,
  wait: number, options: { leading?: boolean, trailing?: boolean } = {}): T {
  var context: any, args: any, result: any
  var timeout: number | null = null
  var previous = 0
  var later = function () {
    previous = options.leading === false ? 0 : Date.now()
    timeout = null
    result = (func as any).apply(context, args)
    if (!timeout) context = args = null
  }
  return function (this: any) {
    var now = Date.now()
    if (!previous && options.leading === false) previous = now
    var remaining = wait - (now - previous)
    context = this
    args = arguments
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        window.clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = (func as any).apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout && options.trailing !== false) {
      timeout = window.setTimeout(later, remaining)
    }
    return result
  } as any
}


/**
 * 添加 class
 * @param element dom
 * @param className className，不考虑多个
 */
export const addClass = (element: Element, className: string) => {
  className = className.trim()
  // 如果支持 DOM 3 中的 classList，则使用 classList
  if (element.classList && element.classList.add) {
    element.classList.add(className)
    return element
  }
  // 按照数组进行操作
  let classNames = element.className.split(' ')
  // 有存在项则不在继续
  if (~classNames.indexOf(className)) {
    return element
  }
  classNames.push(className)
  element.className = classNames.join(' ')
  return element
}


/**
 * 移除 class
 * @param element dom
 * @param className className，不考虑多个
 */
export const removeClass = (element: Element, className: string) => {
  className = className.trim()
  if (element.classList && element.classList.remove) {
    element.classList.remove(className)
    return element
  }
  let classNames = element.className.split(' ')
  let index = ~classNames.indexOf(className)
  // 没找到则不再继续
  if (!~index) {
    return element
  }
  classNames.splice(index, 1)
  element.className = classNames.join(' ')
  return element
}


/**
 * 检测一个uri是否是正确 uri格式，判断了这些：
 * 不允许包含参数的 uri
 * 长度小于 60，不为空
 * tasaid.com | //tasaid.com| www.tasaid.com
 * @param uri 
 */
export const checkUri = (uri: string) => {
  return uri && uri.trim().length <= 60 && /^((https:|http:)?\/\/)?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})(:[0-9]{1,4})?((\/?)|(\/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+\/?)$/.test(uri)
}
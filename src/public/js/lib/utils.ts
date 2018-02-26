
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
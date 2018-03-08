
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


/**
 * 修正 uri，例如 tasaid.com => http://tasaid.com
 * @param uri 
 */
export const resolveHTTPUri = (uri: string) => {
  if (uri.startsWith('//')) {
    return 'http:' + uri
  } else if (!/^http(?:s)?:\/\//.test(uri)) {
    return 'http://' + uri
  } else
    return uri
}
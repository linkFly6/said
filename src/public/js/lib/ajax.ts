

/**
 * 发送请求
 * @param options - 请求配置
 * @param [options.url] - 请求 url
 * @param [options.params] - 请求参数对象（POST 请求，get 请自行在 url 中添加参数）
 * @param [options.callback] - 回调函数
 * @param [options.methods] - 请求 HTTP Methods
 */
export const ajax = <T=any>(options: {
  url: string,
  /**
   * 只接受 post 参数
   */
  params?: object,
  callback: (err: any, data: T) => void,
  methods: 'GET' | 'POST'
}) => {
  const xhr = new XMLHttpRequest()
  xhr.onreadystatechange = () => {
    if (xhr.readyState === (XMLHttpRequest.DONE || 4)) {
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText)
          options.callback(null, data)
        } catch (error) {
          options.callback(error, null)
        }
      }
    }
  }
  options.methods = options.methods.toUpperCase() as any || 'GET'
  xhr.open(options.methods, options.url)
  if (options.methods === 'POST') {
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
  }
  let params: string | void
  if (options.params != null && typeof options.params === 'object') {
    params = getQueryString(options.params)
  }
  xhr.send(params)
}

/**
 * 发送 get 请求
 * @param options 
 */
export const get = <T=any>(options: {
  url: string,
  callback: (err: any, data: T) => void
}) => {
  return ajax<T>({
    methods: 'GET',
    ...options,
  })
}



/**
 * 请求对象转请求 string
 * @param params 
 */
export const getQueryString = (params: object) => {
  var esc = encodeURIComponent
  return Object.keys(params)
    .map(k => esc(k) + '=' + esc(params[k]))
    .join('&')
}
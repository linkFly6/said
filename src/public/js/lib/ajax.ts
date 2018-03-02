/**
 * 发送 get 请求
 * @param options 
 */
export const get = <T=any>(options: {
  url: string,
  callback: (err: any, data: T) => void
}) => {
  const xhr = new XMLHttpRequest()
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE || 4) {
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
  xhr.open('GET', options.url)
  xhr.send()
}
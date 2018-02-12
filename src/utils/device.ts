// export const device = (userAgent: string) => {

// }

const regMobile = /Android|iPhone|Windows Phone|Mobile/i


/**
 * 判断是否是移动设备访问
 * @param userAgent 
 */
export const isMobileDevice = (userAgent: string) => {
  return regMobile.test(userAgent)
}

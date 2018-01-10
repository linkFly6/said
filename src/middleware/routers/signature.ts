import { ApplicationRequestHandler } from 'express-serve-static-core'
import { Route, Filter } from './models'



/**
 * 这里大概实现一个简版的 filter，本质上就是创建中间件
 * 用户自己生成装饰器，token 表示 url 前缀，然后在使用这些装饰器的时候自动补上前缀，从而导致命中中间件
 */

let keyIndex = 0


/**
 * 所有 filter 挂载的 key
 */
const allKeys: string[] = []

/**
 * 所有 filters，属性名是动态生成的 symbolKey，值是对应的方法
 */
export const allSignature: { [prop: string]: Filter } = {}


/**
 * 默认 symbol，用于只定义装饰器，但没有装饰器参数的场景，通过这个默认值识别出装饰器
 */
export const defaultSymbol = `signature_default_${+new Date}${keyIndex}`




/**
 * 给 filter 签名生成自己的装饰器
 * @param filter
 */
export const signatureWithOption = <T>(filter: Filter) => {
  const key = `signatureWithOption_${+new Date}${keyIndex++}`
  allKeys.push(key)
  allSignature[key] = filter
  return (option: T) => {
    return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>) {
      Reflect.defineMetadata(key, option, target, propertyKey)
    }
  }
}

/**
 * 给 filter 签名生成自己的装饰器
 * @param filter
 */
export const signature = (
  filter: Filter,
  // 注意这里，存在只定义装饰器但是没有参数的场景，需要识别出来
  defaultValue: any = defaultSymbol) => {
  const key = `signature_${+new Date}${keyIndex++}`
  allKeys.push(key)
  allSignature[key] = filter
  return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>) {
    Reflect.defineMetadata(key, defaultValue, target, propertyKey)
  }
}



/**
 * 根据 key 获取 Filter 配置和 options
 * @param key 
 */
export const getFilterAndOptions = (target: any, propertyKey: string) => {
  let res: Array<{ options: any, filter: Filter }> = []
  let targetKeys = Reflect.getMetadataKeys(target, propertyKey)
  let keys = targetKeys.filter((key: string) => {
    return !!~allKeys.findIndex(k => k == key)
  })
  if (keys) {
    res = keys.map(key => {
      const options = Reflect.getMetadata(key, target, propertyKey)
      const filter = allSignature[key]
      return {
        options: options === defaultSymbol ? null : options,
        filter,
      }
    })
  }
  return res
}
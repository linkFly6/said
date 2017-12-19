import 'reflect-metadata'

// let privateKey = Symbol()

/**
 * 路由路径 metadata Key
 */
export const symbolPathKey = Symbol.for('design:path')

/**
 * 路由路径
 * @example @path
 */
// tslint:disable-next-line:ban-types
export let path = (path: string): Function => {
  return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>) {
    Reflect.defineMetadata(symbolPathKey, path, target, propertyKey)
  }
}

/**
 * HTTP GET metadata Key
 */
export const symbolHttpMethodsKey = Symbol.for('design:httpMethods')
/**
 * GET 请求
 * @example @get
 */
export let get = function (target: any, propertyKey: string) {
  Reflect.defineMetadata(symbolHttpMethodsKey, 'get', target, propertyKey)
  // let meta = Reflect.getMetadata('design:type', target, propertyKey)
  // let meta2 = Reflect.getMetadata('design:paramtypes', target, propertyKey)
  // let meta3 = Reflect.getMetadata('design:returntype', target, propertyKey)
  // // [ 'design:returntype', 'design:paramtypes', 'design:type' ]
  // let keys = Reflect.getMetadataKeys(target, propertyKey)
  // console.log(keys, meta, meta2, meta3)
}

/**
 * POST 请求
 * @example @post
 */
export let post = function (target: any, propertyKey: string) {
  Reflect.defineMetadata(symbolHttpMethodsKey, 'post', target, propertyKey)
}

/**
 * 完整配置路由 metadata Key
 */
export const sysmbolRouterConfigProxyKey = Symbol.for('design:routerConfig')
/**
 * 配置整个路由，优先级最低的装饰器，会被其他装饰器覆盖，例如 @get，但是可以进行完整配置
 * @example @router({ path: '/', method: 'get', auth: 'token', formdata: true })
 */
export let router = (config: {
  path?: string
  method?: string
  formdata?: boolean,
}) => {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(sysmbolRouterConfigProxyKey, config || {}, target, propertyKey)
  }
}

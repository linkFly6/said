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
 * auth 认证 metadata Key
 */
export const symbolAuthKey = Symbol.for('design:auth')
/**
 * auth 认证
 * @example @auth('token')
 */
export let auth = (authKey: string) => {
  return function (target: any, propertyKey: string) {
    // ada 的 auth 可以传字符串，字符串用来表示从参数里面取哪个字段
    Reflect.defineMetadata(symbolAuthKey, authKey, target, propertyKey)
  }
}

/**
 * 是否挂载用户信息 metadata Key
 */
export const symbolTokenKey = Symbol.for('design:token')
/**
 * 是否挂载用户信息，如果配置配置 @path，则会对路由路径产生影响
 * @example @token
 */
export let token = function (target: any, propertyKey: string) {
  Reflect.defineMetadata(symbolTokenKey, 'token', target, propertyKey)
}


/**
 * 路由代理 metadata Key
 */
export const symbolProxyKey = Symbol.for('design:proxy')
/**
 * 路由代理
 * @example @proxy({ ... })
 */
export let proxy = (proxy: () => any) => {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(symbolProxyKey, proxy, target, propertyKey)
  }
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
  auth?: boolean | string
  formdata?: boolean,
}) => {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(sysmbolRouterConfigProxyKey, config || {}, target, propertyKey)
  }
}

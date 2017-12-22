import { Request, Response, NextFunction, Router } from 'express'

export class Route {
  /**
   * 路由 controller 名称
   */
  public controllerName: string

  /**
   * 路由名称
   */
  public name: string

  /**
   * 路由 path
   */
  public path: string

  /**
   * 路由 http Method
   */
  public method: string

  /**
   * 路由处理函数
   */
  public action: (req: Request, res: Response, next: NextFunction) => any
  // constructor(
  //   path?: string,
  //   method?: string,
  //   transport?: (req: Request, res: Response, next: NextFunction) => any) {
  // }
}


/**
 * router 错误对象
 */
export class RouterError extends Error {

  private _code: number
  public get code(): number {
    return this._code
  }
  private _message: string
  public get message(): string {
    return this._message
  }
  private _data?: any

  public get data(): any {
    return this._data
  }

  constructor(code: number | object | RouterError, message?: string, data?: any) {
    if (typeof code === 'object' && (code as any).code != null && (code as any).message != null) {
      super((code as any).message)
      this._code = (code as any).code
      this._message = (code as any).message
      this._data = (code as any).data
    }
    super(message)
    this._code = code as number
    this._message = message
    this._data = data
  }

  /**
   * 检测是目标对象是否兼容 RouterError
   * @param target 
   */
  public static isLike(target: any) {
    return (target instanceof RouterError) ||
      (target && target.code != null && target.message != null && target.data != null)
  }

  /**
   * 因为 ts 最终编译出来的私有属性是带 _ 的，如果直接序列化则会造成属性不正确
   * 所以提供这个方法
   */
  public toJSON() {
    return {
      code: this.code,
      message: this.message,
      data: this.data,
    }
  }
}


/**
 * action 句柄，在 action 处理过程中统一注入执行上下文
 */
export abstract class ActionHandler<BHR, EHR> {
  /**
   * 前置处理，返回参数会在 action 的第二个参数中注入
   */
  abstract onActionExecuting: (req: Request, route: Route) => BHR
  /**
   * 后置处理，可以自行包装结果
   */
  abstract onResultExecuted: (err: RouterError | Error | null, req: Request, route: Route) => EHR | RouterError | null
}

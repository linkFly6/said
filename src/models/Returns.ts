/**
 * 通用返回类型抽象
 */
export class Returns<T> {
  private _success: boolean
  /**
   * 结果是否正确，判断条件为 errorCode 不为 0，但并不检测数据合法性, 强检测数据合法请使用 check()
   */
  public get success(): boolean {
    return this._success
  }

  private _error: Error
  /**
   * 错误对象
   */
  public get error(): Error {
    return this._error
  }

  private _code: number
  /**
   * 错误代码
   */
  public get code(): number {
    return this._code
  }

  private _message: string
  /**
   * 消息
   */
  public get message(): string {
    return this._message
  }

  private _data: T
  /**
   * 数据源
   */
  public get data(): T {
    return this._data
  }
  /**
   * 将后端返回的数据结果封装为对象
   * - constructor(Error) - 根据 Error 对象构建
   * - constructor(Error, data) - 根据 Error 构建，并使用 data 作为数据
   * - constructor(Returns) - 根据 Returns 对象构建
   * - constructor(null, data) - data 格式为后端返回的统一格式：{ code: number, msg: string, data: any }
   * @param  {Error} error - 错误对象
   * @param  {Returns} error - 上一个 Returns 包装结果
   * @param  {any} data - 包装的数据
   * @return
   */
  constructor(error: any, data: { code: number, msg: string, data: any } | any) {
    if (error instanceof Returns) {
      this._success = error.success
      this._code = error.code
      this._error = error.error
      this._message = error.message
      if (data) {
        this._data = data
      } else {
        this._data = error.data
      }
      return
    }
    if (error instanceof Error) {
      this._success = false
      this._code = (error as any).code
      this._message = error.message
      this._error = error
      this._data = data || null
      return
    }
    if (!data) {
      this._success = false
      this._data = data
      this._code = -1
      this._message = ''
      return
    }

    this._success = data.code === 0
    this._code = data.code
    this._message = data.msg
    this._data = data.data
  }
  /**
   * 和 success 不同，check() 检查返回正确性(code)之后还会检查数据源是否为空(null\undefined)
   */
  public check(): boolean {
    return this.success && this.data != null
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

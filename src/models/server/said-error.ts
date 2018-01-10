import { Log } from '../../utils/log'

/**
 * service 异常
 */
export class ServiceError extends Error {
  private _title: string
  public get title(): string {
    return this._title
  }

  private _data: any
  public get data(): any {
    return this._data
  }
  constructor(title: string, data: any, message?: '') {
    super(message)
    this._title = title
    this._data = data
  }

  /**
   * 检测是否是 ServiceError 对象
   * @param err 
   */
  public static is(err: any) {
    return err instanceof ServiceError
  }

  /**
   * 输出错误日志
   * @param log 
   */
  public log(log: Log) {
    log.error(this.title, this.data)
  }
}
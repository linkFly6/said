import { Request, Response, NextFunction, Router } from 'express'

export class Route {

  public path: string

  public method: string

  public transport: (req: Request, res: Response, next: NextFunction) => any
  // constructor(
  //   path?: string,
  //   method?: string,
  //   transport?: (req: Request, res: Response, next: NextFunction) => any) {
  // }
}

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

  constructor(code: number, message: string, data?: any) {
    super(message)
    this._code = code
    this._message = message
    this._data = data
  }
}
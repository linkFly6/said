import { ActionHandler, Route } from '../middleware/routers/models'
import { Request } from 'express'
import Log from '../utils/log'

export const actionHandler = new ActionHandler()

type ActionInjection = {
  log: Log
}

actionHandler.onActionExecuting = <ActionInjection>(req: Request, route: Route): ActionInjection => {
  const log = new Log(`${route.controllerName}/${route.name}`)
  log.info('')
  return {
    log,
  } as any
}


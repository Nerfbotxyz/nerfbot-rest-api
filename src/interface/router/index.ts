import Router from '@koa/router'

export interface IRouter<State, Context> {
  router: Router<State, Context>
}

export const ROUTERS = {
  AuthRouter: Symbol.for('AuthRouter'),
  NerfRouter: Symbol.for('NerfRouter'),
  NerfUploadsRouter: Symbol.for('NerfUploadsRouter'),
  NerfJobsRouter: Symbol.for('NerfJobsRouter')
}

export * from './auth'
export * from './nerf'
export { default as NerfRouter } from './nerf'

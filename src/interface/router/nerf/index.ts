import Router from '@koa/router'
import { inject, injectable } from 'inversify'

import { Context, State } from '../../../app'
import { ApiKeysRepository, REPOSITORIES } from '../../../service/repository'
import { requireApiToken } from '../../middleware'
import NerfUploadsRouter from './uploads'
import NerfJobsRouter from './jobs'
import { ROUTERS } from '../'

export { default as NerfJobsRouter } from './jobs'
export { default as NerfUploadsRouter } from './uploads'

@injectable()
export default class NerfRouter {
  router: Router<State, Context> = new Router<State, Context>()

  constructor(
    @inject(REPOSITORIES.ApiKeysRepository) private apiKeys: ApiKeysRepository,
    @inject(ROUTERS.NerfJobsRouter) private jobsRouter: NerfJobsRouter,
    @inject(ROUTERS.NerfUploadsRouter) private uploadsRouter: NerfUploadsRouter
  ) {
    this.build()
  }

  private build() {
    this.router.use(requireApiToken(this.apiKeys))
    this.router.use(
      '/uploads',
      this.uploadsRouter.router.routes(),
      this.uploadsRouter.router.allowedMethods()
    )
    this.router.use(
      '/jobs',
      this.jobsRouter.router.routes(),
      this.jobsRouter.router.allowedMethods()
    )
  }
}




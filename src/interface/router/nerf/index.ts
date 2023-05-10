import Router from '@koa/router'
import { inject, injectable } from 'inversify'

import { Context, State } from '~/app'
import { ApiKeysRepository, REPOSITORIES } from '~/service/repository'
import { requireApiToken } from '~/interface/middleware'
import NerfUploadsRouter from './uploads'
import NerfJobsRouter from './jobs'
import { NerfTrainingsRouter, ROUTERS } from '../'
import NerfProcessedRouter from './processed'
import NerfRendersRouter from './renders'

export { default as NerfJobsRouter } from './jobs'
export { default as NerfUploadsRouter } from './uploads'
export { default as NerfTrainingsRouter } from './trainings'

@injectable()
export default class NerfRouter {
  router: Router<State, Context> = new Router<State, Context>()

  constructor(
    @inject(REPOSITORIES.ApiKeysRepository) private apiKeys: ApiKeysRepository,
    @inject(ROUTERS.NerfJobsRouter) private jobsRouter: NerfJobsRouter,
    @inject(ROUTERS.NerfUploadsRouter) private uploadsRouter: NerfUploadsRouter,
    @inject(ROUTERS.NerfProcessedRouter)
    private processedRouter: NerfProcessedRouter,
    @inject(ROUTERS.NerfTrainingsRouter)
    private trainingsRouter: NerfTrainingsRouter,
    @inject(ROUTERS.NerfRendersRouter)
    private rendersRouter: NerfRendersRouter
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
    this.router.use(
      '/processed',
      this.processedRouter.router.routes(),
      this.processedRouter.router.allowedMethods()
    )
    this.router.use(
      '/trainings',
      this.trainingsRouter.router.routes(),
      this.trainingsRouter.router.allowedMethods()
    )
    this.router.use(
      '/renders',
      this.rendersRouter.router.routes(),
      this.rendersRouter.router.allowedMethods()
    )
  }
}

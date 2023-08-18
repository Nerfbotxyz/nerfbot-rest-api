import Router from '@koa/router'
import { inject, injectable } from 'inversify'

import { Context, ParameterizedContext, State } from '~/app'
import {
  APP_SERVICES,
  JobsAppService,
  ProcessedAppService
} from '~/app-services'
import Logger from '~/util/logger'

@injectable()
export default class NerfProcessedRouter {
  router: Router<State, Context> = new Router<State, Context>()
  logger: Logger = new Logger('NerfProcessedRouter')

  constructor(
    @inject(APP_SERVICES.ProcessedAppService)
    private processedAppService: ProcessedAppService,
    @inject(APP_SERVICES.JobsAppService)
    private jobsAppService: JobsAppService
  ) {
    this.build()
  }

  private build() {
    this.router.get('/', this.listProcessed.bind(this))
    this.router.get('/:processedId', this.getProcessed.bind(this))
    this.router.post('/:processedId/train', this.trainProcessed.bind(this))
  }

  private async trainProcessed(ctx: ParameterizedContext) {
    try {
      const { label, callbackURL } = ctx.request.body as any

      const trainingJob = await this.jobsAppService.createTrainingJob(
        ctx.state.auth!.userId,
        ctx.state.auth!.apiKey,
        ctx.params.processedId,
        label,
        callbackURL
      )

      if (trainingJob) {
        ctx.status = 200
        ctx.body = trainingJob
      } else {
        ctx.status = 404
      }
    } catch (error) {
      this.logger.error('[POST][trainProcessed]', error)
      ctx.status = 500
    }

    this.logger.info(
      '[POST][trainProcessed]',
      ctx.status,
      ctx.state.auth!.userId,
      ctx.state.auth!.apiKey,
      ctx.params.processedId
    )

    return
  }

  private async getProcessed(ctx: ParameterizedContext) {
    try {
      const processed = await this.processedAppService.get(
        ctx.state.auth!.apiKey,
        ctx.params.processedId
      )

      if (processed) {
        ctx.status = 200
        ctx.body = { processed }
      } else {
        ctx.status = 404
      }      
    } catch (error) {
      this.logger.error('[GET][getProcessed]', error)
      ctx.status = 500
    }

    this.logger.info(
      '[GET][getProcessed]',
      ctx.status,
      ctx.state.auth!.apiKey,
      ctx.params.processedId
    )

    return
  }

  private async listProcessed(ctx: ParameterizedContext) {
    try {
      const processed = await this.processedAppService.list(
        ctx.state.auth!.apiKey
      )

      ctx.status = 200
      ctx.body = { processed }
    } catch (error) {
      this.logger.error('[GET][listProcessed]', error)
      ctx.status = 500
    }

    this.logger.info('[GET][listProcessed]', ctx.status, ctx.state.auth!.apiKey)

    return
  }
}
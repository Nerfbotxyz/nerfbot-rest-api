import Router from '@koa/router'
import { inject, injectable } from 'inversify'

import { Context, ParameterizedContext, State } from '~/app'
import { APP_SERVICES, JobsAppService, TrainingsAppService } from '~/app-services'
import Logger from '~/util/logger'

@injectable()
export default class NerfTrainingsRouter {
  router: Router<State, Context> = new Router<State, Context>()
  logger: Logger = new Logger('NerfTrainingsRouter')

  constructor(
    @inject(APP_SERVICES.TrainingsAppService)
    private trainingsAppService: TrainingsAppService,
    @inject(APP_SERVICES.JobsAppService)
    private jobsAppService: JobsAppService
  ) {
    this.build()
  }

  private build() {
    this.router.get('/', this.listTrainings.bind(this))
    this.router.get('/:trainingId', this.getTraining.bind(this))
    this.router.post('/:trainingId/render', this.renderTraining.bind(this))
    this.router.post('/:trainingId/export', this.exportTraining.bind(this))
  }

  private async exportTraining(ctx: ParameterizedContext) {
    try {
      const exportJob = await this.jobsAppService.createExportJob(
        ctx.state.auth!.userId,
        ctx.state.auth!.apiKey,
        ctx.params.trainingId
      )

      ctx.status = 200
      ctx.body = exportJob
    } catch (error) {
      this.logger.error('[POST][exportTraining]', error)
      ctx.status = 500
    }

    this.logger.info(
      '[POST][exportTraining]',
      ctx.status,
      ctx.state.auth!.userId,
      ctx.state.auth!.apiKey,
      ctx.params.trainingId
    )

    return
  }

  private async renderTraining(ctx: ParameterizedContext) {
    try {
      const renderJob = await this.jobsAppService.createRenderJob(
        ctx.state.auth!.userId,
        ctx.state.auth!.apiKey,
        ctx.params.trainingId
      )

      ctx.status = 200
      ctx.body = renderJob
    } catch (error) {
      this.logger.error('[POST][renderTraining]', error)
      ctx.status = 500
    }

    this.logger.info(
      '[POST][renderTraining]',
      ctx.status,
      ctx.state.auth!.userId,
      ctx.state.auth!.apiKey,
      ctx.params.trainingId
    )

    return
  }

  private async getTraining(ctx: ParameterizedContext) {
    try {
      const training = await this.trainingsAppService.get(
        ctx.state.auth!.apiKey,
        ctx.params.trainingId
      )

      ctx.status = 200
      ctx.body = { training }
    } catch (error) {
      this.logger.error('[GET][getTraining]', error)
      ctx.status = 500
    }

    this.logger.info(
      '[GET][getTraining]',
      ctx.status,
      ctx.state.auth!.apiKey,
      ctx.params.trainingId
    )

    return
  }

  private async listTrainings(ctx: ParameterizedContext) {
    try {
      const trainings = await this.trainingsAppService.list(
        ctx.state.auth!.apiKey
      )

      ctx.status = 200
      ctx.body = { trainings }
    } catch (error) {
      this.logger.error('[GET][listTrainings]', error)
      ctx.status = 500
    }

    this.logger.info('[GET][listTrainings]', ctx.status, ctx.state.auth!.apiKey)

    return
  }
}

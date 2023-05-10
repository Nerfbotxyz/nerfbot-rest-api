import Router from '@koa/router'
import { inject, injectable } from 'inversify'

import { Context, ParameterizedContext, State } from '~/app'
import { APP_SERVICES, JobsAppService, TrainingsAppService } from '~/app-services'

@injectable()
export default class NerfTrainingsRouter {
  router: Router<State, Context> = new Router<State, Context>()

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

      return
    } catch (error) {
      console.error('[NerfTrainingsRouter][POST][renderTraining]', error)
      ctx.status = 500

      return
    }
  }

  private async getTraining(ctx: ParameterizedContext) {
    try {
      const training = await this.trainingsAppService.get(
        ctx.state.auth!.apiKey,
        ctx.params.trainingId
      )

      ctx.status = 200
      ctx.body = { training }

      return
    } catch (error) {
      console.error('[NerfTrainingsRouter][GET][getTraining]', error)
      ctx.status = 500

      return
    }
  }

  private async listTrainings(ctx: ParameterizedContext) {
    try {
      const trainings = await this.trainingsAppService.list(
        ctx.state.auth!.apiKey
      )

      ctx.status = 200
      ctx.body = { trainings }

      return
    } catch (error) {
      console.error('[NerfTrainingsRouter][GET][listTrainings]', error)
      ctx.status = 500

      return
    }
  }
}

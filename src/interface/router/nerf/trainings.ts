import Router from '@koa/router'
import { inject, injectable } from 'inversify'

import { Context, ParameterizedContext, State } from '~/app'
import { APP_SERVICES, TrainingsAppService } from '~/app-services'

@injectable()
export default class NerfTrainingsRouter {
  router: Router<State, Context> = new Router<State, Context>()

  constructor(
    @inject(APP_SERVICES.TrainingsAppService)
    private trainingsAppService: TrainingsAppService
  ) {
    this.build()
  }

  private build() {
    this.router.get('/', this.listTrainings.bind(this))
    this.router.get('/:trainingId', this.getTraining.bind(this))
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

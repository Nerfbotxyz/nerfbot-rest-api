import Router from '@koa/router'
import { inject, injectable } from 'inversify'

import { Context, ParameterizedContext, State } from '~/app'
import { APP_SERVICES, ProcessedAppService } from '~/app-services'

@injectable()
export default class NerfProcessedRouter {
  router: Router<State, Context> = new Router<State, Context>()

  constructor(
    @inject(APP_SERVICES.ProcessedAppService)
    private processedAppService: ProcessedAppService
  ) {
    this.build()
  }

  private build() {
    this.router.get('/', this.listProcessed.bind(this))
    this.router.get('/:processedId', this.getProcessed.bind(this))
  }

  private async getProcessed(ctx: ParameterizedContext) {
    try {
      const processed = await this.processedAppService.get(
        ctx.state.auth!.apiKey,
        ctx.params.processedId
      )

      ctx.status = 200
      ctx.body = { processed }

      return
    } catch (error) {
      console.error('[NerfProcessedRouter][GET][getProcessed]', error)
      ctx.status = 500

      return
    }
  }

  private async listProcessed(ctx: ParameterizedContext) {
    try {
      const processed = await this.processedAppService.list(
        ctx.state.auth!.apiKey
      )

      ctx.status = 200
      ctx.body = { processed }

      return
    } catch (error) {
      console.error('[NerfProcessedRouter][GET][listProcessed]', error)
      ctx.status = 500

      return
    }
  }
}
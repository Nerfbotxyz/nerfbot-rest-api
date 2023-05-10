import Router from '@koa/router'
import { inject, injectable } from 'inversify'

import { Context, ParameterizedContext, State } from '~/app'
import { APP_SERVICES, RendersAppService } from '~/app-services'

@injectable()
export default class NerfRendersRouter {
  router: Router<State, Context> = new Router<State, Context>()

  constructor(
    @inject(APP_SERVICES.RendersAppService)
    private rendersAppService: RendersAppService
  ) {
    this.build()
  }

  private build() {
    this.router.get('/', this.listRenders.bind(this))
    this.router.get('/:renderId', this.getRender.bind(this))
  }

  private async listRenders(ctx: ParameterizedContext) {
    try {
      const renders = await this.rendersAppService.list(
        ctx.state.auth!.apiKey
      )

      ctx.status = 200
      ctx.body = { renders }

      return
    } catch (error) {
      console.error('[NerfRendersRouter][GET][listRenders]', error)
      ctx.status = 500

      return
    }
  }

  private async getRender(ctx: ParameterizedContext) {
    try {
      const render = await this.rendersAppService.get(
        ctx.state.auth!.apiKey,
        ctx.params.renderId
      )

      ctx.status = 200
      ctx.body = { render }

      return
    } catch (error) {
      console.error('[NerfRendersRouter][GET][getRender]', error)
      ctx.status = 500

      return
    }
  }
}

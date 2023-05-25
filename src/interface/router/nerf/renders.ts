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
    this.router.get('/:renderId/download', this.downloadRender.bind(this))
  }

  private async listRenders(ctx: ParameterizedContext) {
    try {
      const renders = await this.rendersAppService.list(
        ctx.state.auth!.apiKey
      )

      ctx.status = 200
      ctx.body = { renders }
    } catch (error) {
      console.error('[NerfRendersRouter][GET][listRenders]', error)
      ctx.status = 500
    }

    return
  }

  private async getRender(ctx: ParameterizedContext) {
    try {
      const render = await this.rendersAppService.get(
        ctx.state.auth!.apiKey,
        ctx.params.renderId
      )

      ctx.status = 200
      ctx.body = { render }
    } catch (error) {
      console.error('[NerfRendersRouter][GET][getRender]', error)
      ctx.status = 500
    }

    return
  }

  private async downloadRender(ctx: ParameterizedContext) {
    try {
      const downloadStream = await this.rendersAppService.getDownloadStream(
        ctx.state.auth!.apiKey,
        ctx.params.renderId
      )

      if (downloadStream) {
        ctx.status = 200
        ctx.body = downloadStream
        ctx.set('Content-Type', 'video/mp4')
        ctx.set('Accept-Ranges', 'bytes')
      } else {
        ctx.status = 404
      }
    } catch (error) {
      console.error('[NerfRendersRouter][GET][downloadRender]', error)
      ctx.status = 500
    }

    return
  }
}

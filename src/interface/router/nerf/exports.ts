import Router from '@koa/router'
import { inject, injectable } from 'inversify'

import { Context, ParameterizedContext, State } from '~/app'
import { APP_SERVICES, ExportsAppService } from '~/app-services'

@injectable()
export default class NerfExportsRouter {
  router: Router<State, Context> = new Router<State, Context>()

  constructor(
    @inject(APP_SERVICES.ExportsAppService)
    private exportsAppService: ExportsAppService
  ) {
    this.build()
  }

  private build() {
    this.router.get('/', this.listExports.bind(this))
    this.router.get('/:exportId', this.getExport.bind(this))
  }

  private async listExports(ctx: ParameterizedContext) {
    try {
      const nerfExports = await this.exportsAppService.list(
        ctx.state.auth!.apiKey
      )

      ctx.status = 200
      ctx.body = { nerfExports }

      return
    } catch (error) {
      console.error('[NerfExportsRouter][GET][listExports]', error)
      ctx.status = 500

      return
    }
  }

  private async getExport(ctx: ParameterizedContext) {
    try {
      const nerfExport = await this.exportsAppService.get(
        ctx.state.auth!.apiKey,
        ctx.params.exportId
      )

      ctx.status = 200
      ctx.body = { nerfExport }

      return
    } catch (error) {
      console.error('[NerfExportsRouter][GET][getExport]', error)
      ctx.status = 500

      return
    }
  }
}

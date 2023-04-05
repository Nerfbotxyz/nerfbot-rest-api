import Router from '@koa/router'
import { inject, injectable } from 'inversify'

import { State, Context, ParameterizedContext } from '../../../app'
import { IRouter } from '../'

@injectable()
export default class NerfJobsRouter implements IRouter<State, Context> {
  router: Router<State, Context> = new Router<State, Context>()

  constructor() {
    this.build()
  }

  private build() {
    this.router.get('/', this.listProcessRequests.bind(this))
    this.router.get('/:jobId', this.getProcessRequest.bind(this))
  }

  private async listProcessRequests(ctx: ParameterizedContext) {
    // try {
    //   const processRequests = await this.processRequestsAppService.list(
    //     ctx.state.auth!.apiKey
    //   )

    //   ctx.status = 200
    //   ctx.body = { processRequests }

    //   return
    // } catch (error) {
    //   console.error('[NerfRouter][GET][listProcessRequests]', error)
    //   ctx.status = 500
    // }
  }

  private async getProcessRequest(ctx: ParameterizedContext) {
    // try {
    //   const processRequest = await this.processRequestsAppService.get(
    //     ctx.state.auth!.apiKey,
    //     ctx.params.processRequestId
    //   )

    //   ctx.status = 200
    //   ctx.body = processRequest

    //   return
    // } catch (error) {
    //   console.error('[NerfRouter][GET][getProcessRequest]', error)
    //   ctx.status = 500
    // }
  }
}

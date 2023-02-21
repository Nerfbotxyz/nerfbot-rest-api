import Router from '@koa/router'

import { Context, ParameterizedContext, State } from '../../app'
import { requireApiToken } from '../middleware'

export class NerfRouter {
  router: Router<State, Context> = new Router<State, Context>()

  constructor() {
    this.build()
  }

  private build() {
    this.router.use(requireApiToken)
    this.router.post('/upload', this.upload.bind(this))
  }

  private async upload(ctx: ParameterizedContext) {
    ctx.status = 200
    ctx.body = { status: 'thanks!' }
  }
}


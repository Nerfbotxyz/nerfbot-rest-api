import Router from '@koa/router'

import { Context, ParameterizedContext, State } from '../../app'

export class AuthRouter {
  router: Router<State, Context> = new Router<State, Context>()

  constructor() {
    this.build()
  }

  private build() {
    this.router.post('/create-token', this.createToken.bind(this))
  }

  private async createToken(ctx: ParameterizedContext) {
    // ctx.body = { key: 'this-is-a-test-api-key' }
    ctx.status = 401

    return
  }
}

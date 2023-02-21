import { Server } from 'http'
import Koa from 'koa'
import Router from '@koa/router'
import { AuthRouter, NerfRouter } from './interface/router'

export type State = Koa.DefaultState & {
  // auth?: AuthState
}
export type Context = Koa.DefaultContext & {}
export type ParameterizedContext = Koa.ParameterizedContext<
  State,
  Context & Router.RouterParamContext<State, Context>,
  unknown
>

export default class NerfbotRestApi {
  private port: number = 1987
  server!: Server
  app: Koa = new Koa()

  constructor() {
    this.build()
  }

  private build() {
    const router = new Router()

    router.get('/healthcheck', (ctx) => {
      ctx.body = { health: 'ok' }

      return
    })

    const routers = [
      { path: '/auth', router: new AuthRouter().router },
      { path: '/nerf', router: new NerfRouter().router },
    ]

    for (let i = 0; i < routers.length; i++) {
      router.use(
        routers[i].path,
        routers[i].router.routes(),
        routers[i].router.allowedMethods()
      )
    }

    this.app
      .use(async (ctx, next) => {
        ctx.set('Access-Control-Allow-Origin', '*')
        await next()
      })
      .use(router.routes())
      .use(router.allowedMethods())
      .use(async (ctx) => {
        if (ctx.request.method === 'OPTIONS') {
          ctx.status = 200
          ctx.set('Access-Control-Allow-Headers', '*')
        }

        return
      })
  }

  start() {
    if (!this.server) {
      this.server = this.app.listen(this.port, () => {
        console.log(`Nerfbot REST API listening on port ${this.port}`)
      })
    }
  }

  stop() {
    if (this.server) {
      this.server.close(() => console.log('Nerfbot REST API stopped'))
    }
  }
}

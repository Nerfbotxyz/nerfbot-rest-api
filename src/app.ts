import 'dotenv/config'
import { Server } from 'http'
import Koa from 'koa'
import Router from '@koa/router'
import { AuthRouter, NerfRouter } from './interface/router'
import { PostgresAdapter } from './infra/db/adapter'
import { ApiKeyRepository, UserRepository } from './service/repository'

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

  private setupDatabase(): PostgresAdapter {
    const user = process.env.DB_USER || 'DB_USER not set!'
    const pass = process.env.DB_PASS || 'DB_PASS not set!'
    const host = process.env.DB_HOST || 'DB_HOST not set!'
    const port = process.env.DB_PORT || 'DB_PORT not set!'
    const name = process.env.DB_NAME || 'postgres'
    const connection = `postgresql://${user}:${pass}@${host}:${port}/${name}`

    return new PostgresAdapter(connection)
  }

  private setupServices(db: PostgresAdapter): {
    'users': UserRepository,
    'apiKeys': ApiKeyRepository
  } {
    return {
      'users': new UserRepository(db),
      'apiKeys': new ApiKeyRepository(db)
    }
  }

  private build() {
    const db = this.setupDatabase()
    const { users, apiKeys } = this.setupServices(db)

    const router = new Router()

    router.get('/healthcheck', (ctx) => {
      ctx.body = { health: 'ok' }

      return
    })

    const childRouters = [
      { path: '/auth', router: new AuthRouter().router },
      { path: '/nerf', router: new NerfRouter(apiKeys).router },
    ]

    for (let i = 0; i < childRouters.length; i++) {
      const childRouter = childRouters[i]
      router.use(
        childRouter.path,
        childRouter.router.routes(),
        childRouter.router.allowedMethods()
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

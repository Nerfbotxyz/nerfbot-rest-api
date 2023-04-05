import 'dotenv/config'
import { Server } from 'http'
import Koa from 'koa'
import Router from '@koa/router'
import { createClient } from 'redis'

import { AuthRouter, IRouter, NerfRouter, ROUTERS } from './interface/router'
import { PostgresAdapter } from './infra/db/adapter'
import {
  ApiKeysRepository,
  ProcessRequestsRepository,
  UploadsRepository,
  UsersRepository
} from './service/repository'
import { S3Adapter } from './infra/bucket/adapter'
import { UploadsBucket } from './service/bucket'
import {
  ProcessRequestsAppService,
  UploadsAppService
} from './app-services'
import { AuthState } from './interface/middleware'
import { BullAdapter } from './infra/queue/adapter'
import { ProcessQueue } from './service/queue'
import { buildContainer, config } from './inversify.config'

export type State = Koa.DefaultState & {
  auth?: AuthState
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
    const container = buildContainer()

    const router = new Router()
    const routers: { path: string, id: symbol }[] = [
      { path: '/auth', id: ROUTERS.AuthRouter },
      { path: '/nerf', id: ROUTERS.NerfRouter },
    ]

    // TODO -> Refactor into a HealthcheckRouter
    router.get('/healthcheck', (ctx) => {
      ctx.body = { health: 'ok' }

      return
    })

    for (let i = 0; i < routers.length; i++) {
      const { path, id } = routers[i]
      const subRouter = container.get<IRouter<State, Context>>(id).router
      router.use(path, subRouter.routes(), subRouter.allowedMethods())
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

  private async testRedisAndThrowOnFailedConnection() {
    try {
      const redisClient = createClient(config.redis)
      await redisClient.connect()
    } catch (error) {
      console.error('Redis connection failed, see error below')

      throw error
    }
  }

  start() {
    if (!this.server) {
      this.server = this.app.listen(this.port, async () => {
        await this.testRedisAndThrowOnFailedConnection()
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

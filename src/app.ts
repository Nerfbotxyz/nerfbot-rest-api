import 'dotenv/config'
import { Server } from 'http'
import Koa from 'koa'
import Router from '@koa/router'
import { createClient } from 'redis'
import bodyParser from 'koa-bodyparser'

import { IRouter, ROUTERS } from './interface/router'
import { AuthState } from './interface/middleware'
import { buildContainer, config } from './inversify.config'
import { PostgresAdapter } from './infra/db/adapter'
import Logger from './util/logger'
import CallbacksQueue from './service/queue/callbacks'
import { QUEUES } from './service/queue'
import CloudBucket from './infra/bucket/cloud-bucket'

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
  private db!: PostgresAdapter
  private bucket!: CloudBucket
  private logger: Logger = new Logger('NerfbotRestApi')
  private callbacksQueue!: CallbacksQueue

  constructor() {
    this.build()
  }

  private build() {
    const container = buildContainer()

    this.db = container.get<PostgresAdapter>('PostgresAdapter')
    this.bucket = container.get<CloudBucket>('CloudBucket')
    this.callbacksQueue = container.get<CallbacksQueue>(QUEUES.CallbacksQueue)

    const router = new Router()
    const routers: { path: string, id: symbol }[] = [
      { path: '/auth', id: ROUTERS.AuthRouter },
      { path: '/nerf', id: ROUTERS.NerfRouter },
    ]

    // TODO -> Refactor into a HealthcheckRouter
    const healthcheck = (ctx: ParameterizedContext) => {
      ctx.body = {
        health: 'ok',
        version: config.version
      }

      return
    }
    router.get('/', healthcheck)
    router.get('/healthcheck', healthcheck)

    for (let i = 0; i < routers.length; i++) {
      const { path, id } = routers[i]
      const _router = container.get<IRouter<State, Context>>(id)
      const subRouter = _router.router
      router.use(path, subRouter.routes(), subRouter.allowedMethods())
    }

    this.app
      .use(async (ctx, next) => {
        ctx.set('Access-Control-Allow-Origin', '*')
        await next()
      })
      .use(bodyParser({
        formLimit: '500mb'
      }))
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
      await redisClient.disconnect()
    } catch (error) {
      this.logger.error('Redis connection failed, see error below')

      throw error
    }
  }

  private async testPostgresAndThrowOnFailedConnection() {
    try {
      await this.db.client.raw('SELECT 1')
    } catch (error) {
      this.logger.error('Postgres connection failed, see error below')
      console.error(error)
      throw error
    }
  }

  private async testBucketsAndThrowOnFailedConnection() {
    try {
      const bucketKeys = Object.keys(config.bucket.buckets)

      await Promise.all(
        bucketKeys.map(key => this.bucket.test(config.bucket.buckets[key]))
      )
    } catch (error) {
      this.logger.error('Cloud bucket connection failed, see error below')

      throw error
    }
  }

  start() {
    if (!this.server) {
      this.server = this.app.listen(this.port, async () => {
        await this.testRedisAndThrowOnFailedConnection()
        await this.testPostgresAndThrowOnFailedConnection()
        await this.testBucketsAndThrowOnFailedConnection()
        this.callbacksQueue.start()
        this.logger.info(`Nerfbot REST API listening on port ${this.port}`)
      })
    }
  }

  async stop() {
    if (this.server) {
      return new Promise<void>(resolve => {
        this.server.close(async () => {
          await this.callbacksQueue.stop()
          this.logger.info('Nerfbot REST API stopped')
          resolve()
        })
      })
    }
  }
}

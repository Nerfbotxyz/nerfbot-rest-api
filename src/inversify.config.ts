import 'reflect-metadata'
import { Container } from 'inversify'

import { Context, State } from './app'
import {
  AuthRouter,
  IRouter,
  NerfJobsRouter,
  NerfRouter,
  NerfUploadsRouter,
  ROUTERS,
} from './interface/router'
import { PostgresAdapter } from './infra/db/adapter'
import { S3Adapter } from './infra/bucket/adapter'
import { BullAdapter } from './infra/queue/adapter'
import {
  ApiKey,
  ApiKeysRepository,
  IRepository,
  ProcessRequestsRepository,
  REPOSITORIES,
  Upload,
  UploadsRepository,
  User,
  UsersRepository
} from './service/repository'
import { ProcessRequest } from './core'
import { APP_SERVICES, IAppService, ProcessRequestsAppService, UploadsAppService } from './app-services'
import { BUCKETS, IBucketService, UploadsBucket } from './service/bucket'
import { IQueueService, ProcessQueue, QUEUES } from './service/queue'

const user = process.env.DB_USER || 'DB_USER not set!'
const pass = process.env.DB_PASS || 'DB_PASS not set!'
const host = process.env.DB_HOST || 'DB_HOST not set!'
const port = process.env.DB_PORT || 'DB_PORT not set!'
const name = process.env.DB_NAME || 'postgres'
const bucket = process.env.BUCKET_NAME || 'BUCKET_NAME not set!'

export class AppConfig {
  db = { connection: `postgresql://${user}:${pass}@${host}:${port}/${name}` }
  redis = { url: process.env.REDIS || `redis://127.0.0.1:6379` }
  s3 = { bucket }
}
export const config = new AppConfig()

export const buildContainer = (): Container => {
  const container = new Container()

  /**
   * Config
   */
  container.bind<AppConfig>('AppConfig').toConstantValue(config)

  /**
   * Adapters
   */
  container.bind<S3Adapter>('S3Adapter').toConstantValue(new S3Adapter())
  container
    .bind<PostgresAdapter>('PostgresAdapter')
    .toConstantValue(new PostgresAdapter(config.db.connection))
  container
    .bind<BullAdapter>('BullAdapter')
    .toConstantValue(new BullAdapter(config.redis.url))

  /**
   * Services - Buckets
   */
  container.bind<IBucketService>(BUCKETS.UploadsBucket).to(UploadsBucket)

  /**
   * Services - Queues
   */
  container.bind<IQueueService>(QUEUES.ProcessQueue).to(ProcessQueue)

  /**
   * Services - Repositories
   */
  container
    .bind<IRepository<ApiKey>>(REPOSITORIES.ApiKeysRepository)
    .to(ApiKeysRepository)
  container
    .bind<IRepository<ProcessRequest>>(REPOSITORIES.ProcessRequestsRepository)
    .to(ProcessRequestsRepository)
  container
    .bind<IRepository<Upload>>(REPOSITORIES.UploadsRepository)
    .to(UploadsRepository)
  container
    .bind<IRepository<User>>(REPOSITORIES.UsersRepository)
    .to(UsersRepository)

  /**
   * Application Services
   */
  container
    .bind<IAppService>(APP_SERVICES.UploadsAppService)
    .to(UploadsAppService)
  container
    .bind<IAppService>(APP_SERVICES.ProcessRequestsAppService)
    .to(ProcessRequestsAppService)

  /**
   * Routers
   */
  container.bind<IRouter<State, Context>>(ROUTERS.AuthRouter).to(AuthRouter)
  container
    .bind<IRouter<State, Context>>(ROUTERS.NerfJobsRouter)
    .to(NerfJobsRouter)
  container
    .bind<IRouter<State, Context>>(ROUTERS.NerfUploadsRouter)
    .to(NerfUploadsRouter)
  container.bind<IRouter<State, Context>>(ROUTERS.NerfRouter).to(NerfRouter)


  return container
}

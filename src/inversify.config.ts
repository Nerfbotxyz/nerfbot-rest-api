import 'reflect-metadata'
import { Container } from 'inversify'

import { Context, State } from './app'
import {
  AuthRouter,
  IRouter,
  NerfJobsRouter,
  NerfRouter,
  NerfTrainingsRouter,
  NerfUploadsRouter,
  ROUTERS,
} from './interface/router'
import { PostgresAdapter } from './infra/db/adapter'
import { BullAdapter } from './infra/queue/adapter'
import {
  ApiKey,
  ApiKeysRepository,
  ExportsRepository,
  IRepository,
  JobsRepository,
  NerfExport,
  Processed,
  ProcessedRepository,
  REPOSITORIES,
  Render,
  RendersRepository,
  Role,
  RolesRepository,
  Training,
  TrainingsRepository,
  Upload,
  UploadsRepository,
  User,
  UsersRepository
} from './service/repository'
import { Job, JobType } from './core'
import {
  APP_SERVICES,
  AuthAppService,
  ExportsAppService,
  IAppService,
  JobsAppService,
  ProcessedAppService,
  RendersAppService,
  TrainingsAppService,
  UploadsAppService
} from './app-services'
import { BUCKETS, IBucketService, UploadsBucket } from './service/bucket'
import {
  CallbacksQueue,
  IQueueService,
  JobsQueue,
  QUEUES
} from './service/queue'
import NerfProcessedRouter from './interface/router/nerf/processed'
import NerfRendersRouter from './interface/router/nerf/renders'
import NerfExportsRouter from './interface/router/nerf/exports'
import { CallbacksProcessor, JobProcessor, PROCESSORS } from './processors'
import {
  ApiKeyMiddleware,
  MIDDLEWARES,
  requireApiToken
} from './interface/middleware'
import CloudBucket from './infra/bucket/cloud-bucket'

const user = process.env.DB_USER || 'DB_USER not set!'
const pass = process.env.DB_PASS || 'DB_PASS not set!'
const host = process.env.DB_HOST || 'DB_HOST not set!'
const port = process.env.DB_PORT || 'DB_PORT not set!'
const name = process.env.DB_NAME || 'postgres'

interface BucketConfig {
  provider: string
  buckets: {
    [purpose: string]: string
  }
}

export class AppConfig {
  db = { connection: `postgresql://${user}:${pass}@${host}:${port}/${name}` }
  redis = { url: process.env.REDIS || `redis://127.0.0.1:6379` }
  bucket: BucketConfig = {
    provider: process.env.BUCKET_PROVIDER || 'BUCKET_PROVIDER not set!',
    buckets: {
      uploads: process.env.BUCKET_NAME || 'BUCKET_NAME not set!',
      renders: process.env.RENDERS_BUCKET || 'RENDERS_BUCKET not set!',
      exports: process.env.EXPORTS_BUCKET || 'EXPORTS_BUCKET not set!'
    }
  }
  version = process.env.npm_package_version
}
export const config = new AppConfig()

export const buildContainer = (): Container => {
  const container = new Container()

  /**
   * Config
   */
  container.bind<AppConfig>('AppConfig').toConstantValue(config)

  /**
   * Infrastructure Adapters
   */
  container
    .bind<CloudBucket>('CloudBucket')
    .toConstantValue(new CloudBucket(config.bucket.provider))
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
  container
    .bind<IQueueService>(QUEUES.JobsQueue)
    .to(JobsQueue)
    .inSingletonScope()
  container
    .bind<IQueueService>(QUEUES.CallbacksQueue)
    .to(CallbacksQueue)
    .inSingletonScope()

  /**
   * Services - Repositories
   */
  container
    .bind<IRepository<ApiKey>>(REPOSITORIES.ApiKeysRepository)
    .to(ApiKeysRepository)
  container
    .bind<IRepository<NerfExport>>(REPOSITORIES.ExportsRepository)
    .to(ExportsRepository)
  container
    .bind<IRepository<Job<any>>>(REPOSITORIES.JobsRepository)
    .to(JobsRepository)
  container
    .bind<IRepository<Processed>>(REPOSITORIES.ProcessedRepository)
    .to(ProcessedRepository)
  container
    .bind<IRepository<Render>>(REPOSITORIES.RendersRepository)
    .to(RendersRepository)
  container
    .bind<IRepository<Role>>(REPOSITORIES.RolesRepository)
    .to(RolesRepository)
  container
    .bind<IRepository<Training>>(REPOSITORIES.TrainingsRepository)
    .to(TrainingsRepository)
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
    .bind<IAppService>(APP_SERVICES.JobsAppService)
    .to(JobsAppService)
    .inSingletonScope()
  container
    .bind<IAppService>(APP_SERVICES.ProcessedAppService)
    .to(ProcessedAppService)
  container
    .bind<IAppService>(APP_SERVICES.TrainingsAppService)
    .to(TrainingsAppService)
  container
    .bind<IAppService>(APP_SERVICES.RendersAppService)
    .to(RendersAppService)
  container
    .bind<IAppService>(APP_SERVICES.ExportsAppService)
    .to(ExportsAppService)
  container
    .bind<IAppService>(APP_SERVICES.AuthAppService)
    .to(AuthAppService)

  /**
   * Processors
   */
  container
    .bind<JobProcessor<JobType>>(PROCESSORS.CallbacksProcessor)
    .toFunction(CallbacksProcessor)

  /**
   * Middleware
   */
  container
    .bind<ApiKeyMiddleware>(MIDDLEWARES.ApiKeyMiddleware)
    .toFunction(requireApiToken)

  /**
   * Routers
   */
  container.bind<IRouter<State, Context>>(ROUTERS.AuthRouter).to(AuthRouter)
  container
    .bind<IRouter<State, Context>>(ROUTERS.NerfJobsRouter)
    .to(NerfJobsRouter)
  container
    .bind<IRouter<State, Context>>(ROUTERS.NerfProcessedRouter)
    .to(NerfProcessedRouter)
  container
    .bind<IRouter<State, Context>>(ROUTERS.NerfTrainingsRouter)
    .to(NerfTrainingsRouter)
  container
    .bind<IRouter<State, Context>>(ROUTERS.NerfUploadsRouter)
    .to(NerfUploadsRouter)
  container
    .bind<IRouter<State, Context>>(ROUTERS.NerfRendersRouter)
    .to(NerfRendersRouter)
  container
    .bind<IRouter<State, Context>>(ROUTERS.NerfExportsRouter)
    .to(NerfExportsRouter)
  
  /* NB: NerfRouter must be last as it depends on the above routers */
  container.bind<IRouter<State, Context>>(ROUTERS.NerfRouter).to(NerfRouter)

  return container
}
